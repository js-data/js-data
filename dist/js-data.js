/*!
* js-data
* @version 2.8.2 - Homepage <http://www.js-data.io/>
* @author Jason Dobry <jason.dobry@gmail.com>
* @copyright (c) 2014-2015 Jason Dobry
* @license MIT <https://github.com/js-data/js-data/blob/master/LICENSE>
*
* @overview Robust framework-agnostic data store.
*/
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["JSData"] = factory();
	else
		root["JSData"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _collection = __webpack_require__(1);
	
	var _loop = function _loop(_key5) {
	  if (_key5 === "default") return 'continue';
	  Object.defineProperty(exports, _key5, {
	    enumerable: true,
	    get: function get() {
	      return _collection[_key5];
	    }
	  });
	};
	
	for (var _key5 in _collection) {
	  var _ret = _loop(_key5);
	
	  if (_ret === 'continue') continue;
	}
	
	var _datastore = __webpack_require__(13);
	
	var _loop2 = function _loop2(_key6) {
	  if (_key6 === "default") return 'continue';
	  Object.defineProperty(exports, _key6, {
	    enumerable: true,
	    get: function get() {
	      return _datastore[_key6];
	    }
	  });
	};
	
	for (var _key6 in _datastore) {
	  var _ret2 = _loop2(_key6);
	
	  if (_ret2 === 'continue') continue;
	}
	
	var _decorators = __webpack_require__(4);
	
	var _loop3 = function _loop3(_key7) {
	  if (_key7 === "default") return 'continue';
	  Object.defineProperty(exports, _key7, {
	    enumerable: true,
	    get: function get() {
	      return _decorators[_key7];
	    }
	  });
	};
	
	for (var _key7 in _decorators) {
	  var _ret3 = _loop3(_key7);
	
	  if (_ret3 === 'continue') continue;
	}
	
	var _resource = __webpack_require__(14);
	
	var _loop4 = function _loop4(_key8) {
	  if (_key8 === "default") return 'continue';
	  Object.defineProperty(exports, _key8, {
	    enumerable: true,
	    get: function get() {
	      return _resource[_key8];
	    }
	  });
	};
	
	for (var _key8 in _resource) {
	  var _ret4 = _loop4(_key8);
	
	  if (_ret4 === 'continue') continue;
	}
	
	if (!Promise.prototype.spread) {
	  Promise.prototype.spread = function (cb) {
	    return this.then(function (arr) {
	      return cb.apply(this, arr);
	    });
	  };
	}
	
	var version = exports.version = {
	  full: '2.8.2',
	  major: parseInt('2', 10),
	  minor: parseInt('8', 10),
	  patch: parseInt('2', 10),
	  alpha:  true ? 'false' : false,
	  beta:  true ? 'false' : false
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Collection = Collection;
	
	var _query4 = __webpack_require__(2);
	
	var _utils = __webpack_require__(3);
	
	var _decorators = __webpack_require__(4);
	
	var _mindex = __webpack_require__(11);
	
	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }
	
	exports.Query = _query4.Query;
	
	function Collection() {
	  var data = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
	  var idAttribute = arguments.length <= 1 || arguments[1] === undefined ? 'id' : arguments[1];
	
	  if (!(0, _utils.isArray)(data)) {
	    throw new TypeError('new Collection([data]): data: Expected array. Found ' + (typeof data === 'undefined' ? 'undefined' : _typeof(data)));
	  }
	  this.idAttribute = idAttribute;
	  this.index = new _mindex.Index([idAttribute], idAttribute);
	  this.indexes = {};
	  data.forEach(this.index.insertRecord, this.index);
	}
	
	(0, _decorators.configure)({
	  createIndex: function createIndex(name, keyList) {
	    if ((0, _utils.isString)(name) && keyList === undefined) {
	      keyList = [name];
	    }
	    var index = this.indexes[name] = new _mindex.Index(keyList, this.idAttribute);
	    this.index.visitAll(index.insertRecord, index);
	    return this;
	  },
	  query: function query() {
	    return new _query4.Query(this);
	  },
	  between: function between() {
	    var _query;
	
	    return (_query = this.query()).between.apply(_query, arguments).run();
	  },
	  get: function get() {
	    var _query2;
	
	    return (_query2 = this.query()).get.apply(_query2, arguments).run();
	  },
	  getAll: function getAll() {
	    var _query3;
	
	    return (_query3 = this.query()).getAll.apply(_query3, arguments).run();
	  },
	  filter: function filter(opts) {
	    return this.query().filter(opts).run();
	  },
	  skip: function skip(num) {
	    return this.query().skip(num).run();
	  },
	  limit: function limit(num) {
	    return this.query().limit(num).run();
	  },
	  forEach: function forEach(cb, thisArg) {
	    this.index.visitAll(cb, thisArg);
	  },
	  map: function map(cb, thisArg) {
	    var data = [];
	    this.index.visitAll(function (value) {
	      data.push(cb.call(thisArg, value));
	    });
	    return data;
	  },
	  insert: function insert(record) {
	    this.index.insertRecord(record);
	    (0, _utils.forOwn)(this.indexes, function (index, name) {
	      index.insertRecord(record);
	    });
	  },
	  update: function update(record) {
	    this.index.updateRecord(record);
	    (0, _utils.forOwn)(this.indexes, function (index, name) {
	      index.updateRecord(record);
	    });
	  },
	  remove: function remove(record) {
	    this.index.removeRecord(record);
	    (0, _utils.forOwn)(this.indexes, function (index, name) {
	      index.removeRecord(record);
	    });
	  },
	  insertRecord: function insertRecord(record) {
	    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	    var index = opts.index ? this.indexes[opts.index] : this.index;
	    index.insertRecord(record);
	  },
	  updateRecord: function updateRecord(record) {
	    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	    var index = opts.index ? this.indexes[opts.index] : this.index;
	    index.updateRecord(record);
	  },
	  removeRecord: function removeRecord(record) {
	    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	    var index = opts.index ? this.indexes[opts.index] : this.index;
	    index.removeRecord(record);
	  }
	})(Collection.prototype);

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Query = Query;
	
	var _utils = __webpack_require__(3);
	
	var _decorators = __webpack_require__(4);
	
	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }
	
	function Query(collection) {
	  this.collection = collection;
	}
	
	var reserved = {
	  skip: '',
	  offset: '',
	  where: '',
	  limit: '',
	  orderBy: '',
	  sort: ''
	};
	
	function compare(orderBy, index, a, b) {
	  var def = orderBy[index];
	  var cA = (0, _utils.get)(a, def[0]);
	  var cB = (0, _utils.get)(b, def[0]);
	  if (cA && (0, _utils.isString)(cA)) {
	    cA = cA.toUpperCase();
	  }
	  if (cB && (0, _utils.isString)(cB)) {
	    cB = cB.toUpperCase();
	  }
	  if (def[1] === 'DESC') {
	    if (cB < cA) {
	      return -1;
	    } else if (cB > cA) {
	      return 1;
	    } else {
	      if (index < orderBy.length - 1) {
	        return compare(orderBy, index + 1, a, b);
	      } else {
	        return 0;
	      }
	    }
	  } else {
	    if (cA < cB) {
	      return -1;
	    } else if (cA > cB) {
	      return 1;
	    } else {
	      if (index < orderBy.length - 1) {
	        return compare(orderBy, index + 1, a, b);
	      } else {
	        return 0;
	      }
	    }
	  }
	}
	
	var escapeRegExp = /([.*+?^=!:${}()|[\]\/\\])/g;
	var percentRegExp = /%/g;
	var underscoreRegExp = /_/g;
	
	function escape(pattern) {
	  return pattern.replace(escapeRegExp, '\\$1');
	}
	
	function like(pattern, flags) {
	  return new RegExp('^' + escape(pattern).replace(percentRegExp, '.*').replace(underscoreRegExp, '.') + '$', flags);
	}
	
	function evaluate(value, op, predicate) {
	  switch (op) {
	    case '==':
	      return value == predicate; // eslint-disable-line
	    case '===':
	      return value === predicate;
	    case '!=':
	      return value != predicate; // eslint-disable-line
	    case '!==':
	      return value !== predicate;
	    case '>':
	      return value > predicate;
	    case '>=':
	      return value >= predicate;
	    case '<':
	      return value < predicate;
	    case '<=':
	      return value <= predicate;
	    case 'isectEmpty':
	      return !(0, _utils.intersection)(value || [], predicate || []).length;
	    case 'isectNotEmpty':
	      return (0, _utils.intersection)(value || [], predicate || []).length;
	    case 'in':
	      return predicate.indexOf(value) !== -1;
	    case 'notIn':
	      return predicate.indexOf(value) === -1;
	    case 'contains':
	      return value.indexOf(predicate) !== -1;
	    case 'notContains':
	      return value.indexOf(predicate) === -1;
	    default:
	      if (op.indexOf('like') === 0) {
	        return like(predicate, op.substr(4)).exec(value) !== null;
	      } else if (op.indexOf('notLike') === 0) {
	        return like(predicate, op.substr(7)).exec(value) === null;
	      }
	  }
	}
	
	(0, _decorators.configure)({
	  getData: function getData() {
	    if (!this.data) {
	      this.data = this.collection.index.getAll();
	    }
	    return this.data;
	  },
	  between: function between(leftKeys, rightKeys) {
	    var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
	
	    var collection = this.collection;
	    var index = opts.index ? collection.indexes[opts.index] : collection.index;
	    if (this.data) {
	      throw new Error('Cannot access index after first operation!');
	    }
	    this.data = index.between(leftKeys, rightKeys, opts);
	    return this;
	  },
	  get: function get() {
	    var keyList = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
	    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	    if (this.data) {
	      throw new Error('Cannot access index after first operation!');
	    }
	    if (keyList && !(0, _utils.isArray)(keyList)) {
	      keyList = [keyList];
	    }
	    if (!keyList.length) {
	      this.getData();
	      return this;
	    }
	    var collection = this.collection;
	    var index = opts.index ? collection.indexes[opts.index] : collection.index;
	    this.data = index.get(keyList);
	    return this;
	  },
	  getAll: function getAll() {
	    var _this = this;
	
	    var opts = {};
	    if (this.data) {
	      throw new Error('Cannot access index after first operation!');
	    }
	
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	
	    if (!args.length || args.length === 1 && (0, _utils.isObject)(args[0])) {
	      this.getData();
	      return this;
	    } else if (args.length && (0, _utils.isObject)(args[args.length - 1])) {
	      opts = args[args.length - 1];
	      args.pop();
	    }
	    var collection = this.collection;
	    var index = opts.index ? collection.indexes[opts.index] : collection.index;
	    this.data = [];
	    args.forEach(function (keyList) {
	      _this.data = _this.data.concat(index.get(keyList));
	    });
	    return this;
	  },
	  filter: function filter() {
	    var _this2 = this;
	
	    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	    var thisArg = arguments[1];
	
	    this.getData();
	    if ((0, _utils.isObject)(opts)) {
	      (function () {
	        var where = {};
	        // Filter
	        if ((0, _utils.isObject)(opts.where)) {
	          where = opts.where;
	        }
	        (0, _utils.forOwn)(opts, function (value, key) {
	          if (!(key in reserved) && !(key in where)) {
	            where[key] = {
	              '==': value
	            };
	          }
	        });
	
	        var fields = [];
	        var ops = [];
	        var predicates = [];
	        (0, _utils.forOwn)(where, function (clause, field) {
	          if (!(0, _utils.isObject)(clause)) {
	            clause = {
	              '==': clause
	            };
	          }
	          (0, _utils.forOwn)(clause, function (expr, op) {
	            fields.push(field);
	            ops.push(op);
	            predicates.push(expr);
	          });
	        });
	        if (fields.length) {
	          (function () {
	            var i = undefined;
	            var len = fields.length;
	            _this2.data = _this2.data.filter(function (item) {
	              var first = true;
	              var keep = true;
	
	              for (i = 0; i < len; i++) {
	                var op = ops[i];
	                var isOr = op.charAt(0) === '|';
	                op = isOr ? op.substr(1) : op;
	                var expr = evaluate((0, _utils.get)(item, fields[i]), op, predicates[i]);
	                if (expr !== undefined) {
	                  keep = first ? expr : isOr ? keep || expr : keep && expr;
	                }
	                first = false;
	              }
	              return keep;
	            });
	          })();
	        }
	
	        // Sort
	        var orderBy = opts.orderBy || opts.sort;
	
	        if ((0, _utils.isString)(orderBy)) {
	          orderBy = [[orderBy, 'ASC']];
	        }
	        if (!(0, _utils.isArray)(orderBy)) {
	          orderBy = null;
	        }
	
	        // Apply 'orderBy'
	        if (orderBy) {
	          (function () {
	            var index = 0;
	            orderBy.forEach(function (def, i) {
	              if ((0, _utils.isString)(def)) {
	                orderBy[i] = [def, 'ASC'];
	              }
	            });
	            _this2.data.sort(function (a, b) {
	              return compare(orderBy, index, a, b);
	            });
	          })();
	        }
	
	        // Skip
	        if ((0, _utils.isNumber)(opts.skip)) {
	          _this2.skip(opts.skip);
	        } else if ((0, _utils.isNumber)(opts.offset)) {
	          _this2.skip(opts.offset);
	        }
	        // Limit
	        if ((0, _utils.isNumber)(opts.limit)) {
	          _this2.limit(opts.limit);
	        }
	      })();
	    } else if ((0, _utils.isFunction)(opts)) {
	      this.data = this.data.filter(opts, thisArg);
	    }
	    return this;
	  },
	  skip: function skip(num) {
	    if (!(0, _utils.isNumber)(num)) {
	      throw new TypeError('skip: Expected number but found ' + (typeof num === 'undefined' ? 'undefined' : _typeof(num)) + '!');
	    }
	    var data = this.getData();
	    if (num < data.length) {
	      this.data = data.slice(num);
	    } else {
	      this.data = [];
	    }
	    return this;
	  },
	  limit: function limit(num) {
	    if (!(0, _utils.isNumber)(num)) {
	      throw new TypeError('limit: Expected number but found ' + (typeof num === 'undefined' ? 'undefined' : _typeof(num)) + '!');
	    }
	    var data = this.getData();
	    this.data = data.slice(0, Math.min(data.length, num));
	    return this;
	  },
	  forEach: function forEach(cb, thisArg) {
	    this.getData().forEach(cb, thisArg);
	    return this;
	  },
	  map: function map(cb, thisArg) {
	    this.data = this.getData().map(cb, thisArg);
	    return this;
	  },
	  run: function run() {
	    var data = this.data;
	    this.data = null;
	    this.params = null;
	    return data;
	  }
	})(Query.prototype);

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.isObject = isObject;
	exports.isRegExp = isRegExp;
	exports.isString = isString;
	exports.isDate = isDate;
	exports.isNumber = isNumber;
	exports.isFunction = isFunction;
	exports.isSorN = isSorN;
	exports.get = get;
	exports.unset = unset;
	exports.set = set;
	exports.forOwn = forOwn;
	exports.deepMixIn = deepMixIn;
	exports.resolve = resolve;
	exports.reject = reject;
	exports._ = _;
	exports.intersection = intersection;
	exports.makePath = makePath;
	exports.fillIn = fillIn;
	exports.makeBefore = makeBefore;
	exports.isBlacklisted = isBlacklisted;
	exports.omit = omit;
	exports.fromJson = fromJson;
	exports.copy = copy;
	exports.pascalCase = pascalCase;
	exports.camelCase = camelCase;
	
	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }
	
	var isArray = exports.isArray = Array.isArray;
	function isObject(value) {
	  return toString.call(value) === '[object Object]' || false;
	}
	function isPlainObject(value) {
	  return !!value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value.constructor === Object;
	}
	function isRegExp(value) {
	  return toString.call(value) === '[object RegExp]' || false;
	}
	function isString(value) {
	  return typeof value === 'string' || value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && toString.call(value) === '[object String]' || false;
	}
	function isDate(value) {
	  return value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && toString.call(value) === '[object Date]' || false;
	}
	function isNumber(value) {
	  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
	  return type === 'number' || value && type === 'object' && toString.call(value) === '[object Number]' || false;
	}
	function isFunction(value) {
	  return typeof value === 'function' || value && toString.call(value) === '[object Function]' || false;
	}
	function isSorN(value) {
	  return isString(value) || isNumber(value);
	}
	function get(object, prop) {
	  var parts = prop.split('.');
	  var last = parts.pop();
	
	  while (prop = parts.shift()) {
	    object = object[prop];
	    if (object == null) return;
	  }
	
	  return object[last];
	}
	function unset(object, prop) {
	  var parts = prop.split('.');
	  var last = parts.pop();
	
	  while (prop = parts.shift()) {
	    object = object[prop];
	    if (object == null) return;
	  }
	
	  delete object[last];
	}
	function mkdirP(object, path) {
	  if (!path) {
	    return object;
	  }
	  var parts = path.split('.');
	  parts.forEach(function (key) {
	    if (!object[key]) {
	      object[key] = {};
	    }
	    object = object[key];
	  });
	  return object;
	}
	var PATH = /^(.+)\.(.+)$/;
	function set(object, path, value) {
	  var parts = PATH.exec(path);
	  if (parts) {
	    mkdirP(object, parts[1])[parts[2]] = value;
	  } else {
	    object[path] = value;
	  }
	}
	function forOwn(obj, fn, thisArg) {
	  var keys = Object.keys(obj);
	  var len = keys.length;
	  var i = undefined;
	  for (i = 0; i < len; i++) {
	    fn.call(thisArg, obj[keys[i]], keys[i], obj);
	  }
	}
	function deepMixIn(dest, source) {
	  if (source) {
	    forOwn(source, function (value, key) {
	      var existing = this[key];
	      if (isPlainObject(value) && isPlainObject(existing)) {
	        deepMixIn(existing, value);
	      } else {
	        this[key] = value;
	      }
	    }, dest);
	  }
	  return dest;
	}
	function resolve(value) {
	  return Promise.resolve(value);
	}
	function reject(value) {
	  return Promise.reject(value);
	}
	function _(Resource, opts) {
	  for (var key in Resource) {
	    var value = Resource[key];
	    if (opts[key] === undefined && !isFunction(value)) {
	      opts[key] = value;
	    }
	  }
	}
	function intersection(array1, array2) {
	  if (!array1 || !array2) {
	    return [];
	  }
	  var result = [];
	  var item = undefined;
	  var i = undefined;
	  var len = array1.length;
	  for (i = 0; i < len; i++) {
	    item = array1[i];
	    if (result.indexOf(item) !== -1) {
	      continue;
	    }
	    if (array2.indexOf(item) !== -1) {
	      result.push(item);
	    }
	  }
	  return result;
	}
	function isValidString(value) {
	  return value != null && value !== ''; // jshint ignore:line
	}
	function join(items) {
	  var separator = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
	
	  return items.filter(isValidString).join(separator);
	}
	function makePath() {
	  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }
	
	  var result = join(args, '/');
	  return result.replace(/([^:\/]|^)\/{2,}/g, '$1/');
	}
	function fillIn(dest, src) {
	  forOwn(src, function (value, key) {
	    if (dest[key] === undefined) {
	      dest[key] = value;
	    }
	  });
	}
	function makeBefore(target, key) {
	  return function (fn) {
	    var original = target[key];
	    target[key] = function () {
	      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	        args[_key2] = arguments[_key2];
	      }
	
	      var result = fn.apply(target, args);
	      if (result !== undefined && !isArray(result)) {
	        result = [result];
	      }
	      return original.apply(target, result || args);
	    };
	    makeBefore(target, key);
	  };
	}
	function isBlacklisted(prop, bl) {
	  if (!bl || !bl.length) {
	    return false;
	  }
	  var matches = undefined;
	  for (var i = 0; i < bl.length; i++) {
	    if (Object.prototype.toString.call(bl[i]) === '[object RegExp]' && bl[i].test(prop) || bl[i] === prop) {
	      matches = prop;
	      return matches;
	    }
	  }
	  return !!matches;
	}
	function omit(obj, bl) {
	  var toRemove = [];
	  forOwn(obj, function (value, key) {
	    if (isBlacklisted(key, bl)) {
	      toRemove.push(key);
	    }
	  });
	  toRemove.forEach(function (key) {
	    delete obj[key];
	  });
	  return obj;
	}
	function fromJson(json) {
	  return isString(json) ? JSON.parse(json) : json;
	}
	var toJson = exports.toJson = JSON.stringify;
	function copy(from, to, stackFrom, stackTo, blacklist) {
	  if (!to) {
	    to = from;
	    if (from) {
	      if (isArray(from)) {
	        to = copy(from, [], stackFrom, stackTo, blacklist);
	      } else if (isDate(from)) {
	        to = new Date(from.getTime());
	      } else if (isRegExp(from)) {
	        to = new RegExp(from.source, from.toString().match(/[^\/]*$/)[0]);
	        to.lastIndex = from.lastIndex;
	      } else if (isObject(from)) {
	        to = copy(from, Object.create(Object.getPrototypeOf(from)), stackFrom, stackTo, blacklist);
	      }
	    }
	  } else {
	    if (from === to) {
	      throw new Error('Cannot copy! Source and destination are identical.');
	    }
	
	    stackFrom = stackFrom || [];
	    stackTo = stackTo || [];
	
	    if (isObject(from)) {
	      var index = stackFrom.indexOf(from);
	      if (index !== -1) {
	        return stackTo[index];
	      }
	
	      stackFrom.push(from);
	      stackTo.push(to);
	    }
	
	    var result = undefined;
	    if (isArray(from)) {
	      var i = undefined;
	      to.length = 0;
	      for (i = 0; i < from.length; i++) {
	        result = copy(from[i], null, stackFrom, stackTo, blacklist);
	        if (isObject(from[i])) {
	          stackFrom.push(from[i]);
	          stackTo.push(result);
	        }
	        to.push(result);
	      }
	    } else {
	      if (isArray(to)) {
	        to.length = 0;
	      } else {
	        forOwn(to, function (value, key) {
	          delete to[key];
	        });
	      }
	      for (var key in from) {
	        if (from.hasOwnProperty(key)) {
	          if (isBlacklisted(key, blacklist)) {
	            continue;
	          }
	          result = copy(from[key], null, stackFrom, stackTo, blacklist);
	          if (isObject(from[key])) {
	            stackFrom.push(from[key]);
	            stackTo.push(result);
	          }
	          to[key] = result;
	        }
	      }
	    }
	  }
	  return to;
	}
	var SPLIT = /\s+/;
	var NON_ALPHA = /[^A-Za-z]/g;
	var PASCAL_CASE = /(\w)(\w*)/g;
	function pascalize(g0, g1, g2) {
	  return '' + g1.toUpperCase() + g2.toLowerCase();
	}
	function mapToPascal(x) {
	  return x.replace(NON_ALPHA, '').replace(PASCAL_CASE, pascalize);
	}
	function pascalCase(str) {
	  return str.split(SPLIT).map(mapToPascal).join('');
	}
	function camelCase(str) {
	  str = pascalCase(str);
	  if (str) {
	    return str.charAt(0).toLowerCase() + str.slice(1);
	  }
	  return str;
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _actions = __webpack_require__(5);
	
	var _loop = function _loop(_key7) {
	  if (_key7 === "default") return 'continue';
	  Object.defineProperty(exports, _key7, {
	    enumerable: true,
	    get: function get() {
	      return _actions[_key7];
	    }
	  });
	};
	
	for (var _key7 in _actions) {
	  var _ret = _loop(_key7);
	
	  if (_ret === 'continue') continue;
	}
	
	var _belongsTo = __webpack_require__(7);
	
	var _loop2 = function _loop2(_key8) {
	  if (_key8 === "default") return 'continue';
	  Object.defineProperty(exports, _key8, {
	    enumerable: true,
	    get: function get() {
	      return _belongsTo[_key8];
	    }
	  });
	};
	
	for (var _key8 in _belongsTo) {
	  var _ret2 = _loop2(_key8);
	
	  if (_ret2 === 'continue') continue;
	}
	
	var _configure = __webpack_require__(6);
	
	var _loop3 = function _loop3(_key9) {
	  if (_key9 === "default") return 'continue';
	  Object.defineProperty(exports, _key9, {
	    enumerable: true,
	    get: function get() {
	      return _configure[_key9];
	    }
	  });
	};
	
	for (var _key9 in _configure) {
	  var _ret3 = _loop3(_key9);
	
	  if (_ret3 === 'continue') continue;
	}
	
	var _hasMany = __webpack_require__(8);
	
	var _loop4 = function _loop4(_key10) {
	  if (_key10 === "default") return 'continue';
	  Object.defineProperty(exports, _key10, {
	    enumerable: true,
	    get: function get() {
	      return _hasMany[_key10];
	    }
	  });
	};
	
	for (var _key10 in _hasMany) {
	  var _ret4 = _loop4(_key10);
	
	  if (_ret4 === 'continue') continue;
	}
	
	var _hasOne = __webpack_require__(9);
	
	var _loop5 = function _loop5(_key11) {
	  if (_key11 === "default") return 'continue';
	  Object.defineProperty(exports, _key11, {
	    enumerable: true,
	    get: function get() {
	      return _hasOne[_key11];
	    }
	  });
	};
	
	for (var _key11 in _hasOne) {
	  var _ret5 = _loop5(_key11);
	
	  if (_ret5 === 'continue') continue;
	}
	
	var _schema = __webpack_require__(10);
	
	var _loop6 = function _loop6(_key12) {
	  if (_key12 === "default") return 'continue';
	  Object.defineProperty(exports, _key12, {
	    enumerable: true,
	    get: function get() {
	      return _schema[_key12];
	    }
	  });
	};
	
	for (var _key12 in _schema) {
	  var _ret6 = _loop6(_key12);
	
	  if (_ret6 === 'continue') continue;
	}
	
	// Workaround for https://github.com/babel/babel/issues/2763
	var DECORATORS = exports.DECORATORS = 'FIXME';

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.action = action;
	exports.actions = actions;
	
	var _utils = __webpack_require__(3);
	
	var _configure = __webpack_require__(6);
	
	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }
	
	// TODO: Make actions part of the http adapter
	function action(name, opts) {
	  if (!name || !(0, _utils.isString)(name)) {
	    throw new TypeError('action(name[, opts]): Expected: string, Found: ' + (typeof name === 'undefined' ? 'undefined' : _typeof(name)));
	  }
	  return function (target) {
	    if (target[name]) {
	      throw new Error('action(name[, opts]): ' + name + ' already exists on target!');
	    }
	    opts.request = opts.request || function (config) {
	      return config;
	    };
	    opts.response = opts.response || function (response) {
	      return response;
	    };
	    opts.responseError = opts.responseError || function (err) {
	      return (0, _utils.reject)(err);
	    };
	    target[name] = function (id, _opts) {
	      if ((0, _utils.isObject)(id)) {
	        _opts = id;
	      }
	      _opts = _opts || {};
	      var adapter = this.getAdapter(opts.adapter || this.defaultAdapter || 'http');
	      var config = {};
	      (0, _utils.fillIn)(config, opts);
	      if (!_opts.hasOwnProperty('endpoint') && config.endpoint) {
	        _opts.endpoint = config.endpoint;
	      }
	      if (typeof _opts.getEndpoint === 'function') {
	        config.url = _opts.getEndpoint(this, _opts);
	      } else {
	        var args = [_opts.basePath || this.basePath || adapter.defaults.basePath, adapter.getEndpoint(this, (0, _utils.isSorN)(id) ? id : null, _opts)];
	        if ((0, _utils.isSorN)(id)) {
	          args.push(id);
	        }
	        args.push(opts.pathname || name);
	        config.url = _utils.makePath.apply(null, args);
	      }
	      config.method = config.method || 'GET';
	      config.resourceName = this.name;
	      (0, _configure.configure)(config)(_opts);
	      return (0, _utils.resolve)(config).then(_opts.request || opts.request).then(function (config) {
	        return adapter.HTTP(config);
	      }).then(function (data) {
	        if (data && data.config) {
	          data.config.resourceName = this.name;
	        }
	        return data;
	      }).then(_opts.response || opts.response, _opts.responseError || opts.responseError);
	    };
	    return target;
	  };
	}
	
	function actions() {
	  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	  return function (target) {
	    (0, _utils.forOwn)(target, function (value, key) {
	      action(key, value)(target);
	    });
	    return target;
	  };
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.configure = configure;
	
	var _utils = __webpack_require__(3);
	
	/**
	 * Usage:
	 *
	 * @configure({
	 *   idAttribute: '_id'
	 * })
	 * class User extends JSData.Resource {...}
	 */
	function configure(props) {
	  var overwrite = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
	
	  props = props || {};
	  return function (target) {
	    (0, _utils.forOwn)(props, function (value, key) {
	      if (target[key] === undefined || overwrite) {
	        target[key] = (0, _utils.copy)(value);
	      }
	    });
	    return target;
	  };
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.belongsTo = belongsTo;
	
	var _utils = __webpack_require__(3);
	
	/**
	 * Steps to apply a "belongsTo" relationship
	 * 1. Choose the localField and localKey
	 * 2. Configure property descriptor, possibly including custom getter/setter
	 * 3. Add property to prototype of target Resource
	 *
	 * The added property is where an instance of the related Resource will be
	 * attached to an instance of the target Resource, e.g. if Comment belongsTo
	 * User and "localField" is set to "user", "comment.user" will be a reference to
	 * the user.
	 */
	function applyBelongsTo(Resource, Relation) {
	  var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
	
	  // Choose field where the relation will be attached
	  var localField = opts.localField = opts.localField || Relation.name.toLowerCase();
	  // Choose field that holds the primary key of the relation
	  var localKey = opts.localKey = opts.localKey || Relation.name.toLowerCase() + '_id';
	
	  // Setup configuration of the property
	  var descriptor = {
	    // Whether the field specified by "localField" will show up in "for...in"
	    enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
	    // Set default method for retrieving the linked relation
	    get: function get() {
	      var key = (0, _utils.get)(this, localKey);
	      return key !== undefined ? Relation.get(key) : undefined;
	    },
	
	    // Set default method for setting the linked relation
	    set: function set(parent) {
	      (0, _utils.set)(this, localKey, parent[Relation.idAttribute]);
	      return (0, _utils.get)(this, localField);
	    }
	  };
	
	  // Check whether the relation shouldn't actually be linked via a getter
	  if (opts.link === false || opts.link === undefined && !Resource.linkRelations) {
	    delete descriptor.get;
	    delete descriptor.set;
	    descriptor.writable = true;
	  }
	
	  // Check for user-defined getter
	  if (opts.get) {
	    (function () {
	      var originalGet = descriptor.get;
	      // Set user-defined getter
	      descriptor.get = function () {
	        var _this = this;
	
	        // Call user-defined getter, passing in:
	        //  - target Resource
	        //  - related Resource
	        //  - instance of target Resource
	        //  - the original getter function, in case the user wants to use it
	        return opts.get(Resource, Relation, this, originalGet ? function () {
	          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	          }
	
	          return originalGet.apply(_this, args);
	        } : undefined);
	      };
	    })();
	  }
	
	  // Check for user-defined setter
	  if (opts.set) {
	    (function () {
	      var originalSet = descriptor.set;
	      // Set user-defined setter
	      descriptor.set = function (parent) {
	        var _this2 = this;
	
	        // Call user-defined getter, passing in:
	        //  - target Resource
	        //  - related Resource
	        //  - instance of target Resource
	        //  - instance of related Resource
	        //  - the original setter function, in case the user wants to use it
	        return opts.set(Resource, Relation, this, parent, originalSet ? function () {
	          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	            args[_key2] = arguments[_key2];
	          }
	
	          return originalSet.apply(_this2, args);
	        } : undefined);
	      };
	    })();
	  }
	
	  // Finally, added property to prototype of target Resource
	  Object.defineProperty(Resource.prototype, localField, descriptor);
	
	  if (!Resource.relationList) {
	    Resource.relationList = [];
	  }
	  if (!Resource.relationFields) {
	    Resource.relationFields = [];
	  }
	  opts.type = 'belongsTo';
	  opts.name = Resource.name;
	  opts.relation = Relation.name;
	  opts.Relation = Relation;
	  Resource.relationList.push(opts);
	  Resource.relationFields.push(localField);
	  Resource.data().createIndex(localKey);
	
	  // Return target Resource for chaining
	  return Resource;
	}
	
	/**
	 * Usage:
	 *
	 * ES7 Usage:
	 * import {belongsTo, Resource} from 'js-data'
	 * class User extends Resource {}
	 * @belongsTo(User, {...})
	 * class Post extends Resource {}
	 *
	 * ES6 Usage:
	 * import {belongsTo, Resource} from 'js-data'
	 * class User extends Resource {}
	 * class Comment extends Resource {}
	 * belongsTo(User, {...})(Comment)
	 *
	 * ES5 Usage:
	 * var JSData = require('js-data')
	 * var User = JSData.Resource.extend()
	 * var Comment = JSDataResource.extend()
	 * JSData.belongsTo(User, {...})(Comment)
	 */
	function belongsTo(Resource, opts) {
	  return function (target) {
	    return applyBelongsTo(target, Resource, opts);
	  };
	}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.hasMany = hasMany;
	
	var _utils = __webpack_require__(3);
	
	/**
	 * Steps to apply a "hasMany" relationship
	 * 1. Choose the localField and foreignKey or localKeys
	 * 2. Configure property descriptor, possibly including custom getter/setter
	 * 3. Add property to prototype of target Resource
	 *
	 * The added property is where instances of the related Resource will be
	 * attached to an instance of the target Resource, e.g. if User hasMany Comment
	 * and "localField" is set to "comments", "user.comments" will be a reference to
	 * the array of comments.
	 */
	function applyHasMany(Resource, Relation) {
	  var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
	
	  // Choose field where the relation will be attached
	  var localField = opts.localField || (0, _utils.camelCase)(Relation.name) + 'Collection';
	  // Choose field on related instances that holds the primary key of instances
	  // of the target Resource
	  var foreignKey = opts.foreignKey;
	  var localKeys = opts.localKeys;
	  var foreignKeys = opts.foreignKeys;
	
	  if (!foreignKey && !localKeys && !foreignKeys) {
	    foreignKey = opts.foreignKey = (0, _utils.camelCase)(Resource.name) + 'Id';
	  }
	  if (foreignKey) {
	    Relation.data().createIndex(foreignKey);
	  }
	
	  // Setup configuration of the property
	  var descriptor = {
	    // Whether the field specified by "localField" will show up in "for...in"
	    enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
	    // Set default method for retrieving the linked relation
	    get: function get() {
	      var query = {};
	      if (foreignKey) {
	        // Make a FAST retrieval of the relation using a secondary index
	        return Relation.getAll((0, _utils.get)(this, Resource.idAttribute), { index: foreignKey });
	      } else if (localKeys) {
	        var keys = (0, _utils.get)(this, localKeys) || [];
	        var args = (0, _utils.isArray)(keys) ? keys : Object.keys(keys);
	        // Make a slower retrieval using the ids in the "localKeys" array
	        return Relation.getAll.apply(Relation, args);
	      } else if (foreignKeys) {
	        (0, _utils.set)(query, 'where.' + foreignKeys + '.contains', (0, _utils.get)(this, Resource.idAttribute));
	        // Make a much slower retrieval
	        return Relation.filter(query);
	      }
	      return undefined;
	    },
	
	    // Set default method for setting the linked relation
	    set: function set(children) {
	      var _this = this;
	
	      if (children && children.length) {
	        (function () {
	          var id = (0, _utils.get)(_this, Resource.idAttribute);
	          if (foreignKey) {
	            children.forEach(function (child) {
	              (0, _utils.set)(child, foreignKey, id);
	            });
	          } else if (localKeys) {
	            (function () {
	              var keys = [];
	              children.forEach(function (child) {
	                keys.push((0, _utils.get)(child, Relation.idAttribute));
	              });
	              (0, _utils.set)(_this, localKeys, keys);
	            })();
	          } else if (foreignKeys) {
	            children.forEach(function (child) {
	              var keys = (0, _utils.get)(child, foreignKeys);
	              if (keys) {
	                if (keys.indexOf(id) === -1) {
	                  keys.push(id);
	                }
	              } else {
	                (0, _utils.set)(child, foreignKeys, [id]);
	              }
	            });
	          }
	        })();
	      }
	      return (0, _utils.get)(this, localField);
	    }
	  };
	
	  // Check whether the relation shouldn't actually be linked via a getter
	  if (opts.link === false || opts.link === undefined && !Resource.linkRelations) {
	    delete descriptor.get;
	    delete descriptor.set;
	    descriptor.writable = true;
	  }
	
	  // Check for user-defined getter
	  if (opts.get) {
	    (function () {
	      var originalGet = descriptor.get;
	      // Set user-defined getter
	      descriptor.get = function () {
	        var _this2 = this;
	
	        // Call user-defined getter, passing in:
	        //  - target Resource
	        //  - related Resource
	        //  - instance of target Resource
	        //  - the original getter function, in case the user wants to use it
	        return opts.get(Resource, Relation, this, originalGet ? function () {
	          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	          }
	
	          return originalGet.apply(_this2, args);
	        } : undefined);
	      };
	    })();
	  }
	
	  // Check for user-defined setter
	  if (opts.set) {
	    (function () {
	      var originalSet = descriptor.set;
	      // Set user-defined setter
	      descriptor.set = function (children) {
	        var _this3 = this;
	
	        // Call user-defined getter, passing in:
	        //  - target Resource
	        //  - related Resource
	        //  - instance of target Resource
	        //  - instances of related Resource
	        //  - the original setter function, in case the user wants to use it
	        return opts.set(Resource, Relation, this, children, originalSet ? function () {
	          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	            args[_key2] = arguments[_key2];
	          }
	
	          return originalSet.apply(_this3, args);
	        } : undefined);
	      };
	    })();
	  }
	
	  // Finally, added property to prototype of target Resource
	  Object.defineProperty(Resource.prototype, localField, descriptor);
	
	  if (!Resource.relationList) {
	    Resource.relationList = [];
	  }
	  if (!Resource.relationFields) {
	    Resource.relationFields = [];
	  }
	  opts.type = 'hasMany';
	  opts.name = Resource.name;
	  opts.relation = Relation.name;
	  opts.Relation = Relation;
	  Resource.relationList.push(opts);
	  Resource.relationFields.push(localField);
	
	  // Return target Resource for chaining
	  return Resource;
	}
	
	/**
	 * Usage:
	 *
	 * ES7 Usage:
	 * import {hasMany, Resource} from 'js-data'
	 * class Post extends Resource {}
	 * @hasMany(Post, {...})
	 * class User extends Resource {}
	 *
	 * ES6 Usage:
	 * import {hasMany, Resource} from 'js-data'
	 * class User extends Resource {}
	 * class Comment extends Resource {}
	 * hasMany(Comment, {...})(User)
	 *
	 * ES5 Usage:
	 * var JSData = require('js-data')
	 * var User = JSData.Resource.extend()
	 * var Comment = JSDataResource.extend()
	 * JSData.hasMany(User, {...})(Comment)
	 */
	function hasMany(Resource, opts) {
	  return function (target) {
	    return applyHasMany(target, Resource, opts);
	  };
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.hasOne = hasOne;
	
	var _utils = __webpack_require__(3);
	
	/**
	 * Steps to apply a "hasOne" relationship
	 * 1. Choose the foreignKey and localKey
	 * 2. Configure property descriptor, possibly including custom getter/setter
	 * 3. Add property to prototype of target Resource
	 *
	 * The added property is where an instance of the related Resource will be
	 * attached to an instance of the target Resource, e.g. if User hasOne
	 * Profile and "localField" is set to "profile", "user.profile" will be a
	 * reference to the profile.
	 */
	function applyHasOne(Resource, Relation) {
	  var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
	
	  // Choose field where the relation will be attached
	  var localField = opts.localField = opts.localField || (0, _utils.camelCase)(Relation.name);
	  // Choose field that holds the primary key of the relation
	  var foreignKey = opts.foreignKey = opts.foreignKey || (0, _utils.camelCase)(Resource.name) + 'Id';
	
	  // Setup configuration of the property
	  var descriptor = {
	    // Whether the field specified by "localField" will show up in "for...in"
	    enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
	    // Set default method for retrieving the linked relation
	    get: function get() {
	      var items = Relation.getAll((0, _utils.get)(this, Resource.idAttribute), { index: foreignKey });
	      return items && items.length ? items[0] : undefined;
	    },
	
	    // Set default method for setting the linked relation
	    set: function set(child) {
	      (0, _utils.set)(child, foreignKey, (0, _utils.get)(this, Resource.idAttribute));
	      return (0, _utils.get)(this, localField);
	    }
	  };
	
	  // Check whether the relation shouldn't actually be linked via a getter
	  if (opts.link === false || opts.link === undefined && !Resource.linkRelations) {
	    delete descriptor.get;
	    delete descriptor.set;
	  }
	
	  // Check for user-defined getter
	  if (opts.get) {
	    (function () {
	      var originalGet = descriptor.get;
	      // Set user-defined getter
	      descriptor.get = function () {
	        var _this = this;
	
	        // Call user-defined getter, passing in:
	        //  - target Resource
	        //  - related Resource
	        //  - instance of target Resource
	        //  - the original getter function, in case the user wants to use it
	        return opts.get(Resource, Relation, this, originalGet ? function () {
	          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	          }
	
	          return originalGet.apply(_this, args);
	        } : undefined);
	      };
	    })();
	  }
	
	  // Check for user-defined setter
	  if (opts.set) {
	    (function () {
	      var originalSet = descriptor.set;
	      // Set user-defined setter
	      descriptor.set = function (child) {
	        var _this2 = this;
	
	        // Call user-defined getter, passing in:
	        //  - target Resource
	        //  - related Resource
	        //  - instance of target Resource
	        //  - instance of related Resource
	        //  - the original setter function, in case the user wants to use it
	        return opts.set(Resource, Relation, this, child, originalSet ? function () {
	          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	            args[_key2] = arguments[_key2];
	          }
	
	          return originalSet.apply(_this2, args);
	        } : undefined);
	      };
	    })();
	  }
	
	  // Finally, added property to prototype of target Resource
	  Object.defineProperty(Resource.prototype, localField, descriptor);
	
	  if (!Resource.relationList) {
	    Resource.relationList = [];
	  }
	  if (!Resource.relationFields) {
	    Resource.relationFields = [];
	  }
	  opts.type = 'hasOne';
	  opts.name = Resource.name;
	  opts.relation = Relation.name;
	  opts.Relation = Relation;
	  Resource.relationList.push(opts);
	  Resource.relationFields.push(localField);
	  Resource.data().createIndex(foreignKey);
	
	  // Return target Resource for chaining
	  return Resource;
	}
	
	/**
	 * Usage:
	 *
	 * ES7 Usage:
	 * import {hasOne, Resource} from 'js-data'
	 * class User extends Resource {}
	 * @hasOne(User, {...})
	 * class Post extends Resource {}
	 *
	 * ES6 Usage:
	 * import {hasOne, Resource} from 'js-data'
	 * class User extends Resource {}
	 * class Comment extends Resource {}
	 * hasOne(User, {...})(Comment)
	 *
	 * ES5 Usage:
	 * var JSData = require('js-data')
	 * var User = JSData.Resource.extend()
	 * var Comment = JSDataResource.extend()
	 * JSData.hasOne(User, {...})(Comment)
	 */
	function hasOne(Resource, opts) {
	  return function (target) {
	    return applyHasOne(target, Resource, opts);
	  };
	}

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.schema = schema;
	
	var _utils = __webpack_require__(3);
	
	var _collection = __webpack_require__(1);
	
	/**
	 * Usage:
	 *
	 * @schema({
	 *   first: {},
	 *   last: {},
	 *   role: {
	 *     value: 'dev'
	 *   },
	 *   // computed property
	 *   name: {
	 *     get() { return `${this.first} ${this.last}` },
	 *     set(value) {
	 *       let parts = value.split(' ')
	 *       this.first = parts[0]
	 *       this.last = parts[1]
	 *       return this
	 *     }
	 *   }
	 * })
	 * class User extends JSData.Resource {...}
	 *
	 * let user = new User()
	 * user.role // "dev"
	 * user.name = 'John Anderson'
	 * user.first // "John"
	 * user.last // "Anderson"
	 * user.first = "Bill"
	 * user.name // "Bill Anderson"
	 */
	function schema() {
	  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	  return function (target) {
	    // TODO: Test whether there already exists a schema
	    var collection = new _collection.Collection([], target.idAttribute);
	    target.data = function () {
	      // TODO: Do I need this?
	      if (this.data === Object.getPrototypeOf(this).data) {
	        // eslint-disable-line
	        throw new Error(this.name + ': Schemas are not inheritable, did you forget to define a schema?');
	      }
	      return collection;
	    };
	    (0, _utils.forOwn)(opts, function (prop, key) {
	      var descriptor = {
	        enumerable: prop.enumerable !== undefined ? prop.enumerable : true,
	        writable: prop.writable ? prop.writable : true,
	        configurable: prop.configurable ? prop.configurable : true
	      };
	      if (prop.indexed) {
	        delete descriptor.writable;
	        // Update index
	        // TODO: Make this configurable, ie. immediate or lazy update
	        target.createIndex(key);
	        descriptor.get = function () {
	          return this.$$props[key];
	        };
	        descriptor.set = function (value) {
	          this.$$props[key] = value;
	          if (this.$$s) {
	            target.data().updateRecord(this, { index: key });
	          }
	          return value;
	        };
	      }
	      if (prop.get) {
	        delete descriptor.writable;
	        descriptor.get = prop.get;
	      }
	      if (prop.set) {
	        delete descriptor.writable;
	        if (descriptor.set) {
	          (function () {
	            var originalSet = descriptor.set;
	            descriptor.set = function (value) {
	              return prop.set.call(this, originalSet.call(this, value));
	            };
	          })();
	        } else {
	          descriptor.set = prop.set;
	        }
	      }
	      // TODO: This won't work for properties of Object type, because all
	      // instances will share the prototype value
	      if (!descriptor.writable) {
	        Object.defineProperty(target.prototype, key, descriptor);
	      }
	    });
	    return target;
	  };
	}

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Index = Index;
	
	var _utils = __webpack_require__(3);
	
	var _decorators = __webpack_require__(4);
	
	var _utils2 = __webpack_require__(12);
	
	function Index() {
	  var fieldList = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
	  var idAttribute = arguments[1];
	
	  if (!(0, _utils.isArray)(fieldList)) {
	    throw new Error('fieldList must be an array.');
	  }
	
	  this.fieldList = fieldList;
	  this.idAttribute = idAttribute;
	  this.isIndex = true;
	  this.keys = [];
	  this.values = [];
	} // Copyright (c) 2015, InternalFX.
	
	// Permission to use, copy, modify, and/or distribute this software for any purpose with or
	// without fee is hereby granted, provided that the above copyright notice and this permission
	// notice appear in all copies.
	
	// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO
	// THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT
	// SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR
	// ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
	// OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE
	// USE OR PERFORMANCE OF THIS SOFTWARE.
	
	// Modifications
	// Copyright 2015 Jason Dobry
	//
	// Summary of modifications:
	// Converted to ES6 Class syntax
	// Reworked dependencies so as to re-use code already in js-data
	
	(0, _decorators.configure)({
	  set: function set(keyList, value) {
	    if (!(0, _utils.isArray)(keyList)) {
	      keyList = [keyList];
	    }
	
	    var key = keyList.shift() || null;
	    var pos = (0, _utils2.binarySearch)(this.keys, key);
	
	    if (keyList.length === 0) {
	      if (pos.found) {
	        var dataLocation = (0, _utils2.binarySearch)(this.values[pos.index], value, this.idAttribute);
	        if (!dataLocation.found) {
	          (0, _utils2.insertAt)(this.values[pos.index], dataLocation.index, value);
	        }
	      } else {
	        (0, _utils2.insertAt)(this.keys, pos.index, key);
	        (0, _utils2.insertAt)(this.values, pos.index, [value]);
	      }
	    } else {
	      if (pos.found) {
	        this.values[pos.index].set(keyList, value);
	      } else {
	        (0, _utils2.insertAt)(this.keys, pos.index, key);
	        var newIndex = new Index([], this.idAttribute);
	        newIndex.set(keyList, value);
	        (0, _utils2.insertAt)(this.values, pos.index, newIndex);
	      }
	    }
	  },
	  get: function get(keyList) {
	    if (!(0, _utils.isArray)(keyList)) {
	      keyList = [keyList];
	    }
	
	    var key = keyList.shift() || null;
	    var pos = (0, _utils2.binarySearch)(this.keys, key);
	
	    if (keyList.length === 0) {
	      if (pos.found) {
	        if (this.values[pos.index].isIndex) {
	          return this.values[pos.index].getAll();
	        } else {
	          return this.values[pos.index];
	        }
	      } else {
	        return [];
	      }
	    } else {
	      if (pos.found) {
	        return this.values[pos.index].get(keyList);
	      } else {
	        return [];
	      }
	    }
	  },
	  getAll: function getAll() {
	    var results = [];
	    this.values.forEach(function (value) {
	      if (value.isIndex) {
	        results = results.concat(value.getAll());
	      } else {
	        results = results.concat(value);
	      }
	    });
	    return results;
	  },
	  visitAll: function visitAll(cb, thisArg) {
	    this.values.forEach(function (value) {
	      if (value.isIndex) {
	        value.visitAll(cb, thisArg);
	      } else {
	        value.forEach(cb, thisArg);
	      }
	    });
	  },
	  query: function query(_query) {
	    var leftKeys = undefined;
	    var rightKeys = undefined;
	
	    if (_query['>']) {
	      leftKeys = _query['>'];
	      _query.leftInclusive = false;
	    } else if (_query['>=']) {
	      leftKeys = _query['>='];
	      _query.leftInclusive = true;
	    }
	
	    if (_query['<']) {
	      rightKeys = _query['<'];
	      _query.rightInclusive = false;
	    } else if (_query['<=']) {
	      rightKeys = _query['<='];
	      _query.rightInclusive = true;
	    }
	
	    if (leftKeys.length !== rightKeys.length) {
	      throw new Error('Key arrays must be same length');
	    }
	
	    return this.between(leftKeys, rightKeys, (0, _utils.omit)(_query, ['>', '>=', '<', '<=']));
	  },
	  between: function between(leftKeys, rightKeys) {
	    var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
	
	    if (!(0, _utils.isArray)(leftKeys)) {
	      leftKeys = [leftKeys];
	    }
	    if (!(0, _utils.isArray)(rightKeys)) {
	      rightKeys = [rightKeys];
	    }
	    (0, _utils.fillIn)(opts, {
	      leftInclusive: true,
	      rightInclusive: false,
	      limit: undefined,
	      offset: 0
	    });
	
	    var results = this._between(leftKeys, rightKeys, opts);
	
	    if (opts.limit) {
	      return results.slice(opts.offset, opts.limit + opts.offset);
	    } else {
	      return results.slice(opts.offset);
	    }
	  },
	  _between: function _between(leftKeys, rightKeys, opts) {
	    var results = [];
	
	    var leftKey = leftKeys.shift();
	    var rightKey = rightKeys.shift();
	
	    var pos = undefined;
	
	    if (leftKey !== undefined) {
	      pos = (0, _utils2.binarySearch)(this.keys, leftKey);
	    } else {
	      pos = {
	        found: false,
	        index: 0
	      };
	    }
	
	    if (leftKeys.length === 0) {
	      if (pos.found && opts.leftInclusive === false) {
	        pos.index += 1;
	      }
	
	      for (var i = pos.index; i < this.keys.length; i += 1) {
	        if (rightKey !== undefined) {
	          if (opts.rightInclusive) {
	            if (this.keys[i] > rightKey) {
	              break;
	            }
	          } else {
	            if (this.keys[i] >= rightKey) {
	              break;
	            }
	          }
	        }
	
	        if (this.values[i].isIndex) {
	          results = results.concat(this.values[i].getAll());
	        } else {
	          results = results.concat(this.values[i]);
	        }
	
	        if (opts.limit) {
	          if (results.length >= opts.limit + opts.offset) {
	            break;
	          }
	        }
	      }
	    } else {
	      for (var i = pos.index; i < this.keys.length; i += 1) {
	        var currKey = this.keys[i];
	        if (currKey > rightKey) {
	          break;
	        }
	
	        if (this.values[i].isIndex) {
	          if (currKey === leftKey) {
	            results = results.concat(this.values[i]._between((0, _utils.copy)(leftKeys), rightKeys.map(function () {
	              return undefined;
	            }), opts));
	          } else if (currKey === rightKey) {
	            results = results.concat(this.values[i]._between(leftKeys.map(function () {
	              return undefined;
	            }), (0, _utils.copy)(rightKeys), opts));
	          } else {
	            results = results.concat(this.values[i].getAll());
	          }
	        } else {
	          results = results.concat(this.values[i]);
	        }
	
	        if (opts.limit) {
	          if (results.length >= opts.limit + opts.offset) {
	            break;
	          }
	        }
	      }
	    }
	
	    if (opts.limit) {
	      return results.slice(0, opts.limit + opts.offset);
	    } else {
	      return results;
	    }
	  },
	  remove: function remove(keyList, value) {
	    if (!(0, _utils.isArray)(keyList)) {
	      keyList = [keyList];
	    }
	
	    var key = keyList.shift();
	    var pos = (0, _utils2.binarySearch)(this.keys, key);
	
	    if (keyList.length === 0) {
	      if (pos.found) {
	        var dataLocation = (0, _utils2.binarySearch)(this.values[pos.index], value, this.idAttribute);
	        if (dataLocation.found) {
	          (0, _utils2.removeAt)(this.values[pos.index], dataLocation.index);
	          if (this.values[pos.index].length === 0) {
	            (0, _utils2.removeAt)(this.keys, pos.index);
	            (0, _utils2.removeAt)(this.values, pos.index);
	          }
	        }
	      }
	    } else {
	      if (pos.found) {
	        this.values[pos.index].delete(keyList, value);
	      }
	    }
	  },
	  clear: function clear() {
	    this.keys = [];
	    this.values = [];
	  },
	  insertRecord: function insertRecord(data) {
	    var keyList = this.fieldList.map(function (field) {
	      return data[field] || null;
	    });
	
	    this.set(keyList, data);
	  },
	  removeRecord: function removeRecord(data) {
	    var keyList = this.fieldList.map(function (field) {
	      return data[field] || null;
	    });
	
	    this.remove(keyList, data);
	  },
	  updateRecord: function updateRecord(data) {
	    this.removeRecord(data);
	    this.insertRecord(data);
	  }
	})(Index.prototype);

