/* jshint eqeqeq:false */

/**
 * Mix of ES6 and CommonJS module imports because the interop of Babel + Webpack + ES6 modules + CommonJS isn't very good.
 */
import DSErrors from './errors';
let BinaryHeap = require('yabh');
let forEach = require('mout/array/forEach');
let slice = require('mout/array/slice');
let forOwn = require('mout/object/forOwn');
let contains = require('mout/array/contains');
let deepMixIn = require('mout/object/deepMixIn');
let pascalCase = require('mout/string/pascalCase');
let remove = require('mout/array/remove');
let pick = require('mout/object/pick');
let _keys = require('mout/object/keys');
let sort = require('mout/array/sort');
let upperCase = require('mout/string/upperCase');
let get = require('mout/object/get');
let set = require('mout/object/set');
let observe = require('../lib/observe-js/observe.js');
let w;
let objectProto = Object.prototype;
let toString = objectProto.toString;
let P;

/**
 * Attempt to detect the global Promise constructor.
 * JSData will still work without one, as long you do something like this:
 *
 * var JSData = require('js-data');
 * JSData.DSUtils.Promise = MyPromiseLib;
 */
try {
  P = Promise;
} catch (err) {
  console.error('js-data requires a global Promise constructor!');
}

let isArray = Array.isArray || function isArray(value) {
    return toString.call(value) == '[object Array]' || false;
  };

let isRegExp = value => {
  return toString.call(value) == '[object RegExp]' || false;
};

// adapted from lodash.isString
let isString = value => {
  return typeof value == 'string' || (value && typeof value == 'object' && toString.call(value) == '[object String]') || false;
};

let isObject = value => {
  return toString.call(value) == '[object Object]' || false;
};

// adapted from lodash.isDate
let isDate = value => {
  return (value && typeof value == 'object' && toString.call(value) == '[object Date]') || false;
};

// adapted from lodash.isNumber
let isNumber = value => {
  let type = typeof value;
  return type == 'number' || (value && type == 'object' && toString.call(value) == '[object Number]') || false;
};

// adapted from lodash.isFunction
let isFunction = value => {
  return typeof value == 'function' || (value && toString.call(value) === '[object Function]') || false;
};

// shorthand argument checking functions, using these shaves 1.18 kb off of the minified build
let isStringOrNumber = value => {
  return isString(value) || isNumber(value);
};
let isStringOrNumberErr = field => {
  return new DSErrors.IA(`"${field}" must be a string or a number!`);
};
let isObjectErr = field => {
  return new DSErrors.IA(`"${field}" must be an object!`);
};
let isArrayErr = field => {
  return new DSErrors.IA(`"${field}" must be an array!`);
};

// adapted from mout.isEmpty
let isEmpty = val => {
  if (val == null) { // jshint ignore:line
    // typeof null == 'object' so we check it first
    return true;
  } else if (typeof val === 'string' || isArray(val)) {
    return !val.length;
  } else if (typeof val === 'object') {
    let result = true;
    forOwn(val, () => {
      result = false;
      return false; // break loop
    });
    return result;
  } else {
    return true;
  }
};

