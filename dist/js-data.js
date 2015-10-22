/*!
 * js-data
 * @version 2.0.0-beta.6 - Homepage <http://www.js-data.io/>
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
		define(factory);
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

	var _datastoreIndex = __webpack_require__(1);

	var _utils = __webpack_require__(2);

	var _errors = __webpack_require__(3);

	module.exports = {
	  DS: _datastoreIndex['default'],
	  DSUtils: _utils['default'],
	  DSErrors: _errors['default'],
	  createStore: function createStore(options) {
	    return new _datastoreIndex['default'](options);
	  },
	  version: {
	    full: '2.0.0-beta.6',
	    major: parseInt('2', 10),
	    minor: parseInt('0', 10),
	    patch: parseInt('0', 10),
	    alpha: true ? 'false' : false,
	    beta: true ? '6' : false
	  }
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	/* jshint eqeqeq:false */

	var _utils = __webpack_require__(2);

	var _errors = __webpack_require__(3);

	var _sync_methodsIndex = __webpack_require__(4);

	var _async_methodsIndex = __webpack_require__(5);

	function lifecycleNoopCb(resource, attrs, cb) {
	  cb(null, attrs);
	}

	function lifecycleNoop(resource, attrs) {
	  return attrs;
	}

	function compare(_x, _x2, _x3, _x4) {
	  var _again = true;

	  _function: while (_again) {
	    var orderBy = _x,
	        index = _x2,
	        a = _x3,
	        b = _x4;
	    def = cA = cB = undefined;
	    _again = false;

	    var def = orderBy[index];
	    var cA = _utils['default'].get(a, def[0]),
	        cB = _utils['default'].get(b, def[0]);
	    if (_utils['default']._s(cA)) {
	      cA = _utils['default'].upperCase(cA);
	    }
	    if (_utils['default']._s(cB)) {
	      cB = _utils['default'].upperCase(cB);
	    }
	    if (def[1] === 'DESC') {
	      if (cB < cA) {
	        return -1;
	      } else if (cB > cA) {
	        return 1;
	      } else {
	        if (index < orderBy.length - 1) {
	          _x = orderBy;
	          _x2 = index + 1;
	          _x3 = a;
	          _x4 = b;
	          _again = true;
	          continue _function;
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
	          _x = orderBy;
	          _x2 = index + 1;
	          _x3 = a;
	          _x4 = b;
	          _again = true;
	          continue _function;
	        } else {
	          return 0;
	        }
	      }
	    }
	  }
	}

	var Defaults = (function () {
	  function Defaults() {
	    _classCallCheck(this, Defaults);
	  }

	  _createClass(Defaults, [{
	    key: 'errorFn',
	    value: function errorFn(a, b) {
	      if (this.error && typeof this.error === 'function') {
	        try {
	          if (typeof a === 'string') {
	            throw new Error(a);
	          } else {
	            throw a;
	          }
	        } catch (err) {
	          a = err;
	        }
	        this.error(this.name || null, a || null, b || null);
	      }
	    }
	  }]);

	  return Defaults;
	})();

	var defaultsPrototype = Defaults.prototype;

	defaultsPrototype.actions = {};
	defaultsPrototype.afterCreate = lifecycleNoopCb;
	defaultsPrototype.afterCreateCollection = lifecycleNoop;
	defaultsPrototype.afterCreateInstance = lifecycleNoop;
	defaultsPrototype.afterDestroy = lifecycleNoopCb;
	defaultsPrototype.afterEject = lifecycleNoop;
	defaultsPrototype.afterInject = lifecycleNoop;
	defaultsPrototype.afterReap = lifecycleNoop;
	defaultsPrototype.afterUpdate = lifecycleNoopCb;
	defaultsPrototype.afterValidate = lifecycleNoopCb;
	defaultsPrototype.allowSimpleWhere = true;
	defaultsPrototype.basePath = '';
	defaultsPrototype.beforeCreate = lifecycleNoopCb;
	defaultsPrototype.beforeCreateCollection = lifecycleNoop;
	defaultsPrototype.beforeCreateInstance = lifecycleNoop;
	defaultsPrototype.beforeDestroy = lifecycleNoopCb;
	defaultsPrototype.beforeEject = lifecycleNoop;
	defaultsPrototype.beforeInject = lifecycleNoop;
	defaultsPrototype.beforeReap = lifecycleNoop;
	defaultsPrototype.beforeUpdate = lifecycleNoopCb;
	defaultsPrototype.beforeValidate = lifecycleNoopCb;
	defaultsPrototype.bypassCache = false;
	defaultsPrototype.cacheResponse = !!_utils['default'].w;
	defaultsPrototype.clearEmptyQueries = true;
	defaultsPrototype.computed = {};
	defaultsPrototype.defaultAdapter = 'http';
	defaultsPrototype.debug = false;
	defaultsPrototype.defaultValues = {};
	defaultsPrototype.eagerEject = false;
	// TODO: Implement eagerInject in DS#create
	defaultsPrototype.eagerInject = false;
	defaultsPrototype.endpoint = '';
	defaultsPrototype.error = console ? function (a, b, c) {
	  return console[typeof console.error === 'function' ? 'error' : 'log'](a, b, c);
	} : false;
	defaultsPrototype.fallbackAdapters = ['http'];
	defaultsPrototype.findStrictCache = false;
	defaultsPrototype.idAttribute = 'id';
	defaultsPrototype.ignoredChanges = [/\$/];
	defaultsPrototype.ignoreMissing = false;
	defaultsPrototype.keepChangeHistory = false;
	defaultsPrototype.linkRelations = true;
	defaultsPrototype.log = console ? function (a, b, c, d, e) {
	  return console[typeof console.info === 'function' ? 'info' : 'log'](a, b, c, d, e);
	} : false;

	defaultsPrototype.logFn = function (a, b, c, d) {
	  var _this = this;
	  if (_this.debug && _this.log && typeof _this.log === 'function') {
	    _this.log(_this.name || null, a || null, b || null, c || null, d || null);
	  }
	};

	defaultsPrototype.maxAge = false;
	defaultsPrototype.methods = {};
	defaultsPrototype.notify = !!_utils['default'].w;
	defaultsPrototype.reapAction = !!_utils['default'].w ? 'inject' : 'none';
	defaultsPrototype.reapInterval = !!_utils['default'].w ? 30000 : false;
	defaultsPrototype.relationsEnumerable = false;
	defaultsPrototype.resetHistoryOnInject = true;
	defaultsPrototype.strategy = 'single';
	defaultsPrototype.upsert = !!_utils['default'].w;
	defaultsPrototype.useClass = true;
	defaultsPrototype.useFilter = false;
	defaultsPrototype.validate = lifecycleNoopCb;
	defaultsPrototype.defaultFilter = function (collection, resourceName, params, options) {
	  var filtered = collection;
	  var where = null;
	  var reserved = {
	    skip: '',
	    offset: '',
	    where: '',
	    limit: '',
	    orderBy: '',
	    sort: ''
	  };

	  params = params || {};
	  options = options || {};

	  if (_utils['default']._o(params.where)) {
	    where = params.where;
	  } else {
	    where = {};
	  }

	  if (options.allowSimpleWhere) {
	    _utils['default'].forOwn(params, function (value, key) {
	      if (!(key in reserved) && !(key in where)) {
	        where[key] = {
	          '==': value
	        };
	      }
	    });
	  }

	  if (_utils['default'].isEmpty(where)) {
	    where = null;
	  }

	  if (where) {
	    filtered = _utils['default'].filter(filtered, function (attrs) {
	      var first = true;
	      var keep = true;
	      _utils['default'].forOwn(where, function (clause, field) {
	        if (_utils['default']._s(clause)) {
	          clause = {
	            '===': clause
	          };
	        } else if (_utils['default']._n(clause) || _utils['default'].isBoolean(clause)) {
	          clause = {
	            '==': clause
	          };
	        }
	        if (_utils['default']._o(clause)) {
	          _utils['default'].forOwn(clause, function (term, op) {
	            var expr = undefined;
	            var isOr = op[0] === '|';
	            var val = _utils['default'].get(attrs, field);
	            op = isOr ? op.substr(1) : op;
	            if (op === '==') {
	              expr = val == term;
	            } else if (op === '===') {
	              expr = val === term;
	            } else if (op === '!=') {
	              expr = val != term;
	            } else if (op === '!==') {
	              expr = val !== term;
	            } else if (op === '>') {
	              expr = val > term;
	            } else if (op === '>=') {
	              expr = val >= term;
	            } else if (op === '<') {
	              expr = val < term;
	            } else if (op === '<=') {
	              expr = val <= term;
	            } else if (op === 'isectEmpty') {
	              expr = !_utils['default'].intersection(val || [], term || []).length;
	            } else if (op === 'isectNotEmpty') {
	              expr = _utils['default'].intersection(val || [], term || []).length;
	            } else if (op === 'in') {
	              if (_utils['default']._s(term)) {
	                expr = term.indexOf(val) !== -1;
	              } else {
	                expr = _utils['default'].contains(term, val);
	              }
	            } else if (op === 'notIn') {
	              if (_utils['default']._s(term)) {
	                expr = term.indexOf(val) === -1;
	              } else {
	                expr = !_utils['default'].contains(term, val);
	              }
	            } else if (op === 'contains') {
	              if (_utils['default']._s(val)) {
	                expr = val.indexOf(term) !== -1;
	              } else {
	                expr = _utils['default'].contains(val, term);
	              }
	            } else if (op === 'notContains') {
	              if (_utils['default']._s(val)) {
	                expr = val.indexOf(term) === -1;
	              } else {
	                expr = !_utils['default'].contains(val, term);
	              }
	            }
	            if (expr !== undefined) {
	              keep = first ? expr : isOr ? keep || expr : keep && expr;
	            }
	            first = false;
	          });
	        }
	      });
	      return keep;
	    });
	  }

	  var orderBy = null;

	  if (_utils['default']._s(params.orderBy)) {
	    orderBy = [[params.orderBy, 'ASC']];
	  } else if (_utils['default']._a(params.orderBy)) {
	    orderBy = params.orderBy;
	  }

	  if (!orderBy && _utils['default']._s(params.sort)) {
	    orderBy = [[params.sort, 'ASC']];
	  } else if (!orderBy && _utils['default']._a(params.sort)) {
	    orderBy = params.sort;
	  }

	  // Apply 'orderBy'
	  if (orderBy) {
	    (function () {
	      var index = 0;
	      _utils['default'].forEach(orderBy, function (def, i) {
	        if (_utils['default']._s(def)) {
	          orderBy[i] = [def, 'ASC'];
	        } else if (!_utils['default']._a(def)) {
	          throw new _errors['default'].IA('DS.filter("' + resourceName + '"[, params][, options]): ' + _utils['default'].toJson(def) + ': Must be a string or an array!', {
	            params: {
	              'orderBy[i]': {
	                actual: typeof def,
	                expected: 'string|array'
	              }
	            }
	          });
	        }
	      });
	      filtered = _utils['default'].sort(filtered, function (a, b) {
	        return compare(orderBy, index, a, b);
	      });
	    })();
	  }

	  var limit = _utils['default']._n(params.limit) ? params.limit : null;
	  var skip = null;

	  if (_utils['default']._n(params.skip)) {
	    skip = params.skip;
	  } else if (_utils['default']._n(params.offset)) {
	    skip = params.offset;
	  }

	  // Apply 'limit' and 'skip'
	  if (limit && skip) {
	    filtered = _utils['default'].slice(filtered, skip, Math.min(filtered.length, skip + limit));
	  } else if (_utils['default']._n(limit)) {
	    filtered = _utils['default'].slice(filtered, 0, Math.min(filtered.length, limit));
	  } else if (_utils['default']._n(skip)) {
	    if (skip < filtered.length) {
	      filtered = _utils['default'].slice(filtered, skip);
	    } else {
	      filtered = [];
	    }
	  }

	  return filtered;
	};

	var DS = (function () {
	  function DS(options) {
	    _classCallCheck(this, DS);

	    var _this = this;
	    options = options || {};

	    _this.store = {};
	    // alias store, shaves 0.1 kb off the minified build
	    _this.s = _this.store;
	    _this.definitions = {};
	    // alias definitions, shaves 0.3 kb off the minified build
	    _this.defs = _this.definitions;
	    _this.adapters = {};
	    _this.defaults = new Defaults();
	    _this.observe = _utils['default'].observe;
	    _utils['default'].forOwn(options, function (v, k) {
	      _this.defaults[k] = v;
	    });
	  }

	  _createClass(DS, [{
	    key: 'getAdapter',
	    value: function getAdapter(options) {
	      var errorIfNotExist = false;
	      options = options || {};
	      if (_utils['default']._s(options)) {
	        errorIfNotExist = true;
	        options = {
	          adapter: options
	        };
	      }
	      var adapter = this.adapters[options.adapter];
	      if (adapter) {
	        return adapter;
	      } else if (errorIfNotExist) {
	        throw new Error('' + options.adapter + ' is not a registered adapter!');
	      } else {
	        return this.adapters[options.defaultAdapter];
	      }
	    }
	  }, {
	    key: 'registerAdapter',
	    value: function registerAdapter(name, Adapter, options) {
	      var _this = this;
	      options = options || {};
	      if (_utils['default'].isFunction(Adapter)) {
	        _this.adapters[name] = new Adapter(options);
	      } else {
	        _this.adapters[name] = Adapter;
	      }
	      if (options['default']) {
	        _this.defaults.defaultAdapter = name;
	      }
	    }
	  }, {
	    key: 'is',
	    value: function is(resourceName, instance) {
	      var definition = this.defs[resourceName];
	      if (!definition) {
	        throw new _errors['default'].NER(resourceName);
	      }
	      return instance instanceof definition[definition['class']];
	    }
	  }]);

	  return DS;
	})();

	var dsPrototype = DS.prototype;

	dsPrototype.getAdapter.shorthand = false;
	dsPrototype.registerAdapter.shorthand = false;
	dsPrototype.errors = _errors['default'];
	dsPrototype.utils = _utils['default'];

	function addMethods(target, obj) {
	  _utils['default'].forOwn(obj, function (v, k) {
	    target[k] = v;
	    target[k].before = function (fn) {
	      var orig = target[k];
	      target[k] = function () {
	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	          args[_key] = arguments[_key];
	        }

	        return orig.apply(this, fn.apply(this, args) || args);
	      };
	    };
	  });
	}

	addMethods(dsPrototype, _sync_methodsIndex['default']);
	addMethods(dsPrototype, _async_methodsIndex['default']);

	exports['default'] = DS;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	function _defineProperty(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); }

	/* jshint eqeqeq:false */

	var _errors = __webpack_require__(3);

	var BinaryHeap = __webpack_require__(7);
	var forEach = __webpack_require__(8);
	var slice = __webpack_require__(9);
	var forOwn = __webpack_require__(13);
	var contains = __webpack_require__(10);
	var deepMixIn = __webpack_require__(14);
	var pascalCase = __webpack_require__(18);
	var remove = __webpack_require__(11);
	var pick = __webpack_require__(15);
	var sort = __webpack_require__(12);
	var upperCase = __webpack_require__(19);
	var get = __webpack_require__(16);
	var set = __webpack_require__(17);
	var observe = __webpack_require__(6);
	var w = undefined;
	var objectProto = Object.prototype;
	var toString = objectProto.toString;
	var P = undefined;

	try {
	  P = Promise;
	} catch (err) {
	  console.error('js-data requires a global Promise constructor!');
	}

	var isArray = Array.isArray || function isArray(value) {
	  return toString.call(value) == '[object Array]' || false;
	};

	var isRegExp = function isRegExp(value) {
	  return toString.call(value) == '[object RegExp]' || false;
	};

	// adapted from lodash.isBoolean
	var isBoolean = function isBoolean(value) {
	  return value === true || value === false || value && typeof value == 'object' && toString.call(value) == '[object Boolean]' || false;
	};

	// adapted from lodash.isString
	var isString = function isString(value) {
	  return typeof value == 'string' || value && typeof value == 'object' && toString.call(value) == '[object String]' || false;
	};

	var isObject = function isObject(value) {
	  return toString.call(value) == '[object Object]' || false;
	};

	// adapted from lodash.isDate
	var isDate = function isDate(value) {
	  return value && typeof value == 'object' && toString.call(value) == '[object Date]' || false;
	};

	// adapted from lodash.isNumber
	var isNumber = function isNumber(value) {
	  var type = typeof value;
	  return type == 'number' || value && type == 'object' && toString.call(value) == '[object Number]' || false;
	};

	// adapted from lodash.isFunction
	var isFunction = function isFunction(value) {
	  return typeof value == 'function' || value && toString.call(value) === '[object Function]' || false;
	};

	// shorthand argument checking functions, using these shaves 1.18 kb off of the minified build
	var isStringOrNumber = function isStringOrNumber(value) {
	  return isString(value) || isNumber(value);
	};
	var isStringOrNumberErr = function isStringOrNumberErr(field) {
	  return new _errors['default'].IA('"' + field + '" must be a string or a number!');
	};
	var isObjectErr = function isObjectErr(field) {
	  return new _errors['default'].IA('"' + field + '" must be an object!');
	};
	var isArrayErr = function isArrayErr(field) {
	  return new _errors['default'].IA('"' + field + '" must be an array!');
	};

	// adapted from mout.isEmpty
	var isEmpty = function isEmpty(val) {
	  if (val == null) {
	    // jshint ignore:line
	    // typeof null == 'object' so we check it first
	    return true;
	  } else if (typeof val === 'string' || isArray(val)) {
	    return !val.length;
	  } else if (typeof val === 'object') {
	    var _ret = (function () {
	      var result = true;
	      forOwn(val, function () {
	        result = false;
	        return false; // break loop
	      });
	      return {
	        v: result
	      };
	    })();

	    if (typeof _ret === 'object') return _ret.v;
	  } else {
	    return true;
	  }
	};

	var intersection = function intersection(array1, array2) {
	  if (!array1 || !array2) {
	    return [];
	  }
	  var result = [];
	  var item = undefined;
	  for (var i = 0, _length = array1.length; i < _length; i++) {
	    item = array1[i];
	    if (contains(result, item)) {
	      continue;
	    }
	    if (contains(array2, item)) {
	      result.push(item);
	    }
	  }
	  return result;
	};

	var filter = function filter(array, cb, thisObj) {
	  var results = [];
	  forEach(array, function (value, key, arr) {
	    if (cb(value, key, arr)) {
	      results.push(value);
	    }
	  }, thisObj);
	  return results;
	};

	try {
	  w = window;
	  w = {};
	} catch (e) {
	  w = null;
	}

	function Events(target) {
	  var events = {};
	  target = target || this;
	  target.on = function (type, func, ctx) {
	    events[type] = events[type] || [];
	    events[type].push({
	      f: func,
	      c: ctx
	    });
	  };
	  target.off = function (type, func) {
	    var listeners = events[type];
	    if (!listeners) {
	      events = {};
	    } else if (func) {
	      for (var i = 0; i < listeners.length; i++) {
	        if (listeners[i] === func) {
	          listeners.splice(i, 1);
	          break;
	        }
	      }
	    } else {
	      listeners.splice(0, listeners.length);
	    }
	  };
	  target.emit = function () {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    var listeners = events[args.shift()] || [];
	    if (listeners) {
	      for (var i = 0; i < listeners.length; i++) {
	        listeners[i].f.apply(listeners[i].c, args);
	      }
	    }
	  };
	}

	var toPromisify = ['beforeValidate', 'validate', 'afterValidate', 'beforeCreate', 'afterCreate', 'beforeUpdate', 'afterUpdate', 'beforeDestroy', 'afterDestroy'];

	var isBlacklisted = function isBlacklisted(prop, bl) {
	  var i = undefined;
	  if (!bl || !bl.length) {
	    return false;
	  }
	  for (i = 0; i < bl.length; i++) {
	    if (bl[i] === prop) {
	      return true;
	    }
	  }
	  return false;
	};

	// adapted from angular.copy
	var copy = function copy(source, destination, stackSource, stackDest, blacklist) {
	  if (!destination) {
	    destination = source;
	    if (source) {
	      if (isArray(source)) {
	        destination = copy(source, [], stackSource, stackDest, blacklist);
	      } else if (isDate(source)) {
	        destination = new Date(source.getTime());
	      } else if (isRegExp(source)) {
	        destination = new RegExp(source.source, source.toString().match(/[^\/]*$/)[0]);
	        destination.lastIndex = source.lastIndex;
	      } else if (isObject(source)) {
	        destination = copy(source, Object.create(Object.getPrototypeOf(source)), stackSource, stackDest, blacklist);
	      }
	    }
	  } else {
	    if (source === destination) {
	      throw new Error('Cannot copy! Source and destination are identical.');
	    }

	    stackSource = stackSource || [];
	    stackDest = stackDest || [];

	    if (isObject(source)) {
	      var index = stackSource.indexOf(source);
	      if (index !== -1) {
	        return stackDest[index];
	      }

	      stackSource.push(source);
	      stackDest.push(destination);
	    }

	    var result = undefined;
	    if (isArray(source)) {
	      var i = undefined;
	      destination.length = 0;
	      for (i = 0; i < source.length; i++) {
	        result = copy(source[i], null, stackSource, stackDest, blacklist);
	        if (isObject(source[i])) {
	          stackSource.push(source[i]);
	          stackDest.push(result);
	        }
	        destination.push(result);
	      }
	    } else {
	      if (isArray(destination)) {
	        destination.length = 0;
	      } else {
	        forEach(destination, function (value, key) {
	          delete destination[key];
	        });
	      }
	      for (var key in source) {
	        if (source.hasOwnProperty(key)) {
	          if (isBlacklisted(key, blacklist)) {
	            continue;
	          }
	          result = copy(source[key], null, stackSource, stackDest, blacklist);
	          if (isObject(source[key])) {
	            stackSource.push(source[key]);
	            stackDest.push(result);
	          }
	          destination[key] = result;
	        }
	      }
	    }
	  }
	  return destination;
	};

	// adapted from angular.equals
	var equals = function equals(_x, _x2) {
	  var _again = true;

	  _function: while (_again) {
	    var o1 = _x,
	        o2 = _x2;
	    t1 = t2 = length = key = keySet = undefined;
	    _again = false;

	    if (o1 === o2) {
	      return true;
	    }
	    if (o1 === null || o2 === null) {
	      return false;
	    }
	    if (o1 !== o1 && o2 !== o2) {
	      return true;
	    } // NaN === NaN
	    var t1 = typeof o1,
	        t2 = typeof o2,
	        length,
	        key,
	        keySet;
	    if (t1 == t2) {
	      if (t1 == 'object') {
	        if (isArray(o1)) {
	          if (!isArray(o2)) {
	            return false;
	          }
	          if ((length = o1.length) == o2.length) {
	            // jshint ignore:line
	            for (key = 0; key < length; key++) {
	              if (!equals(o1[key], o2[key])) {
	                return false;
	              }
	            }
	            return true;
	          }
	        } else if (isDate(o1)) {
	          if (!isDate(o2)) {
	            return false;
	          }
	          _x = o1.getTime();
	          _x2 = o2.getTime();
	          _again = true;
	          continue _function;
	        } else if (isRegExp(o1) && isRegExp(o2)) {
	          return o1.toString() == o2.toString();
	        } else {
	          if (isArray(o2)) {
	            return false;
	          }
	          keySet = {};
	          for (key in o1) {
	            if (key.charAt(0) === '$' || isFunction(o1[key])) {
	              continue;
	            }
	            if (!equals(o1[key], o2[key])) {
	              return false;
	            }
	            keySet[key] = true;
	          }
	          for (key in o2) {
	            if (!keySet.hasOwnProperty(key) && key.charAt(0) !== '$' && o2[key] !== undefined && !isFunction(o2[key])) {
	              return false;
	            }
	          }
	          return true;
	        }
	      }
	    }
	    return false;
	  }
	};

	var resolveId = function resolveId(definition, idOrInstance) {
	  if (isString(idOrInstance) || isNumber(idOrInstance)) {
	    return idOrInstance;
	  } else if (idOrInstance && definition) {
	    return idOrInstance[definition.idAttribute] || idOrInstance;
	  } else {
	    return idOrInstance;
	  }
	};

	var resolveItem = function resolveItem(resource, idOrInstance) {
	  if (resource && (isString(idOrInstance) || isNumber(idOrInstance))) {
	    return resource.index[idOrInstance] || idOrInstance;
	  } else {
	    return idOrInstance;
	  }
	};

	var isValidString = function isValidString(val) {
	  return val != null && val !== ''; // jshint ignore:line
	};

	var join = function join(items, separator) {
	  separator = separator || '';
	  return filter(items, isValidString).join(separator);
	};

	var makePath = function makePath() {
	  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	    args[_key2] = arguments[_key2];
	  }

	  var result = join(args, '/');
	  return result.replace(/([^:\/]|^)\/{2,}/g, '$1/');
	};

	exports['default'] = {
	  Promise: P,
	  // Options that inherit from defaults
	  _: function _(parent, options) {
	    var _this = this;
	    options = options || {};
	    if (options && options.constructor === parent.constructor) {
	      return options;
	    } else if (!isObject(options)) {
	      throw new _errors['default'].IA('"options" must be an object!');
	    }
	    forEach(toPromisify, function (name) {
	      if (typeof options[name] === 'function' && options[name].toString().indexOf('for (var _len = arg') === -1) {
	        options[name] = _this.promisify(options[name]);
	      }
	    });
	    var O = function Options(attrs) {
	      var self = this;
	      forOwn(attrs, function (value, key) {
	        self[key] = value;
	      });
	    };
	    O.prototype = parent;
	    O.prototype.orig = function () {
	      var orig = {};
	      forOwn(this, function (value, key) {
	        orig[key] = value;
	      });
	      return orig;
	    };
	    return new O(options);
	  },
	  _n: isNumber,
	  _s: isString,
	  _sn: isStringOrNumber,
	  _snErr: isStringOrNumberErr,
	  _o: isObject,
	  _oErr: isObjectErr,
	  _a: isArray,
	  _aErr: isArrayErr,
	  compute: function compute(fn, field) {
	    var _this = this;
	    var args = [];
	    forEach(fn.deps, function (dep) {
	      args.push(get(_this, dep));
	    });
	    // compute property
	    set(_this, field, fn[fn.length - 1].apply(_this, args));
	  },
	  contains: contains,
	  copy: copy,
	  deepMixIn: deepMixIn,
	  diffObjectFromOldObject: observe.diffObjectFromOldObject,
	  BinaryHeap: BinaryHeap,
	  equals: equals,
	  Events: Events,
	  filter: filter,
	  fillIn: function fillIn(target, obj) {
	    forOwn(obj, function (v, k) {
	      if (!(k in target)) {
	        target[k] = v;
	      }
	    });
	    return target;
	  },
	  forEach: forEach,
	  forOwn: forOwn,
	  fromJson: function fromJson(json) {
	    return isString(json) ? JSON.parse(json) : json;
	  },
	  get: get,
	  intersection: intersection,
	  isArray: isArray,
	  isBoolean: isBoolean,
	  isDate: isDate,
	  isEmpty: isEmpty,
	  isFunction: isFunction,
	  isObject: isObject,
	  isNumber: isNumber,
	  isRegExp: isRegExp,
	  isString: isString,
	  makePath: makePath,
	  observe: observe,
	  pascalCase: pascalCase,
	  pick: pick,
	  promisify: function promisify(fn, target) {
	    var _this = this;
	    if (!fn) {
	      return;
	    } else if (typeof fn !== 'function') {
	      throw new Error('Can only promisify functions!');
	    }
	    return function () {
	      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
	        args[_key3] = arguments[_key3];
	      }

	      return new _this.Promise(function (resolve, reject) {

	        args.push(function (err, result) {
	          if (err) {
	            reject(err);
	          } else {
	            resolve(result);
	          }
	        });

	        try {
	          var promise = fn.apply(target || this, args);
	          if (promise && promise.then) {
	            promise.then(resolve, reject);
	          }
	        } catch (err) {
	          reject(err);
	        }
	      });
	    };
	  },
	  remove: remove,
	  set: set,
	  slice: slice,
	  sort: sort,
	  toJson: JSON.stringify,
	  updateTimestamp: function updateTimestamp(timestamp) {
	    var newTimestamp = typeof Date.now === 'function' ? Date.now() : new Date().getTime();
	    if (timestamp && newTimestamp <= timestamp) {
	      return timestamp + 1;
	    } else {
	      return newTimestamp;
	    }
	  },
	  upperCase: upperCase,
	  removeCircular: function removeCircular(object) {
	    return (function rmCirc(value, context) {
	      var i = undefined;
	      var nu = undefined;

	      if (typeof value === 'object' && value !== null && !(value instanceof Boolean) && !(value instanceof Date) && !(value instanceof Number) && !(value instanceof RegExp) && !(value instanceof String)) {

	        // check if current object points back to itself
	        var current = context.current;
	        var parent = context.context;
	        while (parent) {
	          if (parent.current === current) {
	            return undefined;
	          }
	          parent = parent.context;
	        }

	        if (isArray(value)) {
	          nu = [];
	          for (i = 0; i < value.length; i += 1) {
	            nu[i] = rmCirc(value[i], { context: context, current: value[i] });
	          }
	        } else {
	          nu = {};
	          forOwn(value, function (v, k) {
	            nu[k] = rmCirc(value[k], { context: context, current: value[k] });
	          });
	        }
	        return nu;
	      }
	      return value;
	    })(object, { context: null, current: object });
	  },
	  resolveItem: resolveItem,
	  resolveId: resolveId,
	  w: w,
	  applyRelationGettersToTarget: function applyRelationGettersToTarget(store, definition, target) {
	    this.forEach(definition.relationList, function (def) {
	      var relationName = def.relation;
	      var enumerable = typeof def.enumerable === 'boolean' ? def.enumerable : !!definition.relationsEnumerable;
	      if (typeof def.link === 'boolean' ? def.link : !!definition.linkRelations) {
	        delete target[def.localField];
	        if (def.type === 'belongsTo') {
	          Object.defineProperty(target, def.localField, {
	            enumerable: enumerable,
	            get: function get() {
	              return this[def.localKey] ? definition.getResource(relationName).get(this[def.localKey]) : undefined;
	            },
	            set: function set() {}
	          });
	        } else if (def.type === 'hasMany') {
	          Object.defineProperty(target, def.localField, {
	            enumerable: enumerable,
	            get: function get() {
	              var params = {};
	              if (def.foreignKey) {
	                params[def.foreignKey] = this[definition.idAttribute];
	                return store.defaults.constructor.prototype.defaultFilter.call(store, store.s[relationName].collection, relationName, params, { allowSimpleWhere: true });
	              } else if (def.localKeys) {
	                params.where = _defineProperty({}, definition.getResource(relationName).idAttribute, {
	                  'in': this[def.localKeys]
	                });
	                return store.defaults.constructor.prototype.defaultFilter.call(store, store.s[relationName].collection, relationName, params);
	              }
	              return undefined;
	            },
	            set: function set() {}
	          });
	        } else if (def.type === 'hasOne') {
	          if (def.localKey) {
	            Object.defineProperty(target, def.localField, {
	              enumerable: enumerable,
	              get: function get() {
	                return this[def.localKey] ? definition.getResource(relationName).get(this[def.localKey]) : undefined;
	              },
	              set: function set() {}
	            });
	          } else {
	            Object.defineProperty(target, def.localField, {
	              enumerable: enumerable,
	              get: function get() {
	                var params = {};
	                params[def.foreignKey] = this[definition.idAttribute];
	                var items = params[def.foreignKey] ? store.defaults.constructor.prototype.defaultFilter.call(store, store.s[relationName].collection, relationName, params, { allowSimpleWhere: true }) : [];
	                if (items.length) {
	                  return items[0];
	                }
	                return undefined;
	              },
	              set: function set() {}
	            });
	          }
	        }
	      }
	    });
	  }
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var IllegalArgumentError = (function (_Error) {
	  function IllegalArgumentError(message) {
	    _classCallCheck(this, IllegalArgumentError);

	    _get(Object.getPrototypeOf(IllegalArgumentError.prototype), 'constructor', this).call(this);
	    if (typeof Error.captureStackTrace === 'function') {
	      Error.captureStackTrace(this, this.constructor);
	    }
	    this.type = this.constructor.name;
	    this.message = message || 'Illegal Argument!';
	  }

	  _inherits(IllegalArgumentError, _Error);

	  return IllegalArgumentError;
	})(Error);

	var RuntimeError = (function (_Error2) {
	  function RuntimeError(message) {
	    _classCallCheck(this, RuntimeError);

	    _get(Object.getPrototypeOf(RuntimeError.prototype), 'constructor', this).call(this);
	    if (typeof Error.captureStackTrace === 'function') {
	      Error.captureStackTrace(this, this.constructor);
	    }
	    this.type = this.constructor.name;
	    this.message = message || 'RuntimeError Error!';
	  }

	  _inherits(RuntimeError, _Error2);

	  return RuntimeError;
	})(Error);

	var NonexistentResourceError = (function (_Error3) {
	  function NonexistentResourceError(resourceName) {
	    _classCallCheck(this, NonexistentResourceError);

	    _get(Object.getPrototypeOf(NonexistentResourceError.prototype), 'constructor', this).call(this);
	    if (typeof Error.captureStackTrace === 'function') {
	      Error.captureStackTrace(this, this.constructor);
	    }
	    this.type = this.constructor.name;
	    this.message = '' + resourceName + ' is not a registered resource!';
	  }

	  _inherits(NonexistentResourceError, _Error3);

	  return NonexistentResourceError;
	})(Error);

	exports['default'] = {
	  IllegalArgumentError: IllegalArgumentError,
	  IA: IllegalArgumentError,
	  RuntimeError: RuntimeError,
	  R: RuntimeError,
	  NonexistentResourceError: NonexistentResourceError,
	  NER: NonexistentResourceError
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var _utils = __webpack_require__(2);

	var _errors = __webpack_require__(3);

	var _defineResource = __webpack_require__(25);

	var _eject = __webpack_require__(26);

	var _ejectAll = __webpack_require__(27);

	var _filter = __webpack_require__(28);

	var _inject = __webpack_require__(29);

	var NER = _errors['default'].NER;
	var IA = _errors['default'].IA;
	var R = _errors['default'].R;

	function diffIsEmpty(diff) {
	  return !(_utils['default'].isEmpty(diff.added) && _utils['default'].isEmpty(diff.removed) && _utils['default'].isEmpty(diff.changed));
	}

	exports['default'] = {
	  changes: function changes(resourceName, id, options) {
	    var _this = this;
	    var definition = _this.defs[resourceName];
	    options = options || {};

	    id = _utils['default'].resolveId(definition, id);
	    if (!definition) {
	      throw new NER(resourceName);
	    } else if (!_utils['default']._sn(id)) {
	      throw _utils['default']._snErr('id');
	    }
	    options = _utils['default']._(definition, options);


	    var item = _this.get(resourceName, id);
	    if (item) {
	      var _ret = (function () {
	        if (_utils['default'].w) {
	          _this.s[resourceName].observers[id].deliver();
	        }
	        var ignoredChanges = options.ignoredChanges || [];
	        _utils['default'].forEach(definition.relationFields, function (field) {
	          if (!_utils['default'].contains(ignoredChanges, field)) {
	            ignoredChanges.push(field);
	          }
	        });
	        var diff = _utils['default'].diffObjectFromOldObject(item, _this.s[resourceName].previousAttributes[id], _utils['default'].equals, ignoredChanges);
	        _utils['default'].forOwn(diff, function (changeset, name) {
	          var toKeep = [];
	          _utils['default'].forOwn(changeset, function (value, field) {
	            if (!_utils['default'].isFunction(value)) {
	              toKeep.push(field);
	            }
	          });
	          diff[name] = _utils['default'].pick(diff[name], toKeep);
	        });
	        _utils['default'].forEach(definition.relationFields, function (field) {
	          delete diff.added[field];
	          delete diff.removed[field];
	          delete diff.changed[field];
	        });
	        return {
	          v: diff
	        };
	      })();

	      if (typeof _ret === 'object') return _ret.v;
	    }
	  },
	  changeHistory: function changeHistory(resourceName, id) {
	    var _this = this;
	    var definition = _this.defs[resourceName];
	    var resource = _this.s[resourceName];

	    id = _utils['default'].resolveId(definition, id);
	    if (resourceName && !_this.defs[resourceName]) {
	      throw new NER(resourceName);
	    } else if (id && !_utils['default']._sn(id)) {
	      throw _utils['default']._snErr('id');
	    }


	    if (!definition.keepChangeHistory) {
	      definition.errorFn('changeHistory is disabled for this resource!');
	    } else {
	      if (resourceName) {
	        var item = _this.get(resourceName, id);
	        if (item) {
	          return resource.changeHistories[id];
	        }
	      } else {
	        return resource.changeHistory;
	      }
	    }
	  },
	  compute: function compute(resourceName, instance) {
	    var _this = this;
	    var definition = _this.defs[resourceName];

	    instance = _utils['default'].resolveItem(_this.s[resourceName], instance);
	    if (!definition) {
	      throw new NER(resourceName);
	    } else if (!instance) {
	      throw new R('Item not in the store!');
	    } else if (!_utils['default']._o(instance) && !_utils['default']._sn(instance)) {
	      throw new IA('"instance" must be an object, string or number!');
	    }

	    _utils['default'].forOwn(definition.computed, function (fn, field) {
	      _utils['default'].compute.call(instance, fn, field);
	    });
	    return instance;
	  },
	  createInstance: function createInstance(resourceName, attrs, options) {
	    var definition = this.defs[resourceName];
	    var item = undefined;

	    attrs = attrs || {};

	    if (!definition) {
	      throw new NER(resourceName);
	    } else if (attrs && !_utils['default'].isObject(attrs)) {
	      throw new IA('"attrs" must be an object!');
	    }

	    options = _utils['default']._(definition, options);


	    if (options.notify) {
	      options.beforeCreateInstance(options, attrs);
	    }

	    var Constructor = definition[definition['class']];
	    item = new Constructor();
	    if (options.defaultValues) {
	      _utils['default'].deepMixIn(item, options.defaultValues);
	    }
	    _utils['default'].deepMixIn(item, attrs);
	    if (definition.computed) {
	      this.compute(definition.name, item);
	    }
	    if (options.notify) {
	      options.afterCreateInstance(options, item);
	    }
	    return item;
	  },
	  createCollection: function createCollection(resourceName, arr, params, options) {
	    var _this = this;
	    var definition = _this.defs[resourceName];

	    arr = arr || [];
	    params = params || {};

	    if (!definition) {
	      throw new NER(resourceName);
	    } else if (arr && !_utils['default'].isArray(arr)) {
	      throw new IA('"arr" must be an array!');
	    }

	    options = _utils['default']._(definition, options);


	    if (options.notify) {
	      options.beforeCreateCollection(options, arr);
	    }

	    Object.defineProperties(arr, {
	      fetch: {
	        value: function value(params, options) {
	          var __this = this;
	          __this.params = params || __this.params;
	          return _this.findAll(resourceName, __this.params, options).then(function (data) {
	            if (data === __this) {
	              return __this;
	            }
	            data.unshift(__this.length);
	            data.unshift(0);
	            __this.splice.apply(__this, data);
	            data.shift();
	            data.shift();
	            if (data.$$injected) {
	              _this.s[resourceName].queryData[_utils['default'].toJson(__this.params)] = __this;
	              __this.$$injected = true;
	            }
	            return __this;
	          });
	        }
	      },
	      params: {
	        value: params,
	        writable: true
	      },
	      resourceName: {
	        value: resourceName
	      }
	    });

	    if (options.notify) {
	      options.afterCreateCollection(options, arr);
	    }
	    return arr;
	  },
	  defineResource: _defineResource['default'],
	  digest: function digest() {
	    this.observe.Platform.performMicrotaskCheckpoint();
	  },
	  eject: _eject['default'],
	  ejectAll: _ejectAll['default'],
	  filter: _filter['default'],
	  get: function get(resourceName, id, options) {
	    var _this = this;
	    var definition = _this.defs[resourceName];

	    if (!definition) {
	      throw new NER(resourceName);
	    } else if (!_utils['default']._sn(id)) {
	      throw _utils['default']._snErr('id');
	    }

	    options = _utils['default']._(definition, options);


	    // cache miss, request resource from server
	    var item = _this.s[resourceName].index[id];

	    // return resource from cache
	    return item;
	  },
	  getAll: function getAll(resourceName, ids) {
	    var _this = this;
	    var definition = _this.defs[resourceName];
	    var resource = _this.s[resourceName];
	    var collection = [];

	    if (!definition) {
	      throw new NER(resourceName);
	    } else if (ids && !_utils['default']._a(ids)) {
	      throw _utils['default']._aErr('ids');
	    }


	    if (_utils['default']._a(ids)) {
	      var _length = ids.length;
	      for (var i = 0; i < _length; i++) {
	        if (resource.index[ids[i]]) {
	          collection.push(resource.index[ids[i]]);
	        }
	      }
	    } else {
	      collection = resource.collection.slice();
	    }

	    return collection;
	  },
	  hasChanges: function hasChanges(resourceName, id) {
	    var _this = this;
	    var definition = _this.defs[resourceName];

	    id = _utils['default'].resolveId(definition, id);

	    if (!definition) {
	      throw new NER(resourceName);
	    } else if (!_utils['default']._sn(id)) {
	      throw _utils['default']._snErr('id');
	    }


	    // return resource from cache
	    if (_this.get(resourceName, id)) {
	      return diffIsEmpty(_this.changes(resourceName, id));
	    } else {
	      return false;
	    }
	  },
	  inject: _inject['default'],
	  lastModified: function lastModified(resourceName, id) {
	    var definition = this.defs[resourceName];
	    var resource = this.s[resourceName];

	    id = _utils['default'].resolveId(definition, id);
	    if (!definition) {
	      throw new NER(resourceName);
	    }


	    if (id) {
	      if (!(id in resource.modified)) {
	        resource.modified[id] = 0;
	      }
	      return resource.modified[id];
	    }
	    return resource.collectionModified;
	  },
	  lastSaved: function lastSaved(resourceName, id) {
	    var definition = this.defs[resourceName];
	    var resource = this.s[resourceName];

	    id = _utils['default'].resolveId(definition, id);
	    if (!definition) {
	      throw new NER(resourceName);
	    }


	    if (!(id in resource.saved)) {
	      resource.saved[id] = 0;
	    }
	    return resource.saved[id];
	  },
	  previous: function previous(resourceName, id) {
	    var _this = this;
	    var definition = _this.defs[resourceName];
	    var resource = _this.s[resourceName];

	    id = _utils['default'].resolveId(definition, id);
	    if (!definition) {
	      throw new NER(resourceName);
	    } else if (!_utils['default']._sn(id)) {
	      throw _utils['default']._snErr('id');
	    }


	    // return resource from cache
	    return resource.previousAttributes[id] ? _utils['default'].copy(resource.previousAttributes[id]) : undefined;
	  }
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var _create = __webpack_require__(31);

	var _destroy = __webpack_require__(32);

	var _destroyAll = __webpack_require__(33);

	var _find = __webpack_require__(34);

	var _findAll = __webpack_require__(35);

	var _loadRelations = __webpack_require__(36);

	var _reap = __webpack_require__(37);

	var _save = __webpack_require__(38);

	var _update = __webpack_require__(39);

	var _updateAll = __webpack_require__(40);

	exports['default'] = {
	  create: _create['default'],
	  destroy: _destroy['default'],
	  destroyAll: _destroyAll['default'],
	  find: _find['default'],
	  findAll: _findAll['default'],
	  loadRelations: _loadRelations['default'],
	  reap: _reap['default'],
	  refresh: function refresh(resourceName, id, options) {
	    var _this = this;
	    var DSUtils = _this.utils;

	    return new DSUtils.Promise(function (resolve, reject) {
	      var definition = _this.defs[resourceName];
	      id = DSUtils.resolveId(_this.defs[resourceName], id);
	      if (!definition) {
	        reject(new _this.errors.NER(resourceName));
	      } else if (!DSUtils._sn(id)) {
	        reject(DSUtils._snErr('id'));
	      } else {
	        options = DSUtils._(definition, options);
	        options.bypassCache = true;
	        resolve(_this.get(resourceName, id));
	      }
	    }).then(function (item) {
	      return item ? _this.find(resourceName, id, options) : item;
	    });
	  },
	  save: _save['default'],
	  update: _update['default'],
	  updateAll: _updateAll['default']
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
	 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
	 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
	 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
	 * Code distributed by Google as part of the polymer project is also
	 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
	 */

	// Modifications
	// Copyright 2014-2015 Jason Dobry
	//
	// Summary of modifications:
	// Fixed use of "delete" keyword for IE8 compatibility
	// Exposed diffObjectFromOldObject on the exported object
	// Added the "equals" argument to diffObjectFromOldObject to be used to check equality
	// Added a way in diffObjectFromOldObject to ignore changes to certain properties
	// Removed all code related to:
	// - ArrayObserver
	// - ArraySplice
	// - PathObserver
	// - CompoundObserver
	// - Path
	// - ObserverTransform

	(function(global) {
	  var testingExposeCycleCount = global.testingExposeCycleCount;

	  // Detect and do basic sanity checking on Object/Array.observe.
	  function detectObjectObserve() {
	    if (typeof Object.observe !== 'function' ||
	        typeof Array.observe !== 'function') {
	      return false;
	    }

	    var records = [];

	    function callback(recs) {
	      records = recs;
	    }

	    var test = {};
	    var arr = [];
	    Object.observe(test, callback);
	    Array.observe(arr, callback);
	    test.id = 1;
	    test.id = 2;
	    delete test.id;
	    arr.push(1, 2);
	    arr.length = 0;

	    Object.deliverChangeRecords(callback);
	    if (records.length !== 5)
	      return false;

	    if (records[0].type != 'add' ||
	        records[1].type != 'update' ||
	        records[2].type != 'delete' ||
	        records[3].type != 'splice' ||
	        records[4].type != 'splice') {
	      return false;
	    }

	    Object.unobserve(test, callback);
	    Array.unobserve(arr, callback);

	    return true;
	  }

	  var hasObserve = detectObjectObserve();

	  var createObject = ('__proto__' in {}) ?
	    function(obj) { return obj; } :
	    function(obj) {
	      var proto = obj.__proto__;
	      if (!proto)
	        return obj;
	      var newObject = Object.create(proto);
	      Object.getOwnPropertyNames(obj).forEach(function(name) {
	        Object.defineProperty(newObject, name,
	                             Object.getOwnPropertyDescriptor(obj, name));
	      });
	      return newObject;
	    };

	  var MAX_DIRTY_CHECK_CYCLES = 1000;

	  function dirtyCheck(observer) {
	    var cycles = 0;
	    while (cycles < MAX_DIRTY_CHECK_CYCLES && observer.check_()) {
	      cycles++;
	    }
	    if (testingExposeCycleCount)
	      global.dirtyCheckCycleCount = cycles;

	    return cycles > 0;
	  }

	  function objectIsEmpty(object) {
	    for (var prop in object)
	      return false;
	    return true;
	  }

	  function diffIsEmpty(diff) {
	    return objectIsEmpty(diff.added) &&
	           objectIsEmpty(diff.removed) &&
	           objectIsEmpty(diff.changed);
	  }

	  function isBlacklisted(prop, bl) {
	    if (!bl || !bl.length) {
	      return false;
	    }
	    var matches;
	    for (var i = 0; i < bl.length; i++) {
	      if ((Object.prototype.toString.call(bl[i]) === '[object RegExp]' && bl[i].test(prop)) || bl[i] === prop) {
	        return matches = prop;
	      }
	    }
	    return !!matches;
	  }

	  function diffObjectFromOldObject(object, oldObject, equals, bl) {
	    var added = {};
	    var removed = {};
	    var changed = {};

	    for (var prop in oldObject) {
	      var newValue = object[prop];

	      if (isBlacklisted(prop, bl))
	        continue;

	      if (newValue !== undefined && (equals ? equals(newValue, oldObject[prop]) : newValue === oldObject[prop]))
	        continue;

	      if (!(prop in object)) {
	        removed[prop] = undefined;
	        continue;
	      }

	      if (equals ? !equals(newValue, oldObject[prop]) : newValue !== oldObject[prop])
	        changed[prop] = newValue;
	    }

	    for (var prop in object) {
	      if (prop in oldObject)
	        continue;

	      if (isBlacklisted(prop, bl))
	        continue;

	      added[prop] = object[prop];
	    }

	    if (Array.isArray(object) && object.length !== oldObject.length)
	      changed.length = object.length;

	    return {
	      added: added,
	      removed: removed,
	      changed: changed
	    };
	  }

	  var eomTasks = [];
	  function runEOMTasks() {
	    if (!eomTasks.length)
	      return false;

	    for (var i = 0; i < eomTasks.length; i++) {
	      eomTasks[i]();
	    }
	    eomTasks.length = 0;
	    return true;
	  }

	  var runEOM = hasObserve ? (function(){
	    return function(fn) {
	      return Promise.resolve().then(fn);
	    }
	  })() :
	  (function() {
	    return function(fn) {
	      eomTasks.push(fn);
	    };
	  })();

	  var observedObjectCache = [];

	  function newObservedObject() {
	    var observer;
	    var object;
	    var discardRecords = false;
	    var first = true;

	    function callback(records) {
	      if (observer && observer.state_ === OPENED && !discardRecords)
	        observer.check_(records);
	    }

	    return {
	      open: function(obs) {
	        if (observer)
	          throw Error('ObservedObject in use');

	        if (!first)
	          Object.deliverChangeRecords(callback);

	        observer = obs;
	        first = false;
	      },
	      observe: function(obj, arrayObserve) {
	        object = obj;
	        if (arrayObserve)
	          Array.observe(object, callback);
	        else
	          Object.observe(object, callback);
	      },
	      deliver: function(discard) {
	        discardRecords = discard;
	        Object.deliverChangeRecords(callback);
	        discardRecords = false;
	      },
	      close: function() {
	        observer = undefined;
	        Object.unobserve(object, callback);
	        observedObjectCache.push(this);
	      }
	    };
	  }

	  function getObservedObject(observer, object, arrayObserve) {
	    var dir = observedObjectCache.pop() || newObservedObject();
	    dir.open(observer);
	    dir.observe(object, arrayObserve);
	    return dir;
	  }

	  var UNOPENED = 0;
	  var OPENED = 1;
	  var CLOSED = 2;

	  var nextObserverId = 1;

	  function Observer() {
	    this.state_ = UNOPENED;
	    this.callback_ = undefined;
	    this.target_ = undefined; // TODO(rafaelw): Should be WeakRef
	    this.directObserver_ = undefined;
	    this.value_ = undefined;
	    this.id_ = nextObserverId++;
	  }

	  Observer.prototype = {
	    open: function(callback, target) {
	      if (this.state_ != UNOPENED)
	        throw Error('Observer has already been opened.');

	      addToAll(this);
	      this.callback_ = callback;
	      this.target_ = target;
	      this.connect_();
	      this.state_ = OPENED;
	      return this.value_;
	    },

	    close: function() {
	      if (this.state_ != OPENED)
	        return;

	      removeFromAll(this);
	      this.disconnect_();
	      this.value_ = undefined;
	      this.callback_ = undefined;
	      this.target_ = undefined;
	      this.state_ = CLOSED;
	    },

	    deliver: function() {
	      if (this.state_ != OPENED)
	        return;

	      dirtyCheck(this);
	    },

	    report_: function(changes) {
	      try {
	        this.callback_.apply(this.target_, changes);
	      } catch (ex) {
	        Observer._errorThrownDuringCallback = true;
	        console.error('Exception caught during observer callback: ' +
	                       (ex.stack || ex));
	      }
	    },

	    discardChanges: function() {
	      this.check_(undefined, true);
	      return this.value_;
	    }
	  }

	  var collectObservers = !hasObserve;
	  var allObservers;
	  Observer._allObserversCount = 0;

	  if (collectObservers) {
	    allObservers = [];
	  }

	  function addToAll(observer) {
	    Observer._allObserversCount++;
	    if (!collectObservers)
	      return;

	    allObservers.push(observer);
	  }

	  function removeFromAll(observer) {
	    Observer._allObserversCount--;
	  }

	  var runningMicrotaskCheckpoint = false;

	  global.Platform = global.Platform || {};

	  global.Platform.performMicrotaskCheckpoint = function() {
	    if (runningMicrotaskCheckpoint)
	      return;

	    if (!collectObservers)
	      return;

	    runningMicrotaskCheckpoint = true;

	    var cycles = 0;
	    var anyChanged, toCheck;

	    do {
	      cycles++;
	      toCheck = allObservers;
	      allObservers = [];
	      anyChanged = false;

	      for (var i = 0; i < toCheck.length; i++) {
	        var observer = toCheck[i];
	        if (observer.state_ != OPENED)
	          continue;

	        if (observer.check_())
	          anyChanged = true;

	        allObservers.push(observer);
	      }
	      if (runEOMTasks())
	        anyChanged = true;
	    } while (cycles < MAX_DIRTY_CHECK_CYCLES && anyChanged);

	    if (testingExposeCycleCount)
	      global.dirtyCheckCycleCount = cycles;

	    runningMicrotaskCheckpoint = false;
	  };

	  if (collectObservers) {
	    global.Platform.clearObservers = function() {
	      allObservers = [];
	    };
	  }

	  function ObjectObserver(object) {
	    Observer.call(this);
	    this.value_ = object;
	    this.oldObject_ = undefined;
	  }

	  ObjectObserver.prototype = createObject({
	    __proto__: Observer.prototype,

	    arrayObserve: false,

	    connect_: function(callback, target) {
	      if (hasObserve) {
	        this.directObserver_ = getObservedObject(this, this.value_,
	                                                 this.arrayObserve);
	      } else {
	        this.oldObject_ = this.copyObject(this.value_);
	      }

	    },

	    copyObject: function(object) {
	      var copy = Array.isArray(object) ? [] : {};
	      for (var prop in object) {
	        copy[prop] = object[prop];
	      };
	      if (Array.isArray(object))
	        copy.length = object.length;
	      return copy;
	    },

	    check_: function(changeRecords, skipChanges) {
	      var diff;
	      var oldValues;
	      if (hasObserve) {
	        if (!changeRecords)
	          return false;

	        oldValues = {};
	        diff = diffObjectFromChangeRecords(this.value_, changeRecords,
	                                           oldValues);
	      } else {
	        oldValues = this.oldObject_;
	        diff = diffObjectFromOldObject(this.value_, this.oldObject_);
	      }

	      if (diffIsEmpty(diff))
	        return false;

	      if (!hasObserve)
	        this.oldObject_ = this.copyObject(this.value_);

	      this.report_([
	        diff.added || {},
	        diff.removed || {},
	        diff.changed || {},
	        function(property) {
	          return oldValues[property];
	        }
	      ]);

	      return true;
	    },

	    disconnect_: function() {
	      if (hasObserve) {
	        this.directObserver_.close();
	        this.directObserver_ = undefined;
	      } else {
	        this.oldObject_ = undefined;
	      }
	    },

	    deliver: function() {
	      if (this.state_ != OPENED)
	        return;

	      if (hasObserve)
	        this.directObserver_.deliver(false);
	      else
	        dirtyCheck(this);
	    },

	    discardChanges: function() {
	      if (this.directObserver_)
	        this.directObserver_.deliver(true);
	      else
	        this.oldObject_ = this.copyObject(this.value_);

	      return this.value_;
	    }
	  });

	  var observerSentinel = {};

	  var expectedRecordTypes = {
	    add: true,
	    update: true,
	    'delete': true
	  };

	  function diffObjectFromChangeRecords(object, changeRecords, oldValues) {
	    var added = {};
	    var removed = {};

	    for (var i = 0; i < changeRecords.length; i++) {
	      var record = changeRecords[i];
	      if (!expectedRecordTypes[record.type]) {
	        console.error('Unknown changeRecord type: ' + record.type);
	        console.error(record);
	        continue;
	      }

	      if (!(record.name in oldValues))
	        oldValues[record.name] = record.oldValue;

	      if (record.type == 'update')
	        continue;

	      if (record.type == 'add') {
	        if (record.name in removed)
	          delete removed[record.name];
	        else
	          added[record.name] = true;

	        continue;
	      }

	      // type = 'delete'
	      if (record.name in added) {
	        delete added[record.name];
	        delete oldValues[record.name];
	      } else {
	        removed[record.name] = true;
	      }
	    }

	    for (var prop in added)
	      added[prop] = object[prop];

	    for (var prop in removed)
	      removed[prop] = undefined;

	    var changed = {};
	    for (var prop in oldValues) {
	      if (prop in added || prop in removed)
	        continue;

	      var newValue = object[prop];
	      if (oldValues[prop] !== newValue)
	        changed[prop] = newValue;
	    }

	    return {
	      added: added,
	      removed: removed,
	      changed: changed
	    };
	  }

	  // Export the observe-js object for **Node.js**, with backwards-compatibility
	  // for the old `require()` API. Also ensure `exports` is not a DOM Element.
	  // If we're in the browser, export as a global object.

	  global.Observer = Observer;
	  global.Observer.runEOM_ = runEOM;
	  global.Observer.observerSentinel_ = observerSentinel; // for testing.
	  global.Observer.hasObjectObserve = hasObserve;
	  global.diffObjectFromOldObject = diffObjectFromOldObject;
	  global.ObjectObserver = ObjectObserver;

	})(exports);


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * yabh
	 * @version 1.0.1 - Homepage <http://jmdobry.github.io/yabh/>
	 * @author Jason Dobry <jason.dobry@gmail.com>
	 * @copyright (c) 2015 Jason Dobry 
	 * @license MIT <https://github.com/jmdobry/yabh/blob/master/LICENSE>
	 * 
	 * @overview Yet another Binary Heap.
	 */
	(function webpackUniversalModuleDefinition(root, factory) {
		if(true)
			module.exports = factory();
		else if(typeof define === 'function' && define.amd)
			define("yabh", factory);
		else if(typeof exports === 'object')
			exports["BinaryHeap"] = factory();
		else
			root["BinaryHeap"] = factory();
	})(this, function() {
	return /******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};

	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {

	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId])
	/******/ 			return installedModules[moduleId].exports;

	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			exports: {},
	/******/ 			id: moduleId,
	/******/ 			loaded: false
	/******/ 		};

	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

	/******/ 		// Flag the module as loaded
	/******/ 		module.loaded = true;

	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}


	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;

	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;

	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";

	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(0);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ function(module, exports, __webpack_require__) {

		var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

		var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

		Object.defineProperty(exports, '__esModule', {
		  value: true
		});
		/**
		 * @method bubbleUp
		 * @param {array} heap The heap.
		 * @param {function} weightFunc The weight function.
		 * @param {number} n The index of the element to bubble up.
		 */
		function bubbleUp(heap, weightFunc, n) {
		  var element = heap[n];
		  var weight = weightFunc(element);
		  // When at 0, an element can not go up any further.
		  while (n > 0) {
		    // Compute the parent element's index, and fetch it.
		    var parentN = Math.floor((n + 1) / 2) - 1;
		    var _parent = heap[parentN];
		    // If the parent has a lesser weight, things are in order and we
		    // are done.
		    if (weight >= weightFunc(_parent)) {
		      break;
		    } else {
		      heap[parentN] = element;
		      heap[n] = _parent;
		      n = parentN;
		    }
		  }
		}

		/**
		 * @method bubbleDown
		 * @param {array} heap The heap.
		 * @param {function} weightFunc The weight function.
		 * @param {number} n The index of the element to sink down.
		 */
		var bubbleDown = function bubbleDown(heap, weightFunc, n) {
		  var length = heap.length;
		  var node = heap[n];
		  var nodeWeight = weightFunc(node);

		  while (true) {
		    var child2N = (n + 1) * 2,
		        child1N = child2N - 1;
		    var swap = null;
		    if (child1N < length) {
		      var child1 = heap[child1N],
		          child1Weight = weightFunc(child1);
		      // If the score is less than our node's, we need to swap.
		      if (child1Weight < nodeWeight) {
		        swap = child1N;
		      }
		    }
		    // Do the same checks for the other child.
		    if (child2N < length) {
		      var child2 = heap[child2N],
		          child2Weight = weightFunc(child2);
		      if (child2Weight < (swap === null ? nodeWeight : weightFunc(heap[child1N]))) {
		        swap = child2N;
		      }
		    }

		    if (swap === null) {
		      break;
		    } else {
		      heap[n] = heap[swap];
		      heap[swap] = node;
		      n = swap;
		    }
		  }
		};

		var BinaryHeap = (function () {
		  function BinaryHeap(weightFunc, compareFunc) {
		    _classCallCheck(this, BinaryHeap);

		    if (!weightFunc) {
		      weightFunc = function (x) {
		        return x;
		      };
		    }
		    if (!compareFunc) {
		      compareFunc = function (x, y) {
		        return x === y;
		      };
		    }
		    if (typeof weightFunc !== 'function') {
		      throw new Error('BinaryHeap([weightFunc][, compareFunc]): "weightFunc" must be a function!');
		    }
		    if (typeof compareFunc !== 'function') {
		      throw new Error('BinaryHeap([weightFunc][, compareFunc]): "compareFunc" must be a function!');
		    }
		    this.weightFunc = weightFunc;
		    this.compareFunc = compareFunc;
		    this.heap = [];
		  }

		  _createClass(BinaryHeap, [{
		    key: 'push',
		    value: function push(node) {
		      this.heap.push(node);
		      bubbleUp(this.heap, this.weightFunc, this.heap.length - 1);
		    }
		  }, {
		    key: 'peek',
		    value: function peek() {
		      return this.heap[0];
		    }
		  }, {
		    key: 'pop',
		    value: function pop() {
		      var front = this.heap[0];
		      var end = this.heap.pop();
		      if (this.heap.length > 0) {
		        this.heap[0] = end;
		        bubbleDown(this.heap, this.weightFunc, 0);
		      }
		      return front;
		    }
		  }, {
		    key: 'remove',
		    value: function remove(node) {
		      var length = this.heap.length;
		      for (var i = 0; i < length; i++) {
		        if (this.compareFunc(this.heap[i], node)) {
		          var removed = this.heap[i];
		          var end = this.heap.pop();
		          if (i !== length - 1) {
		            this.heap[i] = end;
		            bubbleUp(this.heap, this.weightFunc, i);
		            bubbleDown(this.heap, this.weightFunc, i);
		          }
		          return removed;
		        }
		      }
		      return null;
		    }
		  }, {
		    key: 'removeAll',
		    value: function removeAll() {
		      this.heap = [];
		    }
		  }, {
		    key: 'size',
		    value: function size() {
		      return this.heap.length;
		    }
		  }]);

		  return BinaryHeap;
		})();

		exports['default'] = BinaryHeap;
		module.exports = exports['default'];

	/***/ }
	/******/ ])
	});
	;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	

	    /**
	     * Array forEach
	     */
	    function forEach(arr, callback, thisObj) {
	        if (arr == null) {
	            return;
	        }
	        var i = -1,
	            len = arr.length;
	        while (++i < len) {
	            // we iterate over sparse items since there is no way to make it
	            // work properly on IE 7-8. see #64
	            if ( callback.call(thisObj, arr[i], i, arr) === false ) {
	                break;
	            }
	        }
	    }

	    module.exports = forEach;




