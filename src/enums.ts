// 上传状态
export enum UploadStatus {
  /** 正在处理中 */
  Waiting = 'waiting',
  /** 上传中 */
  Uploading = 'uploading',
  /**  失败 */
  Error = 'error',
  /** 完成 */
  Uploaded = 'uploaded',
}
