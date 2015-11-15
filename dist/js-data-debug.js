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

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _core = __webpack_require__(1);

	var _loop = function _loop(_key2) {
	  if (_key2 === "default") return 'continue';
	  Object.defineProperty(exports, _key2, {
	    enumerable: true,
	    get: function get() {
	      return _core[_key2];
	    }
	  });
	};

	for (var _key2 in _core) {
	  var _ret = _loop(_key2);

	  if (_ret === 'continue') continue;
	}

	var version = exports.version = {
	  full: '<%= pkg.version %>',
	  major: parseInt('<%= major %>', 10),
	  minor: parseInt('<%= minor %>', 10),
	  patch: parseInt('<%= patch %>', 10),
	  alpha:  true ? '<%= alpha %>' : false,
	  beta:  true ? '<%= beta %>' : false
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _decorators = __webpack_require__(2);

	var _loop = function _loop(_key3) {
	  if (_key3 === "default") return 'continue';
	  Object.defineProperty(exports, _key3, {
	    enumerable: true,
	    get: function get() {
	      return _decorators[_key3];
	    }
	  });
	};

	for (var _key3 in _decorators) {
	  var _ret = _loop(_key3);

	  if (_ret === 'continue') continue;
	}

	var _resource = __webpack_require__(7);

	var _loop2 = function _loop2(_key4) {
	  if (_key4 === "default") return 'continue';
	  Object.defineProperty(exports, _key4, {
	    enumerable: true,
	    get: function get() {
	      return _resource[_key4];
	    }
	  });
	};

	for (var _key4 in _resource) {
	  var _ret2 = _loop2(_key4);

	  if (_ret2 === 'continue') continue;
	}

	// Workaround for https://github.com/babel/babel/issues/2763
	var CORE = exports.CORE = 'FIXME';

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _actions = __webpack_require__(3);

	var _loop = function _loop(_key4) {
	  if (_key4 === "default") return 'continue';
	  Object.defineProperty(exports, _key4, {
	    enumerable: true,
	    get: function get() {
	      return _actions[_key4];
	    }
	  });
	};

	for (var _key4 in _actions) {
	  var _ret = _loop(_key4);

	  if (_ret === 'continue') continue;
	}

	var _configure = __webpack_require__(5);

	var _loop2 = function _loop2(_key5) {
	  if (_key5 === "default") return 'continue';
	  Object.defineProperty(exports, _key5, {
	    enumerable: true,
	    get: function get() {
	      return _configure[_key5];
	    }
	  });
	};

	for (var _key5 in _configure) {
	  var _ret2 = _loop2(_key5);

	  if (_ret2 === 'continue') continue;
	}

	var _schema = __webpack_require__(6);

	var _loop3 = function _loop3(_key6) {
	  if (_key6 === "default") return 'continue';
	  Object.defineProperty(exports, _key6, {
	    enumerable: true,
	    get: function get() {
	      return _schema[_key6];
	    }
	  });
	};

	for (var _key6 in _schema) {
	  var _ret3 = _loop3(_key6);

	  if (_ret3 === 'continue') continue;
	}

	// Workaround for https://github.com/babel/babel/issues/2763
	var DECORATORS = exports.DECORATORS = 'FIXME';

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.action = action;
	exports.actions = actions;

	var _utils = __webpack_require__(4);

	var _configure = __webpack_require__(5);

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
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.forOwn = forOwn;
	exports.isRegExp = isRegExp;
	exports.isString = isString;
	exports.isObject = isObject;
	exports.isDate = isDate;
	exports.isNumber = isNumber;
	exports.isFunction = isFunction;
	exports.isSorN = isSorN;
	exports.resolve = resolve;
	exports.reject = reject;
	exports.makePath = makePath;
	exports.fillIn = fillIn;
	exports.isBlacklisted = isBlacklisted;
	exports.omit = omit;
	exports.fromJson = fromJson;
	exports.copy = copy;

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	var isArray = exports.isArray = Array.isArray;
	function forOwn(obj, fn, thisArg) {
	  var keys = Object.keys(obj);
	  var len = keys.length;
	  var i = undefined;
	  for (i = 0; i < len; i++) {
	    fn.call(thisArg, obj[keys[i]], keys[i], obj);
	  }
	}
	function isRegExp(value) {
	  return toString.call(value) === '[object RegExp]' || false;
	}
	function isString(value) {
	  return typeof value === 'string' || value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && toString.call(value) === '[object String]' || false;
	}
	function isObject(value) {
	  return toString.call(value) === '[object Object]' || false;
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
	function resolve(value) {
	  return Promise.resolve(value);
	}
	function reject(value) {
	  return Promise.reject(value);
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

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.configure = configure;

	var _utils = __webpack_require__(4);

	/**
	 * Usage:
	 *
	 * @configure({
	 *   idAttribute: '_id'
	 * })
	 * class User extends JSData.Resource {...}
	 */
	function configure() {
	  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	  return function (target) {
	    (0, _utils.forOwn)(props, function (value, key) {
	      target[key] = (0, _utils.copy)(value);
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
	exports.schema = schema;

	var _utils = __webpack_require__(4);

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
	    (0, _utils.forOwn)(opts, function (prop, key) {
	      var descriptor = {
	        enumerable: prop.enumerable !== undefined ? prop.enumerable : true,
	        writable: prop.writable ? prop.writable : true,
	        configurable: prop.configurable ? prop.configurable : false
	      };
	      if (prop.get) {
	        descriptor.writable = false;
	        descriptor.get = prop.get;
	      }
	      if (prop.set) {
	        descriptor.writable = false;
	        descriptor.set = prop.set;
	      }
	      Object.defineProperty(target.prototype, key, descriptor);
	    });
	    return target;
	  };
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Resource = exports.belongsTo = undefined;

	var _utils = __webpack_require__(4);

	var utils = _interopRequireWildcard(_utils);

	var _decorators = __webpack_require__(2);

	var _mindex = __webpack_require__(8);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var isBrowser = false;

	try {
	  isBrowser = !!window;
	} catch (e) {}

	/**
	 * Usage:
	 *
	 * @belongsTo(User, {
	 *   localKey: 'myUserId'
	 * })
	 * class Post extends JSData.Resource {...}
	 *
	 * @belongsTo(User)
	 * @belongsTo(Post, {
	 *   localField: '_post'
	 * })
	 * class Comment extends JSData.Resource {...}
	 */
	function _belongsTo(relation) {
	  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	  return function (target) {
	    var localField = opts.localField || relation.name.toLowerCase();
	    var localKey = opts.localKey || relation.name.toLowerCase() + '_id';
	    var descriptor = {
	      enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
	      get: function get() {
	        return relation.get(this[localKey]);
	      },
	      set: function set(parent) {
	        this[localKey] = parent[relation.idAttribute];
	      }
	    };
	    if (opts.link === false || opts.link === undefined && !target.linkRelations) {
	      delete descriptor.get;
	      delete descriptor.set;
	    }
	    if (opts.get) {
	      (function () {
	        var originalGet = descriptor.get;
	        descriptor.get = function () {
	          var _this = this;

	          return opts.get(target, relation, this, originalGet ? function () {
	            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	              args[_key] = arguments[_key];
	            }

	            return originalGet.apply(_this, args);
	          } : undefined);
	        };
	      })();
	    }
	    if (opts.set) {
	      (function () {
	        var originalSet = descriptor.set;
	        descriptor.set = function (parent) {
	          var _this2 = this;

	          return opts.set(target, relation, this, parent, originalSet ? function () {
	            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	              args[_key2] = arguments[_key2];
	            }

	            return originalSet.apply(_this2, args);
	          } : undefined);
	        };
	      })();
	    }
	    Object.defineProperty(target.prototype, localField, descriptor);
	    return target;
	  };
	}

	exports.belongsTo = _belongsTo;
	function basicIndex(target) {
	  target.$$index = {};
	  target.$$collection = [];
	  console.log(_mindex.Index);
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

	    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(Resource).call(this));

	    (0, _decorators.configure)(props)(_this3);
	    return _this3;
	  }

	  // Static methods

	  _createClass(Resource, null, [{
	    key: 'createInstance',
	    value: function createInstance() {
	      var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	      var Constructor = this;
	      return props instanceof Constructor ? props : new Constructor(props);
	    }
	  }, {
	    key: 'inject',
	    value: function inject(props) {
	      var singular = false;
	      if (utils.isArray(props)) {
	        props = props.map(this.createInstance);
	      } else {
	        singular = true;
	        props = [this.createInstance(props)];
	      }
	      var instances = props.map(function (instance) {
	        var id = instance[this.idAttribute];
	        if (!this.$$index[id]) {
	          this.$$collection.push(instance);
	        }
	        this.$$index[id] = instance;
	        return instance;
	      }, this);
	      return singular ? instances[0] : instances;
	    }
	  }, {
	    key: 'get',
	    value: function get(id) {
	      return this.$$index[id];
	    }

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
	      return _belongsTo(resource, opts)(this);
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
	    value: function extend() {
	      var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	      var classProps = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	      var Child = undefined;
	      var Parent = this;

	      if (classProps.csp) {
	        Child = function (props) {
	          _classCallCheck(this, Child);
	          Parent.call(this, props);
	        };
	      } else {
	        // TODO: PascalCase(classProps.name)
	        var name = classProps.name;
	        var func = 'return function ' + name + '(props) {\n                    _classCallCheck(this, ' + name + ')\n                    Parent.call(this, props)\n                  }';
	        Child = new Function('_classCallCheck', 'Parent', func)(_classCallCheck, Parent); // eslint-disable-line
	      }

	      _inherits(Child, this);

	      (0, _decorators.configure)(props)(Child.prototype);
	      (0, _decorators.configure)(classProps)(Child);

	      return Child;
	    }
	  }]);

	  return Resource;
	})(BaseResource);

	basicIndex(Resource);
	(0, _decorators.configure)({
	  autoInject: isBrowser,
	  bypassCache: false,
	  csp: false,
	  defaultAdapter: 'http',
	  eagerEject: false,
	  idAttribute: 'id',
	  linkRelations: isBrowser,
	  relationsEnumerable: false,
	  returnMeta: false,
	  strategy: 'single',
	  useFilter: true
	})(Resource);

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); // Copyright (c) 2015, InternalFX.

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

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Index = undefined;

	var _utils = __webpack_require__(4);

	var _utils2 = __webpack_require__(9);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Index = (function () {
	  function Index() {
	    var fieldList = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
	    var idAttribute = arguments[1];

	    _classCallCheck(this, Index);

	    if (!(0, _utils.isArray)(fieldList)) {
	      throw new Error('fieldList must be an array.');
	    }

	    this.fieldList = fieldList;
	    this.idAttribute = idAttribute;
	    this.isIndex = true;
	    this.keys = [];
	    this.values = [];
	  }

	  _createClass(Index, [{
	    key: 'set',
	    value: function set(keyList, value) {
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
	          var newIndex = new Index();
	          newIndex.set(keyList, value);
	          (0, _utils2.insertAt)(this.values, pos.index, newIndex);
	        }
	      }
	    }
	  }, {
	    key: 'get',
	    value: function get(keyList) {
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
	    }
	  }, {
	    key: 'getAll',
	    value: function getAll() {
	      var results = [];
	      this.values.forEach(function (value) {
	        if (value.isIndex) {
	          results = results.concat(value.getAll());
	        } else {
	          results = results.concat(value);
	        }
	      });
	      return results;
	    }
	  }, {
	    key: 'query',
	    value: function query(_query) {
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
	    }
	  }, {
	    key: 'between',
	    value: function between(leftKeys, rightKeys) {
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
	    }
	  }, {
	    key: '_between',
	    value: function _between(leftKeys, rightKeys, opts) {
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
	    }
	  }, {
	    key: 'remove',
	    value: function remove(keyList, value) {
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
	    }
	  }, {
	    key: 'clear',
	    value: function clear() {
	      this.keys = [];
	      this.values = [];
	    }
	  }, {
	    key: 'insertRecord',
	    value: function insertRecord(data) {
	      var keyList = this.fieldList.map(function (field) {
	        return data[field] || null;
	      });

	      this.set(keyList, data);
	    }
	  }, {
	    key: 'removeRecord',
	    value: function removeRecord(data) {
	      var keyList = this.fieldList.map(function (field) {
	        return data[field] || null;
	      });

	      this.remove(keyList, data);
	    }
	  }, {
	    key: 'updateRecord',
	    value: function updateRecord(data) {
	      this.removeRecord(data);
	      this.insertRecord(data);
	    }
	  }]);

	  return Index;
	})();

	exports.Index = Index;

/***/ },
/* 9 */
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

/***/ }
/******/ ])
});
;