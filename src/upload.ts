import OSS from 'ali-oss'
import { MIN_PART_SIZE } from './constants'

interface Props {
  /** 创建OSS参数 */
  params: Object
  /** 上传的文件 */
  file: HFUploader.File
  /** 配置项 */
  options?: HFUploader.Options
  /** onChange */
  onChange?: (file: HFUploader.File) => void
  /** 单个文件 succeed */
  onSucceed?: (file: HFUploader.File) => void
  /** 单个文件 failed */
  onFailed?: (file: HFUploader.File) => void
  /** 上传后处理 */
  afterUpload?: Function
}

export default class Upload {
  params: Object
  options: HFUploader.Options
  timeout: number
  partSize: number
  retryCount: number
  retryCountMax: number
  file: HFUploader.File
  uploadFileClient: any
  currentCheckpoint: any
  onChange: (file: HFUploader.File) => void
  onSucceed: (file: HFUploader.File) => void
  onFailed: (file: HFUploader.File) => void
  afterUpload: Function

  constructor({
    file,
    params,
    options,
    onChange,
    onSucceed,
    onFailed,
    afterUpload
  }: Props) {
    if (!file || !file.originFile) {
      throw new TypeError('A file is required')
    }

    if (!Object.keys(params).length) {
      throw new TypeError('Missing params to create OSS')
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
  }

  uploadFile = client => {
    if (
      !this.uploadFileClient ||
      Object.keys(this.uploadFileClient).length === 0
    ) {
      this.uploadFileClient = client
    }

    const progress = (p: number, checkpoint: any) => {
      this.currentCheckpoint = checkpoint
      this.file = {
        ...this.file,
        percent: p * 99,
        status: 'uploading',
        errorMessage: ''
      }
      this.onChange(this.file)
    }

    const finish = f => {
      this.file.status = 'uploaded'
      this.file.percent = 100
      this.onSucceed(f)
    }

    const fileName = encodeURI(this.file.name)
    const key = `tmp/${this.file.uid}.${this.file.extension}`

    let opts: any = {
      progress,
      mime: this.file.mime_type,
      partSize: this.partSize * 1024,
      headers: {
        'content-disposition': `attachment; filename="${fileName}"`
      }
    }

    if (this.currentCheckpoint) {
      opts.checkpoint = this.currentCheckpoint
    }

    return new Promise((resolve, reject) => {
      this.uploadFileClient
        .multipartUpload(key, this.file.originFile, opts)
        .then(res => {
          this.file.response = res
          const after = this.afterUpload && this.afterUpload(this.file)

          if (after && after.then) {
            after
              .then(() => {
                finish(this.file)
                resolve()
              })
              .catch(err => {
                this.file.status = 'error'
                this.file.errorMessage =
                  typeof err === 'string' ? err : this.options.errorText
                this.onFailed(this.file)
                reject(err)
              })
          } else {
            finish(this.file)
            resolve()
          }
        })
        .catch(err => {
          // 暂停
          if (this.uploadFileClient && this.uploadFileClient.isCancel()) {
            return
          }

          const error = err.name.toLowerCase()
          const isParamsExpired =
            error.indexOf('securitytokenexpirederror') !== -1 ||
            error.indexOf('invalidaccesskeyiderror') !== -1
          const isTimeout = error.indexOf('connectiontimeout') !== -1

          // 参数过期
          if (isParamsExpired) {
            this.uploadFileClient = null
            this.startUpload()
            return
          }

          // 超时
          if (isTimeout) {
            if (this.partSize > MIN_PART_SIZE) {
              // 减小分片大小 最小100k
              const size = Math.ceil(this.partSize / 2)
              this.partSize = size > MIN_PART_SIZE ? size : MIN_PART_SIZE
              this.uploadFile('')
            } else if (this.retryCount < this.retryCountMax) {
              this.retryCount++
              this.uploadFile('')
            } else {
              this.file.status = 'error'
              this.file.errorMessage = this.options.errorText
              this.onFailed(this.file)
              reject(err)
            }
            return
          }

          this.file.status = 'error'
          this.file.errorMessage = this.options.errorText
          this.onFailed(this.file)
          reject(err)
        })
    })
  }

  updateParams = params => {
    this.params = { ...params }
  }

  startUpload = () => {
    const applyTokenDo = (func: any) => {
      const client = new OSS({
        timeout: this.timeout,
        ...this.params
      })

      return func(client)
    }

    return applyTokenDo(this.uploadFile)
  }

  cancelUpload = () => {
    if (this.uploadFileClient) {
      this.uploadFileClient.cancel()
    }
  }

  reUpload = () => {
    this.retryCount = 0
    this.uploadFileClient = null
    this.startUpload()
  }
}
