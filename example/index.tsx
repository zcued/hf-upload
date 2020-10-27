import React, { memo } from 'react'
import { Link } from 'react-router-dom'
import './style.scss'

function Example() {
  return (
    <div className="container">
      <div className="create-button">
        <Link to="/ali">使用 ali-oss 上传</Link>
      </div>
      <div className="create-button">
        <Link to="/qiniu">使用 qiniu 上传</Link>
      </div>
    </div>
  )
}

export default memo(Example)