/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	

	    /**
	     * Create slice of source array or array-like object
	     */
	    function slice(arr, start, end){
	        var len = arr.length;

	        if (start == null) {
	            start = 0;
	        } else if (start < 0) {
	            start = Math.max(len + start, 0);
	        } else {
	            start = Math.min(start, len);
	        }

	        if (end == null) {
	            end = len;
	        } else if (end < 0) {
	            end = Math.max(len + end, 0);
	        } else {
	            end = Math.min(end, len);
	        }

	        var result = [];
	        while (start < end) {
	            result.push(arr[start++]);
	        }

	        return result;
	    }

	    module.exports = slice;




/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var indexOf = __webpack_require__(20);

	    /**
	     * If array contains values.
	     */
	    function contains(arr, val) {
	        return indexOf(arr, val) !== -1;
	    }
	    module.exports = contains;



/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var indexOf = __webpack_require__(20);

	    /**
	     * Remove a single item from the array.
	     * (it won't remove duplicates, just a single item)
	     */
	    function remove(arr, item){
	        var idx = indexOf(arr, item);
	        if (idx !== -1) arr.splice(idx, 1);
	    }

	    module.exports = remove;



/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	

	    /**
	     * Merge sort (http://en.wikipedia.org/wiki/Merge_sort)
	     */
	    function mergeSort(arr, compareFn) {
	        if (arr == null) {
	            return [];
	        } else if (arr.length < 2) {
	            return arr;
	        }

	        if (compareFn == null) {
	            compareFn = defaultCompare;
	        }

	        var mid, left, right;

	        mid   = ~~(arr.length / 2);
	        left  = mergeSort( arr.slice(0, mid), compareFn );
	        right = mergeSort( arr.slice(mid, arr.length), compareFn );

	        return merge(left, right, compareFn);
	    }

	    function defaultCompare(a, b) {
	        return a < b ? -1 : (a > b? 1 : 0);
	    }

	    function merge(left, right, compareFn) {
	        var result = [];

	        while (left.length && right.length) {
	            if (compareFn(left[0], right[0]) <= 0) {
	                // if 0 it should preserve same order (stable)
	                result.push(left.shift());
	            } else {
	                result.push(right.shift());
	            }
	        }

	        if (left.length) {
	            result.push.apply(result, left);
	        }

	        if (right.length) {
	            result.push.apply(result, right);
	        }

	        return result;
	    }

	    module.exports = mergeSort;




