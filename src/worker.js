export default function createWorker() {
  /* separator */
  importScripts('https://cdnout.com/spark-md5/')
  onmessage = function (e) {
    function md5File(file) {
      const proto = Object.getPrototypeOf(file)
      const blobSlice = proto.slice || proto.mozSlice || proto.webkitSlice,
        chunkSize = 2097152, // Read in chunks of 2MB
        chunks = Math.ceil(file.size / chunkSize),
        spark = new SparkMD5.ArrayBuffer(),
        fileReader = new FileReader()
      let currentChunk = 0

      fileReader.onload = (event) => {
        spark.append(event.target.result) // Append array buffer
        currentChunk += 1
        if (currentChunk < chunks) {
          loadNext()
        } else {
          postMessage(spark.end())
          close()
        }
      }

      fileReader.onerror = function () {
        postMessage('')
        close()
        throw new Error(fileReader.error)
      }

      function loadNext() {
        var start = currentChunk * chunkSize,
          end = start + chunkSize >= file.file_size ? file.file_size : start + chunkSize

        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
      }

      loadNext()
    }

    if (e.data && e.data.file) {
      md5File(e.data.file)
    }
  }
  /* separator */
}
