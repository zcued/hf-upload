import * as qiniu from 'qiniu-js'
import { UploadStatus } from '../enums'
import { CONCURRENCY, QINIU_CHUNK_SIZE } from '../constants'
import { UploadParams, UploadOptions, UploadFile, Subscription, QiniuProps, QiNiuUploadConfig } from '../types'

export default class QiniuUpload {
  deleted: boolean
  params: UploadParams
  options: UploadOptions
  timeout: number
  partSize: number
  retryCount: number
  retryCountMax: number
  file: UploadFile
  onChange: (file: UploadFile) => void
  onSucceed: (file: UploadFile) => void
  onFailed: (file: UploadFile) => void
  afterUpload: Function
  needUpdateParams: Function
  currentSubscription: Subscription
  md5MapId: { [key: string]: string }

  constructor({ file, params, options, onChange, onSucceed, onFailed, afterUpload, needUpdateParams }: QiniuProps) {
    if (!file || !file.originFile) {
      throw new TypeError('A file is required')
    }

    if (!params.qiniuToken) {
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
    const { uploadPath: uploadTmpPath, renderKey } = this.options
    const uploadPath = (typeof uploadTmpPath === 'string' ? uploadTmpPath : uploadTmpPath?.qiniu) || 'tmp'
    const key =
      typeof renderKey === 'function' ? renderKey(this.file) : `${uploadPath}/${this.file.uid}.${this.file.extension}`
    const putExtra = {
      fname: this.file.originFile.name,
      // 分片上传的并发请求量
      concurrentRequestLimit: CONCURRENCY,
    }
    const config: QiNiuUploadConfig = {
      // 是否使用cdn 加速
      useCdnDomain: true,
      chunkSize: QINIU_CHUNK_SIZE,
    }

    const opts = {
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
      percent: percent * 0.99,
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
      const observable = qiniu.upload(file, key, params.qiniuToken, putExtra, config)

      const next = (res) => {
        if (this.deleted) {
          //外部删除修改deleted属性，通过上传进度监听deleted操作删除动作
          this.cancelUpload()
          return reject()
        }
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
          const fn = this.needUpdateParams && this.needUpdateParams(this.file)
          if (fn && fn.then) {
            fn.then(() => this.reUpload().then(resolve).catch(reject))
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
        this.finish(this.file)
        resolve(null)
      }

      const subscribe = observable.subscribe({ next, error, complete })
      this.currentSubscription = subscribe
    })
  }

  updateParams = (params) => {
    this.params = { ...params }
  }

  startUpload = () => {
    if (this.deleted) return

    const applyTokenDo = (func: any) => {
      return func()
    }
    return applyTokenDo(this.uploadFile)
  }
  deleteUpload = () => {
    this.deleted = true
  }
  cancelUpload = () => {
    this.currentSubscription.unsubscribe()
  }

  reUpload = () => {
    this.retryCount = 0
    return this.startUpload()
  }
}
