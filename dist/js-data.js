/*!
* js-data
* @version 3.0.0-alpha.11 - Homepage <http://www.js-data.io/>
* @author Jason Dobry <jason.dobry@gmail.com>
* @copyright (c) 2014-2015 Jason Dobry
* @license MIT <https://github.com/js-data/js-data/blob/master/LICENSE>
*
* @overview Robust framework-agnostic data store.
*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.JSData = {})));
}(this, function (exports) { 'use strict';

  var babelHelpers = {};
  babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  babelHelpers.defineProperty = function (obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  };

  babelHelpers;

  /**
   * @module utils
   * @memberof module:js-data
   */

  var INFINITY = 1 / 0;
  var MAX_INTEGER = 1.7976931348623157e+308;
  var BOOL_TAG = '[object Boolean]';
  var DATE_TAG = '[object Date]';
  var FUNC_TAG = '[object Function]';
  var NUMBER_TAG = '[object Number]';
  var OBJECT_TAG = '[object Object]';
  var REGEXP_TAG = '[object RegExp]';
  var STRING_TAG = '[object String]';
  var objToString = Object.prototype.toString;
  var isBrowser = undefined;

  /**
   * Attempt to detect whether we are in the browser.
   */
  try {
    isBrowser = !!window;
  } catch (e) {
    isBrowser = false;
  }

  var toString = function toString(value) {
    return objToString.call(value);
  };
  var toInteger = function toInteger(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = +value;
    if (value === INFINITY || value === -INFINITY) {
      var sign = value < 0 ? -1 : 1;
      return sign * MAX_INTEGER;
    }
    var remainder = value % 1;
    return value === value ? remainder ? value - remainder : value : 0;
  };

  /**
   * Return whether the provided value is an array.
   * @method
   * @param {*} [value] - The value to test.
   */
  var isArray = Array.isArray;
  /**
   * Return whether the provided value is an object type.
   * @param {*} [value] - The value to test.
   */
  function isObject(value) {
    return toString(value) === OBJECT_TAG;
  }
  function isPlainObject(value) {
    return !!value && (typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object' && value.constructor === Object;
  }
  /**
   * Return whether the provided value is a regular expression type.
   * @param {*} [value] - The value to test.
   */
  function isRegExp(value) {
    return toString(value) === REGEXP_TAG;
  }
  /**
   * Return whether the provided value is a string type.
   * @param {*} [value] - The value to test.
   */
  var isString = function isString(value) {
    return typeof value === 'string' || value && (typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object' && toString(value) === STRING_TAG;
  };
  /**
   * Return whether the provided value is null.
   * @param {*} [value] - The value to test.
   */
  var isNull = function isNull(value) {
    return value === null;
  };
  /**
   * Return whether the provided value is undefined.
   * @param {*} [value] - The value to test.
   */
  var isUndefined = function isUndefined(value) {
    return value === undefined;
  };
  /**
   * Return whether the provided value is a date type.
   * @param {*} [value] - The value to test.
   */
  var isDate = function isDate(value) {
    return value && (typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === 'object' && toString(value) === DATE_TAG;
  };
  /**
   * Return whether the provided value is a number type.
   * @param {*} [value] - The value to test.
   */
  var isNumber = function isNumber(value) {
    var type = typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value);
    return type === 'number' || value && type === 'object' && toString(value) === NUMBER_TAG;
  };
  /**
   * Return whether the provided value is an integer.
   * @param {*} [value] - The value to test.
   */
  var isInteger = function isInteger(value) {
    return toString(value) === NUMBER_TAG && value == toInteger(value);
  };
  /**
   * Return whether the provided value is a boolean type.
   * @param {*} [value] - The value to test.
   */
  function isBoolean(value) {
    return toString(value) === BOOL_TAG;
  }
  /**
   * Return whether the provided value is a function.
   * @param {*} [value] - The value to test.
   */
  function isFunction(value) {
    return typeof value === 'function' || value && toString(value) === FUNC_TAG;
  }
  /**
   * Return whether the provided value is a string or a number.
   * @param {*} [value] - The value to test.
   */
  function isSorN(value) {
    return isString(value) || isNumber(value);
  }
  /**
   * Get the value at the provided key or path.
   * @param {Object} object - The object from which to retrieve a property.
   * @param {string} prop - The key or path to the property.
   */
  function get(object, prop) {
    if (!prop) {
      return;
    }
    var parts = prop.split('.');
    var last = parts.pop();

    while (prop = parts.shift()) {
      // eslint-disable-line
      object = object[prop];
      if (object == null) return;
    }

    return object[last];
  }
  /**
   * Unset the value at the provided key or path.
   * @param {Object} object - The object on which to unset a property.
   * @param {string} prop - The key or path to the property.
   */
  function unset(object, prop) {
    var parts = prop.split('.');
    var last = parts.pop();

    while (prop = parts.shift()) {
      // eslint-disable-line
      object = object[prop];
      if (object == null) return;
    }

    object[last] = undefined;
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
  /**
   * Set the value at the provided key or path.
   * @param {Object} object - The object on which to set a property.
   * @param {(string|Object)} path - The key or path to the property. Can also
   * pass in an object of path/value pairs, which will all be set on the target
   * object.
   * @param {*} [value] - The value to set.
   */
  function set(object, path, value) {
    if (isObject(path)) {
      forOwn(path, function (value, _path) {
        set(object, _path, value);
      });
    } else {
      var parts = PATH.exec(path);
      if (parts) {
        mkdirP(object, parts[1])[parts[2]] = value;
      } else {
        object[path] = value;
      }
    }
  }
  /**
   * Iterate over an object's own enumerable properties.
   * @param {Object} object - The object whose properties are to be enumerated.
   * @param {Function} fn - Iteration function.
   * @param {Object} [thisArg] - Content to which to bind `fn`.
   */
  function forOwn(obj, fn, thisArg) {
    var keys = Object.keys(obj);
    var len = keys.length;
    var i = undefined;
    for (i = 0; i < len; i++) {
      fn.call(thisArg, obj[keys[i]], keys[i], obj);
    }
  }
  /**
   * Recursively shallow copy own enumberable properties from `source` to `dest`.
   * @param {Object} dest - The destination object.
   * @param {Object} source - The source object.
   */
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
  /**
   * Proxy for `Promise.resolve`.
   * @param {*} [value] - Value with which to resolve the Promise.
   * @return {Promise} Promise resolved with `value`.
   */
  function resolve$1(value) {
    return Promise.resolve(value);
  }
  /**
   * Proxy for `Promise.reject`.
   * @param {*} [value] - Value with which to reject the Promise.
   * @return {Promise} Promise reject with `value`.
   */
  function reject(value) {
    return Promise.reject(value);
  }
  /**
   * Shallow copy own enumerable non-function properties from `Model` to `opts`.
   * @param {Model} Model - The source Model.
   * @param {Object} opts - The target object.
   */
  function _(Model, opts) {
    for (var key in Model) {
      var value = Model[key];
      if (opts[key] === undefined && !isFunction(value) && key && key.indexOf('_') !== 0) {
        opts[key] = value;
      }
    }
  }
  /**
   * Return the intersection of two arrays.
   * @param {Array} array1 - First array.
   * @param {Array} array2 - Second array.
   * @return {Array} Array of elements common to both arrays.
   */
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
  /**
   * Shallow copy own enumerable properties from `src` to `dest` that are on `src`
   * but are missing from `dest.
   * @param {Object} dest - The destination object.
   * @param {Object} source - The source object.
   */
  function fillIn(dest, src) {
    forOwn(src, function (value, key) {
      if (!dest.hasOwnProperty(key) || dest[key] === undefined) {
        dest[key] = value;
      }
    });
  }
  /**
   * Return whether `prop` is matched by any string or regular expression in `bl`.
   * @param {string} prop - The name of a property.
   * @param {Array} bl - Array of strings and regular expressions.
   * @return {boolean} Whether `prop` was matched.
   */
  function isBlacklisted(prop, bl) {
    if (!bl || !bl.length) {
      return false;
    }
    var matches = undefined;
    for (var i = 0; i < bl.length; i++) {
      if (toString(bl[i]) === '[object RegExp]' && bl[i].test(prop) || bl[i] === prop) {
        matches = prop;
        return matches;
      }
    }
    return !!matches;
  }
  /**
   * Proxy for `JSON.parse`.
   * @param {string} json - JSON to parse.
   * @return {Object} Parsed object.
   */
  function fromJson(json) {
    return isString(json) ? JSON.parse(json) : json;
  }
  /**
   * Proxy for `JSON.stringify`.
   * @method
   * @param {*} value - Value to serialize to JSON.
   * @return {string} JSON string.
   */
  var toJson = JSON.stringify;
  /**
   * Deep copy a value.
   * @param {*} from - Value to deep copy.
   * @return {*} Deep copy of `from`.
   */
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
  /**
   * Convert a string to pascalcase.
   * @param {string} str - String to convert.
   * @return {string} Converted string.
   */
  function pascalCase(str) {
    return str.split(SPLIT).map(mapToPascal).join('');
  }
  /**
   * Convert a string to camelcase.
   * @param {string} str - String to convert.
   * @return {string} Converted string.
   */
  function camelCase(str) {
    str = pascalCase(str);
    if (str) {
      return str.charAt(0).toLowerCase() + str.slice(1);
    }
    return str;
  }
  /**
   * Add eventing capabilities into the target object.
   * @param {Object} target - Target object.
   * @param {Function} [getter] - Custom getter for retrieving the object's event
   * listeners.
   * @param {Function} [setter] - Custom setter for setting the object's event
   * listeners.
   */
  function eventify(target, getter, setter, enumerable) {
    target = target || this;
    var _events = {};
    if (!getter && !setter) {
      getter = function getter() {
        return _events;
      };
      setter = function setter(value) {
        _events = value;
      };
    }
    Object.defineProperties(target, {
      on: {
        enumerable: !!enumerable,
        value: function value(type, func, ctx) {
          if (!getter.call(this)) {
            setter.call(this, {});
          }
          var events = getter.call(this);
          events[type] = events[type] || [];
          events[type].push({
            f: func,
            c: ctx
          });
        }
      },
      off: {
        enumerable: !!enumerable,
        value: function value(type, func) {
          var events = getter.call(this);
          var listeners = events[type];
          if (!listeners) {
            setter.call(this, {});
          } else if (func) {
            for (var i = 0; i < listeners.length; i++) {
              if (listeners[i].f === func) {
                listeners.splice(i, 1);
                break;
              }
            }
          } else {
            listeners.splice(0, listeners.length);
          }
        }
      },
      emit: {
        enumerable: !!enumerable,
        value: function value() {
          var events = getter.call(this) || {};

          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          var type = args.shift();
          var listeners = events[type] || [];
          var i = undefined;
          for (i = 0; i < listeners.length; i++) {
            listeners[i].f.apply(listeners[i].c, args);
          }
          listeners = events.all || [];
          args.unshift(type);
          for (i = 0; i < listeners.length; i++) {
            listeners[i].f.apply(listeners[i].c, args);
          }
        }
      }
    });
  }

  /*eslint-disable*/
  // RiveraGroup/node-tiny-uuid
  // DO WTF YOU WANT TO PUBLIC LICENSE
  function uuid(a, b) {
    for (b = a = ''; // b - result , a - numeric variable
    a++ < 36; b += a * 51 & 52 // if "a" is not 9 or 14 or 19 or 24
    ? //  return a random number or 4
    (a ^ 15 // if "a" is not 15
    ? // genetate a random number from 0 to 15
    8 ^ Math.random() * (a ^ 20 ? 16 : 4) // unless "a" is 20, in which case a random number from 8 to 11
    : 4 //  otherwise 4
    ).toString(16) : '-' //  in other cases (if "a" is 9,14,19,24) insert "-"
    ) {}
    return b;
  }
  /*eslint-enable*/

  var classCallCheck = function classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function');
    }
  };

  var possibleConstructorReturn = function possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }

    return call && ((typeof call === 'undefined' ? 'undefined' : babelHelpers.typeof(call)) === 'object' || typeof call === 'function') ? call : self;
  };

  var addHiddenPropsToTarget = function addHiddenPropsToTarget(target, props) {
    forOwn(props, function (value, key) {
      props[key] = {
        value: value
      };
    });
    Object.defineProperties(target, props);
  };

  var extend = function extend(props, classProps) {
    var SuperClass = this;
    var _SubClass = undefined;

    props || (props = {});
    classProps || (classProps = {});

    if (props.hasOwnProperty('constructor')) {
      _SubClass = props.constructor;
      delete props.constructor;
    } else {
      _SubClass = function SubClass() {
        classCallCheck(this, _SubClass);

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        var _this = possibleConstructorReturn(this, (_SubClass.__super__ || Object.getPrototypeOf(_SubClass)).apply(this, args));
        return _this;
      };
    }

    _SubClass.prototype = Object.create(SuperClass && SuperClass.prototype, {
      constructor: {
        value: _SubClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });

    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(_SubClass, SuperClass);
    } else if (classProps.strictEs6Class) {
      _SubClass.__proto__ = SuperClass; // eslint-disable-line
    } else {
        forOwn(SuperClass, function (value, key) {
          _SubClass[key] = value;
        });
      }
    Object.defineProperty(_SubClass, '__super__', {
      configurable: true,
      value: SuperClass
    });

    addHiddenPropsToTarget(_SubClass.prototype, props);
    fillIn(_SubClass, classProps);

    return _SubClass;
  };

  var getSuper = function getSuper(instance) {
    var Ctor = instance.constructor;
    return Ctor.__super__ || Object.getPrototypeOf(Ctor) || Ctor.__proto__;
  };

