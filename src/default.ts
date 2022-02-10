import { CONCURRENCY, ALI_CHUNK_SIZE, TIMEOUT, ERROR_TEXT, RETRY_COUNT_MAX } from './constants'
import { UploadOptions } from './types'

const defaultOptions: UploadOptions = {
  concurrency: CONCURRENCY,
  partSize: ALI_CHUNK_SIZE,
  timeout: TIMEOUT,
  errorText: ERROR_TEXT,
  retryCountMax: RETRY_COUNT_MAX,
  md5: true,
}

export default defaultOptions