/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var hasOwn = __webpack_require__(21);
	var forIn = __webpack_require__(22);

	    /**
	     * Similar to Array/forEach but works over object properties and fixes Don't
	     * Enum bug on IE.
	     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
	     */
	    function forOwn(obj, fn, thisObj){
	        forIn(obj, function(val, key){
	            if (hasOwn(obj, key)) {
	                return fn.call(thisObj, obj[key], key, obj);
	            }
	        });
	    }

	    module.exports = forOwn;




/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var forOwn = __webpack_require__(13);
	var isPlainObject = __webpack_require__(23);

	    /**
	     * Mixes objects into the target object, recursively mixing existing child
	     * objects.
	     */
	    function deepMixIn(target, objects) {
	        var i = 0,
	            n = arguments.length,
	            obj;

	        while(++i < n){
	            obj = arguments[i];
	            if (obj) {
	                forOwn(obj, copyProp, target);
	            }
	        }

	        return target;
	    }

	    function copyProp(val, key) {
	        var existing = this[key];
	        if (isPlainObject(val) && isPlainObject(existing)) {
	            deepMixIn(existing, val);
	        } else {
	            this[key] = val;
	        }
	    }

	    module.exports = deepMixIn;




/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var slice = __webpack_require__(9);

	    /**
	     * Return a copy of the object, filtered to only have values for the whitelisted keys.
	     */
	    function pick(obj, var_keys){
	        var keys = typeof arguments[1] !== 'string'? arguments[1] : slice(arguments, 1),
	            out = {},
	            i = 0, key;
	        while (key = keys[i++]) {
	            out[key] = obj[key];
	        }
	        return out;
	    }

	    module.exports = pick;




