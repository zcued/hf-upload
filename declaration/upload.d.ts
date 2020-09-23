import { UploadFile, UploadOptions, AliProps } from './types';
export default class Upload {
    params: Object;
    options: UploadOptions;
    timeout: number;
    partSize: number;
    retryCount: number;
    retryCountMax: number;
    file: UploadFile;
    uploadFileClient: any;
    currentCheckpoint: any;
    onChange: (file: UploadFile) => void;
    onSucceed: (file: UploadFile) => void;
    onFailed: (file: UploadFile) => void;
    afterUpload: Function;
    needUpdateParams: Function;
    constructor({ file, params, options, onChange, onSucceed, onFailed, afterUpload, needUpdateParams, }: AliProps);
    uploadFile: (client: any) => Promise<unknown>;
    updateParams: (params: any) => void;
    startUpload: () => any;
    cancelUpload: () => void;
    reUpload: () => void;
}
