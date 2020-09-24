import React, { useState, useRef, memo } from 'react'
import HFUpload from '../../src/index'
import List from '../List'
import { getFileExt } from '../../src/util'
import '../style.scss'

function QiniuExample() {
  const inputRef = useRef(null)
  const uploader = useRef(null)
  const [fileList, setFileList] = useState([])
  const [token, setToken] = useState('')

  /** 允许的视频格式 */
  const UPLOAD_VIDEO_ACCEPTS = ['AVI', 'MOV', 'RMVB', 'RM', 'FLV', 'MP4', '3GP']
  const options = {
    rule: { video: 'qiniu' },
  }
  const createUploader = (params) => {
    uploader.current = new HFUpload({
      params,
      options,
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
          const ext = getFileExt(file.name).toUpperCase()
          // 视频
          if (!UPLOAD_VIDEO_ACCEPTS.includes(ext.toLocaleUpperCase())) {
            return reject('文件类型不支持')
          }
          file.type = 'video'
          resolve()
        })
      },
    })
  }

  const selectFile = () => {
    const el = inputRef.current
    if (el) {
      el.click()
    }
  }

  const handleChange = (e) => {
    const param = { qiniuToken: e.target.value }
    createUploader(param)
    setToken(e.target.value)
  }

  const startUpload = (e) => {
    if (!token) {
      alert('请输入参数')
      return
    }
    const files = e.target.files
    uploader.current.add([...files])
  }

  return (
    <div className="wrap">
      <div className="create-tips">请输入token开始上传</div>
      <input
        type="text"
        placeholder="请输入token"
        onBlur={(e) => handleChange(e)}
      />
      <div className="create-button" onClick={selectFile}>
        <input
          ref={inputRef}
          type="file"
          accept=""
          multiple={true}
          onChange={startUpload}
          style={{ display: 'none' }}
        />
        上 传
      </div>
      <List
        fileList={fileList}
        onAbort={(uid) => uploader.current.abort(uid)}
        reUpload={(uid) => uploader.current.reupload(uid)}
        onDelete={(uid) => uploader.current.delete(uid)}
      />
    </div>
  )
}

export default memo(QiniuExample)