/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var isPrimitive = __webpack_require__(24);

	    /**
	     * get "nested" object property
	     */
	    function get(obj, prop){
	        var parts = prop.split('.'),
	            last = parts.pop();

	        while (prop = parts.shift()) {
	            obj = obj[prop];
	            if (obj == null) return;
	        }

	        return obj[last];
	    }

	    module.exports = get;




/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var namespace = __webpack_require__(30);

	    /**
	     * set "nested" object property
	     */
	    function set(obj, prop, val){
	        var parts = (/^(.+)\.(.+)$/).exec(prop);
	        if (parts){
	            namespace(obj, parts[1])[parts[2]] = val;
	        } else {
	            obj[prop] = val;
	        }
	    }

	    module.exports = set;




/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(41);
	var camelCase = __webpack_require__(42);
	var upperCase = __webpack_require__(19);
	    /**
	     * camelCase + UPPERCASE first char
	     */
	    function pascalCase(str){
	        str = toString(str);
	        return camelCase(str).replace(/^[a-z]/, upperCase);
	    }

	    module.exports = pascalCase;



/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(41);
	    /**
	     * "Safer" String.toUpperCase()
	     */
	    function upperCase(str){
	        str = toString(str);
	        return str.toUpperCase();
	    }
	    module.exports = upperCase;



