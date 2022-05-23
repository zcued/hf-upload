## 3.2.5 (2022-05-23)

### Bug Fixes

- 修复关闭 md5 功能依旧创建 worker 问题 ([f856455](https://github.com/zcued/hf-upload/commit/f8564551c13c0623d92c375c5c462aa4ed06b2c1))
- 修复参数过期 ([14d79ed](https://github.com/zcued/hf-upload/commit/14d79edff53f5ef69d51ef8e4bb8372f0c9c5a0c))
- 修复上传顺序 ([a592e9e](https://github.com/zcued/hf-upload/commit/a592e9e31e193ceff94f9ba880349d4d9c42bc0f))
- 修复上传中删除文件，导致最后 checkComplete 不准确 ([79e16a5](https://github.com/zcued/hf-upload/commit/79e16a514d756236197b30fbe8f9345481901f44))
- 修复 File is undefined in safari ([8d537fd](https://github.com/zcued/hf-upload/commit/8d537fdd2a64b541217c3d17ca6697b2d7d1e425))

### Features

- 增加图片缩略图 thumbUrl，原 thumbUrl 字段改为 originUrl ([5b76063](https://github.com/zcued/hf-upload/commit/5b760634e69303752990b0cc2f29afd490478387))
- 自定义上传 key & 可配置管理文件访问权限 ([010a265](https://github.com/zcued/hf-upload/commit/010a265244be7c420b351c0993539e7ae1dcb37a))
- add previewSize option ([34daf78](https://github.com/zcued/hf-upload/commit/34daf78ddb303156d6dd23aaf2747df14a955540))
- add workerUrl options ([126638a](https://github.com/zcued/hf-upload/commit/126638a28bda2693eb687361775d6b6ea89ca9d5))
