import React, { memo, useState } from 'react'

export default memo(function List({
  fileList,
  onAbort,
  reUpload,
  onDelete,
}: {
  fileList: Array<any>
  onAbort: Function
  reUpload: Function
  onDelete: Function
}) {
  const [isBreak, setIsBreak] = useState(false)

  const handleReupload = (uid) => {
    reUpload(uid)
    setIsBreak(false)
  }

  const handleAbort = (uid) => {
    onAbort(uid)
    setIsBreak(true)
  }

  const _renderUploadStatus = (file) => {
    if (file.percent === 100) {
      return <span>上传成功</span>
    }

    if (file.status === 'waiting') {
      return <span>正在处理中</span>
    }

    if (file.status === 'error' && file.errorMessage) {
      return (
        <span className="error action" onClick={() => reUpload(file.uid)}>
          {file.errorMessage}
        </span>
      )
    }
    return (
      <>
        <span className="action" onClick={() => onAbort(file.uid)}>
          {parseInt(file.percent, 10)}%
        </span>
        <span
          className="action"
          onClick={
            isBreak
              ? () => handleReupload(file.uid)
              : () => handleAbort(file.uid)
          }
        >
          {isBreak ? '恢复' : '暂停'}
        </span>
      </>
    )
  }

  return (
    <div className="upload-list">
      {fileList.map((file) => (
        <div key={file.uid} className="item">
          <div className="row">
            <span className="name" title={file.name}>
              {file.name}
            </span>
            <span>{getFileSize(file.file_size)}</span>
            {_renderUploadStatus(file)}
            <span className="action" onClick={() => onDelete(file.uid)}>
              删除
            </span>
          </div>
          <Progress percent={file.percent} />
        </div>
      ))}
    </div>
  )
})

const getFileSize = (bytes, decimals = 2): string => {
  if (!bytes) {
    return null
  }

  const sz = 'BKMGTP'
  const factor = Math.floor((bytes.toString().length - 1) / 3)
  if (factor === 0 || factor === 1) {
    decimals = 0
  }

  return (bytes / Math.pow(1024, factor)).toFixed(decimals) + sz[factor]
}

function Progress({ percent }: { percent: number }) {
  const strokeWidth = 3
  return (
    <div
      className="progress"
      style={{
        backgroundColor: '#ddd',
        height: strokeWidth,
        borderRadius: strokeWidth / 2,
      }}
    >
      <span
        className="filler"
        style={{
          backgroundColor: '#678294',
          width: `${percent}%`,
          borderRadius: strokeWidth / 2,
        }}
      />
    </div>
  )
}
