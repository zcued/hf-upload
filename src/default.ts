import {
  CONCURRENCY,
  PART_SIZE,
  TIMEOUT,
  ERROR_TEXT,
  RETRY_COUNT_MAX,
} from './constants'
import { UploadOptions } from './types'

const defaultOptions: UploadOptions = {
  concurrency: CONCURRENCY,
  partSize: PART_SIZE,
  timeout: TIMEOUT,
  errorText: ERROR_TEXT,
  retryCountMax: RETRY_COUNT_MAX,
}

export default defaultOptions
