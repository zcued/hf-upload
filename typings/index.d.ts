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

  interface File {
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
    status?: string
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
    /** 预处理中 */
    pretreatment?: boolean
  }
}
