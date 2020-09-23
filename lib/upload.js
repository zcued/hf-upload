"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ali_oss_1 = __importDefault(require("ali-oss"));
const constants_1 = require("./constants");
class Upload {
    constructor({ file, params, options, onChange, onSucceed, onFailed, afterUpload, needUpdateParams, }) {
        this.uploadFile = (client) => {
            if (!this.uploadFileClient ||
                Object.keys(this.uploadFileClient).length === 0) {
                this.uploadFileClient = client;
            }
            const progress = (p, checkpoint) => {
                this.currentCheckpoint = checkpoint;
                this.file = Object.assign(Object.assign({}, this.file), { percent: p * 99, status: 'uploading', errorMessage: '' });
                this.onChange(this.file);
            };
            const finish = (f) => {
                this.file.status = 'uploaded';
                this.file.percent = 100;
                this.onSucceed(f);
            };
            const fileName = encodeURI(this.file.name);
            const key = `tmp/${this.file.uid}.${this.file.extension}`;
            let opts = {
                progress,
                mime: this.file.mime_type,
                partSize: this.partSize * 1024,
                headers: {
                    'content-disposition': `attachment; filename="${fileName}"`,
                },
            };
            if (this.currentCheckpoint) {
                opts.checkpoint = this.currentCheckpoint;
            }
            return new Promise((resolve, reject) => {
                this.uploadFileClient
                    .multipartUpload(key, this.file.originFile, opts)
                    .then((res) => {
                    this.file.response = res;
                    this.currentCheckpoint = null;
                    const after = this.afterUpload && this.afterUpload(this.file);
                    if (after && after.then) {
                        after
                            .then(() => {
                            finish(this.file);
                            resolve();
                        })
                            .catch((err) => {
                            this.file.status = 'error';
                            this.file.errorMessage =
                                typeof err === 'string' ? err : this.options.errorText;
                            this.onFailed(this.file);
                            reject(err);
                        });
                    }
                    else {
                        finish(this.file);
                        resolve();
                    }
                })
                    .catch((err) => {
                    // 暂停
                    if (this.uploadFileClient && this.uploadFileClient.isCancel()) {
                        return;
                    }
                    const error = err.name.toLowerCase();
                    const isParamsExpired = error.indexOf('securitytokenexpirederror') !== -1 ||
                        error.indexOf('invalidaccesskeyiderror') !== -1;
                    const isTimeout = error.indexOf('connectiontimeout') !== -1;
                    // 参数过期
                    if (isParamsExpired) {
                        this.uploadFileClient = null;
                        this.retryCount++;
                        if (this.retryCount < this.retryCountMax) {
                            const fn = this.needUpdateParams && this.needUpdateParams(this.file);
                            if (fn && fn.then) {
                                fn.then(() => this.startUpload());
                            }
                            else {
                                this.startUpload();
                            }
                        }
                        else {
                            this.file.status = 'error';
                            this.file.errorMessage = 'params is expired';
                            this.onFailed(this.file);
                            reject(err);
                        }
                        return;
                    }
                    // 超时
                    if (isTimeout) {
                        if (this.partSize > constants_1.MIN_PART_SIZE) {
                            // 减小分片大小 最小100k
                            const size = Math.ceil(this.partSize / 2);
                            this.partSize = size > constants_1.MIN_PART_SIZE ? size : constants_1.MIN_PART_SIZE;
                            this.uploadFile('');
                        }
                        else if (this.retryCount < this.retryCountMax) {
                            this.retryCount++;
                            this.uploadFile('');
                        }
                        else {
                            this.file.status = 'error';
                            this.file.errorMessage = 'time out';
                            this.onFailed(this.file);
                            reject(err);
                        }
                        return;
                    }
                    this.file.status = 'error';
                    this.file.errorMessage = this.options.errorText;
                    this.onFailed(this.file);
                    reject(err);
                });
            });
        };
        this.updateParams = (params) => {
            this.params = Object.assign({}, params);
        };
        this.startUpload = () => {
            const applyTokenDo = (func) => {
                const client = new ali_oss_1.default(Object.assign({ timeout: this.timeout }, this.params));
                return func(client);
            };
            return applyTokenDo(this.uploadFile);
        };
        this.cancelUpload = () => {
            if (this.uploadFileClient) {
                this.uploadFileClient.cancel();
            }
        };
        this.reUpload = () => {
            this.retryCount = 0;
            this.uploadFileClient = null;
            this.startUpload();
        };
        if (!file || !file.originFile) {
            throw new TypeError('A file is required');
        }
        if (!Object.keys(params).length) {
            throw new TypeError('Missing params to create OSS');
        }
        this.file = file;
        this.partSize = options.partSize;
        this.retryCount = 0;
        this.retryCountMax = options.retryCountMax;
        this.timeout = options.timeout;
        this.params = params;
        this.options = options;
        this.onChange = onChange;
        this.onSucceed = onSucceed;
        this.onFailed = onFailed;
        this.afterUpload = afterUpload;
        this.needUpdateParams = needUpdateParams;
    }
}
exports.default = Upload;
