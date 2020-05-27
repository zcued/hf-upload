"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _sparkMd = _interopRequireDefault(require("spark-md5"));

onmessage = function onmessage(e) {
  function md5File(file) {
    var proto = Object.getPrototypeOf(file);
    var blobSlice = proto.slice || proto.mozSlice || proto.webkitSlice,
        chunkSize = 2097152,
        // Read in chunks of 2MB
    chunks = Math.ceil(file.size / chunkSize),
        spark = new _sparkMd["default"].ArrayBuffer(),
        fileReader = new FileReader();
    var currentChunk = 0;

    fileReader.onload = function (e) {
      spark.append(e.target.result); // Append array buffer

      currentChunk++;

      if (currentChunk < chunks) {
        loadNext();
      } else {
        postMessage(spark.end());
        close();
      }
    };

    fileReader.onerror = function () {
      postMessage('');
      close();
      throw new TypeError('md5: something went wrong ');
    };

    function loadNext() {
      var start = currentChunk * chunkSize,
          end = start + chunkSize >= file.file_size ? file.file_size : start + chunkSize;
      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }

    loadNext();
  }

  if (e.data && e.data.file) {
    md5File(e.data.file);
  }
};