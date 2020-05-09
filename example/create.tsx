import React, { memo, useState } from 'react'
import styled from 'styled-components'

export default memo(function CreateOss({ onSubmit }: { onSubmit: Function }) {
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
