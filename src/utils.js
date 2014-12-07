/* jshint -W041 */
var w, _Promise;
var objectProto = Object.prototype;
var toString = objectProto.toString;
var DSErrors = require('./errors');
var forEach = require('mout/array/forEach');
var slice = require('mout/array/slice');
var forOwn = require('mout/object/forOwn');
var observe = require('../lib/observe-js/observe-js');
var es6Promise = require('es6-promise');
es6Promise.polyfill();

var isArray = Array.isArray || function isArray(value) {
    return toString.call(value) == '[object Array]' || false;
  };

function isRegExp(value) {
  return toString.call(value) == '[object RegExp]' || false;
}

// adapted from lodash.isBoolean
function isBoolean(value) {
  return (value === true || value === false || value && typeof value == 'object' && toString.call(value) == '[object Boolean]') || false;
}

// adapted from lodash.isString
function isString(value) {
  return typeof value == 'string' || (value && typeof value == 'object' && toString.call(value) == '[object String]') || false;
}

function isObject(value) {
  return toString.call(value) == '[object Object]' || false;
}

// adapted from lodash.isDate
function isDate(value) {
  return (value && typeof value == 'object' && toString.call(value) == '[object Date]') || false;
}

// adapted from lodash.isNumber
function isNumber(value) {
  var type = typeof value;
  return type == 'number' || (value && type == 'object' && toString.call(value) == '[object Number]') || false;
}

// adapted from lodash.isFunction
function isFunction(value) {
  return typeof value == 'function' || (value && toString.call(value) === '[object Function]') || false;
}

// adapted from mout.isEmpty
function isEmpty(val) {
  if (val == null) {
    // typeof null == 'object' so we check it first
    return true;
  } else if (typeof val === 'string' || isArray(val)) {
    return !val.length;
  } else if (typeof val === 'object') {
    var result = true;
    forOwn(val, function () {
      result = false;
      return false; // break loop
    });
    return result;
  } else {
    return true;
  }
}

function intersection(array1, array2) {
  if (!array1 || !array2) {
    return [];
  }
  var result = [];
  var item;
  for (var i = 0, length = array1.length; i < length; i++) {
    item = array1[i];
    if (DSUtils.contains(result, item)) {
      continue;
    }
    if (DSUtils.contains(array2, item)) {
      result.push(item);
    }
  }
  return result;
}

function filter(array, cb, thisObj) {
  var results = [];
  forEach(array, function (value, key, arr) {
    if (cb(value, key, arr)) {
      results.push(value);
    }
  }, thisObj);
  return results;
}

