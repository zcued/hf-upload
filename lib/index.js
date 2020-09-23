"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const p_queue_1 = __importDefault(require("./p-queue"));
const upload_1 = __importDefault(require("./upload"));
const util_1 = require("./util");
const default_1 = __importDefault(require("./default"));
__exportStar(require("./types"), exports);
class HFUploader {
    constructor({ files, options = {}, params, onStart, onChange, onSucceed, onFailed, onComplete, afterUpload, beforeUpload, needUpdateParams, }) {
        this.map = {};
        this.ids = [];
        this.fileList = [];
        // 更新参数
        this.updateParams = (params) => {
            this.params = Object.assign({}, params);
            for (let uid in this.map) {
                if (this.map[uid]) {
                    this.map[uid].updateParams(params);
                }
            }
        };
        // 添加
        this.add = (files) => {
            if (this.onStart) {
                this.onStart();
            }
            this.start(files);
        };
        // 暂停
        this.abort = (uid) => {
            if (this.map[uid]) {
                this.map[uid].cancelUpload();
                this.queue._next();
            }
        };
        // 删除
        this.delete = (uid) => {
            this.abort(uid);
            this.queue.clearWithId(uid);
            this.fileList = util_1.deleteFile(uid, this.fileList);
            this.ids = util_1.deleteId(uid, this.ids);
            if (this.onChange) {
                this.onChange({ fileList: this.fileList });
            }
        };
        // 清空
        this.clear = () => {
            this.fileList = [];
            this.queue.clear();
            for (const key in this.map) {
                if (this.map[key]) {
                    this.map[key].cancelUpload();
                }
            }
        };
        // 重新上传
        this.reupload = (uid) => {
            const targetUploader = this.map[uid];
            if (targetUploader) {
                targetUploader.reUpload();
            }
        };
        // 开始上传
        this.start = (files) => {
            const addFile = (file) => {
                this.queue.add(() => {
                    const upload = new upload_1.default({
                        file,
                        params: this.params,
                        options: this.options,
                        onChange: this.handleChange,
                        onSucceed: this.handleSucceed,
                        onFailed: this.handleFailed,
                        afterUpload: this.afterUpload,
                        needUpdateParams: this.needUpdateParams,
                    });
                    this.map[file.uid] = upload;
                    return upload.startUpload();
                }, { id: file.uid });
            };
            // 计算md5
            const md5File = (f) => __awaiter(this, void 0, void 0, function* () {
                const Worker = yield Promise.resolve().then(() => __importStar(require('./file.worker.js')));
                const myWorker = new Worker.default();
                myWorker.postMessage({ file: f.originFile });
                myWorker.onmessage = (e) => {
                    f.md5_file = e.data;
                    addFile(f);
                    myWorker.terminate();
                };
            });
            files.forEach((f) => {
                const objFile = util_1.fileToObject(f);
                objFile.status = 'waiting';
                this.handleChange(objFile);
                // 计算 width height aspect transform thumbUrl
                util_1.preproccessFile(objFile).then(() => {
                    const before = this.beforeUpload && this.beforeUpload(objFile);
                    if (before && before.then) {
                        before
                            .then(() => {
                            md5File(objFile);
                        })
                            .catch((e) => {
                            objFile.status = 'error';
                            objFile.errorMessage = typeof e === 'string' ? e : 'error';
                            this.handleFailed(objFile);
                        });
                    }
                    else {
                        md5File(objFile);
                    }
                });
            });
        };
        this.handleChange = (file) => {
            const { fileList, onChange } = this;
            this.fileList = util_1.updateFileLists(file, fileList);
            if (onChange) {
                onChange({ file, fileList });
            }
        };
        this.handleSucceed = (file) => {
            const { fileList, onSucceed, checkComplete } = this;
            this.fileList = util_1.updateFileLists(file, fileList);
            checkComplete(file.uid);
            if (onSucceed) {
                onSucceed({ file, fileList });
            }
        };
        this.handleFailed = (file) => {
            const { fileList, onFailed, checkComplete } = this;
            this.fileList = util_1.updateFileLists(file, fileList);
            checkComplete(file.uid);
            if (onFailed) {
                onFailed({ file, fileList });
            }
        };
        this.checkComplete = (uid) => {
            const { fileList, onComplete } = this;
            this.ids.push(uid);
            const dedupeIds = Array.from(new Set(this.ids));
            if (dedupeIds.length === fileList.length && onComplete) {
                onComplete({ fileList });
            }
        };
        this.map = {};
        this.fileList = files || [];
        this.params = Object.assign({}, params);
        this.queue = new p_queue_1.default({
            concurrency: options.concurrency || default_1.default.concurrency,
        });
        this.options = Object.assign(Object.assign({}, default_1.default), options);
        this.onStart = onStart;
        this.onChange = onChange;
        this.onSucceed = onSucceed;
        this.onFailed = onFailed;
        this.onComplete = onComplete;
        this.afterUpload = afterUpload;
        this.beforeUpload = beforeUpload;
        this.needUpdateParams = needUpdateParams;
    }
}
exports.default = HFUploader;