/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	

	    /**
	     * Array.indexOf
	     */
	    function indexOf(arr, item, fromIndex) {
	        fromIndex = fromIndex || 0;
	        if (arr == null) {
	            return -1;
	        }

	        var len = arr.length,
	            i = fromIndex < 0 ? len + fromIndex : fromIndex;
	        while (i < len) {
	            // we iterate over sparse items since there is no way to make it
	            // work properly on IE 7-8. see #64
	            if (arr[i] === item) {
	                return i;
	            }

	            i++;
	        }

	        return -1;
	    }

	    module.exports = indexOf;



/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	

	    /**
	     * Safer Object.hasOwnProperty
	     */
	     function hasOwn(obj, prop){
	         return Object.prototype.hasOwnProperty.call(obj, prop);
	     }

	     module.exports = hasOwn;




/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var hasOwn = __webpack_require__(21);

	    var _hasDontEnumBug,
	        _dontEnums;

	    function checkDontEnum(){
	        _dontEnums = [
	                'toString',
	                'toLocaleString',
	                'valueOf',
	                'hasOwnProperty',
	                'isPrototypeOf',
	                'propertyIsEnumerable',
	                'constructor'
	            ];

	        _hasDontEnumBug = true;

	        for (var key in {'toString': null}) {
	            _hasDontEnumBug = false;
	        }
	    }

	    /**
	     * Similar to Array/forEach but works over object properties and fixes Don't
	     * Enum bug on IE.
	     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
	     */
	    function forIn(obj, fn, thisObj){
	        var key, i = 0;
	        // no need to check if argument is a real object that way we can use
	        // it for arrays, functions, date, etc.

	        //post-pone check till needed
	        if (_hasDontEnumBug == null) checkDontEnum();

	        for (key in obj) {
	            if (exec(fn, obj, key, thisObj) === false) {
	                break;
	            }
	        }


	        if (_hasDontEnumBug) {
	            var ctor = obj.constructor,
	                isProto = !!ctor && obj === ctor.prototype;

	            while (key = _dontEnums[i++]) {
	                // For constructor, if it is a prototype object the constructor
	                // is always non-enumerable unless defined otherwise (and
	                // enumerated above).  For non-prototype objects, it will have
	                // to be defined on this object, since it cannot be defined on
	                // any prototype objects.
	                //
	                // For other [[DontEnum]] properties, check if the value is
	                // different than Object prototype value.
	                if (
	                    (key !== 'constructor' ||
	                        (!isProto && hasOwn(obj, key))) &&
	                    obj[key] !== Object.prototype[key]
	                ) {
	                    if (exec(fn, obj, key, thisObj) === false) {
	                        break;
	                    }
	                }
	            }
	        }
	    }

	    function exec(fn, obj, key, thisObj){
	        return fn.call(thisObj, obj[key], key, obj);
	    }

	    module.exports = forIn;




/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	

	    /**
	     * Checks if the value is created by the `Object` constructor.
	     */
	    function isPlainObject(value) {
	        return (!!value && typeof value === 'object' &&
	            value.constructor === Object);
	    }

	    module.exports = isPlainObject;




/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	

	    /**
	     * Checks if the object is a primitive
	     */
	    function isPrimitive(value) {
	        // Using switch fallthrough because it's simple to read and is
	        // generally fast: http://jsperf.com/testing-value-is-primitive/5
	        switch (typeof value) {
	            case "string":
	            case "number":
	            case "boolean":
	                return true;
	        }

	        return value == null;
	    }

	    module.exports = isPrimitive;




