"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("core-js/modules/es6.object.define-property");

require("core-js/modules/es6.object.define-properties");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.array.filter");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.object.keys");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.set");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.array.for-each");

require("core-js/modules/es6.array.map");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _pQueue = _interopRequireDefault(require("./p-queue"));

var _upload = _interopRequireDefault(require("./upload"));

var _util = require("./util");

var _default = _interopRequireDefault(require("./default"));

var _file = _interopRequireDefault(require("./file.worker"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var HFUploader = function HFUploader(_ref) {
  var _this = this;

  var _files = _ref.files,
      _ref$options = _ref.options,
      options = _ref$options === void 0 ? {} : _ref$options,
      _params = _ref.params,
      onStart = _ref.onStart,
      _onChange = _ref.onChange,
      _onSucceed = _ref.onSucceed,
      _onFailed = _ref.onFailed,
      _onComplete = _ref.onComplete,
      afterUpload = _ref.afterUpload,
      beforeUpload = _ref.beforeUpload,
      needUpdateParams = _ref.needUpdateParams;
  (0, _classCallCheck2["default"])(this, HFUploader);
  (0, _defineProperty2["default"])(this, "map", {});
  (0, _defineProperty2["default"])(this, "ids", []);
  (0, _defineProperty2["default"])(this, "params", void 0);
  (0, _defineProperty2["default"])(this, "queue", void 0);
  (0, _defineProperty2["default"])(this, "options", void 0);
  (0, _defineProperty2["default"])(this, "fileList", []);
  (0, _defineProperty2["default"])(this, "needUpdateParams", void 0);
  (0, _defineProperty2["default"])(this, "onStart", void 0);
  (0, _defineProperty2["default"])(this, "afterUpload", void 0);
  (0, _defineProperty2["default"])(this, "beforeUpload", void 0);
  (0, _defineProperty2["default"])(this, "onChange", void 0);
  (0, _defineProperty2["default"])(this, "onSucceed", void 0);
  (0, _defineProperty2["default"])(this, "onFailed", void 0);
  (0, _defineProperty2["default"])(this, "onComplete", void 0);
  (0, _defineProperty2["default"])(this, "updateParams", function (params) {
    _this.params = _objectSpread({}, params);

    for (var uid in _this.map) {
      if (_this.map[uid]) {
        _this.map[uid].updateParams(params);
      }
    }
  });
  (0, _defineProperty2["default"])(this, "add", function (files) {
    if (_this.onStart) {
      _this.onStart();
    }

    _this.start(files);
  });
  (0, _defineProperty2["default"])(this, "abort", function (uid) {
    if (_this.map[uid]) {
      _this.map[uid].cancelUpload();

      _this.queue._next();
    }
  });
  (0, _defineProperty2["default"])(this, "delete", function (uid) {
    _this.abort(uid);

    _this.queue.clearWithId(uid);

    _this.fileList = (0, _util.deleteFile)(uid, _this.fileList);
    _this.ids = (0, _util.deleteId)(uid, _this.ids);

    if (_this.onChange) {
      _this.onChange({
        fileList: _this.fileList
      });
    }
  });
  (0, _defineProperty2["default"])(this, "clear", function () {
    _this.fileList = [];

    _this.queue.clear();

    for (var key in _this.map) {
      if (_this.map[key]) {
        _this.map[key].cancelUpload();
      }
    }
  });
  (0, _defineProperty2["default"])(this, "reupload", function (uid) {
    var targetUploader = _this.map[uid];

    if (targetUploader) {
      targetUploader.reUpload();
    }
  });
  (0, _defineProperty2["default"])(this, "start", function (files) {
    var addFile = function addFile(file) {
      _this.queue.add(function () {
        var upload = new _upload["default"]({
          file: file,
          params: _this.params,
          options: _this.options,
          onChange: _this.handleChange,
          onSucceed: _this.handleSucceed,
          onFailed: _this.handleFailed,
          afterUpload: _this.afterUpload,
          needUpdateParams: _this.needUpdateParams
        });
        _this.map[file.uid] = upload;
        return upload.startUpload();
      }, {
        id: file.uid
      });
    }; // 计算md5


    var md5File = function md5File(f) {
      var myWorker = new _file["default"]();
      myWorker.postMessage({
        file: f.originFile
      });

      myWorker.onmessage = function (e) {
        f.md5_file = e.data;
        addFile(f);
        myWorker.terminate();
      };
    };

    files.forEach(function (f) {
      var objFile = (0, _util.fileToObject)(f);
      objFile.status = 'waiting';

      _this.handleChange(objFile); // 计算 width height aspect transform thumbUrl


      (0, _util.preproccessFile)(objFile).then(function () {
        var before = _this.beforeUpload && _this.beforeUpload(objFile);

        if (before && before.then) {
          before.then(function () {
            md5File(objFile);
          })["catch"](function (e) {
            objFile.status = 'error';
            objFile.errorMessage = typeof e === 'string' ? e : 'error';

            _this.handleFailed(objFile);
          });
        } else {
          md5File(objFile);
        }
      });
    });
  });
  (0, _defineProperty2["default"])(this, "handleChange", function (file) {
    var fileList = _this.fileList,
        onChange = _this.onChange;
    _this.fileList = (0, _util.updateFileLists)(file, fileList);

    if (onChange) {
      onChange({
        file: file,
        fileList: fileList
      });
    }
  });
  (0, _defineProperty2["default"])(this, "handleSucceed", function (file) {
    var fileList = _this.fileList,
        onSucceed = _this.onSucceed,
        checkComplete = _this.checkComplete;
    _this.fileList = (0, _util.updateFileLists)(file, fileList);
    checkComplete(file.uid);

    if (onSucceed) {
      onSucceed({
        file: file,
        fileList: fileList
      });
    }
  });
  (0, _defineProperty2["default"])(this, "handleFailed", function (file) {
    var fileList = _this.fileList,
        onFailed = _this.onFailed,
        checkComplete = _this.checkComplete;
    _this.fileList = (0, _util.updateFileLists)(file, fileList);
    checkComplete(file.uid);

    if (onFailed) {
      onFailed({
        file: file,
        fileList: fileList
      });
    }
  });
  (0, _defineProperty2["default"])(this, "checkComplete", function (uid) {
    var fileList = _this.fileList,
        onComplete = _this.onComplete;

    _this.ids.push(uid);

    var dedupeIds = Array.from(new Set(_this.ids));

    if (dedupeIds.length === fileList.length && onComplete) {
      onComplete({
        fileList: fileList
      });
    }
  });
  this.map = {};
  this.fileList = _files || [];
  this.params = _objectSpread({}, _params);
  this.queue = new _pQueue["default"]({
    concurrency: options.concurrency || _default["default"].concurrency
  });
  this.options = _objectSpread(_objectSpread({}, _default["default"]), options);
  this.onStart = onStart;
  this.onChange = _onChange;
  this.onSucceed = _onSucceed;
  this.onFailed = _onFailed;
  this.onComplete = _onComplete;
  this.afterUpload = afterUpload;
  this.beforeUpload = beforeUpload;
  this.needUpdateParams = needUpdateParams;
} // 更新参数
;

exports["default"] = HFUploader;