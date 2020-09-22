import * as qiniu from 'qiniu-js'
import { UploadStatus } from './enums'
export default class QiniuUpload {
  params: Object
  options: HFUploader.Options
  timeout: number
  partSize: number
  retryCount: number
  retryCountMax: number
  file: HFUploader.UploadFile
  onChange: (file: HFUploader.UploadFile) => void
  onSucceed: (file: HFUploader.UploadFile) => void
  onFailed: (file: HFUploader.UploadFile) => void
  afterUpload: Function
  needUpdateParams: Function
  currentSubscription: HFUploader.Subscription

  constructor({
    file,
    params,
    options,
    onChange,
    onSucceed,
    onFailed,
    afterUpload,
    needUpdateParams,
  }: HFUploader.UploadProps) {
    if (!file || !file.originFile) {
      throw new TypeError('A file is required')
    }

    if (!params.token) {
      throw new TypeError('Missing params to create qiniu')
    }

    this.file = file
    this.partSize = options.partSize
    this.retryCount = 0
    this.retryCountMax = options.retryCountMax
    this.timeout = options.timeout
    this.params = params
    this.options = options
    this.onChange = onChange
    this.onSucceed = onSucceed
    this.onFailed = onFailed
    this.afterUpload = afterUpload
    this.needUpdateParams = needUpdateParams
  }

  uploadFile = () => {
    const key = `tmp/${this.file.uid}.${this.file.extension}`
    const putExtra = {
      fname: this.file.originFile.name,
    }
    const config: HFUploader.QiNiuUploadConfig = {
      useCdnDomain: true,
      checkByMD5: true,
      forceDirect: false,
      retryCount: this.retryCountMax,
      uphost: '',
      concurrentRequestLimit: 3,
      disableStatisticsReport: false,
      chunkSize: this.partSize,
      upprotocol: 'http:',
    }

    let opts = {
      file: this.file.originFile,
      key,
      params: this.params,
      putExtra,
      config,
    }

    return this.upLoadQiniu(opts)
  }

  setProgress = (percent: number) => {
    this.file = {
      ...this.file,
      percent: percent,
      status: UploadStatus.Uploading,
      errorMessage: '',
    }
    this.onChange(this.file)
  }

  finish = (f) => {
    this.file.status = UploadStatus.Uploaded
    this.file.percent = 100
    this.onSucceed(f)
  }

  setError = (errorMessage) => {
    this.file.status = UploadStatus.Error
    this.file.errorMessage = errorMessage
    this.onFailed(this.file)
  }

  upLoadQiniu = (options) => {
    const { file, key, params, putExtra, config } = options

    return new Promise((resolve, reject) => {
      const observable = qiniu.upload(file, key, params.token, putExtra, config)

      const next = (res) => {
        this.setProgress(res.total.percent)
      }

      const error = (err) => {
        const errorName = err.name?.toLowerCase()
        // token 解析错误
        if (errorName === 'syntaxerror') {
          this.setError('token parsing error')
          return
        }

        // 参数过期
        if (err.code === 401) {
          this.retryCount++
          if (this.retryCount < this.retryCountMax) {
            const fn = this.needUpdateParams && this.needUpdateParams(this.file)
            if (fn && fn.then) {
              fn.then(() => this.startUpload())
            } else {
              this.startUpload()
            }
          } else {
            this.setError('params is expired')
            reject(err)
          }
          return
        }

        this.setError(this.options.errorText)
        reject(err)
      }

      const complete = (res) => {
        this.file.response = res
        this.file.oss_path = res.key

        const after = this.afterUpload && this.afterUpload(this.file)
        if (after && after.then) {
          after
            .then(() => {
              this.finish(this.file)
              resolve()
            })
            .catch((err) => {
              this.setError(
                typeof err === 'string' ? err : this.options.errorText
              )
              reject(err)
            })
        } else {
          this.finish(this.file)
          resolve()
        }
      }

      const subscription = observable.subscribe({ next, error, complete })
      this.currentSubscription = subscription
    })
  }

  updateParams = (params) => {
    this.params = { ...params }
  }

  startUpload = () => {
    const applyTokenDo = (func: any) => {
      return func()
    }
    return applyTokenDo(this.uploadFile)
  }

  cancelUpload = () => {
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe()
    }
  }

  reUpload = () => {
    this.retryCount = 0
    this.currentSubscription = null
    this.startUpload()
  }
}