// Find the intersection between two arrays
let intersection = (array1, array2) => {
  if (!array1 || !array2) {
    return [];
  }
  let result = [];
  let item;
  for (let i = 0, length = array1.length; i < length; i++) {
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

let filter = (array, cb, thisObj) => {
  let results = [];
  forEach(array, (value, key, arr) => {
    if (cb(value, key, arr)) {
      results.push(value);
    }
  }, thisObj);
  return results;
};

/**
 * Attempt to detect whether we are in the browser.
 */
try {
  w = window;
  w = {};
} catch (e) {
  w = null;
}

/**
 * Event mixin. Usage:
 *
 * function handler() { ... }
 * Events(myObject);
 * myObject.on('foo', handler);
 * myObject.emit('foo', 'some', 'data');
 * myObject.off('foo', handler);
 */
function Events(target) {
  let events = {};
  target = target || this;
  target.on = (type, func, ctx) => {
    events[type] = events[type] || [];
    events[type].push({
      f: func,
      c: ctx
    });
  };
  target.off = (type, func) => {
    let listeners = events[type];
    if (!listeners) {
      events = {};
    } else if (func) {
      for (let i = 0; i < listeners.length; i++) {
        if (listeners[i] === func) {
          listeners.splice(i, 1);
          break;
        }
      }
    } else {
      listeners.splice(0, listeners.length);
    }
  };
  target.emit = (...args) => {
    let listeners = events[args.shift()] || [];
    if (listeners) {
      for (let i = 0; i < listeners.length; i++) {
        listeners[i].f.apply(listeners[i].c, args);
      }
    }
  };
}

/**
 * Lifecycle hooks that should support promises.
 */
let toPromisify = [
  'beforeValidate',
  'validate',
  'afterValidate',
  'beforeCreate',
  'afterCreate',
  'beforeUpdate',
  'afterUpdate',
  'beforeDestroy',
  'afterDestroy'
];

/**
 * Return whether "prop" is in the blacklist.
 */
let isBlacklisted = observe.isBlacklisted;

// adapted from angular.copy
let copy = (source, destination, stackSource, stackDest, blacklist) => {
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
      let index = stackSource.indexOf(source);
      if (index !== -1) {
        return stackDest[index];
      }

      stackSource.push(source);
      stackDest.push(destination);
    }

    let result;
    if (isArray(source)) {
      let i;
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
        forEach(destination, (value, key) => {
          delete destination[key];
        });
      }
      for (let key in source) {
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
let equals = (o1, o2) => {
  if (o1 === o2) {
    return true;
  }
  if (o1 === null || o2 === null) {
    return false;
  }
  if (o1 !== o1 && o2 !== o2) {
    return true;
  } // NaN === NaN
  var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
  if (t1 == t2) {
    if (t1 == 'object') {
      if (isArray(o1)) {
        if (!isArray(o2)) {
          return false;
        }
        if ((length = o1.length) == o2.length) { // jshint ignore:line
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
        return equals(o1.getTime(), o2.getTime());
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
          if (!keySet.hasOwnProperty(key) &&
            key.charAt(0) !== '$' &&
            o2[key] !== undefined && !isFunction(o2[key])) {
            return false;
          }
        }
        return true;
      }
    }
  }
  return false;
};

/**
 * Given either an instance or the primary key of an instance, return the primary key.
 */
let resolveId = (definition, idOrInstance) => {
  if (isString(idOrInstance) || isNumber(idOrInstance)) {
    return idOrInstance;
  } else if (idOrInstance && definition) {
    return idOrInstance[definition.idAttribute] || idOrInstance;
  } else {
    return idOrInstance;
  }
};

/**
 * Given either an instance or the primary key of an instance, return the instance.
 */
let resolveItem = (resource, idOrInstance) => {
  if (resource && (isString(idOrInstance) || isNumber(idOrInstance))) {
    return resource.index[idOrInstance] || idOrInstance;
  } else {
    return idOrInstance;
  }
};

let isValidString = val => {
  return (val != null && val !== ''); // jshint ignore:line
};

let join = (items, separator) => {
  separator = separator || '';
  return filter(items, isValidString).join(separator);
};

let makePath = (...args) => {
  let result = join(args, '/');
  return result.replace(/([^:\/]|^)\/{2,}/g, '$1/');
};

export default {
  Promise: P,
  /**
   * Method to wrap an "options" object so that it will inherit from
   * some parent object, such as a resource definition.
   */
    _(parent, options) {
    let _this = this;
    options = options || {};
    if (options && options.constructor === parent.constructor) {
      return options;
    } else if (!isObject(options)) {
      throw new DSErrors.IA('"options" must be an object!');
    }
    forEach(toPromisify, name => {
      if (typeof options[name] === 'function' && options[name].toString().indexOf('for (var _len = arg') === -1) {
        options[name] = _this.promisify(options[name]);
      }
    });
    // Dynamic constructor function
    let O = function Options(attrs) {
      let self = this;
      forOwn(attrs, (value, key) => {
        self[key] = value;
      });
    };
    // Inherit from some parent object
    O.prototype = parent;
    // Give us a way to get the original options back.
    O.prototype.orig = function () {
      let orig = {};
      forOwn(this, (value, key) => {
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
  compute(fn, field) {
    let _this = this;
    let args = [];
    forEach(fn.deps, dep => {
      args.push(get(_this, dep));
    });
    // compute property
    set(_this, field, fn[fn.length - 1].apply(_this, args));
  },
  contains,
  copy,
  deepMixIn,
  diffObjectFromOldObject: observe.diffObjectFromOldObject,
  BinaryHeap,
  equals,
  Events,
  filter,
  fillIn(target, obj) {
    forOwn(obj, (v, k) => {
      if (!(k in target)) {
        target[k] = v;
      }
    });
    return target;
  },
  forEach,
  forOwn,
  fromJson(json) {
    return isString(json) ? JSON.parse(json) : json;
  },
  get,
  intersection,
  isArray,
  isBlacklisted,
  isEmpty,
  isFunction,
  isObject,
  isNumber,
  isString,
  keys: _keys,
  makePath,
  observe,
  omit(obj, bl) {
    let toRemove = [];
    forOwn(obj, (v, k) => {
      if (isBlacklisted(k, bl)) {
        toRemove.push(k);
      }
    });
    forEach(toRemove, k => {
      delete obj[k];
    });
    return obj;
  },
  pascalCase,
  pick,
  // Turn the given node-style callback function into one that can return a promise.
  promisify(fn, target) {
    let _this = this;
    if (!fn) {
      return;
    } else if (typeof fn !== 'function') {
      throw new Error('Can only promisify functions!');
    }
    return (...args) => {
      return new _this.Promise(function (resolve, reject) {

        args.push((err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });

        try {
          let promise = fn.apply(target || this, args);
          if (promise && promise.then) {
            promise.then(resolve, reject);
          }
        } catch (err) {
          reject(err);
        }
      });
    };
  },
  remove,
  set,
  slice,
  sort,
  toJson: JSON.stringify,
  updateTimestamp(timestamp) {
    let newTimestamp = typeof Date.now === 'function' ? Date.now() : new Date().getTime();
    if (timestamp && newTimestamp <= timestamp) {
      return timestamp + 1;
    } else {
      return newTimestamp;
    }
  },
  upperCase,
  // Return a copy of "object" with cycles removed.
  removeCircular(object) {
    return (function rmCirc(value, ctx) {
      let i;
      let nu;

      if (typeof value === 'object' && value !== null && !(value instanceof Boolean) && !(value instanceof Date) && !(value instanceof Number) && !(value instanceof RegExp) && !(value instanceof String)) {

        // check if current object points back to itself
        let cur = ctx.cur;
        var parent = ctx.ctx;
        while (parent) {
          if (parent.cur === cur) {
            return undefined;
          }
          parent = parent.ctx;
        }

        if (isArray(value)) {
          nu = [];
          for (i = 0; i < value.length; i += 1) {
            nu[i] = rmCirc(value[i], {ctx, cur: value[i]});
          }
        } else {
          nu = {};
          forOwn(value, (v, k) => {
            nu[k] = rmCirc(value[k], {ctx, cur: value[k]});
          });
        }
        return nu;
      }
      return value;
    }(object, {ctx: null, cur: object}));
  },
  resolveItem,
  resolveId,
  respond(response, meta, options) {
    if (options.returnMeta === 'array') {
      return [response, meta];
    } else if (options.returnMeta === 'object') {
      return {response, meta};
    } else {
      return response;
    }
  },
  w,
  // This is where the magic of relations happens.
  applyRelationGettersToTarget(store, definition, target) {
    this.forEach(definition.relationList, def => {
      let relationName = def.relation;
      let localField = def.localField;
      let localKey = def.localKey;
      let foreignKey = def.foreignKey;
      let localKeys = def.localKeys;
      let enumerable = typeof def.enumerable === 'boolean' ? def.enumerable : !!definition.relationsEnumerable;
      if (typeof def.link === 'boolean' ? def.link : !!definition.linkRelations) {
        delete target[localField];
        let prop = {
          enumerable,
          set() {
          }
        };
        if (def.type === 'belongsTo') {
          prop.get = function () {
            return this[localKey] ? definition.getResource(relationName).get(this[localKey]) : undefined;
          };
        } else if (def.type === 'hasMany') {
          prop.get = function () {
            let params = {};
            if (foreignKey) {
              params[foreignKey] = this[definition.idAttribute];
              return definition.getResource(relationName).defaultFilter.call(store, store.s[relationName].collection, relationName, params, {allowSimpleWhere: true});
            } else if (localKeys) {
              let keys = this[localKeys] || [];
              return definition.getResource(relationName).getAll(isArray(keys) ? keys : _keys(keys));
            }
            return undefined;
          };
        } else if (def.type === 'hasOne') {
          if (localKey) {
            prop.get = function () {
              return this[localKey] ? definition.getResource(relationName).get(this[localKey]) : undefined;
            };
          } else {
            prop.get = function () {
              let params = {};
              params[foreignKey] = this[definition.idAttribute];
              let items = params[foreignKey] ? definition.getResource(relationName).defaultFilter.call(store, store.s[relationName].collection, relationName, params, {allowSimpleWhere: true}) : [];
              if (items.length) {
                return items[0];
              }
              return undefined;
            };
          }
        }
        if (def.get) {
          let orig = prop.get;
          prop.get = function () {
            return def.get(definition, this, (...args) => orig.apply(this, args));
          };
        }
        Object.defineProperty(target, def.localField, prop);
      }
    });
  }
};