/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.sort = sort;
	exports.insertAt = insertAt;
	exports.removeAt = removeAt;
	exports.binarySearch = binarySearch;
	function sort(a, b, field) {
	  // Short-curcuit comparison if a and b are strictly equal
	  // This is absolutely necessary for indexed objects that
	  // don't have the idAttribute field
	  if (a === b) {
	    return 0;
	  }
	  if (field) {
	    a = a[field];
	    b = b[field];
	  }
	  if (a === null && b === null) {
	    return 0;
	  }
	
	  if (a === null) {
	    return -1;
	  }
	
	  if (b === null) {
	    return 1;
	  }
	
	  if (a < b) {
	    return -1;
	  }
	
	  if (a > b) {
	    return 1;
	  }
	
	  return 0;
	}
	
	function insertAt(array, index, value) {
	  array.splice(index, 0, value);
	  return array;
	}
	
	function removeAt(array, index) {
	  array.splice(index, 1);
	  return array;
	}
	
	function binarySearch(array, value, field) {
	  var lo = 0;
	  var hi = array.length;
	  var compared = undefined;
	  var mid = undefined;
	
	  while (lo < hi) {
	    mid = (lo + hi) / 2 | 0;
	    compared = sort(value, array[mid], field);
	    if (compared === 0) {
	      return {
	        found: true,
	        index: mid
	      };
	    } else if (compared < 0) {
	      hi = mid;
	    } else {
	      lo = mid + 1;
	    }
	  }
	
	  return {
	    found: false,
	    index: hi
	  };
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.DS = DS;
	
	var _decorators = __webpack_require__(4);
	
	var _utils = __webpack_require__(3);
	
	var _resource = __webpack_require__(14);
	
	// function lifecycleNoopCb (resource, attrs, cb) {
	//   cb(null, attrs)
	// }
	
	// function lifecycleNoop (resource, attrs) {
	//   return attrs
	// }
	
	// class Defaults {
	//   errorFn (a, b) {
	//     if (this.error && typeof this.error === 'function') {
	//       try {
	//         if (typeof a === 'string') {
	//           throw new Error(a)
	//         } else {
	//           throw a
	//         }
	//       } catch (err) {
	//         a = err
	//       }
	//       this.error(this.name || null, a || null, b || null)
	//     }
	//   }
	// }
	
	// var defaultsPrototype = Defaults.prototype
	
	// defaultsPrototype.actions = {}
	// defaultsPrototype.afterCreate = lifecycleNoopCb
	// defaultsPrototype.afterCreateCollection = lifecycleNoop
	// defaultsPrototype.afterCreateInstance = lifecycleNoop
	// defaultsPrototype.afterDestroy = lifecycleNoopCb
	// defaultsPrototype.afterEject = lifecycleNoop
	// defaultsPrototype.afterFind = lifecycleNoopCb
	// defaultsPrototype.afterFindAll = lifecycleNoopCb
	// defaultsPrototype.afterInject = lifecycleNoop
	// defaultsPrototype.afterLoadRelations = lifecycleNoopCb
	// defaultsPrototype.afterReap = lifecycleNoop
	// defaultsPrototype.afterUpdate = lifecycleNoopCb
	// defaultsPrototype.afterValidate = lifecycleNoopCb
	// defaultsPrototype.allowSimpleWhere = true
	// defaultsPrototype.basePath = ''
	// defaultsPrototype.beforeCreate = lifecycleNoopCb
	// defaultsPrototype.beforeCreateCollection = lifecycleNoop
	// defaultsPrototype.beforeCreateInstance = lifecycleNoop
	// defaultsPrototype.beforeDestroy = lifecycleNoopCb
	// defaultsPrototype.beforeEject = lifecycleNoop
	// defaultsPrototype.beforeInject = lifecycleNoop
	// defaultsPrototype.beforeReap = lifecycleNoop
	// defaultsPrototype.beforeUpdate = lifecycleNoopCb
	// defaultsPrototype.beforeValidate = lifecycleNoopCb
	// defaultsPrototype.bypassCache = false
	// defaultsPrototype.cacheResponse = !!DSUtils.w
	// defaultsPrototype.csp = false
	// defaultsPrototype.clearEmptyQueries = true
	// defaultsPrototype.computed = {}
	// defaultsPrototype.defaultAdapter = 'http'
	// defaultsPrototype.debug = false
	// defaultsPrototype.defaultValues = {}
	// defaultsPrototype.eagerEject = false
	// // TODO: Implement eagerInject in DS#create
	// defaultsPrototype.eagerInject = false
	// defaultsPrototype.endpoint = ''
	// defaultsPrototype.error = console ? (a, b, c) => console[typeof console.error === 'function' ? 'error' : 'log'](a, b, c) : false
	// defaultsPrototype.errorHandler = function (...args) {
	//   return DSUtils.Promise.reject(args[0])
	// }
	// defaultsPrototype.fallbackAdapters = ['http']
	// defaultsPrototype.findStrictCache = false
	// defaultsPrototype.idAttribute = 'id'
	// defaultsPrototype.ignoredChanges = [/\$/]
	// defaultsPrototype.instanceEvents = !!DSUtils.w
	// defaultsPrototype.keepChangeHistory = false
	// defaultsPrototype.linkRelations = !!DSUtils.w
	// defaultsPrototype.log = console ? (a, b, c, d, e) => console[typeof console.info === 'function' ? 'info' : 'log'](a, b, c, d, e) : false
	
	// defaultsPrototype.logFn = function (a, b, c, d) {
	//   let _this = this
	//   if (_this.debug && _this.log && typeof _this.log === 'function') {
	//     _this.log(_this.name || null, a || null, b || null, c || null, d || null)
	//   }
	// }
	
	// defaultsPrototype.maxAge = false
	// defaultsPrototype.methods = {}
	// defaultsPrototype.notify = !!DSUtils.w
	// defaultsPrototype.omit = []
	// defaultsPrototype.onConflict = 'merge'
	// defaultsPrototype.reapAction = DSUtils.w ? 'inject' : 'none'
	// defaultsPrototype.reapInterval = DSUtils.w ? 30000 : false
	// defaultsPrototype.relationsEnumerable = false
	// defaultsPrototype.resetHistoryOnInject = true
	// defaultsPrototype.returnMeta = false
	// defaultsPrototype.scopes = {}
	// defaultsPrototype.strategy = 'single'
	// defaultsPrototype.upsert = !!DSUtils.w
	// defaultsPrototype.useClass = true
	// defaultsPrototype.useFilter = false
	// defaultsPrototype.validate = lifecycleNoopCb
	// defaultsPrototype.watchChanges = !!DSUtils.w
	
	// class _DS {
	//   constructor (options) {
	//     let _this = this
	//     options = options || {}
	
	//     _this.store = {}
	//     _this.definitions = {}
	//     _this.adapters = {}
	//     _this.defaults = new Defaults()
	//     _this.observe = DSUtils.observe
	//     DSUtils.forOwn(options, function (v, k) {
	//       if (k === 'omit') {
	//         _this.defaults.omit = v.concat(Defaults.prototype.omit)
	//       } else {
	//         _this.defaults[k] = v
	//       }
	//     })
	
	//     DSUtils.Events(_this)
	//   }
	
	//   getAdapterName (options) {
	//     let errorIfNotExist = false
	//     options = options || {}
	//     if (DSUtils._s(options)) {
	//       errorIfNotExist = true
	//       options = {
	//         adapter: options
	//       }
	//     }
	//     if (this.adapters[options.adapter]) {
	//       return options.adapter
	//     } else if (errorIfNotExist) {
	//       throw new Error(`${options.adapter} is not a registered adapter!`)
	//     } else {
	//       return options.defaultAdapter
	//     }
	//   }
	
	//   getAdapter (options) {
	//     options = options || {}
	//     return this.adapters[this.getAdapterName(options)]
	//   }
	
	//   registerAdapter (name, Adapter, options) {
	//     let _this = this
	//     options = options || {}
	//     if (DSUtils.isFunction(Adapter)) {
	//       _this.adapters[name] = new Adapter(options)
	//     } else {
	//       _this.adapters[name] = Adapter
	//     }
	//     if (options.default) {
	//       _this.defaults.defaultAdapter = name
	//     }
	//   }
	
	//   errorFn (...args) {
	//     let options = args[args.length - 1]
	//     let defaultHandler = this.defaults.errorHandler
	//     let errorHandler = options ? options.errorHandler : defaultHandler
	//     errorHandler = errorHandler || defaultHandler
	//     return function (err) {
	//       return errorHandler(err, ...args)
	//     }
	//   }
	// }
	
	// var dsPrototype = _DS.prototype
	
	// dsPrototype.getAdapterName.shorthand = false
	// dsPrototype.getAdapter.shorthand = false
	// dsPrototype.registerAdapter.shorthand = false
	// dsPrototype.errors = DSErrors
	// dsPrototype.utils = DSUtils
	
	function DS() {
	  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	  this.definitions = {};
	} /* jshint eqeqeq:false */
	
	(0, _decorators.configure)({
	  clear: function clear() {
	    var ejected = {};
	    (0, _utils.forOwn)(this.definitions, function (definition) {
	      var name = definition.name;
	      ejected[name] = definition.ejectAll();
	    });
	    return ejected;
	  },
	  defineResource: function defineResource(opts) {
	    var Child = _resource.Resource.extend(opts.methods || {}, opts);
	    this.definitions[Child.name] = Child;
	    return Child;
	  }
	})(DS.prototype);
	
	(0, _utils.forOwn)(_resource.Resource, function (value, key) {
	  if ((0, _utils.isFunction)(value)) {
	    DS.prototype[key] = function (name) {
	      var _definitions$name;
	
	      if (!this.definitions[name]) {
	        throw new Error(name + ' is not a registered Resource!');
	      }
	
	      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	      }
	
	      return (_definitions$name = this.definitions[name])[key].apply(_definitions$name, args);
	    };
	  }
	});

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Resource = undefined;
	
	var _utils = __webpack_require__(3);
	
	var utils = _interopRequireWildcard(_utils);
	
	var _decorators = __webpack_require__(4);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var isBrowser = false;
	
	try {
	  isBrowser = !!window;
	} catch (e) {}
	
	function autoInject(resource, data, opts) {
	  if (opts.autoInject) {
	    return resource.inject(data);
	  }
	  return data;
	}
	
	// This is here so Babel will give us
	// the inheritance helpers which we
	// can re-use for the "extend" method
	
	var BaseResource = function BaseResource() {
	  _classCallCheck(this, BaseResource);
	};
	
	var Resource = exports.Resource = (function (_BaseResource) {
	  _inherits(Resource, _BaseResource);
	
	  function Resource() {
	    var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	    _classCallCheck(this, Resource);
	
	    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Resource).call(this));
	
	    Object.defineProperty(_this2, '$$props', {
	      value: {}
	    });
	    (0, _decorators.configure)(props)(_this2);
	    return _this2;
	  }
	
	  // Instance methods
	
	  _createClass(Resource, [{
	    key: 'create',
	    value: function create(opts) {
	      var _this3 = this;
	
	      var Ctor = this.constructor;
	      return Ctor.create(this, opts).then(function (data) {
	        // Might need to find a better way to do this
	        if (data !== _this3 && data[Ctor.idAttribute]) {
	          utils.forOwn(data, function (value, key) {
	            _this3[key] = value;
	          });
	        }
	        return _this3;
	      });
	    }
	  }, {
	    key: 'save',
	    value: function save(opts) {
	      var Ctor = this.constructor;
	      var Opts = utils._(Ctor, opts);
	
	      var adapterName = Ctor.getAdapterName(Opts);
	      return Ctor.adapters[adapterName].update(Ctor, this[Ctor.idAttribute], this, Opts);
	    }
	  }, {
	    key: 'destroy',
	    value: function destroy(opts) {
	      var Ctor = this.constructor;
	      return Ctor.destroy(this[Ctor.idAttribute], opts);
	    }
	
	    // Static methods
	
	  }], [{
	    key: 'data',
	    value: function data() {
	      throw new Error(this.name + ': Did you forget to define a schema?');
	    }
	  }, {
	    key: 'createIndex',
	    value: function createIndex(name, keyList) {
	      this.data().createIndex(name, keyList);
	    }
	  }, {
	    key: 'createInstance',
	    value: function createInstance(props) {
	      var Constructor = this;
	      return props instanceof Constructor ? props : new Constructor(props);
	    }
	  }, {
	    key: 'is',
	    value: function is(instance) {
	      return instance instanceof this;
	    }
	  }, {
	    key: 'inject',
	    value: function inject(items) {
	      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	      var _this = this;
	      var singular = false;
	      if (!utils.isArray(items)) {
	        items = [items];
	        singular = true;
	      }
	      var collection = _this.data();
	      var idAttribute = _this.idAttribute;
	      var relationList = _this.relationList || [];
	      items.forEach(function (props) {
	        relationList.forEach(function (def) {
	          var Relation = def.Relation;
	          var toInject = utils.get(props, def.localField);
	          if (utils.isFunction(def.inject)) {
	            def.inject(_this, def, props);
	          } else if (toInject && def.inject !== false) {
	            if (utils.isArray(toInject)) {
	              toInject.forEach(function (toInjectItem) {
	                if (toInjectItem !== Relation.get(utils.get(toInjectItem, Relation.idAttribute))) {
	                  try {
	                    if (def.foreignKey) {
	                      utils.set(toInjectItem, def.foreignKey, utils.get(props, idAttribute));
	                    }
	                    Relation.inject(toInjectItem);
	                  } catch (err) {
	                    throw new Error('Failed to inject ' + def.type + ' relation: "' + def.relation + '"!');
	                  }
	                }
	              });
	              if (def.localKeys) {
	                utils.set(toInject, def.localKeys, toInject.map(function (injected) {
	                  return utils.get(injected, Relation.idAttribute);
	                }));
	              }
	            } else {
	              // handle injecting belongsTo and hasOne relations
	              if (toInject !== Relation.get(Relation.idAttribute)) {
	                try {
	                  if (def.localKey) {
	                    utils.set(props, def.localKey, utils.get(toInject, Relation.idAttribute));
	                  }
	                  if (def.foreignKey) {
	                    utils.set(toInject, def.foreignKey, utils.get(props, idAttribute));
	                  }
	                  Relation.inject(toInject);
	                } catch (err) {
	                  throw new Error('Failed to inject ' + def.type + ' relation: "' + def.relation + '"!');
	                }
	              }
	            }
	          }
	          // remove relation properties from the item, since those relations have been injected by now
	          if (typeof def.link === 'boolean' ? def.link : !!_this.linkRelations) {
	            utils.unset(props, def.localField);
	          }
	        });
	      });
	      items = items.map(function (props) {
	        var id = utils.get(props, idAttribute);
	        if (!id) {
	          throw new TypeError('User#' + idAttribute + ': Expected string or number, found ' + (typeof id === 'undefined' ? 'undefined' : _typeof(id)) + '!');
	        }
	        var existing = _this.get(id);
	
	        if (existing) {
	          var onConflict = opts.onConflict || _this.onConflict;
	          if (onConflict === 'merge') {
	            utils.deepMixIn(existing, props);
	          } else if (onConflict === 'replace') {
	            utils.forOwn(existing, function (value, key) {
	              if (key !== idAttribute) {
	                if (!props.hasOwnProperty(key)) {
	                  delete existing[key];
	                }
	              }
	            });
	            utils.forOwn(props, function (value, key) {
	              if (key !== idAttribute) {
	                existing[key] = value;
	              }
	            });
	          }
	          props = existing;
	        } else {
	          props = _this.createInstance(props);
	          props.$$props.$$s = true;
	          collection.index.insertRecord(props);
	        }
	        utils.forOwn(collection.indexes, function (index) {
	          index.updateRecord(props);
	        });
	        return props;
	      });
	      return singular ? items.length ? items[0] : undefined : items;
	    }
	  }, {
	    key: 'eject',
	    value: function eject(id) {
	      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	      var item = this.get(id);
	      if (item) {
	        delete item.$$props.$$s;
	        this.data().remove(item);
	      }
	    }
	  }, {
	    key: 'ejectAll',
	    value: function ejectAll(params) {
	      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	      var items = this.filter(params);
	      var collection = this.data();
	      items.forEach(function (item) {
	        collection.remove(item);
	      });
	      return items;
	    }
	  }, {
	    key: 'get',
	    value: function get(id) {
	      var instances = this.data().get(id);
	      return instances.length ? instances[0] : undefined;
	    }
	  }, {
	    key: 'between',
	    value: function between() {
	      var _data;
	
	      return (_data = this.data()).between.apply(_data, arguments);
	    }
	  }, {
	    key: 'getAll',
	    value: function getAll() {
	      var _data2;
	
	      return (_data2 = this.data()).getAll.apply(_data2, arguments);
	    }
	  }, {
	    key: 'filter',
	    value: function filter(opts) {
	      return this.data().filter(opts);
	    }
	  }, {
	    key: 'query',
	    value: function query() {
	      return this.data().query();
	    }
	  }, {
	    key: 'getAdapter',
	    value: function getAdapter(opts) {
	      return this.adapters[this.getAdapterName(opts)];
	    }
	  }, {
	    key: 'getAdapterName',
	    value: function getAdapterName(opts) {
	      utils._(this, opts);
	      return opts.adapter || opts.defaultAdapter;
	    }
	  }, {
	    key: 'beforeCreate',
	    value: function beforeCreate() {}
	  }, {
	    key: 'create',
	    value: function create() {
	      var _this4 = this;
	
	      var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	      utils._(this, opts);
	
	      if (opts.upsert && utils.get(props, this.idAttribute)) {
	        return this.update(utils.get(props, this.idAttribute), props, opts);
	      }
	      return this.beforeCreate(props, opts).then(function () {
	        var adapterName = _this4.getAdapterName(opts);
	        return _this4.adapters[adapterName].create(_this4, utils.omit(props, opts.omit), opts);
	      }).then(function (data) {
	        return _this4.afterCreate(data, opts);
	      }).then(function (data) {
	        return autoInject(_this4, data, opts);
	      });
	    }
	  }, {
	    key: 'afterCreate',
	    value: function afterCreate() {}
	  }, {
	    key: 'beforeCreateMany',
	    value: function beforeCreateMany() {}
	  }, {
	    key: 'createMany',
	    value: function createMany() {
	      var _this5 = this;
	
	      var items = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
	      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	      utils._(this, opts);
	
	      if (opts.upsert) {
	        var _ret = (function () {
	          var hasId = true;
	          items.forEach(function (item) {
	            hasId = hasId && utils.get(item, this.idAttribute);
	          });
	          if (hasId) {
	            return {
	              v: _this5.updateMany(items, opts)
	            };
	          }
	        })();
	
	        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	      }
	      var adapterName = this.getAdapterName(opts);
	      return this.beforeCreateMany(items, opts).then(function () {
	        return _this5.adapters[adapterName].createMany(_this5, items.map(function (item) {
	          return utils.omit(item, opts.omit);
	        }), opts);
	      }).then(function (data) {
	        return _this5.afterCreateMany(data, opts);
	      }).then(function (data) {
	        return autoInject(_this5, data, opts);
	      });
	    }
	  }, {
	    key: 'afterCreateMany',
	    value: function afterCreateMany() {}
	  }, {
	    key: 'beforeFind',
	    value: function beforeFind() {}
	  }, {
	    key: 'find',
	    value: function find(id) {
	      var _this6 = this;
	
	      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	      utils._(this, opts);
	
	      var adapterName = this.getAdapterName(opts);
	      return this.beforeFind(id, opts).then(function () {
	        return _this6.adapters[adapterName].find(_this6, id, opts);
	      }).then(function (data) {
	        return _this6.afterFind(data, opts);
	      }).then(function (data) {
	        return autoInject(_this6, data, opts);
	      });
	    }
	  }, {
	    key: 'afterFind',
	    value: function afterFind() {}
	  }, {
	    key: 'beforeFindAll',
	    value: function beforeFindAll() {}
	  }, {
	    key: 'findAll',
	    value: function findAll() {
	      var _this7 = this;
	
	      var query = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	      utils._(this, opts);
	
	      var adapterName = this.getAdapterName(opts);
	      return this.beforeFindAll(query, opts).then(function () {
	        return _this7.adapters[adapterName].findAll(_this7, query, opts);
	      }).then(function (data) {
	        return _this7.afterFindAll(data, opts);
	      }).then(function (data) {
	        return autoInject(_this7, data, opts);
	      });
	    }
	  }, {
	    key: 'afterFindAll',
	    value: function afterFindAll() {}
	  }, {
	    key: 'beforeUpdate',
	    value: function beforeUpdate() {}
	  }, {
	    key: 'update',
	    value: function update(id) {
	      var _this8 = this;
	
	      var props = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	      var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
	
	      utils._(this, opts);
	
	      var adapterName = this.getAdapterName(opts);
	      return this.beforeUpdate(id, props, opts).then(function () {
	        return _this8.adapters[adapterName].update(_this8, id, props, opts);
	      }).then(function (data) {
	        return _this8.afterUpdate(id, data, opts);
	      }).then(function (data) {
	        return autoInject(_this8, data, opts);
	      });
	    }
	  }, {
	    key: 'afterUpdate',
	    value: function afterUpdate() {}
	  }, {
	    key: 'beforeUpdateMany',
	    value: function beforeUpdateMany() {}
	  }, {
	    key: 'updateMany',
	    value: function updateMany() {
	      var _this9 = this;
	
	      var items = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
	      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	      utils._(this, opts);
	
	      var adapterName = this.getAdapterName(opts);
	      return this.beforeUpdateMany(items, opts).then(function () {
	        return _this9.adapters[adapterName].updateMany(_this9, items, opts);
	      }).then(function (data) {
	        return _this9.afterUpdateMany(data, opts);
	      }).then(function (data) {
	        return autoInject(_this9, data, opts);
	      });
	    }
	  }, {
	    key: 'afterUpdateMany',
	    value: function afterUpdateMany() {}
	  }, {
	    key: 'beforeUpdateAll',
	    value: function beforeUpdateAll() {}
	  }, {
	    key: 'updateAll',
	    value: function updateAll() {
	      var query = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	      var _this10 = this;
	
	      var props = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	      var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
	
	      utils._(this, opts);
	
	      var adapterName = this.getAdapterName(opts);
	      return this.beforeUpdateAll(query, props, opts).then(function () {
	        return _this10.adapters[adapterName].updateAll(_this10, query, props, opts);
	      }).then(function (data) {
	        return _this10.afterUpdateAll(query, data, opts);
	      }).then(function (data) {
	        return autoInject(_this10, data, opts);
	      });
	    }
	  }, {
	    key: 'afterUpdateAll',
	    value: function afterUpdateAll() {}
	  }, {
	    key: 'beforeDestroy',
	    value: function beforeDestroy() {}
	  }, {
	    key: 'destroy',
	    value: function destroy(id) {
	      var _this11 = this;
	
	      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	      utils._(this, opts);
	
	      var adapterName = this.getAdapterName(opts);
	      return this.beforeDestroy(id, opts).then(function () {
	        return _this11.adapters[adapterName].destroy(_this11, id, opts);
	      }).then(function () {
	        return _this11.afterDestroy(id, opts);
	      }).then(function () {
	        return _this11.eject(id, opts);
	      });
	    }
	  }, {
	    key: 'afterDestroy',
	    value: function afterDestroy() {}
	  }, {
	    key: 'beforeDestroyAll',
	    value: function beforeDestroyAll() {}
	  }, {
	    key: 'destroyAll',
	    value: function destroyAll() {
	      var _this12 = this;
	
	      var query = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	      utils._(this, opts);
	
	      var adapterName = this.getAdapterName(opts);
	      return this.beforeDestroyAll(query, opts).then(function () {
	        return _this12.adapters[adapterName].destroyAll(_this12, query, opts);
	      }).then(function () {
	        return _this12.afterDestroyAll(query, opts);
	      }).then(function () {
	        return _this12.ejectAll(query, opts);
	      });
	    }
	  }, {
	    key: 'afterDestroyAll',
	    value: function afterDestroyAll() {}
	
	    /**
	     * Usage:
	     *
	     * Post.belongsTo(User, {
	     *   localKey: 'myUserId'
	     * })
	     *
	     * Comment.belongsTo(User)
	     * Comment.belongsTo(Post, {
	     *   localField: '_post'
	     * })
	     */
	
	  }, {
	    key: 'belongsTo',
	    value: function belongsTo(resource, opts) {
	      return (0, _decorators.belongsTo)(resource, opts)(this);
	    }
	
	    /**
	     * Usage:
	     *
	     * User.hasMany(Post, {
	     *   localField: 'my_posts'
	     * })
	     */
	
	  }, {
	    key: 'hasMany',
	    value: function hasMany(resource, opts) {
	      return (0, _decorators.hasMany)(resource, opts)(this);
	    }
	
	    /**
	     * Usage:
	     *
	     * User.hasOne(Profile, {
	     *   localField: '_profile'
	     * })
	     */
	
	  }, {
	    key: 'hasOne',
	    value: function hasOne(resource, opts) {
	      return (0, _decorators.hasOne)(resource, opts)(this);
	    }
	  }, {
	    key: 'action',
	    value: function action(name, opts) {
	      return (0, _decorators.action)(name, opts)(this);
	    }
	  }, {
	    key: 'actions',
	    value: function actions(opts) {
	      return (0, _decorators.actions)(opts)(this);
	    }
	  }, {
	    key: 'schema',
	    value: function schema(opts) {
	      return (0, _decorators.schema)(opts)(this);
	    }
	  }, {
	    key: 'configure',
	    value: function configure(props) {
	      return (0, _decorators.configure)(props)(this);
	    }
	
	    /**
	     * Usage:
	     *
	     * var User = JSData.Resource.extend({...}, {...})
	     */
	
	  }, {
	    key: 'extend',
	    value: function extend(props) {
	      var classProps = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	      var Child = undefined;
	      var Parent = this;
	      props = props || {};
	
	      if (!classProps.name) {
	        throw new TypeError('name: Expected string, found ' + _typeof(classProps.name) + '!');
	      }
	      var _schema = classProps.schema || _defineProperty({}, classProps.idAttribute, {});
	      var initialize = props.initialize;
	      delete props.initialize;
	      _schema[classProps.idAttribute] = _schema[classProps.idAttribute] || {};
	      classProps.shortname = classProps.shortname || utils.camelCase(classProps.name);
	
	      if (props.hasOwnProperty('constructor')) {
	        Child = props.constructor;
	        delete props.constructor;
	      } else {
	        if (classProps.csp) {
	          Child = function () {
	            _classCallCheck(this, Child);
	
	            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	              args[_key] = arguments[_key];
	            }
	
	            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Child).apply(this, args));
	            if (initialize) {
	              initialize.apply(this, args);
	            }
	            return _this;
	          };
	        } else {
	          var name = utils.pascalCase(classProps.name);
	          delete classProps.name;
	          var func = 'return function ' + name + '() {\n                        _classCallCheck(this, ' + name + ')\n                        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(' + name + ').apply(this, arguments));\n                        if (initialize) {\n                          initialize.apply(this, arguments)\n                        }\n                        return _this\n                      }';
	          Child = new Function('_classCallCheck', '_possibleConstructorReturn', 'Parent', 'initialize', func)(_classCallCheck, _possibleConstructorReturn, Parent, initialize); // eslint-disable-line
	        }
	      }
	
	      _inherits(Child, Parent);
	
	      (0, _decorators.configure)(props)(Child.prototype);
	      (0, _decorators.configure)(classProps)(Child);
	
	      (0, _decorators.schema)(_schema)(Child);
	
	      return Child;
	    }
	  }]);
	
	  return Resource;
	})(BaseResource);
	
	(0, _decorators.configure)({
	  adapters: {},
	  autoInject: isBrowser,
	  bypassCache: false,
	  csp: false,
	  defaultAdapter: 'http',
	  eagerEject: false,
	  idAttribute: 'id',
	  linkRelations: isBrowser,
	  onConflict: 'merge',
	  relationsEnumerable: false,
	  returnMeta: false,
	  strategy: 'single',
	  useFilter: true
	})(Resource);

/***/ }
/******/ ])
});
;
//# sourceMappingURL=js-data-debug.js.map
