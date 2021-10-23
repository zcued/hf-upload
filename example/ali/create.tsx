import React, { memo, useState } from 'react'

export default memo(function CreateOss({ onSubmit }: { onSubmit: (options: any) => void }) {
  const [options, setOptions] = useState({})

  const handleChange = (e, key) => {
    options[key] = e.target.value.trim()
    setOptions({ ...options })
  }

  const handleClick = () => {
    const values = Object.values(options).filter((_) => _)
    if (values.length !== 5) {
      return alert('请输入所有参数！')
    }
    onSubmit(options)
  }

  return (
    <div className="create-form">
      <div className="create-tips">请输入以下信息创建OSS开始上传</div>
      <input type="text" placeholder="请输入accessKeyId" onBlur={(e) => handleChange(e, 'accessKeyId')} />
      <input type="text" placeholder="请输入accessKeySecret" onBlur={(e) => handleChange(e, 'accessKeySecret')} />
      <input type="text" placeholder="请输入stsToken" onBlur={(e) => handleChange(e, 'stsToken')} />
      <input type="text" placeholder="请输入bucket" onBlur={(e) => handleChange(e, 'bucket')} />
      <input type="text" placeholder="请输入region" onBlur={(e) => handleChange(e, 'region')} />
      <div className="create-button" onClick={handleClick}>
        创 建
      </div>
    </div>
  )
})
