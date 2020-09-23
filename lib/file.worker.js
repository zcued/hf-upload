"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const spark_md5_1 = __importDefault(require("spark-md5"));
onmessage = function (e) {
    function md5File(file) {
        const proto = Object.getPrototypeOf(file);
        const blobSlice = proto.slice || proto.mozSlice || proto.webkitSlice, chunkSize = 2097152, // Read in chunks of 2MB
        chunks = Math.ceil(file.size / chunkSize), spark = new spark_md5_1.default.ArrayBuffer(), fileReader = new FileReader();
        let currentChunk = 0;
        fileReader.onload = (e) => {
            spark.append(e.target.result); // Append array buffer
            currentChunk++;
            if (currentChunk < chunks) {
                loadNext();
            }
            else {
                postMessage(spark.end());
                close();
            }
        };
        fileReader.onerror = function () {
            postMessage('');
            close();
            throw fileReader.error;
        };
        function loadNext() {
            const start = currentChunk * chunkSize, end = start + chunkSize >= file.file_size
                ? file.file_size
                : start + chunkSize;
            fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        }
        loadNext();
    }
    if (e.data && e.data.file) {
        md5File(e.data.file);
    }
};