/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	exports['default'] = defineResource;
	/*jshint evil:true, loopfunc:true*/

	var _utils = __webpack_require__(2);

	var _errors = __webpack_require__(3);

	var instanceMethods = ['compute', 'refresh', 'save', 'update', 'destroy', 'loadRelations', 'changeHistory', 'changes', 'hasChanges', 'lastModified', 'lastSaved', 'previous'];

	function defineResource(definition) {
	  var _this = this;
	  var definitions = _this.defs;

	  if (_utils['default']._s(definition)) {
	    definition = {
	      name: definition.replace(/\s/gi, '')
	    };
	  }
	  if (!_utils['default']._o(definition)) {
	    throw _utils['default']._oErr('definition');
	  } else if (!_utils['default']._s(definition.name)) {
	    throw new _errors['default'].IA('"name" must be a string!');
	  } else if (_this.s[definition.name]) {
	    throw new _errors['default'].R('' + definition.name + ' is already registered!');
	  }

	  function Resource(options) {
	    this.defaultValues = {};
	    this.methods = {};
	    this.computed = {};
	    _utils['default'].deepMixIn(this, options);
	    var parent = _this.defaults;
	    if (definition['extends'] && definitions[definition['extends']]) {
	      parent = definitions[definition['extends']];
	    }
	    _utils['default'].fillIn(this.defaultValues, parent.defaultValues);
	    _utils['default'].fillIn(this.methods, parent.methods);
	    _utils['default'].fillIn(this.computed, parent.computed);
	    this.endpoint = 'endpoint' in options ? options.endpoint : this.name;
	  }

	  try {
	    var def;

	    var _class;

	    var _ret = (function () {
	      if (definition['extends'] && definitions[definition['extends']]) {
	        // Inherit from another resource
	        Resource.prototype = definitions[definition['extends']];
	      } else {
	        // Inherit from global defaults
	        Resource.prototype = _this.defaults;
	      }
	      definitions[definition.name] = new Resource(definition);

	      def = definitions[definition.name];

	      // alias name, shaves 0.08 kb off the minified build
	      def.n = def.name;


	      if (!_utils['default']._s(def.idAttribute)) {
	        throw new _errors['default'].IA('"idAttribute" must be a string!');
	      }

	      // Setup nested parent configuration
	      if (def.relations) {
	        def.relationList = [];
	        def.relationFields = [];
	        _utils['default'].forOwn(def.relations, function (relatedModels, type) {
	          _utils['default'].forOwn(relatedModels, function (defs, relationName) {
	            if (!_utils['default']._a(defs)) {
	              relatedModels[relationName] = [defs];
	            }
	            _utils['default'].forEach(relatedModels[relationName], function (d) {
	              d.type = type;
	              d.relation = relationName;
	              d.name = def.n;
	              def.relationList.push(d);
	              if (d.localField) {
	                def.relationFields.push(d.localField);
	              }
	            });
	          });
	        });
	        if (def.relations.belongsTo) {
	          _utils['default'].forOwn(def.relations.belongsTo, function (relatedModel, modelName) {
	            _utils['default'].forEach(relatedModel, function (relation) {
	              if (relation.parent) {
	                def.parent = modelName;
	                def.parentKey = relation.localKey;
	                def.parentField = relation.localField;
	              }
	            });
	          });
	        }
	        if (typeof Object.freeze === 'function') {
	          Object.freeze(def.relations);
	          Object.freeze(def.relationList);
	        }
	      }

	      def.getResource = function (resourceName) {
	        return _this.defs[resourceName];
	      };

	      def.getEndpoint = function (id, options) {
	        options = options || {};
	        options.params = options.params || {};

	        var item = undefined;
	        var parentKey = def.parentKey;
	        var endpoint = options.hasOwnProperty('endpoint') ? options.endpoint : def.endpoint;
	        var parentField = def.parentField;
	        var parentDef = definitions[def.parent];
	        var parentId = options.params[parentKey];

	        if (parentId === false || !parentKey || !parentDef) {
	          if (parentId === false) {
	            delete options.params[parentKey];
	          }
	          return endpoint;
	        } else {
	          delete options.params[parentKey];

	          if (_utils['default']._sn(id)) {
	            item = def.get(id);
	          } else if (_utils['default']._o(id)) {
	            item = id;
	          }

	          if (item) {
	            parentId = parentId || item[parentKey] || (item[parentField] ? item[parentField][parentDef.idAttribute] : null);
	          }

	          if (parentId) {
	            var _ret2 = (function () {
	              delete options.endpoint;
	              var _options = {};
	              _utils['default'].forOwn(options, function (value, key) {
	                _options[key] = value;
	              });
	              return {
	                v: _utils['default'].makePath(parentDef.getEndpoint(parentId, _utils['default']._(parentDef, _options)), parentId, endpoint)
	              };
	            })();

	            if (typeof _ret2 === 'object') return _ret2.v;
	          } else {
	            return endpoint;
	          }
	        }
	      };

	      // Remove this in v0.11.0 and make a breaking change notice
	      // the the `filter` option has been renamed to `defaultFilter`
	      if (def.filter) {
	        def.defaultFilter = def.filter;
	        delete def.filter;
	      }

	      // Create the wrapper class for the new resource
	      _class = def['class'] = _utils['default'].pascalCase(def.name);

	      try {
	        if (typeof def.useClass === 'function') {
	          eval('function ' + _class + '() { def.useClass.call(this); }');
	          def[_class] = eval(_class);
	          def[_class].prototype = (function (proto) {
	            function Ctor() {}

	            Ctor.prototype = proto;
	            return new Ctor();
	          })(def.useClass.prototype);
	        } else {
	          eval('function ' + _class + '() {}');
	          def[_class] = eval(_class);
	        }
	      } catch (e) {
	        def[_class] = function () {};
	      }

	      // Apply developer-defined methods
	      _utils['default'].forOwn(def.methods, function (fn, m) {
	        def[_class].prototype[m] = fn;
	      });

	      def[_class].prototype.set = function (key, value) {
	        _utils['default'].set(this, key, value);
	        _this.compute(def.n, this);
	        return this;
	      };

	      def[_class].prototype.get = function (key) {
	        return _utils['default'].get(this, key);
	      };

	      _utils['default'].applyRelationGettersToTarget(_this, def, def[_class].prototype);

	      // Prepare for computed properties
	      _utils['default'].forOwn(def.computed, function (fn, field) {
	        if (_utils['default'].isFunction(fn)) {
	          def.computed[field] = [fn];
	          fn = def.computed[field];
	        }
	        if (def.methods && field in def.methods) {
	          def.errorFn('Computed property "' + field + '" conflicts with previously defined prototype method!');
	        }
	        var deps;
	        if (fn.length === 1) {
	          var match = fn[0].toString().match(/function.*?\(([\s\S]*?)\)/);
	          deps = match[1].split(',');
	          def.computed[field] = deps.concat(fn);
	          fn = def.computed[field];
	          if (deps.length) {
	            def.errorFn('Use the computed property array syntax for compatibility with minified code!');
	          }
	        }
	        deps = fn.slice(0, fn.length - 1);
	        _utils['default'].forEach(deps, function (val, index) {
	          deps[index] = val.trim();
	        });
	        fn.deps = _utils['default'].filter(deps, function (dep) {
	          return !!dep;
	        });
	      });

	      _utils['default'].forEach(instanceMethods, function (name) {
	        def[_class].prototype['DS' + _utils['default'].pascalCase(name)] = function () {
	          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	          }

	          args.unshift(this[def.idAttribute] || this);
	          args.unshift(def.n);
	          return _this[name].apply(_this, args);
	        };
	      });

	      def[_class].prototype.DSCreate = function () {
	        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	          args[_key2] = arguments[_key2];
	        }

	        args.unshift(this);
	        args.unshift(def.n);
	        return _this.create.apply(_this, args);
	      };

	      // Initialize store data for the new resource
	      _this.s[def.n] = {
	        collection: [],
	        expiresHeap: new _utils['default'].BinaryHeap(function (x) {
	          return x.expires;
	        }, function (x, y) {
	          return x.item === y;
	        }),
	        completedQueries: {},
	        queryData: {},
	        pendingQueries: {},
	        index: {},
	        modified: {},
	        saved: {},
	        previousAttributes: {},
	        observers: {},
	        changeHistories: {},
	        changeHistory: [],
	        collectionModified: 0
	      };

	      if (def.reapInterval) {
	        setInterval(function () {
	          return _this.reap(def.n, { isInterval: true });
	        }, def.reapInterval);
	      }

	      // Proxy DS methods with shorthand ones
	      var fns = ['registerAdapter', 'getAdapter', 'is'];
	      for (key in _this) {
	        if (typeof _this[key] === 'function') {
	          fns.push(key);
	        }
	      }

	      _utils['default'].forEach(fns, function (key) {
	        var k = key;
	        if (_this[k].shorthand !== false) {
	          def[k] = function () {
	            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
	              args[_key3] = arguments[_key3];
	            }

	            args.unshift(def.n);
	            return _this[k].apply(_this, args);
	          };
	          def[k].before = function (fn) {
	            var orig = def[k];
	            def[k] = function () {
	              for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
	                args[_key4] = arguments[_key4];
	              }

	              return orig.apply(def, fn.apply(def, args) || args);
	            };
	          };
	        } else {
	          def[k] = function () {
	            for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
	              args[_key5] = arguments[_key5];
	            }

	            return _this[k].apply(_this, args);
	          };
	        }
	      });

	      def.beforeValidate = _utils['default'].promisify(def.beforeValidate);
	      def.validate = _utils['default'].promisify(def.validate);
	      def.afterValidate = _utils['default'].promisify(def.afterValidate);
	      def.beforeCreate = _utils['default'].promisify(def.beforeCreate);
	      def.afterCreate = _utils['default'].promisify(def.afterCreate);
	      def.beforeUpdate = _utils['default'].promisify(def.beforeUpdate);
	      def.afterUpdate = _utils['default'].promisify(def.afterUpdate);
	      def.beforeDestroy = _utils['default'].promisify(def.beforeDestroy);
	      def.afterDestroy = _utils['default'].promisify(def.afterDestroy);

	      var defaultAdapter = undefined;
	      if (def.hasOwnProperty('defaultAdapter')) {
	        defaultAdapter = def.defaultAdapter;
	      }
	      _utils['default'].forOwn(def.actions, function (action, name) {
	        if (def[name] && !def.actions[name]) {
	          throw new Error('Cannot override existing method "' + name + '"!');
	        }
	        action.request = action.request || function (config) {
	          return config;
	        };
	        action.response = action.response || function (response) {
	          return response;
	        };
	        action.responseError = action.responseError || function (err) {
	          return _utils['default'].Promise.reject(err);
	        };
	        def[name] = function (id, options) {
	          if (_utils['default']._o(id)) {
	            options = id;
	          }
	          options = options || {};
	          var adapter = _this.getAdapter(action.adapter || defaultAdapter || 'http');
	          var config = _utils['default'].deepMixIn({}, action);
	          if (!options.hasOwnProperty('endpoint') && config.endpoint) {
	            options.endpoint = config.endpoint;
	          }
	          if (typeof options.getEndpoint === 'function') {
	            config.url = options.getEndpoint(def, options);
	          } else {
	            var args = [options.basePath || adapter.defaults.basePath || def.basePath, def.getEndpoint(_utils['default']._sn(id) ? id : null, options)];
	            if (_utils['default']._sn(id)) {
	              args.push(id);
	            }
	            args.push(action.pathname || name);
	            config.url = _utils['default'].makePath.apply(null, args);
	          }
	          config.method = config.method || 'GET';
	          _utils['default'].deepMixIn(config, options);
	          return new _utils['default'].Promise(function (r) {
	            return r(config);
	          }).then(options.request || action.request).then(function (config) {
	            return adapter.HTTP(config);
	          }).then(options.response || action.response, options.responseError || action.responseError);
	        };
	      });

	      // Mix-in events
	      _utils['default'].Events(def);


	      return {
	        v: def
	      };
	    })();

	    if (typeof _ret === 'object') return _ret.v;
	  } catch (err) {
	    delete definitions[definition.name];
	    delete _this.s[definition.name];
	    throw err;
	  }
	}

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	exports['default'] = eject;

	function eject(resourceName, id, options) {
	  var _this = this;
	  var DSUtils = _this.utils;
	  var definition = _this.defs[resourceName];
	  var resource = _this.s[resourceName];
	  var item = undefined;
	  var found = false;

	  id = DSUtils.resolveId(definition, id);

	  if (!definition) {
	    throw new _this.errors.NER(resourceName);
	  } else if (!DSUtils._sn(id)) {
	    throw DSUtils._snErr('id');
	  }

	  options = DSUtils._(definition, options);


	  for (var i = 0; i < resource.collection.length; i++) {
	    if (resource.collection[i][definition.idAttribute] == id) {
	      // jshint ignore:line
	      item = resource.collection[i];
	      resource.expiresHeap.remove(item);
	      found = true;
	      break;
	    }
	  }
	  if (found) {
	    var _ret = (function () {
	      definition.beforeEject(options, item);
	      if (options.notify) {
	        definition.emit('DS.beforeEject', definition, item);
	      }
	      resource.collection.splice(i, 1);
	      if (DSUtils.w) {
	        resource.observers[id].close();
	      }
	      delete resource.observers[id];

	      delete resource.index[id];
	      delete resource.previousAttributes[id];
	      delete resource.completedQueries[id];
	      delete resource.pendingQueries[id];
	      DSUtils.forEach(resource.changeHistories[id], function (changeRecord) {
	        DSUtils.remove(resource.changeHistory, changeRecord);
	      });
	      var toRemove = [];
	      DSUtils.forOwn(resource.queryData, function (items, queryHash) {
	        if (items.$$injected) {
	          DSUtils.remove(items, item);
	        }
	        if (!items.length && options.clearEmptyQueries) {
	          toRemove.push(queryHash);
	        }
	      });
	      DSUtils.forEach(toRemove, function (queryHash) {
	        delete resource.completedQueries[queryHash];
	        delete resource.queryData[queryHash];
	      });
	      delete resource.changeHistories[id];
	      delete resource.modified[id];
	      delete resource.saved[id];
	      resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);

	      definition.afterEject(options, item);
	      if (options.notify) {
	        definition.emit('DS.afterEject', definition, item);
	      }

	      return {
	        v: item
	      };
	    })();

	    if (typeof _ret === 'object') return _ret.v;
	  }
	}

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	exports['default'] = ejectAll;

	function ejectAll(resourceName, params, options) {
	  var _this = this;
	  var DSUtils = _this.utils;
	  var definition = _this.defs[resourceName];
	  params = params || {};

	  if (!definition) {
	    throw new _this.errors.NER(resourceName);
	  } else if (!DSUtils._o(params)) {
	    throw DSUtils._oErr('params');
	  }


	  var resource = _this.s[resourceName];
	  var queryHash = DSUtils.toJson(params);
	  var items = _this.filter(definition.n, params);
	  var ids = [];
	  if (DSUtils.isEmpty(params)) {
	    resource.completedQueries = {};
	  } else {
	    delete resource.completedQueries[queryHash];
	  }
	  DSUtils.forEach(items, function (item) {
	    if (item && item[definition.idAttribute]) {
	      ids.push(item[definition.idAttribute]);
	    }
	  });
	  DSUtils.forEach(ids, function (id) {
	    _this.eject(definition.n, id, options);
	  });
	  resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);
	  return items;
	}

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	exports['default'] = filter;

	function filter(resourceName, params, options) {
	  var _this = this;
	  var DSUtils = _this.utils;
	  var definition = _this.defs[resourceName];

	  if (!definition) {
	    throw new _this.errors.NER(resourceName);
	  } else if (params && !DSUtils._o(params)) {
	    throw DSUtils._oErr('params');
	  }

	  // Protect against null
	  params = params || {};
	  options = DSUtils._(definition, options);
	  return definition.defaultFilter.call(_this, _this.s[resourceName].collection, resourceName, params, options);
	}

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	exports['default'] = inject;

	var _utils = __webpack_require__(2);

	var _errors = __webpack_require__(3);

	function _getReactFunction(DS, definition, resource) {
	  // using "var" avoids a JSHint error
	  var name = definition.n;
	  return function _react(added, removed, changed, oldValueFn, firstTime) {
	    var target = this;
	    var item = undefined;
	    var innerId = oldValueFn && oldValueFn(definition.idAttribute) ? oldValueFn(definition.idAttribute) : target[definition.idAttribute];

	    _utils['default'].forEach(definition.relationFields, function (field) {
	      delete added[field];
	      delete removed[field];
	      delete changed[field];
	    });

	    if (!_utils['default'].isEmpty(added) || !_utils['default'].isEmpty(removed) || !_utils['default'].isEmpty(changed) || firstTime) {
	      item = DS.get(name, innerId);
	      resource.modified[innerId] = _utils['default'].updateTimestamp(resource.modified[innerId]);
	      resource.collectionModified = _utils['default'].updateTimestamp(resource.collectionModified);
	      if (definition.keepChangeHistory) {
	        var changeRecord = {
	          resourceName: name,
	          target: item,
	          added: added,
	          removed: removed,
	          changed: changed,
	          timestamp: resource.modified[innerId]
	        };
	        resource.changeHistories[innerId].push(changeRecord);
	        resource.changeHistory.push(changeRecord);
	      }
	    }

	    if (definition.computed) {
	      item = item || DS.get(name, innerId);
	      _utils['default'].forOwn(definition.computed, function (fn, field) {
	        var compute = false;
	        // check if required fields changed
	        _utils['default'].forEach(fn.deps, function (dep) {
	          if (dep in added || dep in removed || dep in changed || !(field in item)) {
	            compute = true;
	          }
	        });
	        compute = compute || !fn.deps.length;
	        if (compute) {
	          _utils['default'].compute.call(item, fn, field);
	        }
	      });
	    }

	    if (definition.idAttribute in changed) {
	      definition.errorFn('Doh! You just changed the primary key of an object! Your data for the "' + name + '" resource is now in an undefined (probably broken) state.');
	    }
	  };
	}

	function _inject(definition, resource, attrs, options) {
	  var _this = this;
	  var _react = _getReactFunction(_this, definition, resource, attrs, options);

	  var injected = undefined;
	  if (_utils['default']._a(attrs)) {
	    injected = [];
	    for (var i = 0; i < attrs.length; i++) {
	      injected.push(_inject.call(_this, definition, resource, attrs[i], options));
	    }
	  } else {
	    // check if "idAttribute" is a computed property
	    var c = definition.computed;
	    var idA = definition.idAttribute;
	    if (c && c[idA]) {
	      (function () {
	        var args = [];
	        _utils['default'].forEach(c[idA].deps, function (dep) {
	          args.push(attrs[dep]);
	        });
	        attrs[idA] = c[idA][c[idA].length - 1].apply(attrs, args);
	      })();
	    }
	    if (!(idA in attrs)) {
	      var error = new _errors['default'].R('' + definition.n + '.inject: "attrs" must contain the property specified by "idAttribute"!');
	      options.errorFn(error);
	      throw error;
	    } else {
	      try {
	        _utils['default'].forEach(definition.relationList, function (def) {
	          var relationName = def.relation;
	          var relationDef = _this.defs[relationName];
	          var toInject = attrs[def.localField];
	          if (toInject) {
	            if (!relationDef) {
	              throw new _errors['default'].R('' + definition.n + ' relation is defined but the resource is not!');
	            }
	            if (_utils['default']._a(toInject)) {
	              (function () {
	                var items = [];
	                _utils['default'].forEach(toInject, function (toInjectItem) {
	                  if (toInjectItem !== _this.s[relationName].index[toInjectItem[relationDef.idAttribute]]) {
	                    try {
	                      var injectedItem = _this.inject(relationName, toInjectItem, options.orig());
	                      if (def.foreignKey) {
	                        injectedItem[def.foreignKey] = attrs[definition.idAttribute];
	                      }
	                      items.push(injectedItem);
	                    } catch (err) {
	                      options.errorFn(err, 'Failed to inject ' + def.type + ' relation: "' + relationName + '"!');
	                    }
	                  }
	                });
	              })();
	            } else {
	              if (toInject !== _this.s[relationName].index[toInject[relationDef.idAttribute]]) {
	                try {
	                  var _injected = _this.inject(relationName, attrs[def.localField], options.orig());
	                  if (def.foreignKey) {
	                    _injected[def.foreignKey] = attrs[definition.idAttribute];
	                  }
	                } catch (err) {
	                  options.errorFn(err, 'Failed to inject ' + def.type + ' relation: "' + relationName + '"!');
	                }
	              }
	            }
	          }
	        });

	        var id = attrs[idA];
	        var item = _this.get(definition.n, id);
	        var initialLastModified = item ? resource.modified[id] : 0;

	        if (!item) {
	          if (attrs instanceof definition[definition['class']]) {
	            item = attrs;
	          } else {
	            item = new definition[definition['class']]();
	          }
	          _utils['default'].forEach(definition.relationList, function (def) {
	            delete attrs[def.localField];
	          });
	          _utils['default'].deepMixIn(item, attrs);

	          resource.collection.push(item);
	          resource.changeHistories[id] = [];

	          if (_utils['default'].w) {
	            resource.observers[id] = new _this.observe.ObjectObserver(item);
	            resource.observers[id].open(_react, item);
	          }

	          resource.index[id] = item;
	          _react.call(item, {}, {}, {}, null, true);
	          resource.previousAttributes[id] = _utils['default'].copy(item, null, null, null, definition.relationFields);
	        } else {
	          _utils['default'].deepMixIn(item, attrs);
	          if (definition.resetHistoryOnInject) {
	            resource.previousAttributes[id] = _utils['default'].copy(item, null, null, null, definition.relationFields);
	            if (resource.changeHistories[id].length) {
	              _utils['default'].forEach(resource.changeHistories[id], function (changeRecord) {
	                _utils['default'].remove(resource.changeHistory, changeRecord);
	              });
	              resource.changeHistories[id].splice(0, resource.changeHistories[id].length);
	            }
	          }
	          if (_utils['default'].w) {
	            resource.observers[id].deliver();
	          }
	        }
	        resource.modified[id] = initialLastModified && resource.modified[id] === initialLastModified ? _utils['default'].updateTimestamp(resource.modified[id]) : resource.modified[id];
	        resource.expiresHeap.remove(item);
	        var timestamp = new Date().getTime();
	        resource.expiresHeap.push({
	          item: item,
	          timestamp: timestamp,
	          expires: definition.maxAge ? timestamp + definition.maxAge : Number.MAX_VALUE
	        });
	        injected = item;
	      } catch (err) {
	        options.errorFn(err, attrs);
	      }
	    }
	  }
	  return injected;
	}

	function inject(resourceName, attrs, options) {
	  var _this = this;
	  var definition = _this.defs[resourceName];
	  var resource = _this.s[resourceName];
	  var injected = undefined;

	  if (!definition) {
	    throw new _errors['default'].NER(resourceName);
	  } else if (!_utils['default']._o(attrs) && !_utils['default']._a(attrs)) {
	    throw new _errors['default'].IA('' + resourceName + '.inject: "attrs" must be an object or an array!');
	  }

	  options = _utils['default']._(definition, options);

	  options.beforeInject(options, attrs);
	  if (options.notify) {
	    definition.emit('DS.beforeInject', definition, attrs);
	  }

	  injected = _inject.call(_this, definition, resource, attrs, options);
	  resource.collectionModified = _utils['default'].updateTimestamp(resource.collectionModified);

	  options.afterInject(options, injected);
	  if (options.notify) {
	    definition.emit('DS.afterInject', definition, injected);
	  }

	  return injected;
	}

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var forEach = __webpack_require__(8);

	    /**
	     * Create nested object if non-existent
	     */
	    function namespace(obj, path){
	        if (!path) return obj;
	        forEach(path.split('.'), function(key){
	            if (!obj[key]) {
	                obj[key] = {};
	            }
	            obj = obj[key];
	        });
	        return obj;
	    }

	    module.exports = namespace;




