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
  beforeUpload?: PromiseAction
  /** afterUpload */
  afterUpload?: PromiseAction
  /** needUpdateParams */
  needUpdateParams?: PromiseAction
  /** file change */
  onChange?: MultiAction
  /** file Succeed */
  onSucceed?: MultiAction
  /** file Failed */
  onFailed?: MultiAction
  /** complete */
  onComplete?: MultiAction
}

export interface AliProps {
  /** 创建OSS参数 */
  params: Object
  /** 上传的文件 */
  file: UploadFile
  /** 配置项 */
  options?: UploadOptions
  /** onChange */
  onChange?: SingleAction
  /** 单个文件 succeed */
  onSucceed?: SingleAction
  /** 单个文件 failed */
  onFailed?: SingleAction
  /** 上传后处理 */
  afterUpload?: PromiseAction
  /** 参数过期 需要更新参数 */
  needUpdateParams?: PromiseAction
}

export type Noop = () => void

export type PromiseAction = (file: UploadFile) => Promise<any>

export type SingleAction = (file: UploadFile) => void

export type MultiAction = ({ file, fileList }: Info) => void