function finallyPolyfill(cb) {
  var constructor = this.constructor;

  return this.then(function (value) {
    return constructor.resolve(cb()).then(function () {
      return value;
    });
  }, function (reason) {
    return constructor.resolve(cb()).then(function () {
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

function updateTimestamp(timestamp) {
  var newTimestamp = typeof Date.now === 'function' ? Date.now() : new Date().getTime();
  if (timestamp && newTimestamp <= timestamp) {
    return timestamp + 1;
  } else {
    return newTimestamp;
  }
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
    var args = Array.prototype.slice.call(arguments);
    var listeners = events[args.shift()] || [];
    if (listeners) {
      for (var i = 0; i < listeners.length; i++) {
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
  var element = heap[n];
  var weight = weightFunc(element);
  // When at 0, an element can not go up any further.
  while (n > 0) {
    // Compute the parent element's index, and fetch it.
    var parentN = Math.floor((n + 1) / 2) - 1;
    var parent = heap[parentN];
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
function bubbleDown(heap, weightFunc, n) {
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
}

function DSBinaryHeap(weightFunc, compareFunc) {
  if (weightFunc && !isFunction(weightFunc)) {
    throw new Error('DSBinaryHeap(weightFunc): weightFunc: must be a function!');
  }
  weightFunc = weightFunc || function (x) {
    return x;
  };
  compareFunc = compareFunc || function (x, y) {
    return x === y;
  };
  this.weightFunc = weightFunc;
  this.compareFunc = compareFunc;
  this.heap = [];
}

var dsp = DSBinaryHeap.prototype;

dsp.push = function (node) {
  this.heap.push(node);
  bubbleUp(this.heap, this.weightFunc, this.heap.length - 1);
};

dsp.peek = function () {
  return this.heap[0];
};

dsp.pop = function () {
  var front = this.heap[0],
    end = this.heap.pop();
  if (this.heap.length > 0) {
    this.heap[0] = end;
    bubbleDown(this.heap, this.weightFunc, 0);
  }
  return front;
};

dsp.remove = function (node) {
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
};

dsp.removeAll = function () {
  this.heap = [];
};

dsp.size = function () {
  return this.heap.length;
};

var toPromisify = [
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
function copy(source, destination, stackSource, stackDest) {
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
        var emptyObject = Object.create(Object.getPrototypeOf(source));
        destination = copy(source, emptyObject, stackSource, stackDest);
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
      if (index !== -1) return stackDest[index];

      stackSource.push(source);
      stackDest.push(destination);
    }

    var result;
    if (isArray(source)) {
      destination.length = 0;
      for (var i = 0; i < source.length; i++) {
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
        forEach(destination, function (value, key) {
          delete destination[key];
        });
      }
      for (var key in source) {
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
}

// adapted from angular.equals
function equals(o1, o2) {
  if (o1 === o2) return true;
  if (o1 === null || o2 === null) return false;
  if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
  var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
  if (t1 == t2) {
    if (t1 == 'object') {
      if (isArray(o1)) {
        if (!isArray(o2)) return false;
        if ((length = o1.length) == o2.length) {
          for (key = 0; key < length; key++) {
            if (!equals(o1[key], o2[key])) return false;
          }
          return true;
        }
      } else if (isDate(o1)) {
        if (!isDate(o2)) return false;
        return equals(o1.getTime(), o2.getTime());
      } else if (isRegExp(o1) && isRegExp(o2)) {
        return o1.toString() == o2.toString();
      } else {
        if (isArray(o2)) return false;
        keySet = {};
        for (key in o1) {
          if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
          if (!equals(o1[key], o2[key])) return false;
          keySet[key] = true;
        }
        for (key in o2) {
          if (!keySet.hasOwnProperty(key) &&
            key.charAt(0) !== '$' &&
            o2[key] !== undefined && !isFunction(o2[key])) return false;
        }
        return true;
      }
    }
  }
  return false;
}

function resolveId(definition, idOrInstance) {
  if (this.isString(idOrInstance) || isNumber(idOrInstance)) {
    return idOrInstance;
  } else if (idOrInstance && definition) {
    return idOrInstance[definition.idAttribute] || idOrInstance;
  } else {
    return idOrInstance;
  }
}

function resolveItem(resource, idOrInstance) {
  if (resource && (isString(idOrInstance) || isNumber(idOrInstance))) {
    return resource.index[idOrInstance] || idOrInstance;
  } else {
    return idOrInstance;
  }
}

function isValidString(val) {
  return (val != null && val !== '');
}

function join(items, separator) {
  separator = separator || '';
  return filter(items, isValidString).join(separator);
}

function makePath(var_args) {
  var result = join(slice(arguments), '/');
  return result.replace(/([^:\/]|^)\/{2,}/g, '$1/');
}

observe.setEqualityFn(equals);

var DSUtils = {
  // Options that inherit from defaults
  _: function (parent, options) {
    var _this = this;
    options = options || {};
    if (options && options.constructor === parent.constructor) {
      return options;
    } else if (!isObject(options)) {
      throw new DSErrors.IA('"options" must be an object!');
    }
    forEach(toPromisify, function (name) {
      if (typeof options[name] === 'function' && options[name].toString().indexOf('var args = Array') === -1) {
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
    return new O(options);
  },
  compute: function (fn, field) {
    var _this = this;
    var args = [];
    forEach(fn.deps, function (dep) {
      args.push(_this[dep]);
    });
    // compute property
    _this[field] = fn[fn.length - 1].apply(_this, args);
  },
  contains: require('mout/array/contains'),
  copy: copy,
  deepMixIn: require('mout/object/deepMixIn'),
  diffObjectFromOldObject: observe.diffObjectFromOldObject,
  DSBinaryHeap: DSBinaryHeap,
  equals: equals,
  Events: Events,
  filter: filter,
  forEach: forEach,
  forOwn: forOwn,
  fromJson: function (json) {
    return isString(json) ? JSON.parse(json) : json;
  },
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
  pascalCase: require('mout/string/pascalCase'),
  pick: require('mout/object/pick'),
  Promise: _Promise,
  promisify: function (fn, target) {
    var Promise = this.Promise;
    if (!fn) {
      return;
    } else if (typeof fn !== 'function') {
      throw new Error('Can only promisify functions!');
    }
    return function () {
      var args = Array.prototype.slice.apply(arguments);
      return new Promise(function (resolve, reject) {

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
  remove: require('mout/array/remove'),
  set: require('mout/object/set'),
  slice: slice,
  sort: require('mout/array/sort'),
  toJson: JSON.stringify,
  updateTimestamp: updateTimestamp,
  upperCase: require('mout/string/upperCase'),
  resolveItem: resolveItem,
  resolveId: resolveId,
  w: w
};

module.exports = DSUtils;