/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	exports['default'] = create;

	function create(resourceName, attrs, options) {
	  var _this = this;
	  var DSUtils = _this.utils;
	  var definition = _this.defs[resourceName];

	  options = options || {};
	  attrs = attrs || {};

	  var rejectionError = undefined;
	  if (!definition) {
	    rejectionError = new _this.errors.NER(resourceName);
	  } else if (!DSUtils._o(attrs)) {
	    rejectionError = DSUtils._oErr('attrs');
	  } else {
	    options = DSUtils._(definition, options);
	    if (options.upsert && DSUtils._sn(attrs[definition.idAttribute])) {
	      return _this.update(resourceName, attrs[definition.idAttribute], attrs, options);
	    }
	  }

	  return new DSUtils.Promise(function (resolve, reject) {
	    if (rejectionError) {
	      reject(rejectionError);
	    } else {
	      resolve(attrs);
	    }
	  }).then(function (attrs) {
	    return options.beforeValidate.call(attrs, options, attrs);
	  }).then(function (attrs) {
	    return options.validate.call(attrs, options, attrs);
	  }).then(function (attrs) {
	    return options.afterValidate.call(attrs, options, attrs);
	  }).then(function (attrs) {
	    return options.beforeCreate.call(attrs, options, attrs);
	  }).then(function (attrs) {
	    if (options.notify) {
	      definition.emit('DS.beforeCreate', definition, attrs);
	    }
	    return _this.getAdapter(options).create(definition, attrs, options);
	  }).then(function (attrs) {
	    return options.afterCreate.call(attrs, options, attrs);
	  }).then(function (attrs) {
	    if (options.notify) {
	      definition.emit('DS.afterCreate', definition, attrs);
	    }
	    if (options.cacheResponse) {
	      var created = _this.inject(definition.n, attrs, options.orig());
	      var id = created[definition.idAttribute];
	      var resource = _this.s[resourceName];
	      resource.completedQueries[id] = new Date().getTime();
	      resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
	      return created;
	    } else {
	      return _this.createInstance(resourceName, attrs, options);
	    }
	  });
	}

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	exports['default'] = destroy;

	function destroy(resourceName, id, options) {
	  var _this = this;
	  var DSUtils = _this.utils;
	  var definition = _this.defs[resourceName];
	  var item = undefined;

	  return new DSUtils.Promise(function (resolve, reject) {
	    id = DSUtils.resolveId(definition, id);
	    if (!definition) {
	      reject(new _this.errors.NER(resourceName));
	    } else if (!DSUtils._sn(id)) {
	      reject(DSUtils._snErr('id'));
	    } else {
	      item = _this.get(resourceName, id) || { id: id };
	      options = DSUtils._(definition, options);
	      resolve(item);
	    }
	  }).then(function (attrs) {
	    return options.beforeDestroy.call(attrs, options, attrs);
	  }).then(function (attrs) {
	    if (options.notify) {
	      definition.emit('DS.beforeDestroy', definition, attrs);
	    }
	    if (options.eagerEject) {
	      _this.eject(resourceName, id);
	    }
	    return _this.getAdapter(options).destroy(definition, id, options);
	  }).then(function () {
	    return options.afterDestroy.call(item, options, item);
	  }).then(function (item) {
	    if (options.notify) {
	      definition.emit('DS.afterDestroy', definition, item);
	    }
	    _this.eject(resourceName, id);
	    return id;
	  })['catch'](function (err) {
	    if (options && options.eagerEject && item) {
	      _this.inject(resourceName, item, { notify: false });
	    }
	    return DSUtils.Promise.reject(err);
	  });
	}

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	exports['default'] = destroyAll;

	function destroyAll(resourceName, params, options) {
	  var _this = this;
	  var DSUtils = _this.utils;
	  var definition = _this.defs[resourceName];
	  var ejected = undefined,
	      toEject = undefined;

	  params = params || {};

	  return new DSUtils.Promise(function (resolve, reject) {
	    if (!definition) {
	      reject(new _this.errors.NER(resourceName));
	    } else if (!DSUtils._o(params)) {
	      reject(DSUtils._oErr('attrs'));
	    } else {
	      options = DSUtils._(definition, options);
	      resolve();
	    }
	  }).then(function () {
	    toEject = _this.defaults.defaultFilter.call(_this, resourceName, params);
	    return options.beforeDestroy(options, toEject);
	  }).then(function () {
	    if (options.notify) {
	      definition.emit('DS.beforeDestroy', definition, toEject);
	    }
	    if (options.eagerEject) {
	      ejected = _this.ejectAll(resourceName, params);
	    }
	    return _this.getAdapter(options).destroyAll(definition, params, options);
	  }).then(function () {
	    return options.afterDestroy(options, toEject);
	  }).then(function () {
	    if (options.notify) {
	      definition.emit('DS.afterDestroy', definition, toEject);
	    }
	    return ejected || _this.ejectAll(resourceName, params);
	  })['catch'](function (err) {
	    if (options && options.eagerEject && ejected) {
	      _this.inject(resourceName, ejected, { notify: false });
	    }
	    return DSUtils.Promise.reject(err);
	  });
	}

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	exports['default'] = find;
	/* jshint -W082 */

	function find(resourceName, id, options) {
	  var _this = this;
	  var DSUtils = _this.utils;
	  var definition = _this.defs[resourceName];
	  var resource = _this.s[resourceName];

	  return new DSUtils.Promise(function (resolve, reject) {
	    if (!definition) {
	      reject(new _this.errors.NER(resourceName));
	    } else if (!DSUtils._sn(id)) {
	      reject(DSUtils._snErr('id'));
	    } else {
	      options = DSUtils._(definition, options);

	      if (options.params) {
	        options.params = DSUtils.copy(options.params);
	      }

	      if (options.bypassCache || !options.cacheResponse) {
	        delete resource.completedQueries[id];
	      }
	      if ((!options.findStrictCache || id in resource.completedQueries) && _this.get(resourceName, id) && !options.bypassCache) {
	        resolve(_this.get(resourceName, id));
	      } else {
	        delete resource.completedQueries[id];
	        resolve();
	      }
	    }
	  }).then(function (item) {
	    if (!item) {
	      if (!(id in resource.pendingQueries)) {
	        var promise = undefined;
	        var strategy = options.findStrategy || options.strategy;
	        if (strategy === 'fallback') {
	          (function () {
	            var makeFallbackCall = function (index) {
	              return _this.getAdapter((options.findFallbackAdapters || options.fallbackAdapters)[index]).find(definition, id, options)['catch'](function (err) {
	                index++;
	                if (index < options.fallbackAdapters.length) {
	                  return makeFallbackCall(index);
	                } else {
	                  return DSUtils.Promise.reject(err);
	                }
	              });
	            };

	            promise = makeFallbackCall(0);
	          })();
	        } else {
	          promise = _this.getAdapter(options).find(definition, id, options);
	        }

	        resource.pendingQueries[id] = promise.then(function (data) {
	          // Query is no longer pending
	          delete resource.pendingQueries[id];
	          if (options.cacheResponse) {
	            var injected = _this.inject(resourceName, data, options.orig());
	            resource.completedQueries[id] = new Date().getTime();
	            resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
	            return injected;
	          } else {
	            return _this.createInstance(resourceName, data, options.orig());
	          }
	        });
	      }
	      return resource.pendingQueries[id];
	    } else {
	      return item;
	    }
	  })['catch'](function (err) {
	    if (resource) {
	      delete resource.pendingQueries[id];
	    }
	    return DSUtils.Promise.reject(err);
	  });
	}

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	exports['default'] = findAll;
	/* jshint -W082 */
	function processResults(data, resourceName, queryHash, options) {
	  var _this = this;
	  var DSUtils = _this.utils;
	  var resource = _this.s[resourceName];
	  var idAttribute = _this.defs[resourceName].idAttribute;
	  var date = new Date().getTime();

	  data = data || [];

	  // Query is no longer pending
	  delete resource.pendingQueries[queryHash];
	  resource.completedQueries[queryHash] = date;

	  // Update modified timestamp of collection
	  resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);

	  // Merge the new values into the cache
	  var injected = _this.inject(resourceName, data, options.orig());

	  // Make sure each object is added to completedQueries
	  if (DSUtils._a(injected)) {
	    DSUtils.forEach(injected, function (item) {
	      if (item) {
	        var id = item[idAttribute];
	        if (id) {
	          resource.completedQueries[id] = date;
	          resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
	        }
	      }
	    });
	  } else {
	    options.errorFn('response is expected to be an array!');
	    resource.completedQueries[injected[idAttribute]] = date;
	  }

	  return injected;
	}

	function findAll(resourceName, params, options) {
	  var _this = this;
	  var DSUtils = _this.utils;
	  var definition = _this.defs[resourceName];
	  var resource = _this.s[resourceName];
	  var queryHash = undefined;

	  return new DSUtils.Promise(function (resolve, reject) {
	    params = params || {};

	    if (!_this.defs[resourceName]) {
	      reject(new _this.errors.NER(resourceName));
	    } else if (!DSUtils._o(params)) {
	      reject(DSUtils._oErr('params'));
	    } else {
	      options = DSUtils._(definition, options);
	      queryHash = DSUtils.toJson(params);

	      if (options.params) {
	        options.params = DSUtils.copy(options.params);
	      }

	      if (options.bypassCache || !options.cacheResponse) {
	        delete resource.completedQueries[queryHash];
	        delete resource.queryData[queryHash];
	      }
	      if (queryHash in resource.completedQueries) {
	        if (options.useFilter) {
	          resolve(_this.filter(resourceName, params, options.orig()));
	        } else {
	          resolve(resource.queryData[queryHash]);
	        }
	      } else {
	        resolve();
	      }
	    }
	  }).then(function (items) {
	    if (!(queryHash in resource.completedQueries)) {
	      if (!(queryHash in resource.pendingQueries)) {
	        var promise = undefined;
	        var strategy = options.findAllStrategy || options.strategy;
	        if (strategy === 'fallback') {
	          (function () {
	            var makeFallbackCall = function (index) {
	              return _this.getAdapter((options.findAllFallbackAdapters || options.fallbackAdapters)[index]).findAll(definition, params, options)['catch'](function (err) {
	                index++;
	                if (index < options.fallbackAdapters.length) {
	                  return makeFallbackCall(index);
	                } else {
	                  return DSUtils.Promise.reject(err);
	                }
	              });
	            };

	            promise = makeFallbackCall(0);
	          })();
	        } else {
	          promise = _this.getAdapter(options).findAll(definition, params, options);
	        }

	        resource.pendingQueries[queryHash] = promise.then(function (data) {
	          delete resource.pendingQueries[queryHash];
	          if (options.cacheResponse) {
	            resource.queryData[queryHash] = processResults.call(_this, data, resourceName, queryHash, options);
	            resource.queryData[queryHash].$$injected = true;
	            return resource.queryData[queryHash];
	          } else {
	            DSUtils.forEach(data, function (item, i) {
	              data[i] = _this.createInstance(resourceName, item, options.orig());
	            });
	            return data;
	          }
	        });
	      }

	      return resource.pendingQueries[queryHash];
	    } else {
	      return items;
	    }
	  })['catch'](function (err) {
	    if (resource) {
	      delete resource.pendingQueries[queryHash];
	    }
	    return DSUtils.Promise.reject(err);
	  });
	}

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	exports['default'] = loadRelations;

	function _defineProperty(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); }

	function loadRelations(resourceName, instance, relations, options) {
	  var _this = this;
	  var DSUtils = _this.utils;
	  var DSErrors = _this.errors;

	  var definition = _this.defs[resourceName];

	  return new DSUtils.Promise(function (resolve, reject) {
	    if (DSUtils._sn(instance)) {
	      instance = _this.get(resourceName, instance);
	    }

	    if (DSUtils._s(relations)) {
	      relations = [relations];
	    }

	    if (!definition) {
	      reject(new DSErrors.NER(resourceName));
	    } else if (!DSUtils._o(instance)) {
	      reject(new DSErrors.IA('"instance(id)" must be a string, number or object!'));
	    } else if (!DSUtils._a(relations)) {
	      reject(new DSErrors.IA('"relations" must be a string or an array!'));
	    } else {
	      (function () {
	        var _options = DSUtils._(definition, options);
	        if (!_options.hasOwnProperty('findBelongsTo')) {
	          _options.findBelongsTo = true;
	        }
	        if (!_options.hasOwnProperty('findHasMany')) {
	          _options.findHasMany = true;
	        }

	        var tasks = [];

	        DSUtils.forEach(definition.relationList, function (def) {
	          var relationName = def.relation;
	          var relationDef = definition.getResource(relationName);
	          var __options = DSUtils._(relationDef, options);
	          if (DSUtils.contains(relations, relationName) || DSUtils.contains(relations, def.localField)) {
	            var task = undefined;
	            var params = {};
	            if (__options.allowSimpleWhere) {
	              params[def.foreignKey] = instance[definition.idAttribute];
	            } else {
	              params.where = {};
	              params.where[def.foreignKey] = {
	                '==': instance[definition.idAttribute]
	              };
	            }

	            if (def.type === 'hasMany') {
	              if (def.localKeys) {
	                delete params[def.foreignKey];
	                params.where = _defineProperty({}, relationDef.idAttribute, {
	                  'in': instance[def.localKeys]
	                });
	              }
	              task = _this.findAll(relationName, params, __options.orig());
	            } else if (def.type === 'hasOne') {
	              if (def.localKey && instance[def.localKey]) {
	                task = _this.find(relationName, instance[def.localKey], __options.orig());
	              } else if (def.foreignKey) {
	                task = _this.findAll(relationName, params, __options.orig()).then(function (hasOnes) {
	                  return hasOnes.length ? hasOnes[0] : null;
	                });
	              }
	            } else if (instance[def.localKey]) {
	              task = _this.find(relationName, instance[def.localKey], __options.orig());
	            }

	            if (task) {
	              tasks.push(task);
	            }
	          }
	        });

	        resolve(tasks);
	      })();
	    }
	  }).then(function (tasks) {
	    return DSUtils.Promise.all(tasks);
	  }).then(function () {
	    return instance;
	  });
	}

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	exports['default'] = reap;

	function reap(resourceName, options) {
	  var _this = this;
	  var DSUtils = _this.utils;
	  var definition = _this.defs[resourceName];
	  var resource = _this.s[resourceName];

	  return new DSUtils.Promise(function (resolve, reject) {

	    if (!definition) {
	      reject(new _this.errors.NER(resourceName));
	    } else {
	      options = DSUtils._(definition, options);
	      if (!options.hasOwnProperty('notify')) {
	        options.notify = false;
	      }
	      var items = [];
	      var now = new Date().getTime();
	      var expiredItem = undefined;
	      while ((expiredItem = resource.expiresHeap.peek()) && expiredItem.expires < now) {
	        items.push(expiredItem.item);
	        delete expiredItem.item;
	        resource.expiresHeap.pop();
	      }
	      resolve(items);
	    }
	  }).then(function (items) {
	    if (options.isInterval || options.notify) {
	      definition.beforeReap(options, items);
	      definition.emit('DS.beforeReap', definition, items);
	    }
	    if (options.reapAction === 'inject') {
	      (function () {
	        var timestamp = new Date().getTime();
	        DSUtils.forEach(items, function (item) {
	          resource.expiresHeap.push({
	            item: item,
	            timestamp: timestamp,
	            expires: definition.maxAge ? timestamp + definition.maxAge : Number.MAX_VALUE
	          });
	        });
	      })();
	    } else if (options.reapAction === 'eject') {
	      DSUtils.forEach(items, function (item) {
	        _this.eject(resourceName, item[definition.idAttribute]);
	      });
	    } else if (options.reapAction === 'refresh') {
	      var _ret2 = (function () {
	        var tasks = [];
	        DSUtils.forEach(items, function (item) {
	          tasks.push(_this.refresh(resourceName, item[definition.idAttribute]));
	        });
	        return {
	          v: DSUtils.Promise.all(tasks)
	        };
	      })();

	      if (typeof _ret2 === 'object') return _ret2.v;
	    }
	    return items;
	  }).then(function (items) {
	    if (options.isInterval || options.notify) {
	      definition.afterReap(options, items);
	      definition.emit('DS.afterReap', definition, items);
	    }
	    return items;
	  });
	}

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	exports['default'] = save;

	function save(resourceName, id, options) {
	  var _this = this;
	  var DSUtils = _this.utils;
	  var DSErrors = _this.errors;

	  var definition = _this.defs[resourceName];
	  var item = undefined;
	  var noChanges = undefined;

	  return new DSUtils.Promise(function (resolve, reject) {
	    id = DSUtils.resolveId(definition, id);
	    if (!definition) {
	      reject(new DSErrors.NER(resourceName));
	    } else if (!DSUtils._sn(id)) {
	      reject(DSUtils._snErr('id'));
	    } else if (!_this.get(resourceName, id)) {
	      reject(new DSErrors.R('id "' + id + '" not found in cache!'));
	    } else {
	      item = _this.get(resourceName, id);
	      options = DSUtils._(definition, options);
	      resolve(item);
	    }
	  }).then(function (attrs) {
	    return options.beforeValidate.call(attrs, options, attrs);
	  }).then(function (attrs) {
	    return options.validate.call(attrs, options, attrs);
	  }).then(function (attrs) {
	    return options.afterValidate.call(attrs, options, attrs);
	  }).then(function (attrs) {
	    return options.beforeUpdate.call(attrs, options, attrs);
	  }).then(function (attrs) {
	    if (options.notify) {
	      definition.emit('DS.beforeUpdate', definition, attrs);
	    }
	    if (options.changesOnly) {
	      var resource = _this.s[resourceName];
	      if (DSUtils.w) {
	        resource.observers[id].deliver();
	      }
	      var toKeep = [];
	      var changes = _this.changes(resourceName, id);

	      for (var key in changes.added) {
	        toKeep.push(key);
	      }
	      for (key in changes.changed) {
	        toKeep.push(key);
	      }
	      changes = DSUtils.pick(attrs, toKeep);
	      if (DSUtils.isEmpty(changes)) {
	        // no changes, return
	        noChanges = true;
	        return attrs;
	      } else {
	        attrs = changes;
	      }
	    }
	    return _this.getAdapter(options).update(definition, id, attrs, options);
	  }).then(function (data) {
	    return options.afterUpdate.call(data, options, data);
	  }).then(function (attrs) {
	    if (options.notify) {
	      definition.emit('DS.afterUpdate', definition, attrs);
	    }
	    if (noChanges) {
	      return attrs;
	    } else if (options.cacheResponse) {
	      var injected = _this.inject(definition.n, attrs, options.orig());
	      var resource = _this.s[resourceName];
	      var _id = injected[definition.idAttribute];
	      resource.saved[_id] = DSUtils.updateTimestamp(resource.saved[_id]);
	      if (!definition.resetHistoryOnInject) {
	        resource.previousAttributes[_id] = DSUtils.copy(injected, null, null, null, definition.relationFields);
	      }
	      return injected;
	    } else {
	      return _this.createInstance(resourceName, attrs, options.orig());
	    }
	  });
	}

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	exports['default'] = update;

	function update(resourceName, id, attrs, options) {
	  var _this = this;
	  var DSUtils = _this.utils;
	  var DSErrors = _this.errors;

	  var definition = _this.defs[resourceName];

	  return new DSUtils.Promise(function (resolve, reject) {
	    id = DSUtils.resolveId(definition, id);
	    if (!definition) {
	      reject(new DSErrors.NER(resourceName));
	    } else if (!DSUtils._sn(id)) {
	      reject(DSUtils._snErr('id'));
	    } else {
	      options = DSUtils._(definition, options);
	      resolve(attrs);
	    }
	  }).then(function (attrs) {
	    return options.beforeValidate.call(attrs, options, attrs);
	  }).then(function (attrs) {
	    return options.validate.call(attrs, options, attrs);
	  }).then(function (attrs) {
	    return options.afterValidate.call(attrs, options, attrs);
	  }).then(function (attrs) {
	    return options.beforeUpdate.call(attrs, options, attrs);
	  }).then(function (attrs) {
	    if (options.notify) {
	      definition.emit('DS.beforeUpdate', definition, attrs);
	    }
	    return _this.getAdapter(options).update(definition, id, attrs, options);
	  }).then(function (data) {
	    return options.afterUpdate.call(data, options, data);
	  }).then(function (attrs) {
	    if (options.notify) {
	      definition.emit('DS.afterUpdate', definition, attrs);
	    }
	    if (options.cacheResponse) {
	      var injected = _this.inject(definition.n, attrs, options.orig());
	      var resource = _this.s[resourceName];
	      var _id = injected[definition.idAttribute];
	      resource.saved[_id] = DSUtils.updateTimestamp(resource.saved[_id]);
	      if (!definition.resetHistoryOnInject) {
	        resource.previousAttributes[_id] = DSUtils.copy(injected, null, null, null, definition.relationFields);
	      }
	      return injected;
	    } else {
	      return _this.createInstance(resourceName, attrs, options.orig());
	    }
	  });
	}

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	exports['default'] = updateAll;

	function updateAll(resourceName, attrs, params, options) {
	  var _this = this;
	  var DSUtils = _this.utils;
	  var DSErrors = _this.errors;

	  var definition = _this.defs[resourceName];

	  return new DSUtils.Promise(function (resolve, reject) {
	    if (!definition) {
	      reject(new DSErrors.NER(resourceName));
	    } else {
	      options = DSUtils._(definition, options);
	      resolve(attrs);
	    }
	  }).then(function (attrs) {
	    return options.beforeValidate.call(attrs, options, attrs);
	  }).then(function (attrs) {
	    return options.validate.call(attrs, options, attrs);
	  }).then(function (attrs) {
	    return options.afterValidate.call(attrs, options, attrs);
	  }).then(function (attrs) {
	    return options.beforeUpdate.call(attrs, options, attrs);
	  }).then(function (attrs) {
	    if (options.notify) {
	      definition.emit('DS.beforeUpdate', definition, attrs);
	    }
	    return _this.getAdapter(options).updateAll(definition, attrs, params, options);
	  }).then(function (data) {
	    return options.afterUpdate.call(data, options, data);
	  }).then(function (data) {
	    if (options.notify) {
	      definition.emit('DS.afterUpdate', definition, attrs);
	    }
	    var origOptions = options.orig();
	    if (options.cacheResponse) {
	      var _ret = (function () {
	        var injected = _this.inject(definition.n, data, origOptions);
	        var resource = _this.s[resourceName];
	        DSUtils.forEach(injected, function (i) {
	          var id = i[definition.idAttribute];
	          resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
	          if (!definition.resetHistoryOnInject) {
	            resource.previousAttributes[id] = DSUtils.copy(i, null, null, null, definition.relationFields);
	          }
	        });
	        return {
	          v: injected
	        };
	      })();

	      if (typeof _ret === 'object') return _ret.v;
	    } else {
	      var _ret2 = (function () {
	        var instances = [];
	        DSUtils.forEach(data, function (item) {
	          instances.push(_this.createInstance(resourceName, item, origOptions));
	        });
	        return {
	          v: instances
	        };
	      })();

	      if (typeof _ret2 === 'object') return _ret2.v;
	    }
	  });
	}

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	

	    /**
	     * Typecast a value to a String, using an empty string value for null or
	     * undefined.
	     */
	    function toString(val){
	        return val == null ? '' : val.toString();
	    }

	    module.exports = toString;