var utils = Object.freeze({
    get isBrowser () { return isBrowser; },
    isArray: isArray,
    isObject: isObject,
    isRegExp: isRegExp,
    isString: isString,
    isNull: isNull,
    isUndefined: isUndefined,
    isDate: isDate,
    isNumber: isNumber,
    isInteger: isInteger,
    isBoolean: isBoolean,
    isFunction: isFunction,
    isSorN: isSorN,
    get: get,
    unset: unset,
    set: set,
    forOwn: forOwn,
    deepMixIn: deepMixIn,
    resolve: resolve$1,
    reject: reject,
    _: _,
    intersection: intersection,
    fillIn: fillIn,
    isBlacklisted: isBlacklisted,
    fromJson: fromJson,
    toJson: toJson,
    copy: copy,
    pascalCase: pascalCase,
    camelCase: camelCase,
    eventify: eventify,
    uuid: uuid,
    classCallCheck: classCallCheck,
    possibleConstructorReturn: possibleConstructorReturn,
    addHiddenPropsToTarget: addHiddenPropsToTarget,
    extend: extend,
    getSuper: getSuper
  });

  /**
   * A class used by the @{link Collection} class to build queries to be executed
   * against the collection's data. An instance of `Query` is returned by
   * {@link Model.query} and {@link Collection.query}.
   * @class Query
   * @param {Collection} collection - The collection on which this query operates.
   */
  function Query(collection) {
    classCallCheck(this, Query);

    /**
     * The collection on which this query operates.
     * @type {Collection}
     */
    this.collection = collection;
    /**
     * The data result of this query.
     * @type {Array}
     */
    this.data = null;
  }

  Query.extend = extend;

  var reserved = {
    skip: '',
    offset: '',
    where: '',
    limit: '',
    orderBy: '',
    sort: ''
  };

  var escapeRegExp = /([.*+?^=!:${}()|[\]\/\\])/g;
  var percentRegExp = /%/g;
  var underscoreRegExp = /_/g;

  function escape(pattern) {
    return pattern.replace(escapeRegExp, '\\$1');
  }

  Query.ops = {
    '==': function _(value, predicate) {
      return value == predicate; // eslint-disable-line
    },
    '===': function _(value, predicate) {
      return value === predicate;
    },
    '!=': function _(value, predicate) {
      return value != predicate; // eslint-disable-line
    },
    '!==': function _(value, predicate) {
      return value !== predicate;
    },
    '>': function _(value, predicate) {
      return value > predicate;
    },
    '>=': function _(value, predicate) {
      return value >= predicate;
    },
    '<': function _(value, predicate) {
      return value < predicate;
    },
    '<=': function _(value, predicate) {
      return value <= predicate;
    },
    'isectEmpty': function isectEmpty(value, predicate) {
      return !intersection(value || [], predicate || []).length;
    },
    'isectNotEmpty': function isectNotEmpty(value, predicate) {
      return intersection(value || [], predicate || []).length;
    },
    'in': function _in(value, predicate) {
      return predicate.indexOf(value) !== -1;
    },
    'notIn': function notIn(value, predicate) {
      return predicate.indexOf(value) === -1;
    },
    'contains': function contains(value, predicate) {
      return (value || []).indexOf(predicate) !== -1;
    },
    'notContains': function notContains(value, predicate) {
      return (value || []).indexOf(predicate) === -1;
    }
  };

  addHiddenPropsToTarget(Query.prototype, {
    compare: function compare(orderBy, index, a, b) {
      var def = orderBy[index];
      var cA = get(a, def[0]);
      var cB = get(b, def[0]);
      if (cA && isString(cA)) {
        cA = cA.toUpperCase();
      }
      if (cB && isString(cB)) {
        cB = cB.toUpperCase();
      }
      a || (a = null);
      b || (b = null);
      if (def[1] === 'DESC') {
        if (cB < cA) {
          return -1;
        } else if (cB > cA) {
          return 1;
        } else {
          if (index < orderBy.length - 1) {
            return this.compare(orderBy, index + 1, a, b);
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
            return this.compare(orderBy, index + 1, a, b);
          } else {
            return 0;
          }
        }
      }
    },
    evaluate: function evaluate(value, op, predicate) {
      if (Query.ops[op]) {
        return Query.ops[op](value, predicate);
      }
      if (op.indexOf('like') === 0) {
        return this.like(predicate, op.substr(4)).exec(value) !== null;
      } else if (op.indexOf('notLike') === 0) {
        return this.like(predicate, op.substr(7)).exec(value) === null;
      }
    },
    like: function like(pattern, flags) {
      return new RegExp('^' + escape(pattern).replace(percentRegExp, '.*').replace(underscoreRegExp, '.') + '$', flags);
    },

    /**
     * Return the current data result of this query.
     * @memberof Query
     * @instance
     * @return {Array} The data in this query.
     */
    getData: function getData() {
      if (!this.data) {
        this.data = this.collection.index.getAll();
      }
      return this.data;
    },

    /**
     * Find all entities between two boundaries.
     *
     * Get the users ages 18 to 30
     * ```js
     * const users = query.between(18, 30, { index: 'age' }).run()
     * ```
     * Same as above
     * ```js
     * const users = query.between([18], [30], { index: 'age' }).run()
     * ```
     *
     * @memberof Query
     * @instance
     * @param {Array} leftKeys - Keys defining the left boundary.
     * @param {Array} rightKeys - Keys defining the right boundary.
     * @param {Object} [opts] - Configuration options.
     * @param {string} [opts.index] - Name of the secondary index to use in the
     * query. If no index is specified, the main index is used.
     * @param {boolean} [opts.leftInclusive=true] - Whether to include entities
     * on the left boundary.
     * @param {boolean} [opts.rightInclusive=false] - Whether to include entities
     * on the left boundary.
     * @param {boolean} [opts.limit] - Limit the result to a certain number.
     * @param {boolean} [opts.offset] - The number of resulting entities to skip.
     * @return {Query} A reference to itself for chaining.
     */
    between: function between(leftKeys, rightKeys, opts) {
      opts || (opts = {});
      var collection = this.collection;
      var index = opts.index ? collection.indexes[opts.index] : collection.index;
      if (this.data) {
        throw new Error('Cannot access index after first operation!');
      }
      this.data = index.between(leftKeys, rightKeys, opts);
      return this;
    },

    /**
     * Find the entity or entities that match the provided key.
     *
     * #### Example
     *
     * Get the entity whose primary key is 25
     * ```js
     * const entities = query.get(25).run()
     * ```
     * Same as above
     * ```js
     * const entities = query.get([25]).run()
     * ```
     * Get all users who are active and have the "admin" role
     * ```js
     * const activeAdmins = query.get(['active', 'admin'], {
     *   index: 'activityAndRoles'
     * }).run()
     * ```
     * Get all entities that match a certain weather condition
     * ```js
     * const niceDays = query.get(['sunny', 'humid', 'calm'], {
     *   index: 'weatherConditions'
     * }).run()
     * ```
     *
     * @memberof Query
     * @instance
     * @param {Array} keyList - Key(s) defining the entity to retrieve. If
     * `keyList` is not an array (i.e. for a single-value key), it will be
     * wrapped in an array.
     * @param {Object} [opts] - Configuration options.
     * @param {string} [opts.string] - Name of the secondary index to use in the
     * query. If no index is specified, the main index is used.
     * @return {Query} A reference to itself for chaining.
     */
    get: function get() {
      var keyList = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var opts = arguments[1];

      opts || (opts = {});
      if (this.data) {
        throw new Error('Cannot access index after first operation!');
      }
      if (keyList && !isArray(keyList)) {
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

    /**
     * Find the entity or entities that match the provided keyLists.
     *
     * #### Example
     *
     * Get the posts where "status" is "draft" or "inReview"
     * ```js
     * const posts = query.getAll('draft', 'inReview', { index: 'status' }).run()
     * ```
     * Same as above
     * ```js
     * const posts = query.getAll(['draft'], ['inReview'], { index: 'status' }).run()
     * ```
     *
     * @memberof Query
     * @instance
     * @param {...Array} [keyList] - Provide one or more keyLists, and all
     * entities matching each keyList will be retrieved. If no keyLists are
     * provided, all entities will be returned.
     * @param {Object} [opts] - Configuration options.
     * @param {string} [opts.index] - Name of the secondary index to use in the
     * query. If no index is specified, the main index is used.
     * @return {Query} A reference to itself for chaining.
     */
    getAll: function getAll() {
      var _this = this;

      var opts = {};
      if (this.data) {
        throw new Error('Cannot access index after first operation!');
      }

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (!args.length || args.length === 1 && isObject(args[0])) {
        this.getData();
        return this;
      } else if (args.length && isObject(args[args.length - 1])) {
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

    /**
     * Find the entity or entities that match the provided query or pass the
     * provided filter function.
     *
     * #### Example
     *
     * Get the draft posts created less than three months
     * ```js
     * const posts = query.filter({
     *   where: {
     *     status: {
     *       '==': 'draft'
     *     },
     *     created_at_timestamp: {
     *       '>=': (new Date().getTime() - (1000 * 60 * 60 * 24 * 30 * 3)) // 3 months ago
     *     }
     *   }
     * }).run()
     * ```
     * Use a custom filter function
     * ```js
     * const posts = query.filter(function (post) {
     *   return post.isReady()
     * }).run()
     * ```
     *
     * @memberof Query
     * @instance
     * @param {(Object|Function)} [queryOrFn={}] - Selection query or filter
     * function.
     * @param {Function} [thisArg] - Context to which to bind `queryOrFn` if
     * `queryOrFn` is a function.
     * @return {Query} A reference to itself for chaining.
     */
    filter: function filter(query, thisArg) {
      var self = this;
      query || (query = {});
      self.getData();
      if (isObject(query)) {
        (function () {
          var where = {};
          // Filter
          if (isObject(query.where)) {
            where = query.where;
          }
          forOwn(query, function (value, key) {
            if (!(key in reserved) && !(key in where)) {
              where[key] = {
                '==': value
              };
            }
          });

          var fields = [];
          var ops = [];
          var predicates = [];
          forOwn(where, function (clause, field) {
            if (!isObject(clause)) {
              clause = {
                '==': clause
              };
            }
            forOwn(clause, function (expr, op) {
              fields.push(field);
              ops.push(op);
              predicates.push(expr);
            });
          });
          if (fields.length) {
            (function () {
              var i = undefined;
              var len = fields.length;
              self.data = self.data.filter(function (item) {
                var first = true;
                var keep = true;

                for (i = 0; i < len; i++) {
                  var op = ops[i];
                  var isOr = op.charAt(0) === '|';
                  op = isOr ? op.substr(1) : op;
                  var expr = self.evaluate(get(item, fields[i]), op, predicates[i]);
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
          var orderBy = query.orderBy || query.sort;

          if (isString(orderBy)) {
            orderBy = [[orderBy, 'ASC']];
          }
          if (!isArray(orderBy)) {
            orderBy = null;
          }

          // Apply 'orderBy'
          if (orderBy) {
            (function () {
              var index = 0;
              orderBy.forEach(function (def, i) {
                if (isString(def)) {
                  orderBy[i] = [def, 'ASC'];
                }
              });
              self.data.sort(function (a, b) {
                return self.compare(orderBy, index, a, b);
              });
            })();
          }

          // Skip
          if (isNumber(query.skip)) {
            self.skip(query.skip);
          } else if (isNumber(query.offset)) {
            self.skip(query.offset);
          }
          // Limit
          if (isNumber(query.limit)) {
            self.limit(query.limit);
          }
        })();
      } else if (isFunction(query)) {
        self.data = self.data.filter(query, thisArg);
      }
      return self;
    },

    /**
     * Skip a number of results.
     *
     * #### Example
     *
     * Get all but the first 10 draft posts
     * ```js
     * const posts = query.get('draft', { index: 'status' }).skip(10).run()
     * ```
     *
     * @memberof Query
     * @instance
     * @param {number} num - The number of entities to skip.
     * @return {Query} A reference to itself for chaining.
     */
    skip: function skip(num) {
      if (!isNumber(num)) {
        throw new TypeError('skip: Expected number but found ' + (typeof num === 'undefined' ? 'undefined' : babelHelpers.typeof(num)) + '!');
      }
      var data = this.getData();
      if (num < data.length) {
        this.data = data.slice(num);
      } else {
        this.data = [];
      }
      return this;
    },

    /**
     * Limit the result.
     *
     * #### Example
     *
     * Get only the first 10 draft posts
     * ```js
     * const posts = query.get('draft', { index: 'status' }).limit(10).run()
     * ```
     *
     * @memberof Query
     * @instance
     * @param {number} num - The maximum number of entities to keep in the result.
     * @return {Query} A reference to itself for chaining.
     */
    limit: function limit(num) {
      if (!isNumber(num)) {
        throw new TypeError('limit: Expected number but found ' + (typeof num === 'undefined' ? 'undefined' : babelHelpers.typeof(num)) + '!');
      }
      var data = this.getData();
      this.data = data.slice(0, Math.min(data.length, num));
      return this;
    },

    /**
     * Iterate over all entities.
     *
     * @memberof Query
     * @instance
     * @param {Function} forEachFn - Iteration function.
     * @param {*} [thisArg] - Context to which to bind `forEachFn`.
     * @return {Query} A reference to itself for chaining.
     */
    forEach: function forEach(forEachFn, thisArg) {
      this.getData().forEach(forEachFn, thisArg);
      return this;
    },

    /**
     * Apply a mapping function to the result data.
     *
     * @memberof Query
     * @instance
     * @param {Function} mapFn - Mapping function.
     * @param {*} [thisArg] - Context to which to bind `mapFn`.
     * @return {Query} A reference to itself for chaining.
     */
    map: function map(mapFn, thisArg) {
      this.data = this.getData().map(mapFn, thisArg);
      return this;
    },

    /**
     * Return the result of calling the specified function on each item in this
     * collection's main index.
     * @memberof Query
     * @instance
     * @param {string} funcName - Name of function to call
     * @parama {...*} [args] - Remaining arguments to be passed to the function.
     * @return {Query} A reference to itself for chaining.
     */
    mapCall: function mapCall(funcName) {
      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      this.data = this.getData().map(function (item) {
        return item[funcName].apply(item, args);
      });
      return this;
    },

    /**
     * Complete the execution of the query and return the resulting data.
     *
     * @memberof Query
     * @instance
     * @return {Array} The result of executing this query.
     */
    run: function run() {
      var data = this.data;
      this.data = null;
      return data;
    }
  });

  function sort(a, b, hashCode) {
    // Short-curcuit comparison if a and b are strictly equal
    // This is absolutely necessary for indexed objects that
    // don't have the idAttribute field
    if (a === b) {
      return 0;
    }
    if (hashCode) {
      a = hashCode(a);
      b = hashCode(b);
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

  var blacklist = { '>': 1, '>=': 1, '<': 1, '<=': 1 };

  function Index(fieldList, opts) {
    classCallCheck(this, Index);
    fieldList || (fieldList = []);

    if (!isArray(fieldList)) {
      throw new Error('fieldList must be an array.');
    }

    opts || (opts = {});
    this.fieldList = fieldList;
    this.fieldGetter = opts.fieldGetter;
    this.hashCode = opts.hashCode;
    this.isIndex = true;
    this.keys = [];
    this.values = [];
  }

  addHiddenPropsToTarget(Index.prototype, {
    set: function set(keyList, value) {
      if (!isArray(keyList)) {
        keyList = [keyList];
      }

      var key = keyList.shift() || null;
      var pos = binarySearch(this.keys, key);

      if (keyList.length === 0) {
        if (pos.found) {
          var dataLocation = binarySearch(this.values[pos.index], value, this.hashCode);
          if (!dataLocation.found) {
            insertAt(this.values[pos.index], dataLocation.index, value);
          }
        } else {
          insertAt(this.keys, pos.index, key);
          insertAt(this.values, pos.index, [value]);
        }
      } else {
        if (pos.found) {
          this.values[pos.index].set(keyList, value);
        } else {
          insertAt(this.keys, pos.index, key);
          var newIndex = new Index([], { hashCode: this.hashCode });
          newIndex.set(keyList, value);
          insertAt(this.values, pos.index, newIndex);
        }
      }
    },
    get: function get(keyList) {
      if (!isArray(keyList)) {
        keyList = [keyList];
      }

      var key = keyList.shift() || null;
      var pos = binarySearch(this.keys, key);

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

      var _opts = {};
      forOwn(_query, function (value, key) {
        if (!blacklist[key]) {
          _opts[key] = value;
        }
      });
      return this.between(leftKeys, rightKeys, _opts);
    },
    between: function between(leftKeys, rightKeys) {
      var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      if (!isArray(leftKeys)) {
        leftKeys = [leftKeys];
      }
      if (!isArray(rightKeys)) {
        rightKeys = [rightKeys];
      }
      fillIn(opts, {
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
        pos = binarySearch(this.keys, leftKey);
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
              results = results.concat(this.values[i]._between(copy(leftKeys), rightKeys.map(function () {
                return undefined;
              }), opts));
            } else if (currKey === rightKey) {
              results = results.concat(this.values[i]._between(leftKeys.map(function () {
                return undefined;
              }), copy(rightKeys), opts));
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
    peek: function peek() {
      if (this.values.length) {
        if (this.values[0].isIndex) {
          return this.values[0].peek();
        } else {
          return this.values[0];
        }
      }
      return [];
    },
    remove: function remove(keyList, value) {
      if (!isArray(keyList)) {
        keyList = [keyList];
      }

      var key = keyList.shift();
      var pos = binarySearch(this.keys, key);

      if (keyList.length === 0) {
        if (pos.found) {
          var dataLocation = binarySearch(this.values[pos.index], value, this.hashCode);
          if (dataLocation.found) {
            removeAt(this.values[pos.index], dataLocation.index);
            if (this.values[pos.index].length === 0) {
              removeAt(this.keys, pos.index);
              removeAt(this.values, pos.index);
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
        if (isFunction(field)) {
          return field(data) || null;
        } else {
          return data[field] || null;
        }
      });
      this.set(keyList, data);
    },
    removeRecord: function removeRecord(data) {
      var _this = this;

      var removed = undefined;
      this.values.forEach(function (value, i) {
        if (value.isIndex) {
          if (value.removeRecord(data)) {
            if (value.keys.length === 0) {
              removeAt(_this.keys, i);
              removeAt(_this.values, i);
            }
            removed = true;
            return false;
          }
        } else {
          var dataLocation = binarySearch(value, data, _this.hashCode);
          if (dataLocation.found) {
            removeAt(value, dataLocation.index);
            if (value.length === 0) {
              removeAt(_this.keys, i);
              removeAt(_this.values, i);
            }
            removed = true;
            return false;
          }
        }
      });
      return removed ? data : undefined;
    },
    updateRecord: function updateRecord(data) {
      this.removeRecord(data);
      this.insertRecord(data);
    }
  });

  /**
   * An ordered set of records.
   *
   * ```javascript
   * import {Collection, Record} from 'js-data'
   * const record1 = new Record({ id: 1 })
   * const record2 = new Record({ id: 2 })
   * const UserCollection = new Collection([record1, record2])
   * UserCollection.get(1) === record1 // true
   * ```
   *
   * @class Collection
   * @param {Array} [records] Initial set of records to insert into the
   * collection.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.autoPk=false] TODO
   * @param {string} [opts.idAttribute] TODO
   * @param {string} [opts.onConflict=merge] TODO
   * @param {string} [opts.mapper] TODO
   * @param {Object} [opts.recordOpts={}] TODO
   */
  function Collection(records, opts) {
    var self = this;

    classCallCheck(self, Collection);

    if (isObject(records) && !isArray(records)) {
      opts = records;
      records = [];
    }

    // Default values for arguments
    records || (records = []);
    opts || (opts = {});

    fillIn(self, opts);

    /**
     * Event listeners attached to this Collection.
     *
     * @name Collection#_listeners
     * @instance
     * @type {Object}
     * @private
     */
    self._listeners = {};

    var idAttribute = self.recordId();

    /**
     * The main index, which uses @{link Collection#recordId} as the key.
     * @name Collection#index
     * @type {Index}
     */
    self.index = new Index([idAttribute], {
      hashCode: function hashCode(obj) {
        return get(obj, idAttribute);
      }
    });

    /**
     * Object that holds the secondary indexes of this collection.
     * @name Collection#indexes
     * @type {Object.<string, Index>}
     */
    self.indexes = {};

    /**
     * Object that holds the autoPks of records which needed ids to be generated.
     * @name Collection#autoPks
     * @type {Object.<number, Object>}
     */
    self.autoPks = {};

    records.forEach(function (record) {
      record = self.mapper ? self.mapper.createRecord(record) : record;
      self.index.insertRecord(record);
      if (record && isFunction(record.on)) {
        record.on('all', self._onRecordEvent, self);
      }
    });
  }

  Collection.extend = extend;

  /**
   * TODO
   *
   * @name Collection#on
   * @instance
   * @method
   * @param {string} event TODO.
   * @param {Function} handler TODO
   */

  /**
  * TODO
  *
  * @name Collection#off
  * @instance
  * @method
  * @param {string} [event] TODO.
  * @param {Function} [handler] TODO
  */

  /**
  * TODO
  *
  * @name Collection#emit
  * @instance
  * @method
  * @param {string} event TODO.
  * @param {...*} [arg] TODO
  */

  addHiddenPropsToTarget(Collection.prototype, {
    /**
     * Used to bind to events emitted by records in this Collection.
     *
     * @name Collection#_onRecordEvent
     * @method
     * @private
     * @param {...*} [arg] Args passed to {@link Collection#emit}.
     */

    _onRecordEvent: function _onRecordEvent() {
      this.emit.apply(this, arguments);
    },

    /**
     * Insert the provided record or records.
     *
     * If a record is already in the collection then the provided record will
     * either merge with or replace the existing record based on the value of the
     * `onConflict` option.
     *
     * The collection's secondary indexes will be updated as each record is
     * visited.
     *
     * @name Collection#add
     * @method
     * @param {(Object|Object[]|Record|Record[])} data The record or records to insert.
     * @param {Object} [opts] - Configuration options.
     * @param {boolean} [opts.autoPk={@link Collection.autoPk}] - Whether to
     * generate primary keys for the records to be inserted. Useful for inserting
     * temporary, unsaved data into the collection.
     * @param {string} [opts.onConflict] - What to do when a record is already in
     * the collection. Possible values are `merge` or `replace`.
     * @return {(Object|Object[]|Record|Record[])} The added record or records.
     */
    add: function add(records, opts) {
      var self = this;

      // Default values for arguments
      opts || (opts = {});

      // Fill in "opts" with the Collection's configuration
      _(self, opts);
      records = self.beforeAdd(records, opts) || records;

      // Track whether just one record or an array of records is being inserted
      var singular = false;
      var idAttribute = self.recordId();
      if (!isArray(records)) {
        records = [records];
        singular = true;
      }

      // Map the provided records to existing records.
      // New records will be inserted. If any records map to existing records,
      // they will be merged into the existing records according to the onConflict
      // option.
      records = records.map(function (record) {
        var id = self.recordId(record);
        // Track whether we had to generate an id for this record
        // Validate that the primary key attached to the record is a string or
        // number
        var autoPk = false;
        if (!isSorN(id)) {
          // No id found, generate one
          if (opts.autoPk) {
            id = uuid();
            set(record, idAttribute, id);
            autoPk = true;
          } else {
            // Not going to generate one, throw an error
            throw new TypeError(idAttribute + ': Expected string or number, found ' + (typeof id === 'undefined' ? 'undefined' : babelHelpers.typeof(id)) + '!');
          }
        }
        // Grab existing record if there is one
        var existing = self.get(id);
        // If the currently visited record is just a reference to an existing
        // record, then there is nothing to be done. Exit early.
        if (record === existing) {
          return existing;
        }

        if (existing) {
          // Here, the currently visited record corresponds to a record already
          // in the collection, so we need to merge them
          var onConflict = opts.onConflict || self.onConflict;
          if (onConflict === 'merge') {
            deepMixIn(existing, record);
          } else if (onConflict === 'replace') {
            forOwn(existing, function (value, key) {
              if (key !== idAttribute && !record.hasOwnProperty(key)) {
                delete existing[key];
              }
            });
            existing.set(record);
          }
          record = existing;
          // Update all indexes in the collection
          self.updateIndexes(record);
        } else {
          // Here, the currently visted record does not correspond to any record
          // in the collection, so (optionally) instantiate this record and insert
          // it into the collection
          record = self.mapper ? self.mapper.createRecord(record) : record;
          self.index.insertRecord(record);
          forOwn(self.indexes, function (index, name) {
            index.insertRecord(record);
          });
          if (record && isFunction(record.on)) {
            record.on('all', self._onRecordEvent, self);
            // TODO: Make this more performant (batch events?)
            self.emit('add', record);
          }
        }
        if (autoPk) {
          self.autoPks[id] = record;
        }
        return record;
      });
      // Finally, return the inserted data
      var result = singular ? records.length ? records[0] : undefined : records;
      return self.afterAdd(records, opts, result) || result;
    },

    /**
     * Lifecycle hook called by {@link Collection#add}. If this method returns a
     * value then {@link Collection#add} will return that same value.
     *
     * @name Collection#method
     * @method
     * @param {(Object|Object[]|Record|Record[])} result The record or records
     * that were added to this Collection by {@link Collection#add}.
     * @param {Object} opts The `opts` argument passed to {@link Collection#add}.
     */
    afterAdd: function afterAdd() {},

    /**
     * Lifecycle hook called by {@link Collection#remove}. If this method returns
     * a value then {@link Collection#remove} will return that same value.
     *
     * @name Collection#afterRemove
     * @method
     * @param {(string|number)} id The `id` argument passed to {@link Collection#remove}.
     * @param {Object} opts The `opts` argument passed to {@link Collection#remove}.
     * @param {Object} record The result that will be returned by {@link Collection#remove}.
     */
    afterRemove: function afterRemove() {},

    /**
     * Lifecycle hook called by {@link Collection#removeAll}. If this method
     * returns a value then {@link Collection#removeAll} will return that same
     * value.
     *
     * @name Collection#afterRemoveAll
     * @method
     * @param {Object} query The `query` argument passed to {@link Collection#removeAll}.
     * @param {Object} opts The `opts` argument passed to {@link Collection#removeAll}.
     * @param {Object} records The result that will be returned by {@link Collection#removeAll}.
     */
    afterRemoveAll: function afterRemoveAll() {},

    /**
     * Lifecycle hook called by {@link Collection#add}. If this method returns a
     * value then the `records` argument in {@link Collection#add} will be
     * re-assigned to the returned value.
     *
     * @name Collection#beforeAdd
     * @method
     * @param {(Object|Object[]|Record|Record[])} records The `records` argument passed to {@link Collection#add}.
     * @param {Object} opts The `opts` argument passed to {@link Collection#add}.
     */
    beforeAdd: function beforeAdd() {},

    /**
     * Lifecycle hook called by {@link Collection#remove}.
     *
     * @name Collection#beforeRemove
     * @method
     * @param {(string|number)} id The `id` argument passed to {@link Collection#remove}.
     * @param {Object} opts The `opts` argument passed to {@link Collection#remove}.
     */
    beforeRemove: function beforeRemove() {},

    /**
     * Lifecycle hook called by {@link Collection#removeAll}.
     *
     * @name Collection#beforeRemoveAll
     * @method
     * @param {Object} query The `query` argument passed to {@link Collection#removeAll}.
     * @param {Object} opts The `opts` argument passed to {@link Collection#removeAll}.
     */
    beforeRemoveAll: function beforeRemoveAll() {},

    /**
     * Find all records between two boundaries.
     *
     * Shortcut for `collection.query().between(18, 30, { index: 'age' }).run()`
     *
     * Get all users ages 18 to 30:
     * ```javascript
     * const users = collection.between(18, 30, { index: 'age' })
     * ```
     * Same as above:
     * ```javascript
     * const users = collection.between([18], [30], { index: 'age' })
     * ```
     *
     * @name Collection#between
     * @method
     * @param {Array} leftKeys Keys defining the left boundary.
     * @param {Array} rightKeys Keys defining the right boundary.
     * @param {Object} [opts] Configuration options.
     * @param {string} [opts.index] Name of the secondary index to use in the
     * query. If no index is specified, the main index is used.
     * @param {boolean} [opts.leftInclusive=true] Whether to include records
     * on the left boundary.
     * @param {boolean} [opts.rightInclusive=false] Whether to include records
     * on the left boundary.
     * @param {boolean} [opts.limit] Limit the result to a certain number.
     * @param {boolean} [opts.offset] The number of resulting records to skip.
     * @return {Array} The result.
     */
    between: function between(leftKeys, rightKeys, opts) {
      return this.query().between(leftKeys, rightKeys, opts).run();
    },

    /**
     * Create a new secondary index on the contents of the collection.
     *
     * Index users by age:
     * ```javascript
     * collection.createIndex('age')
     * ```
     * Index users by status and role:
     * ```javascript
     * collection.createIndex('statusAndRole', ['status', 'role'])
     * ```
     *
     * @name Collection#createIndex
     * @method
     * @param {string} name - The name of the new secondary index.
     * @param {string[]} [fieldList] - Array of field names to use as the key or
     * compound key of the new secondary index. If no fieldList is provided, then
     * the name will also be the field that is used to index the collection.
     * @return {Collection} A reference to itself for chaining.
     */
    createIndex: function createIndex(name, fieldList, opts) {
      var self = this;
      if (isString(name) && fieldList === undefined) {
        fieldList = [name];
      }
      opts || (opts = {});
      opts.hashCode = opts.hashCode || function (obj) {
        return self.recordId(obj);
      };
      var index = self.indexes[name] = new Index(fieldList, opts);
      self.index.visitAll(index.insertRecord, index);
      return self;
    },

    /**
     * Find the record or records that match the provided query or pass the
     * provided filter function.
     *
     * Shortcut for `collection.query().filter(queryOrFn[, thisArg]).run()`
     *
     * Get the draft posts created less than three months:
     * ```javascript
     * const posts = collection.filter({
     *   where: {
     *     status: {
     *       '==': 'draft'
     *     },
     *     created_at_timestamp: {
     *       '>=': (new Date().getTime() - (1000 * 60 * 60 * 24 * 30 * 3)) // 3 months ago
     *     }
     *   }
     * })
     * ```
     * Use a custom filter function:
     * ```javascript
     * const posts = collection.filter(function (post) {
     *   return post.isReady()
     * })
     * ```
     *
     * @name Collection#filter
     * @method
     * @param {(Object|Function)} [queryOrFn={}] - Selection query or filter
     * function.
     * @param {Object} [thisArg] - Context to which to bind `queryOrFn` if
     * `queryOrFn` is a function.
     * @return {Array} The result.
     */
    filter: function filter(query, thisArg) {
      return this.query().filter(query, thisArg).run();
    },

    /**
     * Iterate over all records.
     *
     * ```javascript
     * collection.forEach(function (record) {
     *   // do something
     * })
     * ```
     *
     * @name Collection#forEach
     * @method
     * @param {Function} forEachFn - Iteration function.
     * @param {*} [thisArg] - Context to which to bind `forEachFn`.
     * @return {Array} The result.
     */
    forEach: function forEach(cb, thisArg) {
      this.index.visitAll(cb, thisArg);
    },

    /**
     * Get the record with the given id.
     *
     * @name Collection#get
     * @method
     * @param {(string|number)} id - The primary key of the record to get.
     * @return {(Object|Record)} The record with the given id.
     */
    get: function get(id) {
      var instances = this.query().get(id).run();
      return instances.length ? instances[0] : undefined;
    },

    /**
     * Find the record or records that match the provided keyLists.
     *
     * Shortcut for `collection.query().getAll(keyList1, keyList2, ...).run()`
     *
     * Get the posts where "status" is "draft" or "inReview":
     * ```javascript
     * const posts = collection.getAll('draft', 'inReview', { index: 'status' })
     * ```
     * Same as above:
     * ```javascript
     * const posts = collection.getAll(['draft'], ['inReview'], { index: 'status' })
     * ```
     *
     * @name Collection#getAll
     * @method
     * @param {...Array} [keyList] - Provide one or more keyLists, and all
     * records matching each keyList will be retrieved. If no keyLists are
     * provided, all records will be returned.
     * @param {Object} [opts] - Configuration options.
     * @param {string} [opts.index] - Name of the secondary index to use in the
     * query. If no index is specified, the main index is used.
     * @return {Array} The result.
     */
    getAll: function getAll() {
      var _query;

      return (_query = this.query()).getAll.apply(_query, arguments).run();
    },

    /**
     * Return the records in this Collection that have a primary key that
     * was automatically generated when they were inserted.
     *
     * @name Collection#getAutoPkItems
     * @method
     * @return {(Object[]|Record[])} The records that have autoPks.
     */
    getAutoPkItems: function getAutoPkItems() {
      var self = this;
      return self.getAll().filter(function (record) {
        return self.autoPks[self.recordId(record)];
      });
    },

    /**
     * Limit the result.
     *
     * Shortcut for `collection.query().limit(maximumNumber).run()`
     *
     * ```javascript
     * const posts = collection.limit(10)
     * ```
     *
     * @name Collection#limit
     * @method
     * @param {number} num - The maximum number of records to keep in the result.
     * @return {Array} The result.
     */
    limit: function limit(num) {
      return this.query().limit(num).run();
    },

    /**
     * Apply a mapping function to all records.
     *
     * ```javascript
     * const names = collection.map(function (user) {
     *   return user.name
     * })
     * ```
     *
     * @name Collection#map
     * @method
     * @param {Function} mapFn - Mapping function.
     * @param {*} [thisArg] - Context to which to bind `mapFn`.
     * @return {Array} The result of the mapping.
     */
    map: function map(cb, thisArg) {
      var data = [];
      this.index.visitAll(function (value) {
        data.push(cb.call(thisArg, value));
      });
      return data;
    },

    /**
     * Return the result of calling the specified function on each record in this
     * collection's main index.
     *
     * @name Collection#mapCall
     * @method
     * @param {string} funcName - Name of function to call
     * @parama {...*} [args] - Remaining arguments to be passed to the function.
     * @return {Array} The result.
     */
    mapCall: function mapCall(funcName) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var data = [];
      this.index.visitAll(function (record) {
        data.push(record[funcName].apply(record, args));
      });
      return data;
    },

    /**
     * Return the primary key of the given, or if no record is provided, return the
     * name of the field that holds the primary key of records in this Collection.
     *
     * @name Collection#record
     * @method
     * @param {(Object|Record)} [record] The record whose primary key is to be
     * returned.
     * @return {(string|number)} Primary key or name of field that holds primary
     * key.
     */
    recordId: function recordId(record) {
      if (record) {
        return get(record, this.recordId());
      }
      var self = this;
      return self.mapper ? self.mapper.idAttribute : self.idAttribute || 'id';
    },

    /**
     * Create a new query to be executed against the contents of the collection.
     * The result will be all or a subset of the contents of the collection.
     *
     * Grab page 2 of users between ages 18 and 30:
     * ```javascript
     * collection.query()
     *   .between(18, 30, { index: 'age' }) // between ages 18 and 30
     *   .skip(10) // second page
     *   .limit(10) // page size
     *   .run()
     * ```
     *
     * @name Collection#query
     * @method
     * @return {Query} New query object.
     */
    query: function query() {
      return new Query(this);
    },

    /**
     * Reduce the data in the collection to a single value and return the result.
     *
     * ```javascript
     * const totalVotes = collection.reduce(function (prev, record) {
     *   return prev + record.upVotes + record.downVotes
     * }, 0)
     * ```
     *
     * @name Collection#reduce
     * @method
     * @param {Function} cb - Reduction callback.
     * @param {*} initialValue - Initial value of the reduction.
     * @return {*} The result.
     */
    reduce: function reduce(cb, initialValue) {
      var data = this.getAll();
      return data.reduce(cb, initialValue);
    },

    /**
     * Remove the record with the given id from this Collection.
     *
     * @name Collection#remove
     * @method
     * @param {(string|number)} id - The primary key of the record to be removed.
     * @param {Object} [opts] - Configuration options.
     * @return {Object|Record} The removed record, if any.
     */
    remove: function remove(id, opts) {
      var self = this;

      // Default values for arguments
      opts || (opts = {});
      self.beforeRemove(id, opts);
      var record = self.get(id);

      // The record is in the collection, remove it
      if (record) {
        delete self.autoPks[id];
        self.index.removeRecord(record);
        forOwn(self.indexes, function (index, name) {
          index.removeRecord(record);
        });
        if (record && isFunction(record.off)) {
          record.off('all', self._onRecordEvent, self);
          self.emit('remove', record);
        }
      }
      return self.afterRemove(id, opts, record) || record;
    },

    /**
     * Remove the record selected by "query" from this collection.
     *
     * @name Collection#removeAll
     * @method
     * @param {Object} [query={}] - Selection query.
     * @param {Object} [query.where] - Filtering criteria.
     * @param {number} [query.skip] - Number to skip.
     * @param {number} [query.limit] - Number to limit to.
     * @param {Array} [query.orderBy] - Sorting criteria.
     * @param {Object} [opts] - Configuration options.
     * @return {(Object[]|Record[])} The removed records, if any.
     */
    removeAll: function removeAll(query, opts) {
      var self = this;
      // Default values for arguments
      opts || (opts = {});
      self.beforeRemoveAll(query, opts);
      var records = self.filter(query);

      // Remove each selected record from the collection
      records.forEach(function (item) {
        self.remove(self.recordId(item));
      });
      return self.afterRemoveAll(query, opts, records) || records;
    },

    /**
     * Skip a number of results.
     *
     * Shortcut for `collection.query().skip(numberToSkip).run()`
     *
     * ```javascript
     * const posts = collection.skip(10)
     * ```
     *
     * @name Collection#skip
     * @method
     * @param {number} num - The number of records to skip.
     * @return {Array} The result.
     */
    skip: function skip(num) {
      return this.query().skip(num).run();
    },

    /**
     * Return the plain JSON representation of all items in this collection.
     * Assumes records in this collection have a toJSON method.
     *
     * @name Collection#toJSON
     * @method
     * @param {Object} [opts] - Configuration options.
     * @param {string[]} [opts.with] - Array of relation names or relation fields
     * to include in the representation.
     * @return {Array} The records.
     */
    toJSON: function toJSON(opts) {
      return this.mapCall('toJSON', opts);
    },

    /**
     * Update a record's position in a single index of this collection. See
     * {@link Collection#updateIndexes} to update a record's position in all
     * indexes at once.
     *
     * @name Collection#updateIndex
     * @method
     * @param {Object} record - The record to update.
     * @param {Object} [opts] - Configuration options.
     * @param {string} [opts.index] The index in which to update the record's
     * position. If you don't specify an index then the record will be updated
     * in the main index.
     */
    updateIndex: function updateIndex(record, opts) {
      opts || (opts = {});
      var index = opts.index ? this.indexes[opts.index] : this.index;
      index.updateRecord(record);
    },

    /**
     * TODO
     *
     * @name Collection#updateIndexes
     * @method
     * @param {Object} record - TODO
     * @param {Object} [opts] - Configuration options.
     */
    updateIndexes: function updateIndexes(record) {
      var self = this;
      self.index.updateRecord(record);
      forOwn(self.indexes, function (index, name) {
        index.updateRecord(record);
      });
    }
  });

  eventify(Collection.prototype, function () {
    return this._listeners;
  }, function (value) {
    this._listeners = value;
  });

  var op = 'belongsTo';

  /**
   * @ignore
   */
  function applyBelongsTo(Mapper, Relation, opts) {
    opts || (opts = {});

    var getRelation = opts.getRelation || function () {
      return Relation;
    };

    var localField = opts.localField;
    if (!localField) {
      throw new Error('localField is required');
    }

    var foreignKey = opts.foreignKey || opts.localKey;
    if (!foreignKey) {
      throw new Error('foreignKey is required');
    }

    // if (isFunction(Mapper.RecordClass)) {
    //   // Setup configuration of the property
    //   const descriptor = {
    //     // Whether the field specified by "localField" will show up in "for...in"
    //     enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
    //     // Set default method for retrieving the linked relation
    //     get () {
    //       return this._get(`links.${localField}`)
    //     },
    //     // Set default method for setting the linked relation
    //     set (parent) {
    //       const self = this
    //       self._set(`links.${localField}`, parent)
    //       set(self, foreignKey, parent ? get(parent, getRelation().idAttribute) : undefined)
    //       return get(self, localField)
    //     }
    //   }

    //   const originalGet = descriptor.get
    //   const originalSet = descriptor.set

    //   // Check for user-defined getter
    //   if (opts.get) {
    //     // Set user-defined getter
    //     descriptor.get = function () {
    //       // Call user-defined getter, passing in:
    //       //  - target Mapper
    //       //  - related Mapper
    //       //  - instance of target Mapper
    //       //  - the original getter function, in case the user wants to use it
    //       return opts.get(Mapper, getRelation(), this, () => originalGet.call(this))
    //     }
    //     delete descriptor.writable
    //   }

    //   // Check for user-defined setter
    //   if (opts.set) {
    //     // Set user-defined setter
    //     descriptor.set = function (parent) {
    //       // Call user-defined getter, passing in:
    //       //  - target Mapper
    //       //  - related Mapper
    //       //  - instance of target Mapper
    //       //  - instance of related Mapper
    //       //  - the original setter function, in case the user wants to use it
    //       return opts.set(Mapper, getRelation(), this, parent, value => originalSet.call(this, value === undefined ? parent : value))
    //     }
    //     delete descriptor.writable
    //   }

    //   // Finally, added property to prototype of target Mapper
    //   Object.defineProperty(Mapper.RecordClass.prototype, localField, descriptor)
    // }

    if (!Mapper.relationList) {
      Mapper.relationList = [];
    }
    if (!Mapper.relationFields) {
      Mapper.relationFields = [];
    }
    opts.type = 'belongsTo';
    opts.name = Mapper.name;
    opts.relation = isString(Relation) ? Relation : Relation.name;
    opts.getRelation = getRelation;
    Mapper.relationList.push(opts);
    Mapper.relationFields.push(localField);

    // Return target Mapper for chaining
    return Mapper;
  }

  /**
   * @memberof! module:js-data
   *
   * @param {Mapper} Relation The Relation the target belongs to.
   * @param {Object} opts Configuration options.
   * @param {string} opts.foreignKey The field that holds the primary key of the
   * related record.
   * @param {string} opts.localField The field that holds a reference to the
   * related record object.
   * @return {Function} Invocation function, which accepts the target as the only
   * parameter.
   */
  function belongsTo(Relation, opts) {
    return function (target) {
      target.dbg(op, Relation, opts);
      return applyBelongsTo(target, Relation, opts);
    };
  }

  /**
   * @memberof! module:js-data
   * @example
   * // ES6
   * import {configure, Model} from 'js-data'
   *
   * // @configure(opts) (ES7)
   * class User extends JSData.Model {}
   * configure(opts)(User)
   *
   * // ES5
   * var JSData = require('js-data')
   * var User = JSData.Model.extend()
   * User.configure(opts)
   *
   * @param {Object} opts - Properties to apply to the target.
   * @param {boolean} [overwrite=true] - Whether to overwrite properties that
   * already exist on the target.
   */
  function configure(opts) {
    var overwrite = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    opts = opts || {};
    return function (target) {
      forOwn(opts, function (value, key) {
        if (target[key] === undefined || overwrite) {
          target[key] = copy(value);
        }
      });
      return target;
    };
  }

  var op$1 = 'hasMany';

  /**
   * @ignore
   */
  function applyHasMany(Mapper, Relation, opts) {
    opts || (opts = {});

    var getRelation = opts.getRelation || function () {
      return Relation;
    };

    var localField = opts.localField;
    if (!localField) {
      throw new Error('localField is required');
    }

    var foreignKey = opts.foreignKey;
    var localKeys = opts.localKeys;
    var foreignKeys = opts.foreignKeys;
    if (!foreignKey && !localKeys && !foreignKeys) {
      throw new Error('one of (foreignKey, localKeys, foreignKeys) is required');
    }

    // // Setup configuration of the property
    // const descriptor = {
    //   // Whether the field specified by "localField" will show up in "for...in"
    //   enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
    //   // Set default method for retrieving the linked relation
    //   get () {
    //     return this._get(`links.${getLocalField()}`)
    //   },
    //   // Set default method for setting the linked relation
    //   set (children) {
    //     if (!children) {
    //       return
    //     }
    //     this._set(`links.${getLocalField()}`, children)
    //     if (children && children.length) {
    //       const id = get(this, Model.idAttribute)
    //       if (foreignKey) {
    //         children.forEach(function (child) {
    //           set(child, foreignKey, id)
    //         })
    //       } else if (localKeys) {
    //         const keys = []
    //         children.forEach(function (child) {
    //           keys.push(get(child, getRelation().idAttribute))
    //         })
    //         set(this, localKeys, keys)
    //       } else if (foreignKeys) {
    //         children.forEach(function (child) {
    //           const keys = get(child, foreignKeys)
    //           if (keys) {
    //             if (keys.indexOf(id) === -1) {
    //               keys.push(id)
    //             }
    //           } else {
    //             set(child, foreignKeys, [id])
    //           }
    //         })
    //       }
    //     }
    //     return get(this, getLocalField())
    //   }
    // }

    // const originalGet = descriptor.get
    // const originalSet = descriptor.set

    // // Check for user-defined getter
    // if (opts.get) {
    //   // Set user-defined getter
    //   descriptor.get = function () {
    //     // Call user-defined getter, passing in:
    //     //  - target Model
    //     //  - related Model
    //     //  - instance of target Model
    //     //  - the original getter function, in case the user wants to use it
    //     return opts.get(Model, getRelation(), this, () => originalGet.call(this))
    //   }
    // }

    // // Check for user-defined setter
    // if (opts.set) {
    //   // Set user-defined setter
    //   descriptor.set = function (children) {
    //     // Call user-defined getter, passing in:
    //     //  - target Model
    //     //  - related Model
    //     //  - instance of target Model
    //     //  - instances of related Model
    //     //  - the original setter function, in case the user wants to use it
    //     return opts.set(Model, getRelation(), this, children, value => originalSet.call(this, value === undefined ? children : value))
    //   }
    // }

    // // Finally, added property to prototype of target Model
    // Object.defineProperty(Model.prototype, getLocalField(), descriptor)

    if (!Mapper.relationList) {
      Mapper.relationList = [];
    }
    if (!Mapper.relationFields) {
      Mapper.relationFields = [];
    }
    opts.type = 'hasMany';
    opts.name = Mapper.name;
    opts.relation = isString(Relation) ? Relation : Relation.name;
    opts.getRelation = getRelation;
    Mapper.relationList.push(opts);
    Mapper.relationFields.push(localField);

    // Return target Mapper for chaining
    return Mapper;
  }

  /**
   * @memberof! module:js-data
   *
   * @param {Mapper} Relation - The relation of which the target has many.
   * @param {Object} opts - Configuration options.
   * @param {string} opts.localField The field on the target where the relation
   * will be attached.
   * @return {Function} Invocation function, which accepts the target as the only
   * parameter.
   */
  function hasMany(Relation, opts) {
    return function (target) {
      target.dbg(op$1, Relation, opts);
      return applyHasMany(target, Relation, opts);
    };
  }

  var op$2 = 'hasOne';

  /**
   * @ignore
   */
  function applyHasOne(Mapper, Relation, opts) {
    opts || (opts = {});

    var getRelation = opts.getRelation || function () {
      return Relation;
    };

    var localField = opts.localField;
    if (!localField) {
      throw new Error('localField is required');
    }

    var foreignKey = opts.foreignKey;
    if (!foreignKey) {
      throw new Error('foreignKey is required');
    }

    // // Setup configuration of the property
    // const descriptor = {
    //   // Whether the field specified by "localField" will show up in "for...in"
    //   enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
    //   // Set default method for retrieving the linked relation
    //   get () {
    //     return this._get(`links.${getLocalField()}`)
    //   },
    //   // Set default method for setting the linked relation
    //   set (child) {
    //     if (!child) {
    //       return
    //     }
    //     this._set(`links.${getLocalField()}`, child)
    //     set(child, getForeignKey(), get(this, Model.idAttribute))
    //     return get(this, getLocalField())
    //   }
    // }

    // // Check for user-defined getter
    // if (opts.get) {
    //   const originalGet = descriptor.get
    //   // Set user-defined getter
    //   descriptor.get = function () {
    //     // Call user-defined getter, passing in:
    //     //  - target Model
    //     //  - related Model
    //     //  - instance of target Model
    //     //  - the original getter function, in case the user wants to use it
    //     return opts.get(Model, Relation, this, originalGet ? (...args) => originalGet.apply(this, args) : undefined)
    //   }
    // }

    // // Check for user-defined setter
    // if (opts.set) {
    //   const originalSet = descriptor.set
    //   // Set user-defined setter
    //   descriptor.set = function (child) {
    //     // Call user-defined getter, passing in:
    //     //  - target Model
    //     //  - related Model
    //     //  - instance of target Model
    //     //  - instance of related Model
    //     //  - the original setter function, in case the user wants to use it
    //     return opts.set(Model, Relation, this, child, originalSet ? (...args) => originalSet.apply(this, args) : undefined)
    //   }
    // }

    // // Finally, added property to prototype of target Model
    // Object.defineProperty(Model.prototype, getLocalField(), descriptor)

    if (!Mapper.relationList) {
      Mapper.relationList = [];
    }
    if (!Mapper.relationFields) {
      Mapper.relationFields = [];
    }
    opts.type = 'hasOne';
    opts.name = Mapper.name;
    opts.relation = isString(Relation) ? Relation : Relation.name;
    opts.getRelation = getRelation;
    Mapper.relationList.push(opts);
    Mapper.relationFields.push(localField);

    // Return target Mapper for chaining
    return Mapper;
  }

  /**
   * @memberof! module:js-data
   *
   * @param {Mapper} Relation The Relation of which the target has one.
   * @param {Object} opts Configuration options.
   * @param {string} opts.foreignKey The field that holds the primary key of the
   * related record.
   * @param {string} opts.localField The field on the target where the relation
   * will be attached.
   * @return {Function} Invocation function, which accepts the target as the only
   * parameter.
   */
  function hasOne(Relation, opts) {
    return function (target) {
      target.dbg(op$2, 'Relation:', Relation, 'opts:', opts);
      return applyHasOne(target, Relation, opts);
    };
  }

  var op$3 = 'setSchema';

  /**
   * @param {Model} target - Target Model.
   * @param {string} key - Key for new property.
   * @param {Object} opts - Configuration options.
   * @ignore
   */
  function makeDescriptor(target, key, opts) {
    var descriptor = {
      enumerable: opts.enumerable !== undefined ? opts.enumerable : true
    };
    descriptor.get = function () {
      return this._get('props.' + key);
    };
    descriptor.set = function (value) {
      var _this = this;

      // TODO: rework this
      // if (isFunction(opts.validate) && !opts.validate(value)) {
      //   return false
      // }
      var _get = this._get;
      var _set = this._set;
      var _unset = this._unset;
      // if (!_get('noValidate')) {
      //   const errors = validate(opts, value)
      //   if (errors) {
      //     throw new Error(errors.join(', '))
      //   }
      // }
      if (opts.track && !_get('creating')) {
        (function () {
          var changing = _get('changing');
          var previous = _get('previous.' + key);
          var current = _get('props.' + key);
          var changed = _get('changed');
          if (!changing) {
            changed = [];
          }
          var index = changed.indexOf(key);
          if (current !== value && index === -1) {
            changed.push(key);
          }
          if (previous !== value) {
            _set('changes.' + key, value);
          } else {
            _unset('changes.' + key);
            if (index >= 0) {
              changed.splice(index, 1);
            }
          }
          if (!changed.length) {
            changing = false;
            _unset('changing');
            _unset('changed');
            if (_get('eventId')) {
              clearTimeout(_get('eventId'));
              _unset('eventId');
            }
          }
          if (!changing && changed.length) {
            _set('changed', changed);
            _set('changing', true);
            _set('eventId', setTimeout(function () {
              _unset('changed');
              _unset('eventId');
              _unset('changing');
              if (!_get('silent')) {
                var i = undefined;
                for (i = 0; i < changed.length; i++) {
                  _this.emit('change:' + changed[i], _this, get(_this, changed[i]));
                }
                _this.emit('change', _this, _get('changes'));
              }
              _unset('silent');
            }, 0));
          }
        })();
      }
      _set('props.' + key, value);
      // if (_get('$') && opts.indexed) {
      //   target.getCollection().updateIndex(this, { index: key })
      // }
      return value;
    };
    // if (opts.indexed) {
    //   // Update index
    //   // TODO: Make this configurable, ie. immediate or lazy update
    //   target.createIndex(key)
    // }
    if (opts.get) {
      if (descriptor.get) {
        (function () {
          var originalGet = descriptor.get;
          descriptor.get = function () {
            return opts.get.call(this, originalGet);
          };
        })();
      } else {
        descriptor.get = opts.get;
      }
    }
    if (opts.set) {
      if (descriptor.set) {
        (function () {
          var originalSet = descriptor.set;
          descriptor.set = function (value) {
            return opts.set.call(this, value, originalSet);
          };
        })();
      } else {
        descriptor.set = opts.set;
      }
    }
    return descriptor;
  }

  /**
   * @memberof! module:js-data
   * @example
   * // ES6
   * import {setSchema, Model} from 'js-data'
   * const properties = {
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
   * }
   *
   * // @setSchema(properties) (ES7)
   * class User extends Model {}
   * User.setSchema(properties)
   *
   * // ES5
   * var JSData = require('js-data')
   * var User = JSData.Model.extend({}, { name: 'User' })
   * User.setSchema(properties)
   *
   * @param {Object.<string, Object>} opts - Property configurations.
   * @return {Function} Invocation function, which accepts the target as the only
   * parameter.
   */
  function setSchema(opts) {
    opts || (opts = {});

    return function (target) {
      target.dbg(op$3, 'opts:', opts);

      target.schema || (target.schema = {});
      configure(target.schema, opts);

      forOwn(opts, function (prop, key) {
        var descriptor = makeDescriptor(target, key, prop);
        // TODO: This won't work for properties of Object type, because all
        // instances will share the prototype value
        if (!descriptor.writable) {
          Object.defineProperty(target.prototype, key, descriptor);
        }
      });
      return target;
    };
  }

  var op$4 = 'registerAdapter';

  /**
   * Add the provided adapter to the target's "adapters" property, registering it
   * with the specified.
   * @memberof! module:js-data
   * @param {string} name - The name under which to register the adapter.
   * @param {Adapter} adapter - The adapter to register.
   * @param {Object} opts - Configuration options.
   * @param {boolean} [opts.default=false] - Whether to make the adapter the
   * default adapter for the target.
   * @return {Function} Invocation function, which accepts the target as the only
   * parameter.
   */
  function registerAdapter(name, adapter, opts) {
    opts || (opts = {});
    opts.op = op$4;
    return function (target) {
      target.dbg(op$4, 'name:', name, 'adapter:', adapter, 'opts:', opts);
      // Register the adapter
      target.getAdapters()[name] = adapter;
      // Optionally make it the default adapter for the target.
      if (opts === true || opts.default) {
        target.defaultAdapter = name;
      }
    };
  }

  /**
   * js-data's Record class.
   * @class Record
   *
   * @abstract
   * @param {Object} [props] The initial properties of the new Record instance.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.noValidate=false] Whether to skip validation on the
   * initial properties.
   */
  function Record(props, opts) {
    var self = this;
    classCallCheck(self, Record);

    props || (props = {});
    opts || (opts = {});
    var _props = {};
    Object.defineProperties(self, {
      _get: {
        value: function value(key) {
          return get(_props, key);
        }
      },
      _set: {
        value: function value(key, _value) {
          return set(_props, key, _value);
        }
      }
    });
    self._set('creating', true);
    if (opts.noValidate) {
      self._set('noValidate', true);
    }
    fillIn(self, props);
    self._set('creating');
    self._set('changes', {});
    self._set('noValidate');
    self._set('previous', copy(props));
  }

  Record.extend = extend;

  addHiddenPropsToTarget(Record.prototype, {
    _mapper: function _mapper() {
      return this.constructor.Mapper;
    },

    /**
     * Return the value at the given path for this instance.
     *
     * @param {string} key - Path of value to retrieve.
     * @return {*} Value at path.
     */
    get: function get$$(key) {
      return get(this, key);
    },

    /**
     * Set the value for a given key, or the values for the given keys if "key" is
     * an object.
     *
     * @param {(string|Object)} key - Key to set or hash of key-value pairs to set.
     * @param {*} [value] - Value to set for the given key.
     * @param {Object} [opts] - Optional configuration.
     * @param {boolean} [opts.silent=false] - Whether to trigger change events.
     */
    set: function set$$(key, value, opts) {
      var self = this;
      if (isObject(key)) {
        opts = value;
      }
      opts || (opts = {});
      if (opts.silent) {
        self._set('silent', true);
      }
      set(self, key, value);
      if (!self._get('eventId')) {
        self._set('silent');
      }
    },

    /**
     * Unset the value for a given key.
     *
     * @param {string} key - Key to unset.
     * @param {Object} [opts] - Optional configuration.
     * @param {boolean} [opts.silent=false] - Whether to trigger change events.
     */
    unset: function unset(key, opts) {
      this.set(key, undefined, opts);
    },
    hashCode: function hashCode() {
      var self = this;
      return get(self, self._mapper().idAttribute);
    },
    changes: function changes(key) {
      var self = this;
      if (key) {
        return self._get('changes.' + key);
      }
      return self._get('changes');
    },
    hasChanges: function hasChanges() {
      return !!(this._get('changed') || []).length;
    },
    commit: function commit() {
      var self = this;
      self._set('changed');
      self._set('changes', {});
      self._set('previous', copy(self));
      return self;
    },
    previous: function previous(key) {
      var self = this;
      if (key) {
        return self._get('previous.' + key);
      }
      return self._get('previous');
    },
    revert: function revert(opts) {
      var self = this;
      var previous = self._get('previous') || {};
      opts || (opts = {});
      opts.preserve || (opts.preserve = []);
      forOwn(self, function (value, key) {
        if (key !== self._mapper().idAttribute && !previous.hasOwnProperty(key) && self.hasOwnProperty(key) && opts.preserve.indexOf(key) === -1) {
          delete self[key];
        }
      });
      forOwn(previous, function (value, key) {
        if (opts.preserve.indexOf(key) === -1) {
          self[key] = value;
        }
      });
      self.commit();
      return self;
    },
    schema: function schema(key) {
      var _schema = this._mapper().schema;
      return key ? _schema[key] : _schema;
    },

    // validate (obj, value) {
    //   let errors = []
    //   let _schema = this.schema()
    //   if (!obj) {
    //     obj = this
    //   } else if (utils.isString(obj)) {
    //     const prop = _schema[obj]
    //     if (prop) {
    //       errors = validate.validate(prop, value) || []
    //     }
    //   } else {
    //     utils.forOwn(_schema, function (prop, key) {
    //       errors = errors.concat(validate.validate(prop, utils.get(obj, key)) || [])
    //     })
    //   }
    //   return errors.length ? errors : undefined
    // },

    /**
     * @param {Object} [opts] Configuration options. @see {@link Model.create}.
     */
    create: function create(opts) {
      return this._mapper().create(this, opts);
    },
    beforeSave: function beforeSave() {},
    save: function save(opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;
      var Mapper = self._mapper();

      // Default values for arguments
      opts || (opts = {});

      // Fill in "opts" with the Model's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeSave lifecycle hook
      op = opts.op = 'beforeSave';
      return resolve$1(self[op](opts)).then(function () {
        // Now delegate to the adapter
        op = opts.op = 'save';
        Mapper.dbg(op, self, opts);
        return self.getAdapter(adapter)[op](Mapper, self, opts);
      }).then(function (data) {
        // afterSave lifecycle hook
        op = opts.op = 'afterSave';
        return resolve$1(self[op](data, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          if (opts.raw) {
            self.set(data.data);
            data.data = self;
          } else {
            self.set(data);
          }
          return Mapper.end(data, opts);
        });
      });
    },
    afterSave: function afterSave() {},
    beforeLoadRelations: function beforeLoadRelations() {},
    loadRelations: function loadRelations(relations, opts) {
      var op = undefined;
      var self = this;
      var Mapper = self._mapper();
      var relationList = Mapper.relationList || [];

      // Default values for arguments
      relations || (relations = []);
      opts || (opts = {});

      // Fill in "opts" with the Model's configuration
      _(Mapper, opts);
      opts.adapter = Mapper.getAdapterName(opts);

      // beforeLoadRelations lifecycle hook
      op = opts.op = 'beforeLoadRelations';
      return resolve$1(self[op](relations, opts)).then(function () {
        if (isString(relations)) {
          relations = [relations];
        }
        // Now delegate to the adapter
        op = opts.op = 'loadRelations';
        Mapper.dbg(op, self, relations, opts);
        return Promise.all(relationList.map(function (def) {
          if (isFunction(def.load)) {
            return def.load(Mapper, def, self, opts);
          }
          var task = undefined;
          if (def.type === 'hasMany' && def.foreignKey) {
            // hasMany
            task = def.getRelation().findAll(babelHelpers.defineProperty({}, def.foreignKey, get(self, Mapper.idAttribute)), opts);
          } else if (def.foreignKey) {
            // belongsTo or hasOne
            var key = get(self, def.foreignKey);
            if (isSorN(key)) {
              task = def.getRelation().find(key, opts);
            }
          } else if (def.localKeys) {
            // hasMany
            task = def.getRelation().findAll(babelHelpers.defineProperty({}, def.getRelation().idAttribute, {
              'in': get(self, def.localKeys)
            }), opts);
          } else if (def.foreignKeys) {
            // hasMany
            task = def.getRelation().findAll(babelHelpers.defineProperty({}, def.getRelation().idAttribute, {
              'contains': get(self, Mapper.idAttribute)
            }), opts);
          }
          if (task) {
            task = task.then(function (data) {
              if (opts.raw) {
                data = data.data;
              }
              set(self, def.localField, def.type === 'hasOne' ? data.length ? data[0] : undefined : data);
            });
          }
          return task;
        }));
      }).then(function () {
        // afterLoadRelations lifecycle hook
        op = opts.op = 'afterLoadRelations';
        return resolve$1(self[op](relations, opts)).then(function () {
          return self;
        });
      });
    },
    afterLoadRelations: function afterLoadRelations() {},

    /**
     * @param {Object} [opts] Configuration options. @see {@link Model.destroy}.
     */
    destroy: function destroy(opts) {
      // TODO: move actual destroy logic here
      var Mapper = this._mapper();
      return Mapper.destroy(get(this, Mapper.idAttribute), opts);
    },

    // TODO: move logic for single-item async operations onto the instance.

    toJSON: function toJSON(opts) {
      return this._mapper().toJSON(this, opts);
    }
  });

  /**
   * Allow records to emit events.
   *
   * An record's registered listeners are stored in the record's private data.
   */
  eventify(Record.prototype, function () {
    return this._get('events');
  }, function (value) {
    this._set('events', value);
  });

  var types = {
    array: isArray,
    boolean: isBoolean,
    integer: isInteger,
    'null': isNull,
    number: isNumber,
    object: isObject,
    string: isString
  };

  var typeGroupValidators = {};
  var validationKeywords = {};

  var segmentToString = function segmentToString(segment, prev) {
    var str = '';
    if (segment) {
      if (isNumber(segment)) {
        str += '[' + segment + ']';
      } else if (prev) {
        str += '.' + segment;
      } else {
        str += '' + segment;
      }
    }
    return str;
  };

  var makePath = function makePath(opts) {
    opts || (opts = {});
    var path = '';
    var segments = opts.path || [];
    segments.forEach(function (segment) {
      path += segmentToString(segment, path);
    });
    path += segmentToString(opts.prop, path);
    return path;
  };

  var makeError = function makeError(actual, expected, opts) {
    return {
      expected: expected,
      actual: '' + actual,
      path: makePath(opts)
    };
  };

  var addError = function addError(actual, expected, opts, errors) {
    errors.push(makeError(actual, expected, opts));
  };

  var maxLengthCommon = function maxLengthCommon(keyword, value, schema, opts) {
    var max = schema[keyword];
    if (value.length > max) {
      return makeError(value.length, 'length no more than ' + max, opts);
    }
  };

  var minLengthCommon = function minLengthCommon(keyword, value, schema, opts) {
    var min = schema[keyword];
    if (value.length < min) {
      return makeError(value.length, 'length no less than ' + min, opts);
    }
  };

  var validateKeyword = function validateKeyword(op, value, schema, opts) {
    return !isUndefined(schema[op]) && validationKeywords[op](value, schema, opts);
  };

  var runOps = function runOps(ops, value, schema, opts) {
    var errors = [];
    ops.forEach(function (op) {
      errors = errors.concat(validateKeyword(op, value, schema, opts) || []);
    });
    return errors.length ? errors : undefined;
  };

  var ANY_OPS = ['enum', 'type', 'allOf', 'anyOf', 'oneOf', 'not'];
  var ARRAY_OPS = ['items', 'maxItems', 'minItems', 'uniqueItems'];
  var NUMERIC_OPS = ['multipleOf', 'maximum', 'minimum'];
  var OBJECT_OPS = ['maxProperties', 'minProperties', 'required', 'properties', 'dependencies'];
  var STRING_OPS = ['maxLength', 'minLength', 'pattern'];

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor75
   * @param {*} value
   * @param {Object} [schema]
   * @param {Object} [opts] Configuration options.
   */
  var validateAny = function validateAny(value, schema, opts) {
    return runOps(ANY_OPS, value, schema, opts);
  };

  /**
   * @param {*} value
   * @param {Object} [schema]
   * @param {Object} [opts]
   */
  var validate = function validate(value, schema, opts) {
    var errors = [];
    opts || (opts = {});
    var shouldPop = undefined;
    var prevProp = opts.prop;
    if (isUndefined(schema)) {
      return;
    }
    if (!isObject(schema)) {
      throw new Error('Invalid schema at path: "' + opts.path + '"');
    }
    if (isUndefined(opts.path)) {
      opts.path = [];
    }
    // Track our location as we recurse
    if (!isUndefined(opts.prop)) {
      shouldPop = true;
      opts.path.push(opts.prop);
      opts.prop = undefined;
    }
    // Validate against parent schema
    if (schema['extends']) {
      // opts.path = path
      // opts.prop = prop
      if (isFunction(schema['extends'].validate)) {
        errors = errors.concat(schema['extends'].validate(value, opts) || []);
      } else {
        errors = errors.concat(validate(value, schema['extends'], opts) || []);
      }
    }
    if (isUndefined(value)) {
      // Check if property is required
      if (schema.required === true) {
        addError(value, 'a value', opts, errors);
      }
      if (shouldPop) {
        opts.path.pop();
        opts.prop = prevProp;
      }
      return errors.length ? errors : undefined;
    }
    errors = errors.concat(validateAny(value, schema, opts) || []);
    if (shouldPop) {
      opts.path.pop();
      opts.prop = prevProp;
    }
    return errors.length ? errors : undefined;
  };

  fillIn(validationKeywords, {
    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor82
     */

    allOf: function allOf(value, schema, opts) {
      var allErrors = [];
      schema.allOf.forEach(function (_schema) {
        allErrors = allErrors.concat(validate(value, _schema, opts) || []);
      });
      return allErrors.length ? undefined : allErrors;
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor85
     */
    anyOf: function anyOf(value, schema, opts) {
      var validated = false;
      var allErrors = [];
      schema.anyOf.forEach(function (_schema) {
        var errors = validate(value, _schema, opts);
        if (errors) {
          allErrors = allErrors.concat(errors);
        } else {
          validated = true;
        }
      });
      return validated ? undefined : allErrors;
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor70
     */
    dependencies: function dependencies(value, schema, opts) {
      // TODO
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor76
     */
    enum: function _enum(value, schema, opts) {
      var possibleValues = schema['enum'];
      if (possibleValues.indexOf(value) === -1) {
        return makeError(value, 'one of (' + possibleValues.join(', ') + ')', opts);
      }
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor37
     */
    items: function items(value, schema, opts) {
      opts || (opts = {});
      // TODO: additionalItems
      var items = schema.items;
      var errors = [];
      var checkingTuple = isArray(items);
      var length = value.length;
      for (var prop = 0; prop < length; prop++) {
        if (checkingTuple) {
          // Validating a tuple, instead of just checking each item against the
          // same schema
          items = schema.items[prop];
        }
        opts.prop = prop;
        errors = errors.concat(validate(value[prop], items, opts) || []);
      }
      return errors.length ? errors : undefined;
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor17
     */
    maximum: function maximum(value, schema, opts) {
      // Must be a number
      var maximum = schema.maximum;
      // Must be a boolean
      // Depends on maximum
      // default: false
      var exclusiveMaximum = schema.exclusiveMaximum;
      if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === (typeof maximum === 'undefined' ? 'undefined' : babelHelpers.typeof(maximum)) && (exclusiveMaximum ? maximum < value : maximum <= value)) {
        // TODO: Account for value of exclusiveMaximum in messaging
        return makeError(value, 'no more than ' + maximum, opts);
      }
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor42
     */
    maxItems: function maxItems(value, schema, opts) {
      return maxLengthCommon('maxItems', value, schema, opts);
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor26
     */
    maxLength: function maxLength(value, schema, opts) {
      return maxLengthCommon('maxLength', value, schema, opts);
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor54
     */
    maxProperties: function maxProperties(value, schema, opts) {
      var maxProperties = schema.maxProperties;
      var length = Object.keys(value).length;
      if (length > maxProperties) {
        return makeError(length, 'no more than ' + maxProperties + ' properties', opts);
      }
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor21
     */
    minimum: function minimum(value, schema, opts) {
      // Must be a number
      var minimum = schema.minimum;
      // Must be a boolean
      // Depends on minimum
      // default: false
      var exclusiveMinimum = schema.exclusiveMinimum;
      if ((typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) === (typeof minimum === 'undefined' ? 'undefined' : babelHelpers.typeof(minimum)) && (exclusiveMinimum ? minimum > value : minimum >= value)) {
        // TODO: Account for value of exclusiveMinimum in messaging
        return makeError(value, 'no less than ' + minimum, opts);
      }
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor42
     */
    minItems: function minItems(value, schema, opts) {
      return minLengthCommon('minItems', value, schema, opts);
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor29
     */
    minLength: function minLength(value, schema, opts) {
      return minLengthCommon('minLength', value, schema, opts);
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor57
     */
    minProperties: function minProperties(value, schema, opts) {
      var minProperties = schema.minProperties;
      var length = Object.keys(value).length;
      if (length < minProperties) {
        return makeError(length, 'no more than ' + minProperties + ' properties', opts);
      }
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor14
     */
    multipleOf: function multipleOf(value, schema, opts) {
      // TODO
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor91
     */
    not: function not(value, schema, opts) {
      if (!validate(value, schema.not, opts)) {
        // TODO: better messaging
        return makeError('succeeded', 'should have failed', opts);
      }
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor88
     */
    oneOf: function oneOf(value, schema, opts) {
      var validated = false;
      var allErrors = [];
      schema.oneOf.forEach(function (_schema) {
        var errors = validate(value, _schema, opts);
        if (errors) {
          allErrors = allErrors.concat(errors);
        } else if (validated) {
          allErrors = [makeError('valid against more than one', 'valid against only one', opts)];
          validated = false;
          return false;
        } else {
          validated = true;
        }
      });
      return validated ? undefined : allErrors;
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor33
     */
    pattern: function pattern(value, schema, opts) {
      var pattern = schema.pattern;
      if (isString(value) && !value.match(pattern)) {
        return makeError(value, pattern, opts);
      }
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor64
     */
    properties: function properties(value, schema, opts) {
      opts || (opts = {});
      // Can be a boolean or an object
      // Technically the default is an "empty schema", but here "true" is
      // functionally the same
      var additionalProperties = isUndefined(schema.additionalProperties) ? true : schema.additionalProperties;
      // "s": The property set of the instance to validate.
      var toValidate = {};
      // "p": The property set from "properties".
      // Default is an object
      var properties = schema.properties || {};
      // "pp": The property set from "patternProperties".
      // Default is an object
      var patternProperties = schema.patternProperties || {};
      var errors = [];

      // Collect set "s"
      forOwn(value, function (_value, prop) {
        toValidate[prop] = undefined;
      });
      // Remove from "s" all elements of "p", if any.
      forOwn(properties || {}, function (_schema, prop) {
        if (isUndefined(value[prop]) && !isUndefined(_schema['default'])) {
          value[prop] = copy(_schema['default']);
        }
        opts.prop = prop;
        errors = errors.concat(validate(value[prop], _schema, opts) || []);
        delete toValidate[prop];
      });
      // For each regex in "pp", remove all elements of "s" which this regex
      // matches.
      forOwn(patternProperties, function (_schema, pattern) {
        forOwn(toValidate, function (undef, prop) {
          if (prop.match(pattern)) {
            opts.prop = prop;
            errors = errors.concat(validate(value[prop], _schema, opts) || []);
            delete toValidate[prop];
          }
        });
      });
      var keys = Object.keys(toValidate);
      // If "s" is not empty, validation fails
      if (additionalProperties === false) {
        if (keys.length) {
          addError('extra fields: ' + keys.join(', '), 'no extra fields', opts, errors);
        }
      } else if (isObject(additionalProperties)) {
        // Otherwise, validate according to provided schema
        keys.forEach(function (prop) {
          opts.prop = prop;
          errors = errors.concat(validate(value[prop], additionalProperties, opts) || []);
        });
      }
      return errors.length ? errors : undefined;
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor61
     */
    required: function required(value, schema, opts) {
      var required = schema.required;
      var errors = [];
      if (!opts.existingOnly) {
        required.forEach(function (prop) {
          if (isUndefined(get(value, prop))) {
            var prevProp = opts.prop;
            opts.prop = prop;
            addError(undefined, 'a value', opts, errors);
            opts.prop = prevProp;
          }
        });
      }
      return errors.length ? errors : undefined;
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor79
     */
    type: function type(value, schema, opts) {
      var type = schema.type;
      var validType = undefined;
      // Can be one of several types
      if (isString(type)) {
        type = [type];
      }
      // Try to match the value against an expected type
      type.forEach(function (_type) {
        // TODO: throw an error if type is not defined
        if (types[_type](value, schema, opts)) {
          // Matched a type
          validType = _type;
          return false;
        }
      });
      // Value did not match any expected type
      if (!validType) {
        return makeError(value ? typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value) : '' + value, 'one of (' + type.join(', ') + ')', opts);
      }
      // Run keyword validators for matched type
      // http://json-schema.org/latest/json-schema-validation.html#anchor12
      var validator = typeGroupValidators[validType];
      if (validator) {
        return validator(value, schema, opts);
      }
    },

    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor49
     */
    uniqueItems: function uniqueItems(value, schema, opts) {
      if (value && value.length && schema.uniqueItems) {
        var length = value.length;
        var item = undefined,
            i = undefined,
            j = undefined;
        // Check n - 1 items
        for (i = length - 1; i > 0; i--) {
          item = value[i];
          // Only compare against unchecked items
          for (j = i - 1; j >= 0; j--) {
            // Found a duplicate
            if (item === value[j]) {
              return makeError(item, 'no duplicates', opts);
            }
          }
        }
      }
    }
  });

  fillIn(typeGroupValidators, {
    array: function array(value, schema, opts) {
      return runOps(ARRAY_OPS, value, schema, opts);
    },

    integer: function integer(value, schema, opts) {
      // Additional validations for numerics are the same
      return typeGroupValidators.numeric(value, schema, opts);
    },

    number: function number(value, schema, opts) {
      // Additional validations for numerics are the same
      return typeGroupValidators.numeric(value, schema, opts);
    },

    /**
     * See http://json-schema.org/latest/json-schema-validation.html#anchor13
     * @param {*} value
     * @param {Object} [schema]
     * @param {Object} [opts] Configuration options.
     */
    numeric: function numeric(value, schema, opts) {
      return runOps(NUMERIC_OPS, value, schema, opts);
    },

    /**
     * See http://json-schema.org/latest/json-schema-validation.html#anchor53
     * @param {*} value
     * @param {Object} [schema]
     * @param {Object} [opts] Configuration options.
     */
    object: function object(value, schema, opts) {
      return runOps(OBJECT_OPS, value, schema, opts);
    },

    /**
     * See http://json-schema.org/latest/json-schema-validation.html#anchor25
     * @param {*} value
     * @param {Object} [schema]
     * @param {Object} [opts] Configuration options.
     */
    string: function string(value, schema, opts) {
      return runOps(STRING_OPS, value, schema, opts);
    }
  });

  /**
   * js-data's Schema class.
   * @class Schema
   *
   * @param {Object} definition Schema definition according to json-schema.org
   */
  function Schema(definition) {
    // const self = this
    definition || (definition = {});
    // TODO: schema validation
    fillIn(this, definition);

    // TODO: rework this to make sure all possible keywords are converted
    // if (definition.properties) {
    //   forOwn(definition.properties, function (_definition, prop) {
    //     definition.properties[prop] = new Schema(_definition)
    //   })
    // }
  }

  /**
   * Validate the provided value against this schema.
   *
   * @param {*} value Value to validate.
   * @param {Object} [opts] Configuration options.
   * @return {(array|undefined)} Array of errors or `undefined` if valid.
   */
  Schema.prototype.validate = function (value, opts) {
    return validate(value, this, opts);
  };

  var resolve = resolve$1;

  var notify = function notify() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var self = this;
    var opts = args.pop();
    self.dbg.apply(self, [opts.op].concat(args));
    if (opts.notify || opts.notify === undefined && self.notify) {
      setTimeout(function () {
        self.emit.apply(self, [opts.op].concat(args));
      });
    }
  };

  var MAPPER_DEFAULTS = {
    /**
     * Hash of registered adapters. Don't modify. Use {@link Mapper#registerAdapter}.
     *
     * @name Mapper#_adapters
     * @private
     */
    _adapters: {},

    /**
     * Hash of registered listeners. Don't modify. Use {@link Mapper#on} and
     * {@link Mapper#off}.
     *
     * @name Mapper#_listeners
     * @private
     */
    _listeners: null,

    /**
     * The name of the registered adapter that this Mapper should used by default.
     *
     * @name Mapper#defaultAdapter
     * @type {string}
     * @default http
     */
    defaultAdapter: 'http',

    /**
     * Whether to enable debug-level logs.
     *
     * @name Mapper#debug
     * @type {boolean}
     * @default false
     */
    debug: false,

    /**
     * The field used as the unique identifier on records handled by this Mapper.
     *
     * @name Mapper#idAttribute
     * @type {string}
     * @default id
     */
    idAttribute: 'id',

    /**
     * Whether this Mapper should emit operational events.
     *
     * @name Mapper#notify
     * @type {boolean}
     * @default true
     */
    notify: true,

    /**
     * Whether {@link Mapper#create}, {@link Mapper#createMany}, {@link Mapper#save},
     * {@link Mapper#update}, {@link Mapper#updateAll}, {@link Mapper#updateMany},
     * {@link Mapper#find}, {@link Mapper#findAll}, {@link Mapper#destroy}, and
     * {@link Mapper#destroyAll} should return a raw result object that contains
     * both the instance data returned by the adapter _and_ metadata about the
     * operation.
     *
     * The default is to NOT return the result object, and instead return just the
     * instance data.
     *
     * @name Mapper#raw
     * @type {boolean}
     * @default false
     */
    raw: false,

    /**
     * Set the `false` to force the Mapper to work with POJO objects only.
     *
     * ```javascript
     * import {Mapper, Record} from 'js-data'
     * const UserMapper = new Mapper({ RecordClass: false })
     * UserMapper.RecordClass // false
     * const user = UserMapper#createRecord()
     * user instanceof Record // false
     * ```
     *
     * Set to a custom class to have records wrapped in your custom class.
     *
     * ```javascript
     * import {Mapper, Record} from 'js-data'
     *  // Custom class
     * class User {
     *   constructor (props = {}) {
     *     for (var key in props) {
     *       if (props.hasOwnProperty(key)) {
     *         this[key] = props[key]
     *       }
     *     }
     *   }
     * }
     * const UserMapper = new Mapper({ RecordClass: User })
     * UserMapper.RecordClass // function User() {}
     * const user = UserMapper#createRecord()
     * user instanceof Record // false
     * user instanceof User // true
     * ```
     *
     * Extend the {@link Record} class.
     *
     * ```javascript
     * import {Mapper, Record} from 'js-data'
     *  // Custom class
     * class User extends Record {
     *   constructor () {
     *     super(props)
     *   }
     * }
     * const UserMapper = new Mapper({ RecordClass: User })
     * UserMapper.RecordClass // function User() {}
     * const user = UserMapper#createRecord()
     * user instanceof Record // true
     * user instanceof User // true
     * ```
     *
     * @name Mapper#RecordClass
     * @default {@link Record}
     */
    RecordClass: undefined,

    schema: {},

    /**
     * Whether {@link Mapper#create} and {@link Mapper#createMany} should instead
     * call {@link Mapper#update} and {@link Mapper#updateMany} if the provided
     * record(s) already contain a primary key.
     *
     * @name Mapper#upsert
     * @type {boolean}
     * @default true
     */
    upsert: true
  };

  /**
   * js-data's Mapper class.
   *
   * @class Mapper
   * @param {Object} [opts] Configuration options.
   */
  function Mapper(opts) {
    var self = this;
    classCallCheck(self, Mapper);

    opts || (opts = {});
    fillIn(self, opts);
    fillIn(self, copy(MAPPER_DEFAULTS));

    if (!(self.schema instanceof Schema)) {
      self.schema = new Schema(self.schema);
    }

    if (isUndefined(self.RecordClass)) {
      self.RecordClass = Record.extend();
    }
    if (self.RecordClass) {
      self.RecordClass.Mapper = self;
    }
  }

  /**
   * Instance members
   */
  addHiddenPropsToTarget(Mapper.prototype, {
    /**
     * @name Mapper#end
     * @method
     */

    end: function end(data, opts) {
      var self = this;
      if (opts.raw) {
        _(opts, data);
      }
      var _data = opts.raw ? data.data : data;
      if (isArray(_data)) {
        _data = _data.map(function (item) {
          return self.createRecord(item);
        });
      } else {
        _data = self.createRecord(_data);
      }
      if (opts.raw) {
        data.data = _data;
      } else {
        data = _data;
      }
      if (opts.notify) {
        setTimeout(function () {
          self.emit(opts.op, data, opts);
        });
      }
      return data;
    },

    /**
     * Create an unsaved, uncached instance of this Mapper's
     * {@link Mapper#RecordClass}.
     *
     * Returns `props` if `props` is already an instance of
     * {@link Mapper#RecordClass}.
     *
     * @name Mapper#createRecord
     * @method
     * @param {Object} props The initial properties of the new unsaved record.
     * @param {Object} [opts] Configuration options.
     * @param {boolean} [opts.noValidate=false] Whether to skip validation on the
     * initial properties.
     * @return {Object} The unsaved record.
     */
    createRecord: function createRecord(props, opts) {
      var RecordClass = this.RecordClass;
      // Check to make sure "props" is not already an instance of this Mapper.
      return RecordClass ? props instanceof RecordClass ? props : new RecordClass(props, opts) : props;
    },

    /**
     * Return whether `record` is an instance of this Mappers's RecordClass.
     *
     * @name Mapper#is
     * @method
     * @param {Object} record The record to check.
     * @return {boolean} Whether `record` is an instance of this Mappers's
     * {@ link Mapper#RecordClass}.
     */
    is: function is(record) {
      var RecordClass = this.RecordClass;
      return RecordClass ? record instanceof RecordClass : false;
    },

    /**
     * Return a plain object representation of the given record.
     *
     * @name Mapper#toJSON
     * @method
     * @param {Object} record Record from which to create a plain object
     * representation.
     * @param {Object} [opts] Configuration options.
     * @param {string[]} [opts.with] Array of relation names or relation fields
     * to include in the representation.
     * @return {Object} Plain object representation of the record.
     */
    toJSON: function toJSON(record, opts) {
      var self = this;
      opts || (opts = {});
      var json = record;
      if (self.is(record)) {
        json = copy(record);
        // The user wants to include relations in the resulting plain object
        // representation
        if (self && self.relationList && opts.with) {
          if (isString(opts.with)) {
            opts.with = [opts.with];
          }
          self.relationList.forEach(function (def) {
            var containedName = undefined;
            if (opts.with.indexOf(def.relation) !== -1) {
              containedName = def.relation;
            } else if (opts.with.indexOf(def.localField) !== -1) {
              containedName = def.localField;
            }
            if (containedName) {
              (function () {
                var optsCopy = { with: opts.with.slice() };

                // Prepare to recurse into deeply nested relations
                optsCopy.with.splice(optsCopy.with.indexOf(containedName), 1);
                optsCopy.with.forEach(function (relation, i) {
                  if (relation && relation.indexOf(containedName) === 0 && relation.length >= containedName.length && relation[containedName.length] === '.') {
                    optsCopy.with[i] = relation.substr(containedName.length + 1);
                  } else {
                    optsCopy.with[i] = '';
                  }
                });
                var relationData = get(record, def.localField);

                if (relationData) {
                  // The actual recursion
                  if (isArray(relationData)) {
                    set(json, def.localField, relationData.map(function (item) {
                      return def.getRelation().toJSON(item, optsCopy);
                    }));
                  } else {
                    set(json, def.localField, def.getRelation().toJSON(relationData, optsCopy));
                  }
                }
              })();
            }
          });
        }
      }
      return json;
    },

    /**
     * Return the registered adapter with the given name or the default adapter if
     * no name is provided.
     *
     * @name Mapper#getAdapter
     * @method
     * @param {string} [name]- The name of the adapter to retrieve.
     * @return {Adapter} The adapter, if any.
     */
    getAdapter: function getAdapter(name) {
      var self = this;
      self.dbg('getAdapter', 'name:', name);
      var adapter = self.getAdapterName(name);
      if (!adapter) {
        throw new ReferenceError(adapter + ' not found!');
      }
      return self.getAdapters()[adapter];
    },

    /**
     * Return the name of a registered adapter based on the given name or options,
     * or the name of the default adapter if no name provided.
     *
     * @name Mapper#getAdapterName
     * @method
     * @param {(Object|string)} [opts] The name of an adapter or options, if any.
     * @return {string} The name of the adapter.
     */
    getAdapterName: function getAdapterName(opts) {
      opts || (opts = {});
      if (isString(opts)) {
        opts = { adapter: opts };
      }
      return opts.adapter || opts.defaultAdapter;
    },

    /**
     * @name Mapper#getAdapters
     * @method
     */
    getAdapters: function getAdapters() {
      return this._adapters;
    },
    getSchema: function getSchema() {
      return this.schema;
    },

    /**
     * Mapper lifecycle hook called by {@link Mapper#create}. If this method
     * returns a promise then {@link Mapper#create} will wait for the promise
     * to resolve before continuing.
     *
     * @name Mapper#beforeCreate
     * @method
     * @param {Object} props The `props` argument passed to {@link Mapper#create}.
     * @param {Object} opts The `opts` argument passed to {@link Mapper#create}.
     */
    beforeCreate: notify,

    checkUpsertCreate: function checkUpsertCreate(props, opts) {
      var self = this;
      return (opts.upsert || opts.upsert === undefined && self.upsert) && get(props, self.idAttribute);
    },

    /**
     * Create and save a new the record using the provided `props`.
     *
     * {@link Mapper#beforeCreate} will be called before calling the adapter.
     * {@link Mapper#afterCreate} will be called after calling the adapter.
     *
     * @name Mapper#create
     * @method
     * @param {Object} props The properties for the new record.
     * @param {Object} [opts] Configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
     * lifecycle events.
     * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
     * created data. If `true` return a response object that includes the created
     * data and metadata about the operation.
     * @param {string[]} [opts.with=[]] Relations to create in a cascading
     * create if `props` contains nested relations. NOT performed in a transaction.
     * @return {Promise}
     */
    create: function create(props, opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;

      // Default values for arguments
      props || (props = {});
      opts || (opts = {});

      // Check whether we should do an upsert instead
      if (self.checkUpsertCreate(props, opts)) {
        return self.update(get(props, self.idAttribute), props, opts);
      }

      // Fill in "opts" with the Mapper's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeCreate lifecycle hook
      op = opts.op = 'beforeCreate';
      return resolve(self[op](props, opts)).then(function (_props) {
        // Allow for re-assignment from lifecycle hook
        props = _props || props;
        // Now delegate to the adapter
        op = opts.op = 'create';
        var json = self.toJSON(props, opts);
        self.dbg(op, json, opts);
        return resolve(self.getAdapter(adapter)[op](self, json, opts));
      }).then(function (data) {
        // afterCreate lifecycle hook
        op = opts.op = 'afterCreate';
        return resolve(self[op](data, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          // Possibly formulate result object
          return self.end(data, opts);
        });
      });
    },

    /**
     * Mapper lifecycle hook called by {@link Mapper#create}. If this method
     * returns a promise then {@link Mapper#create} will wait for the promise
     * to resolve before continuing.
     *
     * @name Mapper#afterCreate
     * @method
     * @param {Object} data The `data` return by the adapter.
     * @param {Object} opts The `opts` argument passed to {@link Mapper#create}.
     */
    afterCreate: notify,

    /**
     * Mapper lifecycle hook called by {@link Mapper#createMany}. If this method
     * returns a promise then {@link Mapper#createMany} will wait for the promise
     * to resolve before continuing.
     *
     * @name Mapper#beforeCreateMany
     * @method
     * @param {Array} records The `records` argument passed to {@link Mapper#createMany}.
     * @param {Object} opts The `opts` argument passed to {@link Mapper#createMany}.
     */
    beforeCreateMany: notify,

    checkUpsertCreateMany: function checkUpsertCreateMany(records, opts) {
      var self = this;
      if (opts.upsert || opts.upsert === undefined && self.upsert) {
        return records.reduce(function (hasId, item) {
          return hasId && get(item, self.idAttribute);
        }, true);
      }
    },

    /**
     * Given an array of records, batch create them via an adapter.
     *
     * {@link Mapper#beforeCreateMany} will be called before calling the adapter.
     * {@link Mapper#afterCreateMany} will be called after calling the adapter.
     *
     * @name Mapper#createMany
     * @method
     * @param {Array} records Array of records to be created in one batch.
     * @param {Object} [opts] Configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
     * lifecycle events.
     * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
     * updated data. If `true` return a response object that includes the updated
     * data and metadata about the operation.
     * @param {string[]} [opts.with=[]] Relations to create in a cascading create
     * if the records to be created have linked/nested relations. NOT performed
     * in a transaction.
     * @return {Promise}
     */
    createMany: function createMany(records, opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;

      // Default values for arguments
      records || (records = []);
      opts || (opts = {});

      // Check whether we should do an upsert instead
      if (self.checkUpsertCreateMany(records, opts)) {
        return self.updateMany(records, opts);
      }

      // Fill in "opts" with the Mapper's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeCreateMany lifecycle hook
      op = opts.op = 'beforeCreateMany';
      return resolve(self[op](records, opts)).then(function (_records) {
        // Allow for re-assignment from lifecycle hook
        records = _records || records;
        // Now delegate to the adapter
        op = opts.op = 'createMany';
        var json = records.map(function (item) {
          return self.toJSON(item, opts);
        });
        self.dbg(op, json, opts);
        return resolve(self.getAdapter(adapter)[op](self, json, opts));
      }).then(function (data) {
        // afterCreateMany lifecycle hook
        op = opts.op = 'afterCreateMany';
        return resolve(self[op](data, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          // Possibly inject result and/or formulate result object
          return self.end(data, opts);
        });
      });
    },

    /**
     * Mapper lifecycle hook called by {@link Mapper#createMany}. If this method
     * returns a promise then {@link Mapper#createMany} will wait for the promise
     * to resolve before continuing.
     *
     * @name Mapper#afterCreateMany
     * @method
     * @param {Array} records The `records` argument passed to {@link Mapper#createMany}.
     * @param {Object} opts The `opts` argument passed to {@link Mapper#createMany}.
     */
    afterCreateMany: notify,

    /**
     * Mappers lifecycle hook called by {@link Mapper#find}. If this method
     * returns a promise then {@link Mapper#find} will wait for the promise
     * to resolve before continuing.
     *
     * @name Mapper#beforeFind
     * @method
     * @param {(string|number)} id The `id` argument passed to {@link Mapper#find}.
     * @param {Object} opts The `opts` argument passed to {@link Mapper#find}.
     */
    beforeFind: notify,

    /**
     * Retrieve via an adapter the record with the given primary key.
     *
     * {@link Mapper#beforeFind} will be called before calling the adapter.
     * {@link Mapper#afterFind} will be called after calling the adapter.
     *
     * @name Mapper#find
     * @method
     * @param {(string|number)} id The primary key of the record to retrieve.
     * @param {Object} [opts] Configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
     * lifecycle events.
     * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
     * updated data. If `true` return a response object that includes the updated
     * data and metadata about the operation.
     * @param {string[]} [opts.with=[]] Relations to eager load in the request.
     * @return {Promise}
     */
    find: function find(id, opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;

      // Default values for arguments
      opts || (opts = {});

      // Fill in "opts" with the Mappers's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeFind lifecycle hook
      op = opts.op = 'beforeFind';
      return resolve(self[op](id, opts)).then(function (_id) {
        // Allow for re-assignment from lifecycle hook
        id = _id === undefined ? id : _id;
        // Now delegate to the adapter
        op = opts.op = 'find';
        self.dbg(op, id, opts);
        return resolve(self.getAdapter(adapter)[op](self, id, opts));
      }).then(function (data) {
        // afterFind lifecycle hook
        op = opts.op = 'afterFind';
        return resolve(self[op](data, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          // Possibly inject result and/or formulate result object
          return self.end(data, opts);
        });
      });
    },

    /**
     * Mapper lifecycle hook called by {@link Mapper#find}. If this method
     * returns a promise then {@link Mapper#find} will wait for the promise
     * to resolve before continuing.
     *
     * @name Mapper#afterFind
     * @method
     * @param {(string|number)} id The `id` argument passed to {@link Mapper#find}.
     * @param {Object} opts The `opts` argument passed to {@link Mapper#find}.
     */
    afterFind: notify,

    /**
     * Mapper lifecycle hook called by {@link Mapper#findAll}. If this method
     * returns a promise then {@link Mapper#findAll} will wait for the promise
     * to resolve before continuing.
     *
     * @name Mapper#beforeFindAll
     * @method
     * @param {Object} query The `query` argument passed to {@link Mapper#findAll}.
     * @param {Object} opts The `opts` argument passed to {@link Mapper#findAll}.
     */
    beforeFindAll: notify,

    /**
     * Using the `query` argument, select records to pull from an adapter.
     * Expects back from the adapter the array of selected records.
     *
     * {@link Mapper#beforeFindAll} will be called before calling the adapter.
     * {@link Mapper#afterFindAll} will be called after calling the adapter.
     *
     * @name Mapper#findAll
     * @method
     * @param {Object} [query={}] Selection query.
     * @param {Object} [query.where] Filtering criteria.
     * @param {number} [query.skip] Number to skip.
     * @param {number} [query.limit] Number to limit to.
     * @param {Array} [query.orderBy] Sorting criteria.
     * @param {Object} [opts] Configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
     * lifecycle events.
     * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
     * resulting data. If `true` return a response object that includes the
     * resulting data and metadata about the operation.
     * @param {string[]} [opts.with=[]] Relations to eager load in the request.
     * @return {Promise}
     */
    findAll: function findAll(query, opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;

      // Default values for arguments
      query || (query = {});
      opts || (opts = {});

      // Fill in "opts" with the Mapper's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeFindAll lifecycle hook
      op = opts.op = 'beforeFindAll';
      return resolve(self[op](query, opts)).then(function (_query) {
        // Allow for re-assignment from lifecycle hook
        query = _query || query;
        // Now delegate to the adapter
        op = opts.op = 'findAll';
        self.dbg(op, query, opts);
        return resolve(self.getAdapter(adapter)[op](self, query, opts));
      }).then(function (data) {
        // afterFindAll lifecycle hook
        op = opts.op = 'afterFindAll';
        return resolve(self[op](data, query, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          // Possibly inject result and/or formulate result object
          return self.end(data, opts);
        });
      });
    },

    /**
     * Mapper lifecycle hook called by {@link Mapper#findAll}. If this method
     * returns a promise then {@link Mapper#findAll} will wait for the promise
     * to resolve before continuing.
     *
     * @name Mapper#afterFindAll
     * @method
     * @param {Object} data The `data` returned by the adapter.
     * @param {Object} query The `query` argument passed to {@link Mapper#findAll}.
     * @param {Object} opts The `opts` argument passed to {@link Mapper#findAll}.
     */
    afterFindAll: notify,

    /**
     * Mapper lifecycle hook called by {@link Mapper#update}. If this method
     * returns a promise then {@link Mapper#update} will wait for the promise
     * to resolve before continuing.
     *
     * @name Mapper#beforeUpdate
     * @method
     * @param {(string|number)} id The `id` argument passed to {@link Mapper#update}.
     * @param {props} props The `props` argument passed to {@link Mapper#update}.
     * @param {Object} opts The `opts` argument passed to {@link Mapper#update}.
     */
    beforeUpdate: notify,

    /**
     * Using an adapter, update the record with the primary key specified by the
     * `id` argument.
     *
     * {@link Mapper#beforeUpdate} will be called before updating the record.
     * {@link Mapper#afterUpdate} will be called after updating the record.
     *
     * @name Mapper#update
     * @method
     * @param {(string|number)} id The primary key of the record to update.
     * @param {Object} props The update to apply to the record.
     * @param {Object} [opts] Configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
     * lifecycle events.
     * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
     * updated data. If `true` return a response object that includes the updated
     * data and metadata about the operation.
     * @param {string[]} [opts.with=[]] Relations to update in a cascading
     * update if `props` contains nested updates to relations. NOT performed in a
     * transaction.
     * @return {Promise}
     */
    update: function update(id, props, opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;

      // Default values for arguments
      props || (props = {});
      opts || (opts = {});

      // Fill in "opts" with the Mapper's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeUpdate lifecycle hook
      op = opts.op = 'beforeUpdate';
      return resolve(self[op](id, props, opts)).then(function (_props) {
        // Allow for re-assignment from lifecycle hook
        props = _props || props;
        // Now delegate to the adapter
        op = opts.op = 'update';
        var json = self.toJSON(props, opts);
        self.dbg(op, id, json, opts);
        return resolve(self.getAdapter(adapter)[op](self, id, json, opts));
      }).then(function (data) {
        // afterUpdate lifecycle hook
        op = opts.op = 'afterUpdate';
        return resolve(self[op](id, data, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          // Possibly inject result and/or formulate result object
          return self.end(data, opts);
        });
      });
    },

    /**
     * Mapper lifecycle hook called by {@link Mapper#update}. If this method
     * returns a promise then {@link Mapper#update} will wait for the promise
     * to resolve before continuing.
     *
     * @name Mapper#afterUpdate
     * @method
     * @param {(string|number)} id The `id` argument passed to {@link Mapper#update}.
     * @param {props} props The `props` argument passed to {@link Mapper#update}.
     * @param {Object} opts The `opts` argument passed to {@link Mapper#update}.
     */
    afterUpdate: notify,

    /**
     * Mapper lifecycle hook called by {@link Mapper#updateMany}. If this method
     * returns a promise then {@link Mapper#updateMany} will wait for the promise
     * to resolve before continuing.
     *
     * @name Mapper#beforeUpdateMany
     * @method
     * @param {Array} records The `records` argument passed to {@link Mapper#updateMany}.
     * @param {Object} opts The `opts` argument passed to {@link Mapper#updateMany}.
     */
    beforeUpdateMany: notify,

    /**
     * Given an array of updates, perform each of the updates via an adapter. Each
     * "update" is a hash of properties with which to update an record. Each
     * update must contain the primary key to be updated.
     *
     * {@link Mapper#beforeUpdateMany} will be called before making the update.
     * {@link Mapper#afterUpdateMany} will be called after making the update.
     *
     * @name Mapper#updateMany
     * @method
     * @param {Array} records Array up record updates.
     * @param {Object} [opts] Configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
     * lifecycle events.
     * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
     * updated data. If `true` return a response object that includes the updated
     * data and metadata about the operation.
     * @param {string[]} [opts.with=[]] Relations to update in a cascading
     * update if each record update contains nested updates for relations. NOT
     * performed in a transaction.
     * @return {Promise}
     */
    updateMany: function updateMany(records, opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;

      // Default values for arguments
      records || (records = []);
      opts || (opts = {});

      // Fill in "opts" with the Mapper's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeUpdateMany lifecycle hook
      op = opts.op = 'beforeUpdateMany';
      return resolve(self[op](records, opts)).then(function (_records) {
        // Allow for re-assignment from lifecycle hook
        records = _records || records;
        // Now delegate to the adapter
        op = opts.op = 'updateMany';
        var json = records.map(function (item) {
          return self.toJSON(item, opts);
        });
        self.dbg(op, json, opts);
        return resolve(self.getAdapter(adapter)[op](self, json, opts));
      }).then(function (data) {
        // afterUpdateMany lifecycle hook
        op = opts.op = 'afterUpdateMany';
        return resolve(self[op](data, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          // Possibly inject result and/or formulate result object
          return self.end(data, opts);
        });
      });
    },

    /**
     * Mapper lifecycle hook called by {@link Mapper#updateMany}. If this method
     * returns a promise then {@link Mapper#updateMany} will wait for the promise
     * to resolve before continuing.
     *
     * @name Mapper#afterUpdateMany
     * @method
     * @param {Array} records The `records` argument passed to {@link Mapper#updateMany}.
     * @param {Object} opts The `opts` argument passed to {@link Mapper#updateMany}.
     */
    afterUpdateMany: notify,

    /**
     * Mapper lifecycle hook called by {@link Mapper#updateAll}. If this method
     * returns a promise then {@link Mapper#updateAll} will wait for the promise
     * to resolve before continuing.
     *
     * @name Mapper#beforeUpdateAll
     * @method
     * @param {Object} query The `query` argument passed to {@link Mapper#updateAll}.
     * @param {Object} props The `props` argument passed to {@link Mapper#updateAll}.
     * @param {Object} opts The `opts` argument passed to {@link Mapper#updateAll}.
     */
    beforeUpdateAll: notify,

    /**
     * Using the `query` argument, perform the a single updated to the selected
     * records. Expects back from the adapter an array of the updated records.
     *
     * {@link Mapper#beforeUpdateAll} will be called before making the update.
     * {@link Mapper#afterUpdateAll} will be called after making the update.
     *
     * @name Mapper#updateAll
     * @method
     * @param {Object} [query={}] Selection query.
     * @param {Object} [query.where] Filtering criteria.
     * @param {number} [query.skip] Number to skip.
     * @param {number} [query.limit] Number to limit to.
     * @param {Array} [query.orderBy] Sorting criteria.
     * @param {Object} props Update to apply to selected records.
     * @param {Object} [opts] Configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
     * lifecycle events.
     * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
     * updated data. If `true` return a response object that includes the updated
     * data and metadata about the operation.
     * @param {string[]} [opts.with=[]] Relations to update in a cascading
     * update if `props` contains nested updates to relations. NOT performed in a
     * transaction.
     * @return {Promise}
     */
    updateAll: function updateAll(query, props, opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;

      // Default values for arguments
      query || (query = {});
      props || (props = {});
      opts || (opts = {});

      // Fill in "opts" with the Mapper's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeUpdateAll lifecycle hook
      op = opts.op = 'beforeUpdateAll';
      return resolve(self[op](query, props, opts)).then(function (_props) {
        // Allow for re-assignment from lifecycle hook
        props = _props || props;
        // Now delegate to the adapter
        op = opts.op = 'updateAll';
        var json = self.toJSON(props, opts);
        self.dbg(op, query, json, opts);
        return resolve(self.getAdapter(adapter)[op](self, query, json, opts));
      }).then(function (data) {
        // afterUpdateAll lifecycle hook
        op = opts.op = 'afterUpdateAll';
        return resolve(self[op](query, data, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          // Possibly inject result and/or formulate result object
          return self.end(data, opts);
        });
      });
    },

    /**
     * Mapper lifecycle hook called by {@link Mapper#updateAll}. If this method
     * returns a promise then {@link Mapper#updateAll} will wait for the promise
     * to resolve before continuing.
     *
     * @name Mapper#afterUpdateAll
     * @method
     * @param {Object} query The `query` argument passed to {@link Mapper#updateAll}.
     * @param {Object} props The `props` argument passed to {@link Mapper#updateAll}.
     * @param {Object} opts The `opts` argument passed to {@link Mapper#updateAll}.
     */
    afterUpdateAll: notify,

    /**
     * Mapper lifecycle hook called by {@link Mapper#destroy}. If this method
     * returns a promise then {@link Mapper#destroy} will wait for the promise
     * to resolve before continuing.
     *
     * @name Mapper#beforeDestroy
     * @method
     * @param {(string|number)} id The `id` argument passed to {@link Mapper#destroy}.
     * @param {Object} opts The `opts` argument passed to {@link Mapper#destroy}.
     */
    beforeDestroy: notify,

    /**
     * Using an adapter, destroy the record with the primary key specified by the
     * `id` argument.
     *
     * {@link Mapper#beforeDestroy} will be called before destroying the record.
     * {@link Mapper#afterDestroy} will be called after destroying the record.
     *
     * @name Mapper#destroy
     * @method
     * @param {(string|number)} id The primary key of the record to destroy.
     * @param {Object} [opts] Configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
     * lifecycle events.
     * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
     * ejected data (if any). If `true` return a response object that includes the
     * ejected data (if any) and metadata about the operation.
     * @param {string[]} [opts.with=[]] Relations to destroy in a cascading
     * delete. NOT performed in a transaction.
     * @return {Promise}
     */
    destroy: function destroy(id, opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;

      // Default values for arguments
      opts || (opts = {});

      // Fill in "opts" with the Mapper's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeDestroy lifecycle hook
      op = opts.op = 'beforeDestroy';
      return resolve(self[op](id, opts)).then(function (_id) {
        // Allow for re-assignment from lifecycle hook
        id = _id === undefined ? id : _id;
        // Now delegate to the adapter
        op = opts.op = 'destroy';
        self.dbg(op, id, opts);
        return resolve(self.getAdapter(adapter)[op](self, id, opts));
      }).then(function (data) {
        // afterDestroy lifecycle hook
        op = opts.op = 'afterDestroy';
        return resolve(self[op](data, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          if (opts.raw) {
            _(opts, data);
            return data;
          }
          return data;
        });
      });
    },

    /**
     * Mapper lifecycle hook called by {@link Mapper#destroy}. If this method
     * returns a promise then {@link Mapper#destroy} will wait for the promise
     * to resolve before continuing.
     *
     * @name Mapper#afterDestroy
     * @method
     * @param {(string|number)} id The `id` argument passed to {@link Mapper#destroy}.
     * @param {Object} opts The `opts` argument passed to {@link Mapper#destroy}.
     */
    afterDestroy: notify,

    /**
     * Mapper lifecycle hook called by {@link Mapper#destroyAll}. If this method
     * returns a promise then {@link Mapper#destroyAll} will wait for the promise
     * to resolve before continuing.
     *
     * @name Mapper#beforeDestroyAll
     * @method
     * @param {query} query The `query` argument passed to {@link Mapper#destroyAll}.
     * @param {Object} opts The `opts` argument passed to {@link Mapper#destroyAll}.
     */
    beforeDestroyAll: notify,

    /**
     * Using the `query` argument, destroy the selected records via an adapter.
     * If no `query` is provided then all records will be destroyed.
     *
     * {@link Mapper#beforeDestroyAll} will be called before destroying the records.
     * {@link Mapper#afterDestroyAll} will be called after destroying the records.
     *
     * @name Mapper#destroyAll
     * @method
     * @param {Object} [query={}] Selection query.
     * @param {Object} [query.where] Filtering criteria.
     * @param {number} [query.skip] Number to skip.
     * @param {number} [query.limit] Number to limit to.
     * @param {Array} [query.orderBy] Sorting criteria.
     * @param {Object} [opts] Configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
     * lifecycle events.
     * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
     * ejected data (if any). If `true` return a response object that includes the
     * ejected data (if any) and metadata about the operation.
     * @param {string[]} [opts.with=[]] Relations to destroy in a cascading
     * delete. NOT performed in a transaction.
     * @return {Promise}
     */
    destroyAll: function destroyAll(query, opts) {
      var op = undefined,
          adapter = undefined;
      var self = this;

      // Default values for arguments
      query || (query = {});
      opts || (opts = {});

      // Fill in "opts" with the Mapper's configuration
      _(self, opts);
      adapter = opts.adapter = self.getAdapterName(opts);

      // beforeDestroyAll lifecycle hook
      op = opts.op = 'beforeDestroyAll';
      return resolve(self[op](query, opts)).then(function (_query) {
        // Allow for re-assignment from lifecycle hook
        query = _query || query;
        // Now delegate to the adapter
        op = opts.op = 'destroyAll';
        self.dbg(op, query, opts);
        return resolve(self.getAdapter(adapter)[op](self, query, opts));
      }).then(function (data) {
        // afterDestroyAll lifecycle hook
        op = opts.op = 'afterDestroyAll';
        return resolve(self[op](data, query, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data;
          if (opts.raw) {
            _(opts, data);
            return data;
          }
          return data;
        });
      });
    },

    /**
     * Mapper lifecycle hook called by {@link Mapper#destroyAll}. If this method
     * returns a promise then {@link Mapper#destroyAll} will wait for the promise
     * to resolve before continuing.
     *
     * @name Mapper#afterDestroyAll
     * @method
     * @param {*} data The `data` returned by the adapter.
     * @param {query} query The `query` argument passed to {@link Mapper#destroyAll}.
     * @param {Object} opts The `opts` argument passed to {@link Mapper#destroyAll}.
     */
    afterDestroyAll: notify,

    /**
     * @name Mapper#log
     * @method
     */
    log: function log(level) {
      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      if (level && !args.length) {
        args.push(level);
        level = 'debug';
      }
      if (level === 'debug' && !this.debug) {
        return;
      }
      var prefix = level.toUpperCase() + ': (' + this.name + ')';
      if (console[level]) {
        var _console;

        (_console = console)[level].apply(_console, [prefix].concat(args));
      } else {
        var _console2;

        (_console2 = console).log.apply(_console2, [prefix].concat(args));
      }
    },

    /**
     * @name Mapper#dbg
     * @method
     */
    dbg: function dbg() {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      this.log.apply(this, ['debug'].concat(args));
    },

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
     *
     * @name Mapper#belongsTo
     * @method
     */
    belongsTo: function belongsTo$$(RelatedMapper, opts) {
      return belongsTo(RelatedMapper, opts)(this);
    },

    /**
     * Usage:
     *
     * User.hasMany(Post, {
     *   localField: 'my_posts'
     * })
     *
     * @name Mapper#hasMany
     * @method
     */
    hasMany: function hasMany$$(RelatedMapper, opts) {
      return hasMany(RelatedMapper, opts)(this);
    },

    /**
     * Usage:
     *
     * User.hasOne(Profile, {
     *   localField: '_profile'
     * })
     *
     * @name Mapper#hasOne
     * @method
     */
    hasOne: function hasOne$$(RelatedMapper, opts) {
      return hasOne(RelatedMapper, opts)(this);
    },

    /**
     * Invoke the {@link module:js-data.exports.setSchema setSchema} decorator on
     * this Mapper.
     *
     * @name Mapper#setSchema
     * @method
     * @param {Object} opts Property configurations.
     * @return {Mapper} A reference to the Mapper for chaining.
     */
    setSchema: function setSchema$$(opts) {
      return setSchema(opts)(this);
    },

    /**
     * Invoke the {@link module:js-data.exports.configure configure} decorator on
     * this Mapper.
     *
     * @name Mapper#configure
     * @method
     * @param {Object} opts Configuration
     * @return {Mapper} A reference to the Mapper for chaining.
     */
    configure: function configure$$(opts) {
      return configure(opts)(this);
    },

    /**
     * Invoke the {@link module:js-data.exports.registerAdapter registerAdapter}
     * decorator on this Mapper.
     *
     * @name Mapper#registerAdapter
     * @method
     * @param {string} name The name of the adapter to register.
     * @param {Adapter} adapter The adapter to register.
     * @param {Object} [opts] Configuration options.
     * @param {boolean} [opts.default=false] Whether to make the adapter the
     * default for this Mapper.
     * @return {Mapper} A reference to the Mapper for chaining.
     */
    registerAdapter: function registerAdapter$$(name, adapter, opts) {
      return registerAdapter(name, adapter, opts)(this);
    }
  });

  /**
   * Create a Mapper subclass.
   *
   * @name Mapper.extend
   * @method
   * @param {Object} [props={}] Properties to add to the prototype of the
   * subclass.
   * @param {Object} [classProps={}] Static properties to add to the subclass.
   * @return {Function} Subclass of Mapper.
   */
  Mapper.extend = extend;

  /**
   * Register a new event listener on this Mapper.
   *
   * @name Mapper#on
   * @method
   */

  /**
   * Remove an event listener from this Mapper.
   *
   * @name Mapper#off
   * @method
   */

  /**
   * Trigger an event on this Mapper.
   *
   * @name Mapper#emit
   * @method
   * @param {string} event Name of event to emit.
   */

  /**
   * A Mapper's registered listeners are stored at {@link Mapper#_listeners}.
   */
  eventify(Mapper.prototype, function () {
    return this._listeners;
  }, function (value) {
    this._listeners = value;
  });

  var belongsToType = 'belongsTo';
  var hasManyType = 'hasMany';
  var hasOneType = 'hasOne';

  var CONTAINER_DEFAULTS = {};

  /**
   * TODO
   *
   * @class Container
   * @param {Object} [opts] Configuration options.
   * @return {Container}
   */
  function Container(opts) {
    var self = this;
    classCallCheck(self, Container);

    opts || (opts = {});
    fillIn(self, opts);
    fillIn(self, CONTAINER_DEFAULTS);

    self._adapters = {};
    self._mappers = {};
    self.mapperDefaults = self.mapperDefaults || {};
    self.MapperClass = self.MapperClass || Mapper;
  }

  Container.extend = extend;

  addHiddenPropsToTarget(Container.prototype, {
    /**
     * TODO
     *
     * @name Container#defineMapper
     * @method
     * @param {string} name {@link Mapper#name}.
     * @param {Object} [opts] Configuration options. Passed to {@link Mapper}.
     * @return {Mapper}
     */

    defineMapper: function defineMapper(name, opts) {
      var self = this;

      // For backwards compatibility with defineResource
      if (isObject(name)) {
        opts = name;
        if (opts.name) {
          throw new Error('name is required!');
        }
        name = opts.name;
      }

      // Default values for arguments
      opts || (opts = {});
      opts.name = name;
      opts.relations || (opts.relations = {});

      // Check if the user is overriding the datastore's default MapperClass
      var MapperClass = opts.MapperClass || self.MapperClass;
      delete opts.MapperClass;

      // Apply the datastore's defaults to the options going into the mapper
      fillIn(opts, self.mapperDefaults);

      // Instantiate a mapper
      var mapper = self._mappers[name] = new MapperClass(opts);
      // Make sure the mapper's name is set
      mapper.name = name;
      // All mappers in this datastore will share adapters
      mapper._adapters = self.getAdapters();

      // Setup the mapper's relations, including generating Mapper#relationList
      // and Mapper#relationFields
      forOwn(mapper.relations, function (group, type) {
        forOwn(group, function (relations, _name) {
          if (isObject(relations)) {
            relations = [relations];
          }
          relations.forEach(function (def) {
            def.getRelation = function () {
              return self.getMapper(_name);
            };
            var Relation = self._mappers[_name] || _name;
            if (type === belongsToType) {
              mapper.belongsTo(Relation, def);
            } else if (type === hasOneType) {
              mapper.hasOne(Relation, def);
            } else if (type === hasManyType) {
              mapper.hasMany(Relation, def);
            }
          });
        });
      });

      return mapper;
    },

    /**
     * TODO
     *
     * @name Container#getAdapters
     * @method
     * @return {Adapter}
     */
    getAdapters: function getAdapters() {
      return this._adapters;
    },

    /**
     * TODO
     *
     * @name Container#getMapper
     * @method
     * @param {string} name {@link Mapper#name}.
     * @return {Mapper}
     */
    getMapper: function getMapper(name) {
      var mapper = this._mappers[name];
      if (!mapper) {
        throw new ReferenceError(name + ' is not a registered mapper!');
      }
      return mapper;
    },

    /**
     * TODO
     *
     * @name Container#registerAdapter
     * @method
     * @param {string} name {@link Mapper#name}.
     * @param {Adapter} adapter Adapter to register.
     * @param {Object} [opts] Configuration options.
     */
    registerAdapter: function registerAdapter$$(name, adapter, opts) {
      registerAdapter(name, adapter, opts)(this);
    }
  });

  var belongsToType$1 = 'belongsTo';
  var hasManyType$1 = 'hasMany';
  var hasOneType$1 = 'hasOne';

  /**
   * TODO
   *
   * @class LinkedCollection
   * @extends Collection
   * @param {Array} [records] Initial set of records to insert into the
   * collection. See {@link Collection}.
   * @param {Object} [opts] Configuration options. See {@link Collection}.
   * @return {Mapper}
   */
  var LinkedCollection = Collection.extend({
    constructor: function constructor(records, opts) {
      var self = this;
      classCallCheck(self, LinkedCollection);

      getSuper(self).call(self, records, opts);

      // Make sure this collection has somewhere to store "added" timestamps
      self._added = {};

      // Make sure this collection a reference to a datastore
      if (!self.datastore) {
        throw new Error('This collection must have a datastore!');
      }
      return self;
    },
    add: function add(records, opts) {
      var self = this;
      var datastore = self.datastore;
      var mapper = self.mapper;
      var relationList = mapper.relationList || [];
      var timestamp = new Date().getTime();
      var singular = undefined;

      records = getSuper(self).prototype.add.call(self, records, opts);

      if (isObject(records) && !isArray(records)) {
        singular = true;
        records = [records];
      }

      records.forEach(function (record) {
        // Track when this record was added
        self._added[self.recordId(record)] = timestamp;
      });

      if (relationList.length && records.length) {
        // Check the currently visited record for relations that need to be
        // inserted into their respective collections.
        mapper.relationList.forEach(function (def) {
          if (def.add === false) {
            return;
          }
          var relationName = def.relation;
          // A reference to the Mapper that this Mapper is related to
          var Relation = datastore.getMapper(relationName);
          // The field used by the related Mapper as the primary key
          var relationIdAttribute = Relation.idAttribute;
          // Grab the foreign key in this relationship, if there is one
          var foreignKey = def.foreignKey;
          var localField = def.localField;
          // A lot of this is an optimization for being able to insert a lot of
          // data as quickly as possible
          var relatedCollection = datastore.getCollection(relationName);
          var type = def.type;
          var isBelongsTo = type === belongsToType$1;
          var isHasMany = type === hasManyType$1;
          var isHasOne = type === hasOneType$1;
          var relatedData = undefined;

          records.forEach(function (record) {
            // Grab a reference to the related data attached or linked to the
            // currently visited record
            relatedData = get(record, localField);

            if (relatedData) {
              (function () {
                var id = get(record, mapper.idAttribute);
                // Otherwise, if there is something to be added, add it
                if (isHasMany) {
                  // Handle inserting hasMany relations
                  relatedData = relatedData.map(function (toInsertItem) {
                    // Check that this item isn't the same item that is already in the
                    // store
                    if (toInsertItem !== relatedCollection.get(get(toInsertItem, relationIdAttribute))) {
                      // Make sure this item has its foreignKey
                      if (foreignKey) {
                        set(toInsertItem, foreignKey, id);
                      }
                      // Finally add this related item
                      toInsertItem = relatedCollection.add(relationName, toInsertItem);
                    }
                    return toInsertItem;
                  });
                  // If it's the parent that has the localKeys
                  if (def.localKeys) {
                    set(record, def.localKeys, relatedData.map(function (inserted) {
                      return get(inserted, relationIdAttribute);
                    }));
                  }
                } else {
                  var relatedDataId = get(relatedData, relationIdAttribute);
                  // Handle inserting belongsTo and hasOne relations
                  if (relatedData !== relatedCollection.get(relatedDataId)) {
                    // Make sure foreignKey field is set
                    if (isBelongsTo) {
                      set(record, def.foreignKey, relatedDataId);
                    } else if (isHasOne) {
                      set(relatedData, def.foreignKey, id);
                    }
                    // Finally insert this related item
                    relatedData = relatedCollection.add(relationName, relatedData);
                  }
                }
                set(record, localField, relatedData);
              })();
            }
          });
        });
      }

      return singular ? records[0] : records;
    },
    remove: function remove(id, opts) {
      var self = this;
      delete self._added[id];
      return getSuper(self).prototype.remove.call(self, id, opts);
    },
    removeAll: function removeAll(query, opts) {
      var self = this;
      var records = getSuper(self).prototype.removeAll.call(self, query, opts);
      records.forEach(function (record) {
        delete self._added[self.recordId(record)];
      });
      return records;
    }
  });

  LinkedCollection.extend = extend;

  var DATASTORE_DEFAULTS = {
    linkRelations: isBrowser
  };

  /**
   * TODO
   *
   * See {@link Container}.
   *
   * @class DataStore
   * @extends Container
   * @param {Object} [opts] Configuration options. See {@link Container}.
   * @return {DataStore}
   */
  var DataStore = Container.extend({
    constructor: function constructor(opts) {
      var self = this;
      classCallCheck(self, DataStore);

      getSuper(self).call(self, opts);
      self.CollectionClass = self.CollectionClass || LinkedCollection;
      self._collections = {};
      fillIn(self, DATASTORE_DEFAULTS);
      return self;
    },

    /**
     * TODO
     *
     * @name DataStore#_end
     * @method
     * @private
     * @param {string} name Name of the {@link LinkedCollection} to which to
     * add the data.
     * @param {Object} data TODO.
     * @param {Object} [opts] Configuration options.
     * @return {(Object|Array)} Result.
     */
    _end: function _end(name, data, opts) {
      if (opts.raw) {
        data.data = this.getCollection(name).add(data.data, opts);
        return data;
      } else {
        data = this.getCollection(name).add(data, opts);
      }
      return data;
    },

    /**
     * TODO
     *
     * @name DataStore#create
     * @method
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {Object} record Passed to {@link Mapper#create}.
     * @param {Object} [opts] Passed to {@link Mapper#create}. See
     * {@link Mapper#create} for more configuration options.
     * @return {Promise}
     */
    create: function create(name, record, opts) {
      var self = this;
      opts || (opts = {});
      fillIn(opts, self.modelOpts);
      return self.getMapper(name).create(record, opts).then(function (data) {
        return self._end(name, data, opts);
      });
    },

    /**
     * TODO
     *
     * @name DataStore#createMany
     * @method
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {Array} records Passed to {@link Mapper#createMany}.
     * @param {Object} [opts] Passed to {@link Mapper#createMany}. See
     * {@link Mapper#createMany} for more configuration options.
     * @return {Promise}
     */
    createMany: function createMany(name, records, opts) {
      var self = this;
      opts || (opts = {});
      fillIn(opts, self.modelOpts);
      return self.getMapper(name).createMany(records, opts).then(function (data) {
        return self._end(name, data, opts);
      });
    },
    defineMapper: function defineMapper(name, opts) {
      var self = this;
      var mapper = getSuper(self).prototype.defineMapper.call(self, name, opts);
      mapper.relationList = mapper.relationList || [];
      mapper.relationList.forEach(function (def) {
        // Conditionally add getters and setters to RecordClass prototype
      });

      // The datastore uses a subclass of Collection that is "datastore-aware"
      var collection = self._collections[name] = new self.CollectionClass(null, {
        // Make sure the collection has somewhere to store "added" timestamps
        _added: {},
        // Give the collection a reference to this datastore
        datastore: self,
        // The mapper tied to the collection
        mapper: mapper
      });

      // Create a secondary index on the "added" timestamps of records in the
      // collection
      collection.createIndex('addedTimestamps', ['$'], {
        fieldGetter: function fieldGetter(obj) {
          return collection._added[collection.recordId(obj)];
        }
      });
      return mapper;
    },

    /**
     * TODO
     *
     * @name DataStore#destroy
     * @method
     * @param {string} name - Name of the {@link Mapper} to target.
     * @param {(string|number)} id - Passed to {@link Mapper#destroy}.
     * @param {Object} [opts] - Passed to {@link Mapper#destroy}. See
     * {@link Mapper#destroy} for more configuration options.
     * @return {Promise}
     */
    destroy: function destroy(name, id, opts) {
      var self = this;
      opts || (opts = {});
      fillIn(opts, self.modelOpts);
      return self.getMapper(name).destroy(id, opts).then(function (data) {
        if (opts.raw) {
          data.data = self.getCollection(name).remove(id, opts);
        } else {
          data = self.getCollection(name).remove(id, opts);
        }
        return data;
      });
    },

    /**
     * TODO
     *
     * @name Mapper#destroyAll
     * @method
     * @param {string} name - Name of the {@link Mapper} to target.
     * @param {Object} [query] - Passed to {@link Mapper#destroyAll}.
     * @param {Object} [opts] - Passed to {@link Mapper#destroyAll}. See
     * {@link Mapper#destroyAll} for more configuration options.
     * @return {Promise}
     */
    destroyAll: function destroyAll(name, query, opts) {
      var self = this;
      opts || (opts = {});
      fillIn(opts, self.modelOpts);
      return self.getMapper(name).destroyAll(query, opts).then(function (data) {
        if (opts.raw) {
          data.data = self.getCollection(name).removeAll(query, opts);
        } else {
          data = self.getCollection(name).removeAll(query, opts);
        }
        return data;
      });
    },

    /**
     * TODO
     *
     * @name DataStore#find
     * @method
     * @param {string} name - Name of the {@link Mapper} to target.
     * @param {(string|number)} id - Passed to {@link Mapper#find}.
     * @param {Object} [opts] - Passed to {@link Mapper#find}.
     * @return {Promise}
     */
    find: function find(name, id, opts) {
      var self = this;
      opts || (opts = {});
      fillIn(opts, self.modelOpts);
      return self.getMapper(name).find(id, opts).then(function (data) {
        return self._end(name, data, opts);
      });
    },

    /**
     * TODO
     *
     * @name DataStore#findAll
     * @method
     * @param {string} name - Name of the {@link Mapper} to target.
     * @param {Object} [query] - Passed to {@link Model.findAll}.
     * @param {Object} [opts] - Passed to {@link Model.findAll}.
     * @return {Promise}
     */
    findAll: function findAll(name, query, opts) {
      var self = this;
      opts || (opts = {});
      fillIn(opts, self.modelOpts);
      return self.getMapper(name).findAll(query, opts).then(function (data) {
        return self._end(name, data, opts);
      });
    },

    /**
     * TODO
     *
     * @name DataStore#getCollection
     * @method
     * @param {string} name Name of the {@link DataStoreCollection} to retrieve.
     * @return {DataStoreCollection}
     */
    getCollection: function getCollection(name) {
      var collection = this._collections[name];
      if (!collection) {
        throw new ReferenceError(name + ' is not a registered collection!');
      }
      return collection;
    },

    /**
     * TODO
     *
     * @name DataStore#update
     * @method
     * @param {string} name - Name of the {@link Mapper} to target.
     * @param {(string|number)} id - Passed to {@link Mapper#update}.
     * @param {Object} record - Passed to {@link Mapper#update}.
     * @param {Object} [opts] - Passed to {@link Mapper#update}. See
     * {@link Mapper#update} for more configuration options.
     * @return {Promise}
     */
    update: function update(name, id, record, opts) {
      var self = this;
      opts || (opts = {});
      fillIn(opts, self.modelOpts);
      return self.getMapper(name).update(id, record, opts).then(function (data) {
        return self._end(name, data, opts);
      });
    },

    /**
     * TODO
     *
     * @name DataStore#updateAll
     * @method
     * @param {string} name - Name of the {@link Mapper} to target.
     * @param {Object?} query - Passed to {@link Model.updateAll}.
     * @param {Object} props - Passed to {@link Model.updateAll}.
     * @param {Object} [opts] - Passed to {@link Model.updateAll}. See
     * {@link Model.updateAll} for more configuration options.
     * @return {Promise}
     */
    updateAll: function updateAll(name, query, props, opts) {
      var self = this;
      opts || (opts = {});
      fillIn(opts, self.modelOpts);
      return self.getMapper(name).updateAll(query, props, opts).then(function (data) {
        return self._end(name, data, opts);
      });
    },

    /**
     * TODO
     *
     * @name DataStore#updateMany
     * @method
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {(Object[]|Record[])} records Passed to {@link Mapper#updateMany}.
     * @param {Object} [opts] Passed to {@link Mapper#updateMany}. See
     * {@link Mapper#updateMany} for more configuration options.
     * @return {Promise}
     */
    updateMany: function updateMany(name, records, opts) {
      var self = this;
      opts || (opts = {});
      fillIn(opts, self.modelOpts);
      return self.getMapper(name).updateMany(records, opts).then(function (data) {
        return self._end(name, data, opts);
      });
    }
  });

  DataStore.prototype.defineResource = DataStore.prototype.defineMapper;
  DataStore.extend = extend;

  /**
   * Registered as `js-data` in NPM and Bower.
   * #### Script tag
   * ```js
   * window.JSData
   * ```
   * #### CommonJS
   * ```js
   * var JSData = require('js-data')
   * ```
   * #### ES6 Modules
   * ```js
   * import JSData from 'js-data'
   * ```
   * #### AMD
   * ```js
   * define('myApp', ['js-data'], function (JSData) { ... })
   * ```
   *
   * @module js-data
   * @property {Function} belongsTo - {@link module:js-data.exports.belongsTo belongsTo}
   * decorator function.
   * @property {Function} configure - {@link module:js-data.exports.configure configure}
   * decorator function.
   * @property {Function} Collection - {@link Collection} class.
   * @property {Function} DS - {@link DS} class.
   * @property {Function} hasMany - {@link module:js-data.exports.hasMany hasMany}
   * decorator function.
   * @property {Function} hasOne - {@link module:js-data.exports.hasOne hasOne}
   * decorator function.
   * @property {Function} initialize - {@link module:js-data.exports.initialize initialize}
   * decorator function.
   * @property {Function} Model - {@link Model} class.
   * @property {Function} registerAdapter - {@link registerAdapter} decorator
   * function.
   * @property {Function} setSchema - {@link setSchema} decorator function.
   * @property {Function} Query - {@link Query} class.
   * @property {Object} utils - Utility methods used by the `js-data` module. See
   * {@link module:js-data.module:utils utils}.
   * @property {Object} version - Details of the current version of the `js-data`
   * module.
   * @property {string} version.full - The full semver value.
   * @property {number} version.major - The major version number.
   * @property {number} version.minor - The minor version number.
   * @property {number} version.patch - The patch version number.
   * @property {(string|boolean)} version.alpha - The alpha version value,
   * otherwise `false` if the current version is not alpha.
   * @property {(string|boolean)} version.beta - The beta version value,
   * otherwise `false` if the current version is not beta.
   */

  var version = {
    full: '3.0.0-alpha.11',
    major: parseInt('3', 10),
    minor: parseInt('0', 10),
    patch: parseInt('0', 10),
    alpha: '11' !== 'false' ? '11' : false,
    beta: 'false' !== 'false' ? 'false' : false
  };

  var DS = DataStore;

  exports.Collection = Collection;
  exports.Container = Container;
  exports.DataStore = DataStore;
  exports.DS = DS;
  exports.LinkedCollection = LinkedCollection;
  exports.Mapper = Mapper;
  exports.Query = Query;
  exports.Record = Record;
  exports.utils = utils;
  exports.version = version;
  exports.belongsTo = belongsTo;
  exports.configure = configure;
  exports.hasMany = hasMany;
  exports.hasOne = hasOne;
  exports.setSchema = setSchema;
  exports.registerAdapter = registerAdapter;
  exports.types = types;
  exports.typeGroupValidators = typeGroupValidators;
  exports.validationKeywords = validationKeywords;
  exports.validate = validate;
  exports.Schema = Schema;

}));
//# sourceMappingURL=js-data.js.map