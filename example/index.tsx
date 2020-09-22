import React, { useRef, useState } from 'react'
import HFUpload from '../lib'
import UploadButton from './upload'
import CreateOss from './create'
import List from './list'
import './style.scss'

export default function Example() {
  const uploader = useRef(null)
  const [fileList, setFileList] = useState([])
  const [status, setStatus] = useState('waiting')

  const createUploader = (params) => {
    uploader.current = new HFUpload({
      params,
      onChange: ({ fileList: nextFileList }) => {
        setFileList([...nextFileList])
      },
      onSucceed: ({ fileList: nextFileList }) => {
        setFileList([...nextFileList])
      },
      onFailed: ({ fileList: nextFileList }) => {
        setFileList([...nextFileList])
      },
      needUpdateParams: (file) => {
        return new Promise((resolve, reject) => {
          // 重新请求参数 updateParams
          resolve()
        })
      },
      beforeUpload: (file) => {
        return new Promise((resolve, reject) => {
          const isOutRange = file.file_size / 1024 / 1024 > 5
          if (isOutRange) {
            return reject('上传文件过大')
          }
          resolve()
        })
      },
    })
    setStatus('start')
  }

  const startUpload = (files) => {
    uploader.current.add(files)
  }

  let child = <CreateOss onSubmit={createUploader} />

  if (status === 'start') {
    child = (
      <>
        <UploadButton onChange={startUpload} />
        <List
          fileList={fileList}
          onAbort={(uid) => uploader.current.abort(uid)}
          reUpload={(uid) => uploader.current.reupload(uid)}
          onDelete={(uid) => uploader.current.delete(uid)}
        />
      </>
    )
  }

  return <div className="wrap">{child}</div>
}
