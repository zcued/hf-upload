import React, { memo, useState } from 'react'

export default memo(function CreateOss({ onSubmit }: { onSubmit: Function }) {
  const [options, setOptions] = useState({
    accessKeyId: 'STS.NSzfaqDhVwdjK59oV1Gq6S9NF',
    accessKeySecret: 'FPGYmuVAh23mkTvnmKjtfjkbFs6Ca8E8woBd8BnYhsFB',
    stsToken:
      'CAIS3wJ1q6Ft5B2yfSjIr5DPLdvFqbd3wKaBSROIi1ZkS/4avPzlpDz2IH9NeXhqA+AYsf41mm5W6fkclqRzRptBQlbKatBr9YhMqfI9hTA1/Z7b16cNrbH4M6/6edqSvqL7Z+H+U6nXGJOEYEzFkSle2KbzcS7YMXWuLZyOj+xFDKwQRRLqQTdCCctbAQFgpcQGVx7WLu3/Fh/xnlLZFlZz2Hp7kngtwK642NG59x7CjUXz0PMov4D2K5TGCs53J8VHTsuS1u57fba7h0w20RVR87psh6Fp4CrOusrnY2Nc+BKbKeHZgJYNZQZyffo9ALUW7qq+x/11vujUjYqyxx9IM+BRXmPDQZjngum8Qbr5b41mKu2gYSWUio3fbqOY6V10PSgpUypRYMckJ3NKDhghdyrXMKfP+iqRPV7+GvLfgP9pi8ArkQu3ooSQQliCR7GeyygfIYQnc1g4q8Xmd8lHlsUagAGZRt0gz05w8cl8Rk7hqLzLr2qwt1/RGWbodpHOlnwmr1slaJZ54pFt33tPjxHPf+5N5N1/2MV/52pxiDeQIlxZ1wiXnZ5a41c3pF207M6+lLKpKxJCD6k/OeEKF7hONL35ifC6l26Jkh8JqIsMnaEfjTmfkaNKsDyI7coymaQIzw==',
    bucket: 'hellorf-damfile',
    region: 'oss-cn-beijing',
  })

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
      <input
        type="text"
        placeholder="请输入accessKeyId"
        onBlur={(e) => handleChange(e, 'accessKeyId')}
      />
      <input
        type="text"
        placeholder="请输入accessKeySecret"
        onBlur={(e) => handleChange(e, 'accessKeySecret')}
      />
      <input
        type="text"
        placeholder="请输入stsToken"
        onBlur={(e) => handleChange(e, 'stsToken')}
      />
      <input
        type="text"
        placeholder="请输入bucket"
        onBlur={(e) => handleChange(e, 'bucket')}
      />
      <input
        type="text"
        placeholder="请输入region"
        onBlur={(e) => handleChange(e, 'region')}
      />
      <div className="create-button" onClick={handleClick}>
        创 建
      </div>
    </div>
  )
})
