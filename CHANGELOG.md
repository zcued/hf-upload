## 更新 3.0.0 (2021-10-21)

- 升级webpack5
- 升级react 17
- 弃用worker-loader(webpack5支持web worker)

#### 无奈之举：
- 使用import.meta.url无法打包成commonjs，
- 使用url创建worker需要在同一个域名下
只能使用blob创建worker
- WORKER_PATH = https://static.hellorf.com/fe/hf-upload/file.worker.js
  
