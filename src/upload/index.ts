import OssUpload from './upload-ali'
import QiniuUpload from './upload-qiniu'

// 获取上传实例
function Upload(parameter) {
  const { file, options, params } = parameter
  const { rule } = options
  const {
    accessKeyId,
    accessKeySecret,
    stsToken,
    bucket,
    region,
    qiniuToken,
  } = params

  if (rule && rule[file.type] === 'qiniu') {
    parameter.params = { qiniuToken }
    return new QiniuUpload({ ...parameter })
  }
  parameter.params = { accessKeyId, accessKeySecret, stsToken, bucket, region }
  return new OssUpload({ ...parameter })
}

export default Upload