/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(41);
	var replaceAccents = __webpack_require__(43);
	var removeNonWord = __webpack_require__(44);
	var upperCase = __webpack_require__(19);
	var lowerCase = __webpack_require__(45);
	    /**
	    * Convert string to camelCase text.
	    */
	    function camelCase(str){
	        str = toString(str);
	        str = replaceAccents(str);
	        str = removeNonWord(str)
	            .replace(/[\-_]/g, ' ') //convert all hyphens and underscores to spaces
	            .replace(/\s[a-z]/g, upperCase) //convert first char of each word to UPPERCASE
	            .replace(/\s+/g, '') //remove spaces
	            .replace(/^[A-Z]/g, lowerCase); //convert first char to lowercase
	        return str;
	    }
	    module.exports = camelCase;



/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(41);
	    /**
	    * Replaces all accented chars with regular ones
	    */
	    function replaceAccents(str){
	        str = toString(str);

	        // verifies if the String has accents and replace them
	        if (str.search(/[\xC0-\xFF]/g) > -1) {
	            str = str
	                    .replace(/[\xC0-\xC5]/g, "A")
	                    .replace(/[\xC6]/g, "AE")
	                    .replace(/[\xC7]/g, "C")
	                    .replace(/[\xC8-\xCB]/g, "E")
	                    .replace(/[\xCC-\xCF]/g, "I")
	                    .replace(/[\xD0]/g, "D")
	                    .replace(/[\xD1]/g, "N")
	                    .replace(/[\xD2-\xD6\xD8]/g, "O")
	                    .replace(/[\xD9-\xDC]/g, "U")
	                    .replace(/[\xDD]/g, "Y")
	                    .replace(/[\xDE]/g, "P")
	                    .replace(/[\xE0-\xE5]/g, "a")
	                    .replace(/[\xE6]/g, "ae")
	                    .replace(/[\xE7]/g, "c")
	                    .replace(/[\xE8-\xEB]/g, "e")
	                    .replace(/[\xEC-\xEF]/g, "i")
	                    .replace(/[\xF1]/g, "n")
	                    .replace(/[\xF2-\xF6\xF8]/g, "o")
	                    .replace(/[\xF9-\xFC]/g, "u")
	                    .replace(/[\xFE]/g, "p")
	                    .replace(/[\xFD\xFF]/g, "y");
	        }
	        return str;
	    }
	    module.exports = replaceAccents;



/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(41);
	    // This pattern is generated by the _build/pattern-removeNonWord.js script
	    var PATTERN = /[^\x20\x2D0-9A-Z\x5Fa-z\xC0-\xD6\xD8-\xF6\xF8-\xFF]/g;

	    /**
	     * Remove non-word chars.
	     */
	    function removeNonWord(str){
	        str = toString(str);
	        return str.replace(PATTERN, '');
	    }

	    module.exports = removeNonWord;



/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var toString = __webpack_require__(41);
	    /**
	     * "Safer" String.toLowerCase()
	     */
	    function lowerCase(str){
	        str = toString(str);
	        return str.toLowerCase();
	    }

	    module.exports = lowerCase;



/***/ }
/******/ ])
});

