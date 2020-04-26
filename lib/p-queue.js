"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es6.object.define-property");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.array.find-index");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.map");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _util = require("./util");

var Queue = /*#__PURE__*/function () {
  function Queue() {
    (0, _classCallCheck2["default"])(this, Queue);
    (0, _defineProperty2["default"])(this, "_queue", void 0);
    (0, _defineProperty2["default"])(this, "idMap", void 0);
    this._queue = [];
    this.idMap = new Map();
  }

  (0, _createClass2["default"])(Queue, [{
    key: "enqueue",
    value: function enqueue(run, options) {
      var id = options.id;
      this.idMap.set(id, run);

      this._queue.push(run);
    }
  }, {
    key: "dequeue",
    value: function dequeue() {
      return this._queue.shift();
    }
  }, {
    key: "clearWithId",
    value: function clearWithId(id) {
      var targetRunner = this.idMap.get(id);

      var runnerIndex = this._queue.findIndex(function (item) {
        return item === targetRunner;
      });

      if (runnerIndex === -1) {
        return;
      }

      this._queue.splice(runnerIndex, 1);
    }
  }, {
    key: "clear",
    value: function clear() {
      this._queue = [];
    }
  }, {
    key: "size",
    get: function get() {
      return this._queue.length;
    }
  }]);
  return Queue;
}();

var PQueue = /*#__PURE__*/function () {
  function PQueue(opts) {
    (0, _classCallCheck2["default"])(this, PQueue);
    (0, _defineProperty2["default"])(this, "queue", void 0);
    (0, _defineProperty2["default"])(this, "_pendingCount", void 0);
    (0, _defineProperty2["default"])(this, "_concurrency", void 0);
    (0, _defineProperty2["default"])(this, "_resolveEmpty", void 0);
    opts = Object.assign({
      concurrency: Infinity,
      queueClass: Queue
    }, opts);

    if (opts.concurrency < 1) {
      throw new TypeError('Expected `concurrency` to be a number from 1 and up');
    }

    this.queue = new opts.queueClass();
    this._pendingCount = 0;
    this._concurrency = opts.concurrency;
    this._resolveEmpty = _util.noop;
  }

  (0, _createClass2["default"])(PQueue, [{
    key: "_next",
    value: function _next() {
      this._pendingCount--;

      if (this.queue.size > 0) {
        this.queue.dequeue()();
      } else {
        this._resolveEmpty();
      }
    }
  }, {
    key: "add",
    value: function add(fn, opts) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var run = function run() {
          _this._pendingCount++;
          fn().then(function (val) {
            resolve(val);

            _this._next();
          })["catch"](function (err) {
            reject(err);

            _this._next();
          });
        };

        if (_this._pendingCount < _this._concurrency) {
          run();
        } else {
          _this.queue.enqueue(run, opts);
        }
      });
    }
  }, {
    key: "clear",
    value: function clear() {
      this.queue.clear();
    }
  }, {
    key: "clearWithId",
    value: function clearWithId(id) {
      this.queue.clearWithId(id);
    }
  }, {
    key: "onEmpty",
    value: function onEmpty() {
      var _this2 = this;

      return new Promise(function (resolve) {
        var existingResolve = _this2._resolveEmpty;

        _this2._resolveEmpty = function () {
          existingResolve();
          resolve();
        };
      });
    }
  }, {
    key: "size",
    get: function get() {
      return this.queue.size;
    }
  }, {
    key: "pending",
    get: function get() {
      return this._pendingCount;
    }
  }]);
  return PQueue;
}();

exports["default"] = PQueue;