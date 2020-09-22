declare namespace HFUploader {
  interface Options {
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

  interface UploadFile {
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

  interface UploadProps {
    /** 创建实例的参数 */
    params: Object
    /** 上传的文件 */
    file: HFUploader.UploadFile
    /** 配置项 */
    options?: HFUploader.Options
    /** onChange */
    onChange?: (file: HFUploader.UploadFile) => void
    /** 单个文件 succeed */
    onSucceed?: (file: HFUploader.UploadFile) => void
    /** 单个文件 failed */
    onFailed?: (file: HFUploader.UploadFile) => void
    /** 上传后处理 */
    afterUpload?: Function
    /** 参数过期 需要更新参数 */
    needUpdateParams?: Function
  }

  interface QiNiuUploadConfig {
    /** 是否开启 cdn 加速 */
    useCdnDomain: boolean
    /** 是否对分片进行 md5校验 */
    checkByMD5: boolean
    /** 强制直传 */
    forceDirect: boolean
    /** 上传失败后重试次数 */
    retryCount: number
    /** 自定义上传域名 */
    uphost: string
    /** 自定义分片上传并发请求量 */
    concurrentRequestLimit: number
    /** 是否禁止静态日志上报 */
    disableStatisticsReport: boolean
    /** 分片大小，单位为 MB */
    chunkSize: number
    /** 上传域名协议 */
    upprotocol: 'http:' | 'https:'
  }

  interface Subscription {
    /** 用来标示该 Subscription 是否被取消订阅的标示位 */
    closed: boolean
    /** 取消 observer 的订阅 */
    unsubscribe(): void
  }
}
