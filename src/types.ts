export interface UploadOptions {
  /** 最高并发量 */
  concurrency?: number
  /** 分片大小 M */
  partSize?: number
  /** 超时时间 ms */
  timeout?: number
  /** 超时重新上传次数 */
  retryCountMax?: number
  /** 错误提示 */
  errorText?: string
  /** 文件上传的方式 (ali|qiliu) */
  rule?: { [key: string]: string }
}

export interface UploadFile {
  /** uid */
  uid: string
  /** 文件名 */
  name: string
  /** 文件类型 */
  mime_type: string
  /** 文件大小 */
  file_size: number
  /** 原始文件 */
  originFile?: File
  /** 上传进度 0～1 */
  percent?: number
  /** 文件上传状态 */
  status?: 'waiting' | 'uploading' | 'uploaded' | 'error'
  /** response */
  response?: any
  /** 上传失败原因 */
  errorMessage?: string
  /** 封面图 */
  thumbUrl?: string
  /** 宽 */
  width?: number
  /** 高 */
  height?: number
  /** 宽高比 */
  aspect?: number
  /** 旋转角度 */
  transform?: string
  /** md5值 */
  md5_file?: string
  /** 后缀 */
  extension?: string
  /** oss 路径 */
  oss_path?: string
  /** 文件所属类型 */
  type?: string
}

export interface Info {
  file?: UploadFile
  fileList?: Array<UploadFile>
}

export interface UploadProps {
  files?: Array<UploadFile>
  /** 配置项 */
  options?: UploadOptions
  /** 创建OSS参数 */
  params?: any
  /** 上传开始 */
  onStart?: Noop
  /** beforeUpload */
  beforeUpload?: PromiseFn
  /** afterUpload */
  afterUpload?: PromiseFn
  /** needUpdateParams */
  needUpdateParams?: PromiseFn
  /** file change */
  onChange?: MultiFileFn
  /** file Succeed */
  onSucceed?: MultiFileFn
  /** file Failed */
  onFailed?: MultiFileFn
  /** complete */
  onComplete?: MultiFileFn
}

export interface AliProps {
  /** 创建OSS参数 */
  params: Object
  /** 上传的文件 */
  file: UploadFile
  /** 配置项 */
  options?: UploadOptions
  /** onChange */
  onChange?: SingleFileFn
  /** 单个文件 succeed */
  onSucceed?: SingleFileFn
  /** 单个文件 failed */
  onFailed?: SingleFileFn
  /** 上传后处理 */
  afterUpload?: PromiseFn
  /** 参数过期 需要更新参数 */
  needUpdateParams?: PromiseFn
}

export interface UploadParams {
  accessKeyId?: string
  accessKeySecret?: string
  stsToken?: string
  bucket?: string
  region?: string
  qiniuToken?: string
}

export interface QiniuProps {
  /** 创建qiniu参数 */
  params: UploadParams
  /** 上传的文件 */
  file: UploadFile
  /** 配置项 */
  options?: UploadOptions
  /** onChange */
  onChange?: SingleFileFn
  /** 单个文件 succeed */
  onSucceed?: SingleFileFn
  /** 单个文件 failed */
  onFailed?: SingleFileFn
  /** 上传后处理 */
  afterUpload?: PromiseFn
  /** 参数过期 需要更新参数 */
  needUpdateParams?: PromiseFn
}
export interface QiNiuUploadConfig {
  /** 是否开启 cdn 加速 */
  useCdnDomain: boolean
  /** 是否对分片进行 md5校验 */
  checkByMD5?: boolean
  /** 强制直传 */
  forceDirect?: boolean
  /** 上传失败后重试次数 */
  retryCount?: number
  /** 自定义上传域名 */
  uphost?: string
  /** 自定义分片上传并发请求量 */
  concurrentRequestLimit?: number
  /** 是否禁止静态日志上报 */
  disableStatisticsReport?: boolean
  /** 分片大小，单位为 MB */
  chunkSize?: number
  /** 上传域名协议 */
  upprotocol?: 'http:' | 'https:'
}

export interface Subscription {
  /** 用来标示该 Subscription 是否被取消订阅的标示位 */
  closed: boolean
  /** 取消 observer 的订阅 */
  unsubscribe(): void
}
export type Noop = () => void

export type PromiseFn = (file: UploadFile) => Promise<any>

export type SingleFileFn = (file: UploadFile) => void

export type MultiFileFn = ({ file, fileList }: Info) => void
