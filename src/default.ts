import {
  CONCURRENCY,
  ALI_CHUNK_SIZE,
  TIMEOUT,
  ERROR_TEXT,
  RETRY_COUNT_MAX,
  IS_ORDER,
} from './constants'
import { UploadOptions } from './types'

const defaultOptions: UploadOptions = {
  concurrency: CONCURRENCY,
  partSize: ALI_CHUNK_SIZE,
  timeout: TIMEOUT,
  errorText: ERROR_TEXT,
  retryCountMax: RETRY_COUNT_MAX,
  isOrder: IS_ORDER,
}

export default defaultOptions
