import React, { memo, useState } from 'react'
import styled from 'styled-components'

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
    <Wrap>
      <div className="tips">请输入以下信息创建OSS开始上传</div>
      <Input
        type="text"
        placeholder="请输入accessKeyId"
        onBlur={(e) => handleChange(e, 'accessKeyId')}
      />
      <Input
        type="text"
        placeholder="请输入accessKeySecret"
        onBlur={(e) => handleChange(e, 'accessKeySecret')}
      />
      <Input
        type="text"
        placeholder="请输入stsToken"
        onBlur={(e) => handleChange(e, 'stsToken')}
      />
      <Input
        type="text"
        placeholder="请输入bucket"
        onBlur={(e) => handleChange(e, 'bucket')}
      />
      <Input
        type="text"
        placeholder="请输入region"
        onBlur={(e) => handleChange(e, 'region')}
      />
      <Button onClick={handleClick}>创 建</Button>
    </Wrap>
  )
})

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;

  .tips {
    width: 100%;
    color: white;
    font-size: 14px;
    text-align: left;
    margin-bottom: 24px;
  }
`

const Input = styled.input`
  box-sizing: border-box;
  width: 100%;
  height: 42px;
  margin-bottom: 24px;
  padding: 0 16px;
  border: 1px solid #ddd;
  border-radius: 2px;
  outline: 0;
  color: #333;
`

export const Button = styled.div`
  width: 108px;
  height: 42px;
  border: 0;
  border-radius: 4px;

  text-align: center;
  line-height: 42px;
  font-size: 14px;

  color: white;
  background: rgba(54, 66, 74, 1);
  outline: 0;
  cursor: pointer;

  :hover {
    opacity: 0.7;
  }
`
