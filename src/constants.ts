/** 默认最高并发数量 2 */
export const CONCURRENCY = 2

/** 超时重新上传次数 */
export const RETRY_COUNT_MAX = 3

/** 默认超时时间60s */
export const TIMEOUT = 60 * 1000

/** 默认分片大小为500kb */
export const ALI_CHUNK_SIZE = 500

/** 最小分片大小为100kb */
export const MIN_PART_SIZE = 100

/** 错误信息提示 */
export const ERROR_TEXT = '网络故障请重试'

/** qiniu分片上传时，分片大小为1 单位MB */
export const QINIU_CHUNK_SIZE = 1
