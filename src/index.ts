import PQueue from './p-queue'
import Upload from './upload'
import {
  updateFileLists,
  deleteFile,
  deleteId,
  preproccessFile,
  fileToObject,
} from './util'
import defaultOptions from './default'
import { UploadStatus } from './enums'
import {
  UploadFile,
  UploadOptions,
  UploadProps,
  MultiFileFn,
  PromiseFn,
  Noop,
} from './types'

export * from './types'

export default class HFUploader {
  map: Object = {}
  ids: Array<string> = []
  params: any
  queue: PQueue
  options: UploadOptions
  fileList: Array<UploadFile> = []
  needUpdateParams?: PromiseFn
  onStart?: Noop
  afterUpload?: PromiseFn
  beforeUpload?: PromiseFn
  onChange: MultiFileFn
  onSucceed: MultiFileFn
  onFailed: MultiFileFn
  onComplete: MultiFileFn
  temporary: Array<any>
  md5Tem: { [key: string]: any }

  constructor({
    files,
    options = {},
    params,
    onStart,
    onChange,
    onSucceed,
    onFailed,
    onComplete,
    afterUpload,
    beforeUpload,
    needUpdateParams,
  }: UploadProps) {
    this.map = {}
    this.fileList = files || []
    this.params = { ...params }
    this.queue = new PQueue({
      concurrency: options.concurrency || defaultOptions.concurrency,
    })

    this.options = { ...defaultOptions, ...options }
    this.onStart = onStart
    this.onChange = onChange
    this.onSucceed = onSucceed
    this.onFailed = onFailed
    this.onComplete = onComplete
    this.afterUpload = afterUpload
    this.beforeUpload = beforeUpload
    this.needUpdateParams = needUpdateParams
    this.temporary = []
    this.md5Tem = {}
  }

  // 更新参数
  updateParams = (params) => {
    this.params = { ...params }

    for (let uid in this.map) {
      if (this.map[uid]) {
        this.map[uid].updateParams(params)
      }
    }
  }

  // 添加
  add = (files: Array<UploadFile>) => {
    if (this.onStart) {
      this.onStart()
    }

    this.start(files)
  }

  // 暂停
  abort = (uid: string) => {
    if (this.map[uid]) {
      this.map[uid].cancelUpload()
      this.queue._next()
    }
  }

  // 删除
  delete = (uid: string) => {
    this.abort(uid)
    this.queue.clearWithId(uid)
    this.fileList = deleteFile(uid, this.fileList)
    this.ids = deleteId(uid, this.ids)
    if (this.onChange) {
      this.onChange({ fileList: this.fileList })
    }
  }

  // 清空
  clear = () => {
    this.fileList = []
    this.queue.clear()
    for (const key in this.map) {
      if (this.map[key]) {
        this.map[key].cancelUpload()
      }
    }
  }

  // 重新上传
  reupload = (uid: string) => {
    const targetUploader = this.map[uid]
    if (targetUploader) {
      targetUploader.reUpload()
    }
  }

  // 开始上传
  start = (files: Array<UploadFile>) => {
    const addFile = (file, index?: number) => {
      if (typeof index === 'number') {
        this.temporary[index].isrun = true
      }
      this.queue.add(
        () => {
          const parameter = {
            file,
            params: this.params,
            options: this.options,
            onChange: this.handleChange,
            onSucceed: this.handleSucceed,
            onFailed: this.handleFailed,
            afterUpload: this.afterUpload,
            needUpdateParams: this.needUpdateParams,
          }
          const upload = Upload(parameter)
          this.map[file.uid] = upload
          return upload.startUpload()
        },
        { id: file.uid }
      )
    }

    const createWorker = async (f, onmessage) => {
      const Worker: any = await import('./file.worker.js')
      const myWorker = new Worker.default()
      myWorker.postMessage({ file: f.originFile })
      myWorker.onmessage = (e) => onmessage(e, myWorker)
    }

    this.temporary = Array.from({ length: files.length })

    const justUpload = (f, index, defaultIsRun) => {
      createWorker(f, (e, myWorker) => {
        this.md5Tem[f.uid] = e.data
        myWorker.terminate()
      })

      this.temporary[index] = { f, isrun: defaultIsRun }
      if (this.temporary.slice(0, index).every((item) => item)) {
        let lastIndex = files.length
        const afterHavData = this.temporary.slice(index, files.length)

        for (let tem in afterHavData) {
          const item = afterHavData[tem]
          if (item === undefined) {
            lastIndex = Number(tem)
            break
          }
        }

        this.temporary.slice(0, lastIndex).forEach((item, ind) => {
          if (!item.isrun) {
            addFile(item.f, ind)
          }
        })
      }
    }

    files.forEach((f, index) => {
      const objFile = fileToObject(f)
      objFile.status = UploadStatus.Waiting
      this.handleChange(objFile)
      // 计算 width height aspect transform thumbUrl
      preproccessFile(objFile).then(() => {
        const before = this.beforeUpload && this.beforeUpload(objFile)
        if (before && before.then) {
          before
            .then(() => {
              justUpload(objFile, index, false)
            })
            .catch((e) => {
              objFile.status = UploadStatus.Error
              objFile.errorMessage = typeof e === 'string' ? e : 'error'
              this.handleFailed(objFile)
              justUpload(objFile, index, true)
            })
        } else {
          justUpload(objFile, index, false)
        }
      })
    })
  }

  handleChange = (file: UploadFile) => {
    const { fileList, onChange } = this
    this.fileList = updateFileLists(file, fileList)
    if (onChange) {
      onChange({ file, fileList })
    }
  }

  handleSucceed = (file: UploadFile) => {
    const success = () => {
      const { fileList, onSucceed, checkComplete } = this
      this.fileList = updateFileLists(file, fileList)
      checkComplete(file.uid)
      if (onSucceed) {
        onSucceed({ file, fileList })
      }
    }

    file.md5_file = this.md5Tem[file.uid]
    const after = this.afterUpload && this.afterUpload(file)
    if (after && after.then) {
      after
        .then(success)
        .catch((err) => {
          file.status = UploadStatus.Error
          file.errorMessage =
            typeof err === 'string' ? err : this.options.errorText
          this.handleFailed(file)
        })
    } else {
      success()
    }
  }

  handleFailed = (file: UploadFile) => {
    const { fileList, onFailed, checkComplete } = this
    this.fileList = updateFileLists(file, fileList)
    checkComplete(file.uid)
    if (onFailed) {
      onFailed({ file, fileList })
    }
  }

  checkComplete = (uid: string) => {
    const { fileList, onComplete } = this
    this.ids.push(uid)
    const dedupeIds = Array.from(new Set(this.ids))
    if (dedupeIds.length === fileList.length && onComplete) {
      onComplete({ fileList })
    }
  }
}
