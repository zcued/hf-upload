"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const defaultOptions = {
    concurrency: constants_1.CONCURRENCY,
    partSize: constants_1.PART_SIZE,
    timeout: constants_1.TIMEOUT,
    errorText: constants_1.ERROR_TEXT,
    retryCountMax: constants_1.RETRY_COUNT_MAX,
};
exports.default = defaultOptions;
