/* jshint eqeqeq:false */
import DSErrors from './errors';
import forEach from 'mout/array/forEach';
import slice from 'mout/array/slice';
import forOwn from 'mout/object/forOwn';
import contains from 'mout/array/contains';
import deepMixIn from 'mout/object/deepMixIn';
import pascalCase from 'mout/string/pascalCase';
import remove from 'mout/array/remove';
import pick from 'mout/object/pick';
import sort from 'mout/array/sort';
import upperCase from 'mout/string/upperCase';
import observe from '../lib/observe-js/observe-js';
import es6Promise from 'es6-promise';
let w, _Promise;
let DSUtils;
let objectProto = Object.prototype;
let toString = objectProto.toString;
es6Promise.polyfill();

let isArray = Array.isArray || function isArray(value) {
    return toString.call(value) == '[object Array]' || false;
  };

let isRegExp = value => {
  return toString.call(value) == '[object RegExp]' || false;
};

// adapted from lodash.isBoolean
let isBoolean = value => {
  return (value === true || value === false || value && typeof value == 'object' && toString.call(value) == '[object Boolean]') || false;
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

let intersection = (array1, array2) => {
  if (!array1 || !array2) {
    return [];
  }
  let result = [];
  let item;
  for (let i = 0, length = array1.length; i < length; i++) {
    item = array1[i];
    if (DSUtils.contains(result, item)) {
      continue;
    }
    if (DSUtils.contains(array2, item)) {
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

function finallyPolyfill(cb) {
  let constructor = this.constructor;

  return this.then(value => {
    return constructor.resolve(cb()).then(() => {
      return value;
    });
  }, reason => {
    return constructor.resolve(cb()).then(() => {
      throw reason;
    });
  });
}

try {
  w = window;
  if (!w.Promise.prototype['finally']) {
    w.Promise.prototype['finally'] = finallyPolyfill;
  }
  _Promise = w.Promise;
  w = {};
} catch (e) {
  w = null;
  _Promise = require('bluebird');
}

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
 * @method bubbleUp
 * @param {array} heap The heap.
 * @param {function} weightFunc The weight function.
 * @param {number} n The index of the element to bubble up.
 */
function bubbleUp(heap, weightFunc, n) {
  let element = heap[n];
  let weight = weightFunc(element);
  // When at 0, an element can not go up any further.
  while (n > 0) {
    // Compute the parent element's index, and fetch it.
    let parentN = Math.floor((n + 1) / 2) - 1;
    let parent = heap[parentN];
    // If the parent has a lesser weight, things are in order and we
    // are done.
    if (weight >= weightFunc(parent)) {
      break;
    } else {
      heap[parentN] = element;
      heap[n] = parent;
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
let bubbleDown = (heap, weightFunc, n) => {
  var length = heap.length;
  let node = heap[n];
  let nodeWeight = weightFunc(node);

  while (true) {
    let child2N = (n + 1) * 2,
      child1N = child2N - 1;
    let swap = null;
    if (child1N < length) {
      let child1 = heap[child1N],
        child1Weight = weightFunc(child1);
      // If the score is less than our node's, we need to swap.
      if (child1Weight < nodeWeight) {
        swap = child1N;
      }
    }
    // Do the same checks for the other child.
    if (child2N < length) {
      let child2 = heap[child2N],
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

class DSBinaryHeap {
  constructor(weightFunc, compareFunc) {
    if (weightFunc && !isFunction(weightFunc)) {
      throw new Error('DSBinaryHeap(weightFunc): weightFunc: must be a function!');
    }
    if (!weightFunc) {
      weightFunc = x => {
        return x;
      };
    }
    if (!compareFunc) {
      compareFunc = (x, y) => {
        return x === y;
      };
    }
    this.weightFunc = weightFunc;
    this.compareFunc = compareFunc;
    this.heap = [];
  }

  push(node) {
    this.heap.push(node);
    bubbleUp(this.heap, this.weightFunc, this.heap.length - 1);
  }

  peek() {
    return this.heap[0];
  }

  pop() {
    let _this = this;
    let front = _this.heap[0];
    let end = _this.heap.pop();
    if (_this.heap.length > 0) {
      _this.heap[0] = end;
      bubbleDown(_this.heap, _this.weightFunc, 0);
    }
    return front;
  }

  remove(node) {
    let _this = this;
    var length = _this.heap.length;
    for (let i = 0; i < length; i++) {
      if (_this.compareFunc(_this.heap[i], node)) {
        let removed = _this.heap[i];
        let end = _this.heap.pop();
        if (i !== length - 1) {
          _this.heap[i] = end;
          bubbleUp(_this.heap, _this.weightFunc, i);
          bubbleDown(_this.heap, _this.weightFunc, i);
        }
        return removed;
      }
    }
    return null;
  }

  removeAll() {
    this.heap = [];
  }

  size() {
    return this.heap.length;
  }
}

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

// adapted from angular.copy
let copy = (source, destination, stackSource, stackDest) => {
  if (!destination) {
    destination = source;
    if (source) {
      if (isArray(source)) {
        destination = copy(source, [], stackSource, stackDest);
      } else if (isDate(source)) {
        destination = new Date(source.getTime());
      } else if (isRegExp(source)) {
        destination = new RegExp(source.source, source.toString().match(/[^\/]*$/)[0]);
        destination.lastIndex = source.lastIndex;
      } else if (isObject(source)) {
        destination = copy(source, Object.create(Object.getPrototypeOf(source)), stackSource, stackDest);
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
      destination.length = 0;
      for (let i = 0; i < source.length; i++) {
        result = copy(source[i], null, stackSource, stackDest);
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
          result = copy(source[key], null, stackSource, stackDest);
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

let resolveId = (definition, idOrInstance) => {
  if (isString(idOrInstance) || isNumber(idOrInstance)) {
    return idOrInstance;
  } else if (idOrInstance && definition) {
    return idOrInstance[definition.idAttribute] || idOrInstance;
  } else {
    return idOrInstance;
  }
};

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

observe.setEqualityFn(equals);

DSUtils = {
  // Options that inherit from defaults
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
    let O = function Options(attrs) {
      let self = this;
      forOwn(attrs, (value, key) => self[key] = value);
    };
    O.prototype = parent;
    O.prototype.orig = function () {
      let orig = {};
      forOwn(this, (value, key) => orig[key] = value);
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
    forEach(fn.deps, dep => args.push(_this[dep]));
    // compute property
    _this[field] = fn[fn.length - 1].apply(_this, args);
  },
  contains,
  copy,
  deepMixIn,
  diffObjectFromOldObject: observe.diffObjectFromOldObject,
  DSBinaryHeap,
  equals,
  Events,
  filter,
  forEach,
  forOwn,
  fromJson(json) {
    return isString(json) ? JSON.parse(json) : json;
  },
  get: require('mout/object/get'),
  intersection,
  isArray,
  isBoolean,
  isDate,
  isEmpty,
  isFunction,
  isObject,
  isNumber,
  isRegExp,
  isString,
  makePath,
  observe,
  pascalCase,
  pick,
  Promise: _Promise,
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
  set: require('mout/object/set'),
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
  removeCircular(object) {
    let objects = [];

    return (function rmCirc(value) {

      let i;
      let nu;

      if (typeof value === 'object' && value !== null && !(value instanceof Boolean) && !(value instanceof Date) && !(value instanceof Number) && !(value instanceof RegExp) && !(value instanceof String)) {

        for (i = 0; i < objects.length; i += 1) {
          if (objects[i] === value) {
            return undefined;
          }
        }

        objects.push(value);

        if (DSUtils.isArray(value)) {
          nu = [];
          for (i = 0; i < value.length; i += 1) {
            nu[i] = rmCirc(value[i]);
          }
        } else {
          nu = {};
          forOwn(value, (v, k) => nu[k] = rmCirc(value[k]));
        }
        return nu;
      }
      return value;
    }(object));
  },
  resolveItem,
  resolveId,
  w
};

export default DSUtils;
