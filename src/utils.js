var DSErrors = require('./errors');
var isFunction = require('mout/lang/isFunction');
var w;
var _Promise;

var es6Promise = require('es6-promise');
es6Promise.polyfill();

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
  if (!global.Promise.prototype['finally']) {
    global.Promise.prototype['finally'] = finallyPolyfill;
  }
  _Promise = global.Promise;
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

module.exports = {
  w: w,
  DSBinaryHeap: DSBinaryHeap,
  isBoolean: require('mout/lang/isBoolean'),
  isString: require('mout/lang/isString'),
  isArray: require('mout/lang/isArray'),
  isObject: require('mout/lang/isObject'),
  isNumber: require('mout/lang/isNumber'),
  isFunction: isFunction,
  isEmpty: require('mout/lang/isEmpty'),
  toJson: JSON.stringify,
  fromJson: JSON.parse,
  makePath: require('mout/string/makePath'),
  upperCase: require('mout/string/upperCase'),
  pascalCase: require('mout/string/pascalCase'),
  deepMixIn: require('mout/object/deepMixIn'),
  mixIn: require('mout/object/mixIn'),
  forOwn: require('mout/object/forOwn'),
  forEach: require('mout/array/forEach'),
  pick: require('mout/object/pick'),
  set: require('mout/object/set'),
  merge: require('mout/object/merge'),
  contains: require('mout/array/contains'),
  filter: require('mout/array/filter'),
  toLookup: require('mout/array/toLookup'),
  remove: require('mout/array/remove'),
  slice: require('mout/array/slice'),
  sort: require('mout/array/sort'),
  // Options that inherit from defaults
  _: function (parent, options) {
    var _this = this;
    options = options || {};
    if (options && options.constructor === parent.constructor) {
      return options;
    } else if (!_this.isObject(options)) {
      throw new DSErrors.IA('"options" must be an object!');
    }
    _this.forEach(toPromisify, function (name) {
      if (typeof options[name] === 'function' && options[name].toString().indexOf('var args = Array') === -1) {
        options[name] = _this.promisify(options[name]);
      }
    });
    var O = function Options(attrs) {
      _this.mixIn(this, attrs);
    };
    O.prototype = parent;
    return new O(options);
  },
  resolveItem: function (resource, idOrInstance) {
    if (resource && (this.isString(idOrInstance) || this.isNumber(idOrInstance))) {
      return resource.index[idOrInstance] || idOrInstance;
    } else {
      return idOrInstance;
    }
  },
  resolveId: function (definition, idOrInstance) {
    if (this.isString(idOrInstance) || this.isNumber(idOrInstance)) {
      return idOrInstance;
    } else if (idOrInstance && definition) {
      return idOrInstance[definition.idAttribute] || idOrInstance;
    } else {
      return idOrInstance;
    }
  },
  updateTimestamp: updateTimestamp,
  Promise: _Promise,
  deepFreeze: function deepFreeze(o) {
    if (typeof Object.freeze === 'function' && typeof Object.isFrozen === 'function') {
      var prop, propKey;
      Object.freeze(o); // First freeze the object.
      for (propKey in o) {
        prop = o[propKey];
        if (!prop || !o.hasOwnProperty(propKey) || typeof prop !== 'object' || Object.isFrozen(prop)) {
          // If the object is on the prototype, not an object, or is already frozen,
          // skip it. Note that this might leave an unfrozen reference somewhere in the
          // object if there is an already frozen object containing an unfrozen object.
          continue;
        }

        deepFreeze(prop); // Recursively call deepFreeze.
      }
    }
  },
  compute: function (fn, field, DSUtils) {
    var _this = this;
    var args = [];
    DSUtils.forEach(fn.deps, function (dep) {
      args.push(_this[dep]);
    });
    // compute property
    this[field] = fn[fn.length - 1].apply(this, args);
  },
  diffObjectFromOldObject: function (object, oldObject) {
    var added = {};
    var removed = {};
    var changed = {};

    for (var prop in oldObject) {
      var newValue = object[prop];

      if (newValue !== undefined && newValue === oldObject[prop])
        continue;

      if (!(prop in object)) {
        removed[prop] = undefined;
        continue;
      }

      if (newValue !== oldObject[prop])
        changed[prop] = newValue;
    }

    for (var prop2 in object) {
      if (prop2 in oldObject)
        continue;

      added[prop2] = object[prop2];
    }

    return {
      added: added,
      removed: removed,
      changed: changed
    };
  },
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
  Events: Events
};
