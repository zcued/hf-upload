import React, { memo, useRef } from 'react'

export default memo(function Upload({ onChange }: { onChange: Function }) {
  const inputRef = useRef(null)

  const selectFile = () => {
    const el = inputRef.current
    if (el) {
      el.click()
    }
  }

  const handleChange = (e) => {
    const files = e.target.files
    onChange([...files])
    e.target.value = null
  }

  return (
    <div className="create-button" onClick={selectFile}>
      <input
        ref={inputRef}
        type="file"
        accept=".PNG,.JPG,.MP4"
        multiple={true}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      上 传
    </div>
  )
})
