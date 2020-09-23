import OssUpload from './upload-ali'
import QiniuUpload from './upload-qiniu'

// 获取上传实例
function Upload(type, typeConfig, params) {
  if (typeConfig[type] === 'qiniu') {
    return new QiniuUpload({ ...params })
  }

  return new OssUpload({ ...params })
}

export default Upload
