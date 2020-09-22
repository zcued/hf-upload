"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("core-js/modules/es6.object.define-property");

require("core-js/modules/es6.object.define-properties");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.array.for-each");

require("core-js/modules/es6.array.filter");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.array.index-of");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.function.name");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _aliOss = _interopRequireDefault(require("ali-oss"));

var _constants = require("./constants");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var Upload = function Upload(_ref) {
  var _this = this;

  var file = _ref.file,
      _params = _ref.params,
      options = _ref.options,
      onChange = _ref.onChange,
      onSucceed = _ref.onSucceed,
      onFailed = _ref.onFailed,
      afterUpload = _ref.afterUpload,
      needUpdateParams = _ref.needUpdateParams;
  (0, _classCallCheck2["default"])(this, Upload);
  (0, _defineProperty2["default"])(this, "params", void 0);
  (0, _defineProperty2["default"])(this, "options", void 0);
  (0, _defineProperty2["default"])(this, "timeout", void 0);
  (0, _defineProperty2["default"])(this, "partSize", void 0);
  (0, _defineProperty2["default"])(this, "retryCount", void 0);
  (0, _defineProperty2["default"])(this, "retryCountMax", void 0);
  (0, _defineProperty2["default"])(this, "file", void 0);
  (0, _defineProperty2["default"])(this, "uploadFileClient", void 0);
  (0, _defineProperty2["default"])(this, "currentCheckpoint", void 0);
  (0, _defineProperty2["default"])(this, "onChange", void 0);
  (0, _defineProperty2["default"])(this, "onSucceed", void 0);
  (0, _defineProperty2["default"])(this, "onFailed", void 0);
  (0, _defineProperty2["default"])(this, "afterUpload", void 0);
  (0, _defineProperty2["default"])(this, "needUpdateParams", void 0);
  (0, _defineProperty2["default"])(this, "uploadFile", function (client) {
    if (!_this.uploadFileClient || Object.keys(_this.uploadFileClient).length === 0) {
      _this.uploadFileClient = client;
    }

    var progress = function progress(p, checkpoint) {
      _this.currentCheckpoint = checkpoint;
      _this.file = _objectSpread(_objectSpread({}, _this.file), {}, {
        percent: p * 99,
        status: 'uploading',
        errorMessage: ''
      });

      _this.onChange(_this.file);
    };

    var finish = function finish(f) {
      _this.file.status = 'uploaded';
      _this.file.percent = 100;

      _this.onSucceed(f);
    };

    var fileName = encodeURI(_this.file.name);
    var key = "tmp/".concat(_this.file.uid, ".").concat(_this.file.extension);
    var opts = {
      progress: progress,
      mime: _this.file.mime_type,
      partSize: _this.partSize * 1024,
      headers: {
        'content-disposition': "attachment; filename=\"".concat(fileName, "\"")
      }
    };

    if (_this.currentCheckpoint) {
      opts.checkpoint = _this.currentCheckpoint;
    }

    return new Promise(function (resolve, reject) {
      _this.uploadFileClient.multipartUpload(key, _this.file.originFile, opts).then(function (res) {
        _this.file.response = res;
        _this.currentCheckpoint = null;

        var after = _this.afterUpload && _this.afterUpload(_this.file);

        if (after && after.then) {
          after.then(function () {
            finish(_this.file);
            resolve();
          })["catch"](function (err) {
            _this.file.status = 'error';
            _this.file.errorMessage = typeof err === 'string' ? err : _this.options.errorText;

            _this.onFailed(_this.file);

            reject(err);
          });
        } else {
          finish(_this.file);
          resolve();
        }
      })["catch"](function (err) {
        // 暂停
        if (_this.uploadFileClient && _this.uploadFileClient.isCancel()) {
          return;
        }

        var error = err.name.toLowerCase();
        var isParamsExpired = error.indexOf('securitytokenexpirederror') !== -1 || error.indexOf('invalidaccesskeyiderror') !== -1;
        var isTimeout = error.indexOf('connectiontimeout') !== -1; // 参数过期

        if (isParamsExpired) {
          _this.uploadFileClient = null;
          _this.retryCount++;

          if (_this.retryCount < _this.retryCountMax) {
            var fn = _this.needUpdateParams && _this.needUpdateParams(_this.file);

            if (fn && fn.then) {
              fn.then(function () {
                return _this.startUpload();
              });
            } else {
              _this.startUpload();
            }
          } else {
            _this.file.status = 'error';
            _this.file.errorMessage = 'params is expired';

            _this.onFailed(_this.file);

            reject(err);
          }

          return;
        } // 超时


        if (isTimeout) {
          if (_this.partSize > _constants.MIN_PART_SIZE) {
            // 减小分片大小 最小100k
            var size = Math.ceil(_this.partSize / 2);
            _this.partSize = size > _constants.MIN_PART_SIZE ? size : _constants.MIN_PART_SIZE;

            _this.uploadFile('');
          } else if (_this.retryCount < _this.retryCountMax) {
            _this.retryCount++;

            _this.uploadFile('');
          } else {
            _this.file.status = 'error';
            _this.file.errorMessage = 'time out';

            _this.onFailed(_this.file);

            reject(err);
          }

          return;
        }

        _this.file.status = 'error';
        _this.file.errorMessage = _this.options.errorText;

        _this.onFailed(_this.file);

        reject(err);
      });
    });
  });
  (0, _defineProperty2["default"])(this, "updateParams", function (params) {
    _this.params = _objectSpread({}, params);
  });
  (0, _defineProperty2["default"])(this, "startUpload", function () {
    var applyTokenDo = function applyTokenDo(func) {
      var client = new _aliOss["default"](_objectSpread({
        timeout: _this.timeout
      }, _this.params));
      return func(client);
    };

    return applyTokenDo(_this.uploadFile);
  });
  (0, _defineProperty2["default"])(this, "cancelUpload", function () {
    if (_this.uploadFileClient) {
      _this.uploadFileClient.cancel();
    }
  });
  (0, _defineProperty2["default"])(this, "reUpload", function () {
    _this.retryCount = 0;
    _this.uploadFileClient = null;

    _this.startUpload();
  });

  if (!file || !file.originFile) {
    throw new TypeError('A file is required');
  }

  if (!Object.keys(_params).length) {
    throw new TypeError('Missing params to create OSS');
  }

  this.file = file;
  this.partSize = options.partSize;
  this.retryCount = 0;
  this.retryCountMax = options.retryCountMax;
  this.timeout = options.timeout;
  this.params = _params;
  this.options = options;
  this.onChange = onChange;
  this.onSucceed = onSucceed;
  this.onFailed = onFailed;
  this.afterUpload = afterUpload;
  this.needUpdateParams = needUpdateParams;
};

exports["default"] = Upload;