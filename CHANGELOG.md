## 更新 3.0.4 (2021-10-23)

- 升级webpack5
- 升级react 17
- 弃用worker-loader(webpack5支持web worker)
- file.worker.js 放到静态资源里 https://static.hellorf.com/fe/hf-upload/file.worker.js

#### 无奈之举：
使用import.meta.url无法打包成commonjs，使用url创建worker需要在同一个域名下，只能使用blob创建worker
  
