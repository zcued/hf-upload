"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preproccessFile = exports.fileToObject = exports.getFileExt = exports.getUid = exports.deleteId = exports.deleteFile = exports.updateFileLists = exports.noop = void 0;
function noop() {
    return null;
}
exports.noop = noop;
exports.updateFileLists = (file, fileLists) => {
    const i = fileLists.findIndex((_) => _.uid === file.uid);
    i > -1 ? (fileLists[i] = Object.assign({}, file)) : fileLists.push(file);
    return fileLists;
};
exports.deleteFile = (uid, fileLists) => {
    return fileLists.filter((_) => _.uid !== uid);
};
exports.deleteId = (uid, ids) => {
    return ids.filter((_) => _ !== uid);
};
function getUid() {
    let count = 0;
    function getkey() {
        return `hf-upload-${new Date().valueOf()}-${count++}`;
    }
    return getkey;
}
exports.getUid = getUid;
const uid = getUid();
function getFileExt(fileName) {
    if (!fileName.includes('.')) {
        return '';
    }
    const tempArr = fileName.split('.');
    return tempArr[tempArr.length - 1];
}
exports.getFileExt = getFileExt;
function fileToObject(file) {
    const { name, size, type, percent } = file, rest = __rest(file, ["name", "size", "type", "percent"]);
    return Object.assign({ uid: uid(), name: name, file_size: size, mime_type: type || 'application/octet-stream', percent: percent || 0, originFile: file, extension: getFileExt(name).toLowerCase() }, rest);
}
exports.fileToObject = fileToObject;
const rotation = {
    1: 'rotate(0deg)',
    3: 'rotate(180deg)',
    6: 'rotate(90deg)',
    8: 'rotate(270deg)',
};
const getImgPreview = (file, callback) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const blobUrl = window.URL.createObjectURL(file);
        if (reader.error) {
            console.error('read file error', reader.error);
            if (callback) {
                callback(blobUrl);
            }
            return;
        }
        const readerResult = reader.result;
        const scanner = new DataView(readerResult);
        let idx = 0;
        let value = 1; // Non-rotated is the default
        let maxBytes = scanner.byteLength;
        // 不是 JPEG 文件
        if (scanner.getUint16(idx, false) != 0xffd8) {
            maxBytes = 0;
        }
        idx += 2;
        while (idx < maxBytes - 2) {
            const uint16 = scanner.getUint16(idx);
            idx += 2;
            switch (uint16) {
                case 0xffe1: {
                    // Start of EXIF
                    const exifLength = scanner.getUint16(idx);
                    maxBytes = exifLength - idx;
                    idx += 2;
                    break;
                }
                case 0x0112: {
                    // Orientation tag
                    // Read the value, its 6 bytes further out
                    // See page 102 at the following URL
                    // http://www.kodak.com/global/plugins/acrobat/en/service/digCam/exifStandard2.pdf
                    value = scanner.getUint16(idx + 6, false);
                    maxBytes = 0; // Stop scanning
                    break;
                }
                default:
                    break;
            }
        }
        const img = new Image();
        img.src = blobUrl;
        img.onload = () => {
            const width = img.width;
            const height = img.height;
            const aspect = width / height;
            callback(blobUrl, width, height, aspect, value);
        };
        img.onerror = () => {
            callback();
        };
    };
    reader.readAsArrayBuffer(file);
};
exports.preproccessFile = (file) => {
    return new Promise((resolve) => {
        const unPreview = typeof document === 'undefined' ||
            typeof window === 'undefined' ||
            !FileReader ||
            !File ||
            !(file.originFile instanceof File) ||
            file.thumbUrl !== undefined ||
            file.mime_type.indexOf('image') === -1;
        function preview(f) {
            f.thumbUrl = '';
            getImgPreview(f.originFile, (previewDataUrl, width, height, aspect, value = 1) => {
                f.thumbUrl = previewDataUrl;
                f.width = width;
                f.height = height;
                f.aspect = aspect;
                f.transform = rotation[value];
                resolve(f);
            });
        }
        if (unPreview) {
            resolve(file);
        }
        else {
            preview(file);
        }
    });
};
