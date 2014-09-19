/**
* @author Jason Dobry <jason.dobry@gmail.com>
* @file js-data.js
* @version 0.1.0 - Homepage <http://www.js-data.io/>
* @copyright (c) 2014 Jason Dobry 
* @license MIT <https://github.com/js-data/js-data/blob/master/LICENSE>
*
* @overview Data store.
*/
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.JSData=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright 2012 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Modifications
// Copyright 2014 Jason Dobry
//
// Summary of modifications:
// Removed all code related to:
// - ArrayObserver
// - ArraySplice
// - PathObserver
// - CompoundObserver
// - Path
// - ObserverTransform
(function(global) {
  'use strict';

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

  function detectEval() {
    // Don't test for eval if we're running in a Chrome App environment.
    // We check for APIs set that only exist in a Chrome App context.
    if (typeof chrome !== 'undefined' && chrome.app && chrome.app.runtime) {
      return false;
    }

    try {
      var f = new Function('', 'return true;');
      return f();
    } catch (ex) {
      return false;
    }
  }

  var hasEval = detectEval();

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
    if (global.testingExposeCycleCount)
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

  function diffObjectFromOldObject(object, oldObject) {
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

    for (var prop in object) {
      if (prop in oldObject)
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
    var eomObj = { pingPong: true };
    var eomRunScheduled = false;

    Object.observe(eomObj, function() {
      runEOMTasks();
      eomRunScheduled = false;
    });

    return function(fn) {
      eomTasks.push(fn);
      if (!eomRunScheduled) {
        eomRunScheduled = true;
        eomObj.pingPong = !eomObj.pingPong;
      }
    };
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

  /*
   * The observedSet abstraction is a perf optimization which reduces the total
   * number of Object.observe observations of a set of objects. The idea is that
   * groups of Observers will have some object dependencies in common and this
   * observed set ensures that each object in the transitive closure of
   * dependencies is only observed once. The observedSet acts as a write barrier
   * such that whenever any change comes through, all Observers are checked for
   * changed values.
   *
   * Note that this optimization is explicitly moving work from setup-time to
   * change-time.
   *
   * TODO(rafaelw): Implement "garbage collection". In order to move work off
   * the critical path, when Observers are closed, their observed objects are
   * not Object.unobserve(d). As a result, it's possible that if the observedSet
   * is kept open, but some Observers have been closed, it could cause "leaks"
   * (prevent otherwise collectable objects from being collected). At some
   * point, we should implement incremental "gc" which keeps a list of
   * observedSets which may need clean-up and does small amounts of cleanup on a
   * timeout until all is clean.
   */

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

  var hasDebugForceFullDelivery = hasObserve && hasEval && (function() {
    try {
      eval('%RunMicrotasks()');
      return true;
    } catch (ex) {
      return false;
    }
  })();

  global.Platform = global.Platform || {};

  global.Platform.performMicrotaskCheckpoint = function() {
    if (runningMicrotaskCheckpoint)
      return;

    if (hasDebugForceFullDelivery) {
      eval('%RunMicrotasks()');
      return;
    }

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

    if (global.testingExposeCycleCount)
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
    delete: true
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

  global.Observer = Observer;
  global.Observer.runEOM_ = runEOM;
  global.Observer.observerSentinel_ = observerSentinel; // for testing.
  global.Observer.hasObjectObserve = hasObserve;

  global.ObjectObserver = ObjectObserver;
})((exports.Number = { isNaN: window.isNaN }) ? exports : exports);

},{}],2:[function(require,module,exports){
"use strict";
var Promise = require("./promise/promise").Promise;
var polyfill = require("./promise/polyfill").polyfill;
exports.Promise = Promise;
exports.polyfill = polyfill;
},{"./promise/polyfill":6,"./promise/promise":7}],3:[function(require,module,exports){
"use strict";
/* global toString */

var isArray = require("./utils").isArray;
var isFunction = require("./utils").isFunction;

/**
  Returns a promise that is fulfilled when all the given promises have been
  fulfilled, or rejected if any of them become rejected. The return promise
  is fulfilled with an array that gives all the values in the order they were
  passed in the `promises` array argument.

  Example:

  ```javascript
  var promise1 = RSVP.resolve(1);
  var promise2 = RSVP.resolve(2);
  var promise3 = RSVP.resolve(3);
  var promises = [ promise1, promise2, promise3 ];

  RSVP.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `RSVP.all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  var promise1 = RSVP.resolve(1);
  var promise2 = RSVP.reject(new Error("2"));
  var promise3 = RSVP.reject(new Error("3"));
  var promises = [ promise1, promise2, promise3 ];

  RSVP.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @for RSVP
  @param {Array} promises
  @param {String} label
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
*/
function all(promises) {
  /*jshint validthis:true */
  var Promise = this;

  if (!isArray(promises)) {
    throw new TypeError('You must pass an array to all.');
  }

  return new Promise(function(resolve, reject) {
    var results = [], remaining = promises.length,
    promise;

    if (remaining === 0) {
      resolve([]);
    }

    function resolver(index) {
      return function(value) {
        resolveAll(index, value);
      };
    }

    function resolveAll(index, value) {
      results[index] = value;
      if (--remaining === 0) {
        resolve(results);
      }
    }

    for (var i = 0; i < promises.length; i++) {
      promise = promises[i];

      if (promise && isFunction(promise.then)) {
        promise.then(resolver(i), reject);
      } else {
        resolveAll(i, promise);
      }
    }
  });
}

exports.all = all;
},{"./utils":11}],4:[function(require,module,exports){
(function (process,global){
"use strict";
var browserGlobal = (typeof window !== 'undefined') ? window : {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var local = (typeof global !== 'undefined') ? global : (this === undefined? window:this);

// node
function useNextTick() {
  return function() {
    process.nextTick(flush);
  };
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function() {
    node.data = (iterations = ++iterations % 2);
  };
}

function useSetTimeout() {
  return function() {
    local.setTimeout(flush, 1);
  };
}

var queue = [];
function flush() {
  for (var i = 0; i < queue.length; i++) {
    var tuple = queue[i];
    var callback = tuple[0], arg = tuple[1];
    callback(arg);
  }
  queue = [];
}

var scheduleFlush;

// Decide what async method to use to triggering processing of queued callbacks:
if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else {
  scheduleFlush = useSetTimeout();
}

function asap(callback, arg) {
  var length = queue.push([callback, arg]);
  if (length === 1) {
    // If length is 1, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    scheduleFlush();
  }
}

exports.asap = asap;
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":12}],5:[function(require,module,exports){
"use strict";
var config = {
  instrument: false
};

function configure(name, value) {
  if (arguments.length === 2) {
    config[name] = value;
  } else {
    return config[name];
  }
}

exports.config = config;
exports.configure = configure;
},{}],6:[function(require,module,exports){
(function (global){
"use strict";
/*global self*/
var RSVPPromise = require("./promise").Promise;
var isFunction = require("./utils").isFunction;

function polyfill() {
  var local;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof window !== 'undefined' && window.document) {
    local = window;
  } else {
    local = self;
  }

  var es6PromiseSupport = 
    "Promise" in local &&
    // Some of these methods are missing from
    // Firefox/Chrome experimental implementations
    "resolve" in local.Promise &&
    "reject" in local.Promise &&
    "all" in local.Promise &&
    "race" in local.Promise &&
    // Older version of the spec had a resolver object
    // as the arg rather than a function
    (function() {
      var resolve;
      new local.Promise(function(r) { resolve = r; });
      return isFunction(resolve);
    }());

  if (!es6PromiseSupport) {
    local.Promise = RSVPPromise;
  }
}

exports.polyfill = polyfill;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./promise":7,"./utils":11}],7:[function(require,module,exports){
"use strict";
var config = require("./config").config;
var configure = require("./config").configure;
var objectOrFunction = require("./utils").objectOrFunction;
var isFunction = require("./utils").isFunction;
var now = require("./utils").now;
var all = require("./all").all;
var race = require("./race").race;
var staticResolve = require("./resolve").resolve;
var staticReject = require("./reject").reject;
var asap = require("./asap").asap;

var counter = 0;

config.async = asap; // default async is asap;

function Promise(resolver) {
  if (!isFunction(resolver)) {
    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
  }

  if (!(this instanceof Promise)) {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
  }

  this._subscribers = [];

  invokeResolver(resolver, this);
}

function invokeResolver(resolver, promise) {
  function resolvePromise(value) {
    resolve(promise, value);
  }

  function rejectPromise(reason) {
    reject(promise, reason);
  }

  try {
    resolver(resolvePromise, rejectPromise);
  } catch(e) {
    rejectPromise(e);
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value, error, succeeded, failed;

  if (hasCallback) {
    try {
      value = callback(detail);
      succeeded = true;
    } catch(e) {
      failed = true;
      error = e;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (handleThenable(promise, value)) {
    return;
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (failed) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    resolve(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

var PENDING   = void 0;
var SEALED    = 0;
var FULFILLED = 1;
var REJECTED  = 2;

function subscribe(parent, child, onFulfillment, onRejection) {
  var subscribers = parent._subscribers;
  var length = subscribers.length;

  subscribers[length] = child;
  subscribers[length + FULFILLED] = onFulfillment;
  subscribers[length + REJECTED]  = onRejection;
}

function publish(promise, settled) {
  var child, callback, subscribers = promise._subscribers, detail = promise._detail;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    invokeCallback(settled, child, callback, detail);
  }

  promise._subscribers = null;
}

Promise.prototype = {
  constructor: Promise,

  _state: undefined,
  _detail: undefined,
  _subscribers: undefined,

  then: function(onFulfillment, onRejection) {
    var promise = this;

    var thenPromise = new this.constructor(function() {});

    if (this._state) {
      var callbacks = arguments;
      config.async(function invokePromiseCallback() {
        invokeCallback(promise._state, thenPromise, callbacks[promise._state - 1], promise._detail);
      });
    } else {
      subscribe(this, thenPromise, onFulfillment, onRejection);
    }

    return thenPromise;
  },

  'catch': function(onRejection) {
    return this.then(null, onRejection);
  }
};

Promise.all = all;
Promise.race = race;
Promise.resolve = staticResolve;
Promise.reject = staticReject;

function handleThenable(promise, value) {
  var then = null,
  resolved;

  try {
    if (promise === value) {
      throw new TypeError("A promises callback cannot return that same promise.");
    }

    if (objectOrFunction(value)) {
      then = value.then;

      if (isFunction(then)) {
        then.call(value, function(val) {
          if (resolved) { return true; }
          resolved = true;

          if (value !== val) {
            resolve(promise, val);
          } else {
            fulfill(promise, val);
          }
        }, function(val) {
          if (resolved) { return true; }
          resolved = true;

          reject(promise, val);
        });

        return true;
      }
    }
  } catch (error) {
    if (resolved) { return true; }
    reject(promise, error);
    return true;
  }

  return false;
}

function resolve(promise, value) {
  if (promise === value) {
    fulfill(promise, value);
  } else if (!handleThenable(promise, value)) {
    fulfill(promise, value);
  }
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) { return; }
  promise._state = SEALED;
  promise._detail = value;

  config.async(publishFulfillment, promise);
}

function reject(promise, reason) {
  if (promise._state !== PENDING) { return; }
  promise._state = SEALED;
  promise._detail = reason;

  config.async(publishRejection, promise);
}

function publishFulfillment(promise) {
  publish(promise, promise._state = FULFILLED);
}

function publishRejection(promise) {
  publish(promise, promise._state = REJECTED);
}

exports.Promise = Promise;
},{"./all":3,"./asap":4,"./config":5,"./race":8,"./reject":9,"./resolve":10,"./utils":11}],8:[function(require,module,exports){
"use strict";
/* global toString */
var isArray = require("./utils").isArray;

/**
  `RSVP.race` allows you to watch a series of promises and act as soon as the
  first promise given to the `promises` argument fulfills or rejects.

  Example:

  ```javascript
  var promise1 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      resolve("promise 1");
    }, 200);
  });

  var promise2 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      resolve("promise 2");
    }, 100);
  });

  RSVP.race([promise1, promise2]).then(function(result){
    // result === "promise 2" because it was resolved before promise1
    // was resolved.
  });
  ```

  `RSVP.race` is deterministic in that only the state of the first completed
  promise matters. For example, even if other promises given to the `promises`
  array argument are resolved, but the first completed promise has become
  rejected before the other promises became fulfilled, the returned promise
  will become rejected:

  ```javascript
  var promise1 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      resolve("promise 1");
    }, 200);
  });

  var promise2 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error("promise 2"));
    }, 100);
  });

  RSVP.race([promise1, promise2]).then(function(result){
    // Code here never runs because there are rejected promises!
  }, function(reason){
    // reason.message === "promise2" because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  @method race
  @for RSVP
  @param {Array} promises array of promises to observe
  @param {String} label optional string for describing the promise returned.
  Useful for tooling.
  @return {Promise} a promise that becomes fulfilled with the value the first
  completed promises is resolved with if the first completed promise was
  fulfilled, or rejected with the reason that the first completed promise
  was rejected with.
*/
function race(promises) {
  /*jshint validthis:true */
  var Promise = this;

  if (!isArray(promises)) {
    throw new TypeError('You must pass an array to race.');
  }
  return new Promise(function(resolve, reject) {
    var results = [], promise;

    for (var i = 0; i < promises.length; i++) {
      promise = promises[i];

      if (promise && typeof promise.then === 'function') {
        promise.then(resolve, reject);
      } else {
        resolve(promise);
      }
    }
  });
}

exports.race = race;
},{"./utils":11}],9:[function(require,module,exports){
"use strict";
/**
  `RSVP.reject` returns a promise that will become rejected with the passed
  `reason`. `RSVP.reject` is essentially shorthand for the following:

  ```javascript
  var promise = new RSVP.Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  var promise = RSVP.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @for RSVP
  @param {Any} reason value that the returned promise will be rejected with.
  @param {String} label optional string for identifying the returned promise.
  Useful for tooling.
  @return {Promise} a promise that will become rejected with the given
  `reason`.
*/
function reject(reason) {
  /*jshint validthis:true */
  var Promise = this;

  return new Promise(function (resolve, reject) {
    reject(reason);
  });
}

exports.reject = reject;
},{}],10:[function(require,module,exports){
"use strict";
function resolve(value) {
  /*jshint validthis:true */
  if (value && typeof value === 'object' && value.constructor === this) {
    return value;
  }

  var Promise = this;

  return new Promise(function(resolve) {
    resolve(value);
  });
}

exports.resolve = resolve;
},{}],11:[function(require,module,exports){
"use strict";
function objectOrFunction(x) {
  return isFunction(x) || (typeof x === "object" && x !== null);
}

function isFunction(x) {
  return typeof x === "function";
}

function isArray(x) {
  return Object.prototype.toString.call(x) === "[object Array]";
}

// Date.now is not available in browsers < IE9
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
var now = Date.now || function() { return new Date().getTime(); };


exports.objectOrFunction = objectOrFunction;
exports.isFunction = isFunction;
exports.isArray = isArray;
exports.now = now;
},{}],12:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],13:[function(require,module,exports){
var indexOf = require('./indexOf');

    /**
     * If array contains values.
     */
    function contains(arr, val) {
        return indexOf(arr, val) !== -1;
    }
    module.exports = contains;


},{"./indexOf":16}],14:[function(require,module,exports){
var makeIterator = require('../function/makeIterator_');

    /**
     * Array filter
     */
    function filter(arr, callback, thisObj) {
        callback = makeIterator(callback, thisObj);
        var results = [];
        if (arr == null) {
            return results;
        }

        var i = -1, len = arr.length, value;
        while (++i < len) {
            value = arr[i];
            if (callback(value, i, arr)) {
                results.push(value);
            }
        }

        return results;
    }

    module.exports = filter;



},{"../function/makeIterator_":23}],15:[function(require,module,exports){


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



},{}],16:[function(require,module,exports){


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


},{}],17:[function(require,module,exports){
var filter = require('./filter');

    function isValidString(val) {
        return (val != null && val !== '');
    }

    /**
     * Joins strings with the specified separator inserted between each value.
     * Null values and empty strings will be excluded.
     */
    function join(items, separator) {
        separator = separator || '';
        return filter(items, isValidString).join(separator);
    }

    module.exports = join;


},{"./filter":14}],18:[function(require,module,exports){
var indexOf = require('./indexOf');

    /**
     * Remove a single item from the array.
     * (it won't remove duplicates, just a single item)
     */
    function remove(arr, item){
        var idx = indexOf(arr, item);
        if (idx !== -1) arr.splice(idx, 1);
    }

    module.exports = remove;


},{"./indexOf":16}],19:[function(require,module,exports){


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



},{}],20:[function(require,module,exports){


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



},{}],21:[function(require,module,exports){
var isFunction = require('../lang/isFunction');

    /**
     * Creates an object that holds a lookup for the objects in the array.
     */
    function toLookup(arr, key) {
        var result = {};
        if (arr == null) {
            return result;
        }

        var i = -1, len = arr.length, value;
        if (isFunction(key)) {
            while (++i < len) {
                value = arr[i];
                result[key(value)] = value;
            }
        } else {
            while (++i < len) {
                value = arr[i];
                result[value[key]] = value;
            }
        }

        return result;
    }
    module.exports = toLookup;


},{"../lang/isFunction":30}],22:[function(require,module,exports){


    /**
     * Returns the first argument provided to it.
     */
    function identity(val){
        return val;
    }

    module.exports = identity;



},{}],23:[function(require,module,exports){
var identity = require('./identity');
var prop = require('./prop');
var deepMatches = require('../object/deepMatches');

    /**
     * Converts argument into a valid iterator.
     * Used internally on most array/object/collection methods that receives a
     * callback/iterator providing a shortcut syntax.
     */
    function makeIterator(src, thisObj){
        if (src == null) {
            return identity;
        }
        switch(typeof src) {
            case 'function':
                // function is the first to improve perf (most common case)
                // also avoid using `Function#call` if not needed, which boosts
                // perf a lot in some cases
                return (typeof thisObj !== 'undefined')? function(val, i, arr){
                    return src.call(thisObj, val, i, arr);
                } : src;
            case 'object':
                return function(val){
                    return deepMatches(val, src);
                };
            case 'string':
            case 'number':
                return prop(src);
        }
    }

    module.exports = makeIterator;



},{"../object/deepMatches":38,"./identity":22,"./prop":24}],24:[function(require,module,exports){


    /**
     * Returns a function that gets a property of the passed object
     */
    function prop(name){
        return function(obj){
            return obj[name];
        };
    }

    module.exports = prop;



},{}],25:[function(require,module,exports){
var kindOf = require('./kindOf');
var isPlainObject = require('./isPlainObject');
var mixIn = require('../object/mixIn');

    /**
     * Clone native types.
     */
    function clone(val){
        switch (kindOf(val)) {
            case 'Object':
                return cloneObject(val);
            case 'Array':
                return cloneArray(val);
            case 'RegExp':
                return cloneRegExp(val);
            case 'Date':
                return cloneDate(val);
            default:
                return val;
        }
    }

    function cloneObject(source) {
        if (isPlainObject(source)) {
            return mixIn({}, source);
        } else {
            return source;
        }
    }

    function cloneRegExp(r) {
        var flags = '';
        flags += r.multiline ? 'm' : '';
        flags += r.global ? 'g' : '';
        flags += r.ignorecase ? 'i' : '';
        return new RegExp(r.source, flags);
    }

    function cloneDate(date) {
        return new Date(+date);
    }

    function cloneArray(arr) {
        return arr.slice();
    }

    module.exports = clone;



},{"../object/mixIn":44,"./isPlainObject":34,"./kindOf":36}],26:[function(require,module,exports){
var clone = require('./clone');
var forOwn = require('../object/forOwn');
var kindOf = require('./kindOf');
var isPlainObject = require('./isPlainObject');

    /**
     * Recursively clone native types.
     */
    function deepClone(val, instanceClone) {
        switch ( kindOf(val) ) {
            case 'Object':
                return cloneObject(val, instanceClone);
            case 'Array':
                return cloneArray(val, instanceClone);
            default:
                return clone(val);
        }
    }

    function cloneObject(source, instanceClone) {
        if (isPlainObject(source)) {
            var out = {};
            forOwn(source, function(val, key) {
                this[key] = deepClone(val, instanceClone);
            }, out);
            return out;
        } else if (instanceClone) {
            return instanceClone(source);
        } else {
            return source;
        }
    }

    function cloneArray(arr, instanceClone) {
        var out = [],
            i = -1,
            n = arr.length,
            val;
        while (++i < n) {
            out[i] = deepClone(arr[i], instanceClone);
        }
        return out;
    }

    module.exports = deepClone;




},{"../object/forOwn":41,"./clone":25,"./isPlainObject":34,"./kindOf":36}],27:[function(require,module,exports){
var isKind = require('./isKind');
    /**
     */
    var isArray = Array.isArray || function (val) {
        return isKind(val, 'Array');
    };
    module.exports = isArray;


},{"./isKind":31}],28:[function(require,module,exports){
var isKind = require('./isKind');
    /**
     */
    function isBoolean(val) {
        return isKind(val, 'Boolean');
    }
    module.exports = isBoolean;


},{"./isKind":31}],29:[function(require,module,exports){
var forOwn = require('../object/forOwn');
var isArray = require('./isArray');

    function isEmpty(val){
        if (val == null) {
            // typeof null == 'object' so we check it first
            return true;
        } else if ( typeof val === 'string' || isArray(val) ) {
            return !val.length;
        } else if ( typeof val === 'object' ) {
            var result = true;
            forOwn(val, function(){
                result = false;
                return false; // break loop
            });
            return result;
        } else {
            return true;
        }
    }

    module.exports = isEmpty;



},{"../object/forOwn":41,"./isArray":27}],30:[function(require,module,exports){
var isKind = require('./isKind');
    /**
     */
    function isFunction(val) {
        return isKind(val, 'Function');
    }
    module.exports = isFunction;


},{"./isKind":31}],31:[function(require,module,exports){
var kindOf = require('./kindOf');
    /**
     * Check if value is from a specific "kind".
     */
    function isKind(val, kind){
        return kindOf(val) === kind;
    }
    module.exports = isKind;


},{"./kindOf":36}],32:[function(require,module,exports){
var isKind = require('./isKind');
    /**
     */
    function isNumber(val) {
        return isKind(val, 'Number');
    }
    module.exports = isNumber;


},{"./isKind":31}],33:[function(require,module,exports){
var isKind = require('./isKind');
    /**
     */
    function isObject(val) {
        return isKind(val, 'Object');
    }
    module.exports = isObject;


},{"./isKind":31}],34:[function(require,module,exports){


    /**
     * Checks if the value is created by the `Object` constructor.
     */
    function isPlainObject(value) {
        return (!!value && typeof value === 'object' &&
            value.constructor === Object);
    }

    module.exports = isPlainObject;



},{}],35:[function(require,module,exports){
var isKind = require('./isKind');
    /**
     */
    function isString(val) {
        return isKind(val, 'String');
    }
    module.exports = isString;


},{"./isKind":31}],36:[function(require,module,exports){


    var _rKind = /^\[object (.*)\]$/,
        _toString = Object.prototype.toString,
        UNDEF;

    /**
     * Gets the "kind" of value. (e.g. "String", "Number", etc)
     */
    function kindOf(val) {
        if (val === null) {
            return 'Null';
        } else if (val === UNDEF) {
            return 'Undefined';
        } else {
            return _rKind.exec( _toString.call(val) )[1];
        }
    }
    module.exports = kindOf;


},{}],37:[function(require,module,exports){


    /**
     * Typecast a value to a String, using an empty string value for null or
     * undefined.
     */
    function toString(val){
        return val == null ? '' : val.toString();
    }

    module.exports = toString;



},{}],38:[function(require,module,exports){
var forOwn = require('./forOwn');
var isArray = require('../lang/isArray');

    function containsMatch(array, pattern) {
        var i = -1, length = array.length;
        while (++i < length) {
            if (deepMatches(array[i], pattern)) {
                return true;
            }
        }

        return false;
    }

    function matchArray(target, pattern) {
        var i = -1, patternLength = pattern.length;
        while (++i < patternLength) {
            if (!containsMatch(target, pattern[i])) {
                return false;
            }
        }

        return true;
    }

    function matchObject(target, pattern) {
        var result = true;
        forOwn(pattern, function(val, key) {
            if (!deepMatches(target[key], val)) {
                // Return false to break out of forOwn early
                return (result = false);
            }
        });

        return result;
    }

    /**
     * Recursively check if the objects match.
     */
    function deepMatches(target, pattern){
        if (target && typeof target === 'object') {
            if (isArray(target) && isArray(pattern)) {
                return matchArray(target, pattern);
            } else {
                return matchObject(target, pattern);
            }
        } else {
            return target === pattern;
        }
    }

    module.exports = deepMatches;



},{"../lang/isArray":27,"./forOwn":41}],39:[function(require,module,exports){
var forOwn = require('./forOwn');
var isPlainObject = require('../lang/isPlainObject');

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



},{"../lang/isPlainObject":34,"./forOwn":41}],40:[function(require,module,exports){
var hasOwn = require('./hasOwn');

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



},{"./hasOwn":42}],41:[function(require,module,exports){
var hasOwn = require('./hasOwn');
var forIn = require('./forIn');

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



},{"./forIn":40,"./hasOwn":42}],42:[function(require,module,exports){


    /**
     * Safer Object.hasOwnProperty
     */
     function hasOwn(obj, prop){
         return Object.prototype.hasOwnProperty.call(obj, prop);
     }

     module.exports = hasOwn;



},{}],43:[function(require,module,exports){
var hasOwn = require('./hasOwn');
var deepClone = require('../lang/deepClone');
var isObject = require('../lang/isObject');

    /**
     * Deep merge objects.
     */
    function merge() {
        var i = 1,
            key, val, obj, target;

        // make sure we don't modify source element and it's properties
        // objects are passed by reference
        target = deepClone( arguments[0] );

        while (obj = arguments[i++]) {
            for (key in obj) {
                if ( ! hasOwn(obj, key) ) {
                    continue;
                }

                val = obj[key];

                if ( isObject(val) && isObject(target[key]) ){
                    // inception, deep merge objects
                    target[key] = merge(target[key], val);
                } else {
                    // make sure arrays, regexp, date, objects are cloned
                    target[key] = deepClone(val);
                }

            }
        }

        return target;
    }

    module.exports = merge;



},{"../lang/deepClone":26,"../lang/isObject":33,"./hasOwn":42}],44:[function(require,module,exports){
var forOwn = require('./forOwn');

    /**
    * Combine properties from all the objects into first one.
    * - This method affects target object in place, if you want to create a new Object pass an empty object as first param.
    * @param {object} target    Target Object
    * @param {...object} objects    Objects to be combined (0...n objects).
    * @return {object} Target Object.
    */
    function mixIn(target, objects){
        var i = 0,
            n = arguments.length,
            obj;
        while(++i < n){
            obj = arguments[i];
            if (obj != null) {
                forOwn(obj, copyProp, target);
            }
        }
        return target;
    }

    function copyProp(val, key){
        this[key] = val;
    }

    module.exports = mixIn;


},{"./forOwn":41}],45:[function(require,module,exports){
var forEach = require('../array/forEach');

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



},{"../array/forEach":15}],46:[function(require,module,exports){
var slice = require('../array/slice');

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



},{"../array/slice":19}],47:[function(require,module,exports){
var namespace = require('./namespace');

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



},{"./namespace":45}],48:[function(require,module,exports){
var toString = require('../lang/toString');
var replaceAccents = require('./replaceAccents');
var removeNonWord = require('./removeNonWord');
var upperCase = require('./upperCase');
var lowerCase = require('./lowerCase');
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


},{"../lang/toString":37,"./lowerCase":49,"./removeNonWord":52,"./replaceAccents":53,"./upperCase":54}],49:[function(require,module,exports){
var toString = require('../lang/toString');
    /**
     * "Safer" String.toLowerCase()
     */
    function lowerCase(str){
        str = toString(str);
        return str.toLowerCase();
    }

    module.exports = lowerCase;


},{"../lang/toString":37}],50:[function(require,module,exports){
var join = require('../array/join');
var slice = require('../array/slice');

    /**
     * Group arguments as path segments, if any of the args is `null` or an
     * empty string it will be ignored from resulting path.
     */
    function makePath(var_args){
        var result = join(slice(arguments), '/');
        // need to disconsider duplicate '/' after protocol (eg: 'http://')
        return result.replace(/([^:\/]|^)\/{2,}/g, '$1/');
    }

    module.exports = makePath;


},{"../array/join":17,"../array/slice":19}],51:[function(require,module,exports){
var toString = require('../lang/toString');
var camelCase = require('./camelCase');
var upperCase = require('./upperCase');
    /**
     * camelCase + UPPERCASE first char
     */
    function pascalCase(str){
        str = toString(str);
        return camelCase(str).replace(/^[a-z]/, upperCase);
    }

    module.exports = pascalCase;


},{"../lang/toString":37,"./camelCase":48,"./upperCase":54}],52:[function(require,module,exports){
var toString = require('../lang/toString');
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


},{"../lang/toString":37}],53:[function(require,module,exports){
var toString = require('../lang/toString');
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


},{"../lang/toString":37}],54:[function(require,module,exports){
var toString = require('../lang/toString');
    /**
     * "Safer" String.toUpperCase()
     */
    function upperCase(str){
        str = toString(str);
        return str.toUpperCase();
    }
    module.exports = upperCase;


},{"../lang/toString":37}],55:[function(require,module,exports){
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');
var promisify = DSUtils.promisify;

function create(resourceName, attrs, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  var promise = new DSUtils.Promise(function (resolve, reject) {

    options = options || {};

    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else {
      if (!('cacheResponse' in options)) {
        options.cacheResponse = true;
      }
      if (!('upsert' in options)) {
        options.upsert = true;
      }
      resolve(attrs);
    }
  });

  if (options.upsert && attrs[definition.idAttribute]) {
    return _this.update(resourceName, attrs[definition.idAttribute], attrs, options);
  } else {
    return promise
      .then(function (attrs) {
        var func = options.beforeValidate ? promisify(options.beforeValidate) : definition.beforeValidate;
        return func.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        var func = options.validate ? promisify(options.validate) : definition.validate;
        return func.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        var func = options.afterValidate ? promisify(options.afterValidate) : definition.afterValidate;
        return func.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        var func = options.beforeCreate ? promisify(options.beforeCreate) : definition.beforeCreate;
        return func.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        _this.notify(definition, 'beforeCreate', DSUtils.merge({}, attrs));
        return _this.getAdapter(definition, options).create(definition, options.serialize ? options.serialize(resourceName, attrs) : definition.serialize(resourceName, attrs), options);
      })
      .then(function (res) {
        var func = options.afterCreate ? promisify(options.afterCreate) : definition.afterCreate;
        var attrs = options.deserialize ? options.deserialize(resourceName, res) : definition.deserialize(resourceName, res);
        return func.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        _this.notify(definition, 'afterCreate', DSUtils.merge({}, attrs));
        if (options.cacheResponse) {
          var resource = _this.store[resourceName];
          var created = _this.inject(definition.name, attrs, options);
          var id = created[definition.idAttribute];
          resource.completedQueries[id] = new Date().getTime();
          resource.previousAttributes[id] = DSUtils.deepMixIn({}, created);
          resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
          return _this.get(definition.name, id);
        } else {
          return _this.createInstance(resourceName, attrs, options);
        }
      });
  }
}

module.exports = create;

},{"../../errors":87,"../../utils":89}],56:[function(require,module,exports){
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');
var promisify = DSUtils.promisify;

function destroy(resourceName, id, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var item;

  return new DSUtils.Promise(function (resolve, reject) {
    options = options || {};

    id = DSUtils.resolveId(definition, id);
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
      reject(new DSErrors.IA('"id" must be a string or a number!'));
    } else if (!_this.get(resourceName, id)) {
      reject(new DSErrors.R('id "' + id + '" not found in cache!'));
    } else {
      item = _this.get(resourceName, id);
      resolve(item);
    }
  })
    .then(function (attrs) {
      var func = options.beforeDestroy ? promisify(options.beforeDestroy) : definition.beforeDestroy;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      _this.notify(definition, 'beforeDestroy', DSUtils.merge({}, attrs));
      return _this.getAdapter(definition, options).destroy(definition, id, options);
    })
    .then(function () {
      var func = options.afterDestroy ? promisify(options.afterDestroy) : definition.afterDestroy;
      return func.call(item, resourceName, item);
    })
    .then(function (item) {
      _this.notify(definition, 'afterDestroy', DSUtils.merge({}, item));
      _this.eject(resourceName, id);
      return id;
    });
}

module.exports = destroy;

},{"../../errors":87,"../../utils":89}],57:[function(require,module,exports){
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function destroyAll(resourceName, params, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  return new DSUtils.Promise(function (resolve, reject) {
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else {
      resolve();
    }
  }).then(function () {
      return _this.getAdapter(definition, options).destroyAll(definition, params, options);
    }).then(function () {
      return _this.ejectAll(resourceName, params);
    });
}

module.exports = destroyAll;

},{"../../errors":87,"../../utils":89}],58:[function(require,module,exports){
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function find(resourceName, id, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var resource = _this.store[resourceName];

  return new DSUtils.Promise(function (resolve, reject) {
    options = options || {};

    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
      reject(new DSErrors.IA('"id" must be a string or a number!'));
    } else if (!DSUtils.isObject(options)) {
      reject(new DSErrors.IA('"options" must be an object!'));
    } else {
      if (!('cacheResponse' in options)) {
        options.cacheResponse = true;
      }
      if (options.bypassCache || !options.cacheResponse) {
        delete resource.completedQueries[id];
      }
      if (id in resource.completedQueries) {
        resolve(_this.get(resourceName, id));
      } else {
        resolve();
      }
    }
  }).then(function (item) {
      if (!(id in resource.completedQueries)) {
        if (!(id in resource.pendingQueries)) {
          resource.pendingQueries[id] = _this.getAdapter(definition, options).find(definition, id, options)
            .then(function (res) {
              var data = options.deserialize ? options.deserialize(resourceName, res) : definition.deserialize(resourceName, res);
              if (options.cacheResponse) {
                // Query is no longer pending
                delete resource.pendingQueries[id];
                resource.completedQueries[id] = new Date().getTime();
                return _this.inject(resourceName, data, options);
              } else {
                return _this.createInstance(resourceName, data, options);
              }
            });
        }
        return resource.pendingQueries[id];
      } else {
        return item;
      }
    }).catch(function (err) {
      delete resource.pendingQueries[id];
      throw err;
    });
}

module.exports = find;

},{"../../errors":87,"../../utils":89}],59:[function(require,module,exports){
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function processResults(data, resourceName, queryHash, options) {
  var _this = this;
  var resource = _this.store[resourceName];
  var idAttribute = _this.definitions[resourceName].idAttribute;
  var date = new Date().getTime();

  data = data || [];

  // Query is no longer pending
  delete resource.pendingQueries[queryHash];
  resource.completedQueries[queryHash] = date;

  // Update modified timestamp of collection
  resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);

  // Merge the new values into the cache
  var injected = _this.inject(resourceName, data, options);

  // Make sure each object is added to completedQueries
  if (DSUtils.isArray(injected)) {
    DSUtils.forEach(injected, function (item) {
      if (item && item[idAttribute]) {
        resource.completedQueries[item[idAttribute]] = date;
      }
    });
  } else {
    console.warn(errorPrefix(resourceName) + 'response is expected to be an array!');
    resource.completedQueries[injected[idAttribute]] = date;
  }

  return injected;
}

function findAll(resourceName, params, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var resource = _this.store[resourceName];
  var queryHash;

  return new DSUtils.Promise(function (resolve, reject) {
    options = options || {};
    params = params || {};

    if (!_this.definitions[resourceName]) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isObject(params)) {
      reject(new DSErrors.IA('"params" must be an object!'));
    } else if (!DSUtils.isObject(options)) {
      reject(new DSErrors.IA('"options" must be an object!'));
    } else {
      if (!('cacheResponse' in options)) {
        options.cacheResponse = true;
      }

      queryHash = DSUtils.toJson(params);

      if (options.bypassCache || !options.cacheResponse) {
        delete resource.completedQueries[queryHash];
      }
      if (queryHash in resource.completedQueries) {
        resolve(_this.filter(resourceName, params, options));
      } else {
        resolve();
      }
    }
  }).then(function (items) {
      if (!(queryHash in resource.completedQueries)) {
        if (!(queryHash in resource.pendingQueries)) {
          resource.pendingQueries[queryHash] = _this.getAdapter(definition, options).findAll(definition, params, options)
            .then(function (res) {
              delete resource.pendingQueries[queryHash];
              var data = options.deserialize ? options.deserialize(resourceName, res) : definition.deserialize(resourceName, res);
              if (options.cacheResponse) {
                return processResults.call(_this, data, resourceName, queryHash, options);
              } else {
                DSUtils.forEach(data, function (item, i) {
                  data[i] = _this.createInstance(resourceName, item, options);
                });
                return data;
              }
            });
        }

        return resource.pendingQueries[queryHash];
      } else {
        return items;
      }
    }).catch(function (err) {
      delete resource.pendingQueries[queryHash];
      throw err;
    });
}

module.exports = findAll;

},{"../../errors":87,"../../utils":89}],60:[function(require,module,exports){
module.exports = {
  create: require('./create'),
  destroy: require('./destroy'),
  destroyAll: require('./destroyAll'),
  find: require('./find'),
  findAll: require('./findAll'),
  loadRelations: require('./loadRelations'),
  refresh: require('./refresh'),
  save: require('./save'),
  update: require('./update'),
  updateAll: require('./updateAll')
};

},{"./create":55,"./destroy":56,"./destroyAll":57,"./find":58,"./findAll":59,"./loadRelations":61,"./refresh":62,"./save":63,"./update":64,"./updateAll":65}],61:[function(require,module,exports){
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function loadRelations(resourceName, instance, relations, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var fields = [];

  return new DSUtils.Promise(function (resolve, reject) {
    options = options || {};

    if (DSUtils.isString(instance) || DSUtils.isNumber(instance)) {
      instance = _this.get(resourceName, instance);
    }

    if (DSUtils.isString(relations)) {
      relations = [relations];
    }

    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isObject(instance)) {
      reject(new DSErrors.IA('"instance(id)" must be a string, number or object!'));
    } else if (!DSUtils.isArray(relations)) {
      reject(new DSErrors.IA('"relations" must be a string or an array!'));
    } else if (!DSUtils.isObject(options)) {
      reject(new DSErrors.IA('"options" must be an object!'));
    } else {
      if (!('findBelongsTo' in options)) {
        options.findBelongsTo = true;
      }
      if (!('findHasMany' in options)) {
        options.findHasMany = true;
      }

      var tasks = [];

      DSUtils.forEach(definition.relationList, function (def) {
        var relationName = def.relation;
        if (DSUtils.contains(relations, relationName)) {
          var task;
          var params = {};
          params[def.foreignKey] = instance[definition.idAttribute];

          if (def.type === 'hasMany' && params[def.foreignKey]) {
            task = _this.findAll(relationName, params, options);
          } else if (def.type === 'hasOne') {
            if (def.localKey && instance[def.localKey]) {
              task = _this.find(relationName, instance[def.localKey], options);
            } else if (def.foreignKey && params[def.foreignKey]) {
              task = _this.findAll(relationName, params, options).then(function (hasOnes) {
                return hasOnes.length ? hasOnes[0] : null;
              });
            }
          } else if (instance[def.localKey]) {
            task = _this.find(relationName, instance[def.localKey], options);
          }

          if (task) {
            tasks.push(task);
            fields.push(def.localField);
          }
        }
      });

      resolve(tasks);
    }
  })
    .then(function (tasks) {
      return DSUtils.Promise.all(tasks);
    })
    .then(function (loadedRelations) {
      DSUtils.forEach(fields, function (field, index) {
        instance[field] = loadedRelations[index];
      });
      return instance;
    });
}

module.exports = loadRelations;

},{"../../errors":87,"../../utils":89}],62:[function(require,module,exports){
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function refresh(resourceName, id, options) {
  var _this = this;

  return new DSUtils.Promise(function (resolve, reject) {
    options = options || {};

    id = DSUtils.resolveId(_this.definitions[resourceName], id);
    if (!_this.definitions[resourceName]) {
      reject(new _this.errors.NER(resourceName));
    } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
      reject(new DSErrors.IA('"id" must be a string or a number!'));
    } else if (!DSUtils.isObject(options)) {
      reject(new DSErrors.IA('"options" must be an object!'));
    } else {
      options.bypassCache = true;
      resolve(_this.get(resourceName, id));
    }
  }).then(function (item) {
      if (item) {
        return _this.find(resourceName, id, options);
      } else {
        return item;
      }
    });
}

module.exports = refresh;

},{"../../errors":87,"../../utils":89}],63:[function(require,module,exports){
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');
var promisify = DSUtils.promisify;

function save(resourceName, id, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var item;

  return new DSUtils.Promise(function (resolve, reject) {
    options = options || {};

    id = DSUtils.resolveId(definition, id);
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
      reject(new DSErrors.IA('"id" must be a string or a number!'));
    } else if (!DSUtils.isObject(options)) {
      reject(new DSErrors.IA('"options" must be an object!'));
    } else if (!_this.get(resourceName, id)) {
      reject(new DSErrors.R('id "' + id + '" not found in cache!'));
    } else {
      item = _this.get(resourceName, id);
      if (!('cacheResponse' in options)) {
        options.cacheResponse = true;
      }
      resolve(item);
    }
  }).then(function (attrs) {
      var func = options.beforeValidate ? promisify(options.beforeValidate) : definition.beforeValidate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      var func = options.validate ? promisify(options.validate) : definition.validate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      var func = options.afterValidate ? promisify(options.afterValidate) : definition.afterValidate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      var func = options.beforeUpdate ? promisify(options.beforeUpdate) : definition.beforeUpdate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      _this.notify(definition, 'beforeUpdate', DSUtils.merge({}, attrs));
      if (options.changesOnly) {
        var resource = _this.store[resourceName];
        resource.observers[id].deliver();
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
          return attrs;
        } else {
          attrs = changes;
        }
      }
      return _this.getAdapter(definition, options).update(definition, id, options.serialize ? options.serialize(resourceName, attrs) : definition.serialize(resourceName, attrs), options);
    })
    .then(function (res) {
      var func = options.afterUpdate ? promisify(options.afterUpdate) : definition.afterUpdate;
      var attrs = options.deserialize ? options.deserialize(resourceName, res) : definition.deserialize(resourceName, res);
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      _this.notify(definition, 'afterUpdate', DSUtils.merge({}, attrs));
      if (options.cacheResponse) {
        var resource = _this.store[resourceName];
        var saved = _this.inject(definition.name, attrs, options);
        resource.previousAttributes[id] = DSUtils.deepMixIn({}, saved);
        resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
        resource.observers[id].discardChanges();
        return _this.get(resourceName, id);
      } else {
        return attrs;
      }
    });
}

module.exports = save;

},{"../../errors":87,"../../utils":89}],64:[function(require,module,exports){
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');
var promisify = DSUtils.promisify;

function update(resourceName, id, attrs, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  return new DSUtils.Promise(function (resolve, reject) {
    options = options || {};

    id = DSUtils.resolveId(definition, id);
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
      reject(new DSErrors.IA('"id" must be a string or a number!'));
    } else if (!DSUtils.isObject(options)) {
      reject(new DSErrors.IA('"options" must be an object!'));
    } else {
      if (!('cacheResponse' in options)) {
        options.cacheResponse = true;
      }
      resolve(attrs);
    }
  }).then(function (attrs) {
      var func = options.beforeValidate ? promisify(options.beforeValidate) : definition.beforeValidate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      var func = options.validate ? promisify(options.validate) : definition.validate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      var func = options.afterValidate ? promisify(options.afterValidate) : definition.afterValidate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      var func = options.beforeUpdate ? promisify(options.beforeUpdate) : definition.beforeUpdate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      _this.notify(definition, 'beforeUpdate', DSUtils.merge({}, attrs));
      return _this.getAdapter(definition, options).update(definition, id, options.serialize ? options.serialize(resourceName, attrs) : definition.serialize(resourceName, attrs), options);
    })
    .then(function (res) {
      var func = options.afterUpdate ? promisify(options.afterUpdate) : definition.afterUpdate;
      var attrs = options.deserialize ? options.deserialize(resourceName, res) : definition.deserialize(resourceName, res);
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      _this.notify(definition, 'afterUpdate', DSUtils.merge({}, attrs));
      if (options.cacheResponse) {
        var resource = _this.store[resourceName];
        var updated = _this.inject(definition.name, attrs, options);
        var id = updated[definition.idAttribute];
        resource.previousAttributes[id] = DSUtils.deepMixIn({}, updated);
        resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
        resource.observers[id].discardChanges();
        return _this.get(definition.name, id);
      } else {
        return attrs;
      }
    });
}

module.exports = update;

},{"../../errors":87,"../../utils":89}],65:[function(require,module,exports){
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');
var promisify = DSUtils.promisify;

function updateAll(resourceName, attrs, params, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  return new DSUtils.Promise(function (resolve, reject) {
    options = options || {};

    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isObject(options)) {
      reject(new DSErrors.IA('"options" must be an object!'));
    } else {
      if (!('cacheResponse' in options)) {
        options.cacheResponse = true;
      }
      resolve(attrs);
    }
  }).then(function (attrs) {
      var func = options.beforeValidate ? promisify(options.beforeValidate) : definition.beforeValidate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      var func = options.validate ? promisify(options.validate) : definition.validate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      var func = options.afterValidate ? promisify(options.afterValidate) : definition.afterValidate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      var func = options.beforeUpdate ? promisify(options.beforeUpdate) : definition.beforeUpdate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      _this.notify(definition, 'beforeUpdate', DSUtils.merge({}, attrs));
      return _this.getAdapter(definition, options).updateAll(definition, options.serialize ? options.serialize(resourceName, attrs) : definition.serialize(resourceName, attrs), params, options);
    })
    .then(function (res) {
      var func = options.afterUpdate ? promisify(options.afterUpdate) : definition.afterUpdate;
      var attrs = options.deserialize ? options.deserialize(resourceName, res) : definition.deserialize(resourceName, res);
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (data) {
      _this.notify(definition, 'afterUpdate', DSUtils.merge({}, attrs));
      if (options.cacheResponse) {
        return _this.inject(definition.name, data, options);
      } else {
        return data;
      }
    });
}

module.exports = updateAll;

},{"../../errors":87,"../../utils":89}],66:[function(require,module,exports){
var DSUtils = require('../utils');
var DSErrors = require('../errors');
var syncMethods = require('./sync_methods');
var asyncMethods = require('./async_methods');

DSUtils.deepFreeze(syncMethods);
DSUtils.deepFreeze(asyncMethods);
DSUtils.deepFreeze(DSErrors);
DSUtils.deepFreeze(DSUtils);

function lifecycleNoop(resourceName, attrs, cb) {
  cb(null, attrs);
}

function Defaults() {
}

Defaults.prototype.idAttribute = 'id';
Defaults.prototype.defaultAdapter = 'DSHttpAdapter';
Defaults.prototype.defaultFilter = function (collection, resourceName, params, options) {
  var _this = this;
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

  if (DSUtils.isObject(params.where)) {
    where = params.where;
  } else {
    where = {};
  }

  if (options.allowSimpleWhere) {
    DSUtils.forOwn(params, function (value, key) {
      if (!(key in reserved) && !(key in where)) {
        where[key] = {
          '==': value
        };
      }
    });
  }

  if (DSUtils.isEmpty(where)) {
    where = null;
  }

  if (where) {
    filtered = DSUtils.filter(filtered, function (attrs) {
      var first = true;
      var keep = true;
      DSUtils.forOwn(where, function (clause, field) {
        if (DSUtils.isString(clause)) {
          clause = {
            '===': clause
          };
        } else if (DSUtils.isNumber(clause) || DSUtils.isBoolean(clause)) {
          clause = {
            '==': clause
          };
        }
        if (DSUtils.isObject(clause)) {
          DSUtils.forOwn(clause, function (val, op) {
            if (op === '==') {
              keep = first ? (attrs[field] == val) : keep && (attrs[field] == val);
            } else if (op === '===') {
              keep = first ? (attrs[field] === val) : keep && (attrs[field] === val);
            } else if (op === '!=') {
              keep = first ? (attrs[field] != val) : keep && (attrs[field] != val);
            } else if (op === '!==') {
              keep = first ? (attrs[field] !== val) : keep && (attrs[field] !== val);
            } else if (op === '>') {
              keep = first ? (attrs[field] > val) : keep && (attrs[field] > val);
            } else if (op === '>=') {
              keep = first ? (attrs[field] >= val) : keep && (attrs[field] >= val);
            } else if (op === '<') {
              keep = first ? (attrs[field] < val) : keep && (attrs[field] < val);
            } else if (op === '<=') {
              keep = first ? (attrs[field] <= val) : keep && (attrs[field] <= val);
            } else if (op === 'in') {
              keep = first ? DSUtils.contains(val, attrs[field]) : keep && DSUtils.contains(val, attrs[field]);
            } else if (op === 'notIn') {
              keep = first ? !DSUtils.contains(val, attrs[field]) : keep && !DSUtils.contains(val, attrs[field]);
            } else if (op === '|==') {
              keep = first ? (attrs[field] == val) : keep || (attrs[field] == val);
            } else if (op === '|===') {
              keep = first ? (attrs[field] === val) : keep || (attrs[field] === val);
            } else if (op === '|!=') {
              keep = first ? (attrs[field] != val) : keep || (attrs[field] != val);
            } else if (op === '|!==') {
              keep = first ? (attrs[field] !== val) : keep || (attrs[field] !== val);
            } else if (op === '|>') {
              keep = first ? (attrs[field] > val) : keep || (attrs[field] > val);
            } else if (op === '|>=') {
              keep = first ? (attrs[field] >= val) : keep || (attrs[field] >= val);
            } else if (op === '|<') {
              keep = first ? (attrs[field] < val) : keep || (attrs[field] < val);
            } else if (op === '|<=') {
              keep = first ? (attrs[field] <= val) : keep || (attrs[field] <= val);
            } else if (op === '|in') {
              keep = first ? DSUtils.contains(val, attrs[field]) : keep || DSUtils.contains(val, attrs[field]);
            } else if (op === '|notIn') {
              keep = first ? !DSUtils.contains(val, attrs[field]) : keep || !DSUtils.contains(val, attrs[field]);
            }
            first = false;
          });
        }
      });
      return keep;
    });
  }

  var orderBy = null;

  if (DSUtils.isString(params.orderBy)) {
    orderBy = [
      [params.orderBy, 'ASC']
    ];
  } else if (DSUtils.isArray(params.orderBy)) {
    orderBy = params.orderBy;
  }

  if (!orderBy && DSUtils.isString(params.sort)) {
    orderBy = [
      [params.sort, 'ASC']
    ];
  } else if (!orderBy && DSUtils.isArray(params.sort)) {
    orderBy = params.sort;
  }

  // Apply 'orderBy'
  if (orderBy) {
    DSUtils.forEach(orderBy, function (def) {
      if (DSUtils.isString(def)) {
        def = [def, 'ASC'];
      } else if (!DSUtils.isArray(def)) {
        throw new _this.errors.IllegalArgumentError('DS.filter(resourceName[, params][, options]): ' + DSUtils.toJson(def) + ': Must be a string or an array!', { params: { 'orderBy[i]': { actual: typeof def, expected: 'string|array' } } });
      }
      filtered = DSUtils.sort(filtered, function (a, b) {
        var cA = a[def[0]], cB = b[def[0]];
        if (DSUtils.isString(cA)) {
          cA = DSUtils.upperCase(cA);
        }
        if (DSUtils.isString(cB)) {
          cB = DSUtils.upperCase(cB);
        }
        if (def[1] === 'DESC') {
          if (cB < cA) {
            return -1;
          } else if (cB > cA) {
            return 1;
          } else {
            return 0;
          }
        } else {
          if (cA < cB) {
            return -1;
          } else if (cA > cB) {
            return 1;
          } else {
            return 0;
          }
        }
      });
    });
  }

  var limit = DSUtils.isNumber(params.limit) ? params.limit : null;
  var skip = null;

  if (DSUtils.isNumber(params.skip)) {
    skip = params.skip;
  } else if (DSUtils.isNumber(params.offset)) {
    skip = params.offset;
  }

  // Apply 'limit' and 'skip'
  if (limit && skip) {
    filtered = DSUtils.slice(filtered, skip, Math.min(filtered.length, skip + limit));
  } else if (DSUtils.isNumber(limit)) {
    filtered = DSUtils.slice(filtered, 0, Math.min(filtered.length, limit));
  } else if (DSUtils.isNumber(skip)) {
    if (skip < filtered.length) {
      filtered = DSUtils.slice(filtered, skip);
    } else {
      filtered = [];
    }
  }

  return filtered;
};
Defaults.prototype.baseUrl = '';
Defaults.prototype.endpoint = '';
Defaults.prototype.useClass = true;
Defaults.prototype.keepChangeHistory = false;
Defaults.prototype.resetHistoryOnInject = true;
/**
 * @doc property
 * @id DSProvider.properties:defaults.beforeValidate
 * @name defaults.beforeValidate
 * @description
 * Called before the `validate` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * beforeValidate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.beforeValidate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.beforeValidate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.validate
 * @name defaults.validate
 * @description
 * Called before the `afterValidate` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * validate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.validate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.validate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.afterValidate
 * @name defaults.afterValidate
 * @description
 * Called before the `beforeCreate` or `beforeUpdate` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * afterValidate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.afterValidate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.afterValidate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.beforeCreate
 * @name defaults.beforeCreate
 * @description
 * Called before the `create` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * beforeCreate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.beforeCreate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.beforeCreate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.afterCreate
 * @name defaults.afterCreate
 * @description
 * Called after the `create` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * afterCreate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.afterCreate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.afterCreate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.beforeUpdate
 * @name defaults.beforeUpdate
 * @description
 * Called before the `update` or `save` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * beforeUpdate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.beforeUpdate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.beforeUpdate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.afterUpdate
 * @name defaults.afterUpdate
 * @description
 * Called after the `update` or `save` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * afterUpdate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.afterUpdate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.afterUpdate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.beforeDestroy
 * @name defaults.beforeDestroy
 * @description
 * Called before the `destroy` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * beforeDestroy(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.beforeDestroy = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.beforeDestroy = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.afterDestroy
 * @name defaults.afterDestroy
 * @description
 * Called after the `destroy` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * afterDestroy(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.afterDestroy = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.afterDestroy = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.beforeInject
 * @name defaults.beforeInject
 * @description
 * Called before the `inject` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * beforeInject(resourceName, attrs)
 * ```
 *
 * Throwing an error inside this step will cancel the injection.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.beforeInject = function (resourceName, attrs) {
 *      // do somthing/inspect/modify attrs
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.beforeInject = function (resourceName, attrs) {
  return attrs;
};
/**
 * @doc property
 * @id DSProvider.properties:defaults.afterInject
 * @name defaults.afterInject
 * @description
 * Called after the `inject` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * afterInject(resourceName, attrs)
 * ```
 *
 * Throwing an error inside this step will cancel the injection.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.afterInject = function (resourceName, attrs) {
 *      // do somthing/inspect/modify attrs
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.afterInject = function (resourceName, attrs) {
  return attrs;
};
/**
 * @doc property
 * @id DSProvider.properties:defaults.serialize
 * @name defaults.serialize
 * @description
 * Your server might expect a custom request object rather than the plain POJO payload. Use `serialize` to
 * create your custom request object.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.serialize = function (resourceName, data) {
 *      return {
 *          payload: data
 *      };
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource to serialize.
 * @param {object} data Data to be sent to the server.
 * @returns {*} By default returns `data` as-is.
 */
Defaults.prototype.serialize = function (resourceName, data) {
  return data;
};

/**
 * @doc property
 * @id DSProvider.properties:defaults.deserialize
 * @name DSProvider.properties:defaults.deserialize
 * @description
 * Your server might return a custom response object instead of the plain POJO payload. Use `deserialize` to
 * pull the payload out of your response object so js-data can use it.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.deserialize = function (resourceName, data) {
 *      return data ? data.payload : data;
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource to deserialize.
 * @param {object} data Response object from `http()`.
 * @returns {*} By default returns `data.data`.
 */
Defaults.prototype.deserialize = function (resourceName, data) {
  return data;
};

/**
 * @doc constructor
 * @id DS
 * @name DS
 * @description
 * See the [configuration guide](/documentation/guide/configure/global).
 *
 * @param {object=} options Configuration options. Properties:
 *
 * - `{string}` - `baseUrl` - The url relative to which all AJAX requests will be made.
 * - `{string}` - `idAttribute` - Default: `"id"` - The attribute that specifies the primary key for resources.
 * - `{string}` - `defaultAdapter` - Default: `"DSHttpAdapter"`
 * - `{string}` - `events` - Default: `"broadcast"` [DSProvider.defaults.events](/documentation/api/js-data/DSProvider.properties:defaults.events)
 * - `{function}` - `filter` - Default: See [js-data query language](/documentation/guide/queries/custom).
 * - `{function}` - `beforeValidate` - See [DSProvider.defaults.beforeValidate](/documentation/api/js-data/DSProvider.properties:defaults.beforeValidate). Default: No-op
 * - `{function}` - `validate` - See [DSProvider.defaults.validate](/documentation/api/js-data/DSProvider.properties:defaults.validate). Default: No-op
 * - `{function}` - `afterValidate` - See [DSProvider.defaults.afterValidate](/documentation/api/js-data/DSProvider.properties:defaults.afterValidate). Default: No-op
 * - `{function}` - `beforeCreate` - See [DSProvider.defaults.beforeCreate](/documentation/api/js-data/DSProvider.properties:defaults.beforeCreate). Default: No-op
 * - `{function}` - `afterCreate` - See [DSProvider.defaults.afterCreate](/documentation/api/js-data/DSProvider.properties:defaults.afterCreate). Default: No-op
 * - `{function}` - `beforeUpdate` - See [DSProvider.defaults.beforeUpdate](/documentation/api/js-data/DSProvider.properties:defaults.beforeUpdate). Default: No-op
 * - `{function}` - `afterUpdate` - See [DSProvider.defaults.afterUpdate](/documentation/api/js-data/DSProvider.properties:defaults.afterUpdate). Default: No-op
 * - `{function}` - `beforeDestroy` - See [DSProvider.defaults.beforeDestroy](/documentation/api/js-data/DSProvider.properties:defaults.beforeDestroy). Default: No-op
 * - `{function}` - `afterDestroy` - See [DSProvider.defaults.afterDestroy](/documentation/api/js-data/DSProvider.properties:defaults.afterDestroy). Default: No-op
 * - `{function}` - `afterInject` - See [DSProvider.defaults.afterInject](/documentation/api/js-data/DSProvider.properties:defaults.afterInject). Default: No-op
 * - `{function}` - `beforeInject` - See [DSProvider.defaults.beforeInject](/documentation/api/js-data/DSProvider.properties:defaults.beforeInject). Default: No-op
 * - `{function}` - `serialize` - See [DSProvider.defaults.serialize](/documentation/api/js-data/DSProvider.properties:defaults.serialize). Default: No-op
 * - `{function}` - `deserialize` - See [DSProvider.defaults.deserialize](/documentation/api/js-data/DSProvider.properties:defaults.deserialize). Default: No-op
 */
function DS(options) {
  /**
   * @doc property
   * @id DS.properties:defaults
   * @name defaults
   * @description
   * Reference to [DSProvider.defaults](/documentation/api/api/DSProvider.properties:defaults).
   */
  this.defaults = new Defaults();
  DSUtils.deepMixIn(this.defaults, options);

  this.notify = function (definition, event) {
    var args = Array.prototype.slice.call(arguments, 2);
    args.unshift(definition.name);
    args.unshift('DS.' + event);
    definition.emit.apply(definition, args);
  };

  /*!
   * @doc property
   * @id DS.properties:store
   * @name store
   * @description
   * Meta data for each registered resource.
   */
  this.store = {};

  /*!
   * @doc property
   * @id DS.properties:definitions
   * @name definitions
   * @description
   * Registered resource definitions available to the data store.
   */
  this.definitions = {};

  /**
   * @doc property
   * @id DS.properties:adapters
   * @name adapters
   * @description
   * Registered adapters available to the data store. Object consists of key-values pairs where the key is
   * the name of the adapter and the value is the adapter itself.
   */
  this.adapters = {};
}

DS.prototype.getAdapter = function (def, options) {
  options = options || {};
  return this.adapters[options.adapter] || this.adapters[def.defaultAdapter];
};

/**
 * @doc property
 * @id DS.properties:errors
 * @name errors
 * @description
 * References to the various [error types](/documentation/api/api/errors) used by js-data.
 */
DS.prototype.errors = require('../errors');

/*!
 * @doc property
 * @id DS.properties:utils
 * @name utils
 * @description
 * Utility functions used internally by js-data.
 */
DS.prototype.utils = DSUtils;

DSUtils.deepMixIn(DS.prototype, syncMethods);
DSUtils.deepMixIn(DS.prototype, asyncMethods);

module.exports = DS;

},{"../errors":87,"../utils":89,"./async_methods":60,"./sync_methods":78}],67:[function(require,module,exports){
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function changeHistory(resourceName, id) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var resource = _this.store[resourceName];

  id = DSUtils.resolveId(definition, id);
  if (resourceName && !_this.definitions[resourceName]) {
    throw new DSErrors.NER(resourceName);
  } else if (id && !DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA('"id" must be a string or a number!');
  }

  if (!definition.keepChangeHistory) {
    console.warn('changeHistory is disabled for this resource!');
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
}

module.exports = changeHistory;

},{"../../errors":87,"../../utils":89}],68:[function(require,module,exports){
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function changes(resourceName, id) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new DSErrors.NER(resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA('"id" must be a string or a number!');
  }

  var item = _this.get(resourceName, id);
  if (item) {
    _this.store[resourceName].observers[id].deliver();
    var diff = DSUtils.diffObjectFromOldObject(item, _this.store[resourceName].previousAttributes[id]);
    DSUtils.forOwn(diff, function (changeset, name) {
      var toKeep = [];
      DSUtils.forOwn(changeset, function (value, field) {
        if (!DSUtils.isFunction(value)) {
          toKeep.push(field);
        }
      });
      diff[name] = DSUtils.pick(diff[name], toKeep);
    });
    DSUtils.forEach(definition.relationFields, function (field) {
      delete diff.added[field];
      delete diff.removed[field];
      delete diff.changed[field];
    });
    return diff;
  }
}

module.exports = changes;

},{"../../errors":87,"../../utils":89}],69:[function(require,module,exports){
function errorPrefix(resourceName) {
  return 'DS.compute(' + resourceName + ', instance): ';
}

function _compute(fn, field, DSUtils) {
  var _this = this;
  var args = [];
  DSUtils.forEach(fn.deps, function (dep) {
    args.push(_this[dep]);
  });
  // compute property
  this[field] = fn[fn.length - 1].apply(this, args);
}

/**
 * @doc method
 * @id DS.sync methods:compute
 * @name compute
 * @description
 * Force the given instance or the item with the given primary key to recompute its computed properties.
 *
 * ## Signature:
 * ```js
 * DS.compute(resourceName, instance)
 * ```
 *
 * ## Example:
 *
 * ```js
 * var User = DS.defineResource({
 *   name: 'user',
 *   computed: {
 *     fullName: ['first', 'last', function (first, last) {
 *       return first + ' ' + last;
 *     }]
 *   }
 * });
 *
 * var user = User.createInstance({ first: 'John', last: 'Doe' });
 * user.fullName; // undefined
 *
 * User.compute(user);
 *
 * user.fullName; // "John Doe"
 *
 * var user2 = User.inject({ id: 2, first: 'Jane', last: 'Doe' });
 * user2.fullName; // undefined
 *
 * User.compute(1);
 *
 * user2.fullName; // "Jane Doe"
 *
 * // if you don't pass useClass: false then you can do:
 * var user3 = User.createInstance({ first: 'Sally', last: 'Doe' });
 * user3.fullName; // undefined
 * user3.DSCompute();
 * user3.fullName; // "Sally Doe"
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object|string|number} instance Instance or primary key of the instance (must be in the store) for which to recompute properties.
 * @returns {Object} The instance.
 */
function compute(resourceName, instance) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];

  instance = DSUtils.resolveItem(DS.store[resourceName], instance);
  if (!definition) {
    throw new DSErrors.NER(errorPrefix(resourceName) + resourceName);
  } else if (!DSUtils.isObject(instance) && !DSUtils.isString(instance) && !DSUtils.isNumber(instance)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'instance: Must be an object, string or number!');
  }

  if (DSUtils.isString(instance) || DSUtils.isNumber(instance)) {
    instance = DS.get(resourceName, instance);
  }

  DSUtils.forOwn(definition.computed, function (fn, field) {
    _compute.call(instance, fn, field, DSUtils);
  });

  return instance;
}

module.exports = {
  compute: compute,
  _compute: _compute
};

},{}],70:[function(require,module,exports){
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function createInstance(resourceName, attrs, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  attrs = attrs || {};
  options = options || {};

  if (!definition) {
    throw new DSErrors.NER(resourceName);
  } else if (attrs && !DSUtils.isObject(attrs)) {
    throw new DSErrors.IA('"attrs" must be an object!');
  } else if (!DSUtils.isObject(options)) {
    throw new DSErrors.IA('"options" must be an object!');
  }

  if (!('useClass' in options)) {
    options.useClass = definition.useClass;
  }

  var item;

  if (options.useClass) {
    var Constructor = definition[definition.class];
    item = new Constructor();
  } else {
    item = {};
  }
  return DSUtils.deepMixIn(item, attrs);
}

module.exports = createInstance;

},{"../../errors":87,"../../utils":89}],71:[function(require,module,exports){
/*jshint evil:true*/
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function Resource(utils, options) {

  utils.deepMixIn(this, options);

  if ('endpoint' in options) {
    this.endpoint = options.endpoint;
  } else {
    this.endpoint = this.name;
  }
}

var methodsToProxy = [
  'changes',
  'changeHistory',
  'create',
  'createInstance',
  'destroy',
  'destroyAll',
  'eject',
  'ejectAll',
  'filter',
  'find',
  'findAll',
  'get',
  'hasChanges',
  'inject',
  'lastModified',
  'lastSaved',
  'link',
  'linkAll',
  'linkInverse',
  'unlinkInverse',
  'loadRelations',
  'previous',
  'refresh',
  'save',
  'update',
  'updateAll'
];

/**
 * @doc method
 * @id DS.sync methods:defineResource
 * @name defineResource
 * @description
 * Define a resource and register it with the data store.
 *
 * ## Signature:
 * ```js
 * DS.defineResource(definition)
 * ```
 *
 * ## Example:
 *
 * ```js
 *  DS.defineResource({
 *      name: 'document',
 *      idAttribute: '_id',
 *      endpoint: '/documents
 *      baseUrl: 'http://myapp.com/api',
 *      beforeDestroy: function (resourceName attrs, cb) {
 *          console.log('looks good to me');
 *          cb(null, attrs);
 *      }
 *  });
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 *
 * @param {string|object} definition Name of resource or resource definition object: Properties:
 *
 * - `{string}` - `name` - The name by which this resource will be identified.
 * - `{string="id"}` - `idAttribute` - The attribute that specifies the primary key for this resource.
 * - `{string=}` - `endpoint` - The attribute that specifies the primary key for this resource. Default is the value of `name`.
 * - `{string=}` - `baseUrl` - The url relative to which all AJAX requests will be made.
 * - `{boolean=}` - `useClass` - Whether to use a wrapper class created from the ProperCase name of the resource. The wrapper will always be used for resources that have `methods` defined.
 * - `{boolean=}` - `keepChangeHistory` - Whether to keep a history of changes for items in the data store. Default: `false`.
 * - `{boolean=}` - `resetHistoryOnInject` - Whether to reset the history of changes for items when they are injected of re-injected into the data store. This will also reset an item's previous attributes. Default: `true`.
 * - `{function=}` - `defaultFilter` - Override the filtering used internally by `DS.filter` with you own function here.
 * - `{*=}` - `meta` - A property reserved for developer use. This will never be used by the API.
 * - `{object=}` - `methods` - If provided, items of this resource will be wrapped in a constructor function that is
 * empty save for the attributes in this option which will be mixed in to the constructor function prototype. Enabling
 * this feature for this resource will incur a slight performance penalty, but allows you to give custom behavior to what
 * are now "instances" of this resource.
 * - `{function=}` - `beforeValidate` - Lifecycle hook. Overrides global. Signature: `beforeValidate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `validate` - Lifecycle hook. Overrides global. Signature: `validate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `afterValidate` - Lifecycle hook. Overrides global. Signature: `afterValidate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `beforeCreate` - Lifecycle hook. Overrides global. Signature: `beforeCreate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `afterCreate` - Lifecycle hook. Overrides global. Signature: `afterCreate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `beforeUpdate` - Lifecycle hook. Overrides global. Signature: `beforeUpdate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `afterUpdate` - Lifecycle hook. Overrides global. Signature: `afterUpdate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `beforeDestroy` - Lifecycle hook. Overrides global. Signature: `beforeDestroy(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `afterDestroy` - Lifecycle hook. Overrides global. Signature: `afterDestroy(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `beforeInject` - Lifecycle hook. Overrides global. Signature: `beforeInject(resourceName, attrs)`.
 * - `{function=}` - `afterInject` - Lifecycle hook. Overrides global. Signature: `afterInject(resourceName, attrs)`.
 * - `{function=}` - `serialize` - Serialization hook. Overrides global. Signature: `serialize(resourceName, attrs)`.
 * - `{function=}` - `deserialize` - Deserialization hook. Overrides global. Signature: `deserialize(resourceName, attrs)`.
 *
 * See [DSProvider.defaults](/documentation/api/js-data/DSProvider.properties:defaults).
 */
function defineResource(definition) {
  var DS = this;
  var definitions = DS.definitions;

  if (DSUtils.isString(definition)) {
    definition = {
      name: definition.replace(/\s/gi, '')
    };
  }
  if (!DSUtils.isObject(definition)) {
    throw new DSErrors.IA('"definition" must be an object!');
  } else if (!DSUtils.isString(definition.name)) {
    throw new DSErrors.IA('"name" must be a string!');
  } else if (DS.store[definition.name]) {
    throw new DSErrors.R(definition.name + ' is already registered!');
  }

  try {
    // Inherit from global defaults
    Resource.prototype = DS.defaults;
    definitions[definition.name] = new Resource(DSUtils, definition);

    var def = definitions[definition.name];

    if (!DSUtils.isString(def.idAttribute)) {
      throw new DSErrors.IA('"idAttribute" must be a string!');
    }

    // Setup nested parent configuration
    if (def.relations) {
      def.relationList = [];
      def.relationFields = [];
      DSUtils.forOwn(def.relations, function (relatedModels, type) {
        DSUtils.forOwn(relatedModels, function (defs, relationName) {
          if (!DSUtils.isArray(defs)) {
            relatedModels[relationName] = [defs];
          }
          DSUtils.forEach(relatedModels[relationName], function (d) {
            d.type = type;
            d.relation = relationName;
            d.name = def.name;
            def.relationList.push(d);
            def.relationFields.push(d.localField);
          });
        });
      });
      if (def.relations.belongsTo) {
        DSUtils.forOwn(def.relations.belongsTo, function (relatedModel, modelName) {
          DSUtils.forEach(relatedModel, function (relation) {
            if (relation.parent) {
              def.parent = modelName;
              def.parentKey = relation.localKey;
            }
          });
        });
      }
      DSUtils.deepFreeze(def.relations);
      DSUtils.deepFreeze(def.relationList);
    }

    def.getEndpoint = function (attrs, options) {
      var parent = this.parent;
      var parentKey = this.parentKey;
      var item;
      var endpoint;
      var thisEndpoint = options.endpoint || this.endpoint;
      var parentDef = definitions[parent];
      delete options.endpoint;
      options = options || {};
      options.params = options.params || {};
      if (parent && parentKey && parentDef && options.params[parentKey] !== false) {
        if (DSUtils.isNumber(attrs) || DSUtils.isString(attrs)) {
          item = DS.get(this.name, attrs);
        }
        if (DSUtils.isObject(attrs) && parentKey in attrs) {
          delete options.params[parentKey];
          endpoint = DSUtils.makePath(parentDef.getEndpoint(attrs, options), attrs[parentKey], thisEndpoint);
        } else if (item && parentKey in item) {
          delete options.params[parentKey];
          endpoint = DSUtils.makePath(parentDef.getEndpoint(attrs, options), item[parentKey], thisEndpoint);
        } else if (options && options.params[parentKey]) {
          endpoint = DSUtils.makePath(parentDef.getEndpoint(attrs, options), options.params[parentKey], thisEndpoint);
          delete options.params[parentKey];
        }
      }
      if (options.params[parentKey] === false) {
        delete options.params[parentKey];
      }
      return endpoint || thisEndpoint;
    };

    // Remove this in v0.11.0 and make a breaking change notice
    // the the `filter` option has been renamed to `defaultFilter`
    if (def.filter) {
      def.defaultFilter = def.filter;
      delete def.filter;
    }

    // Create the wrapper class for the new resource
    def.class = DSUtils.pascalCase(definition.name);
    eval('function ' + def.class + '() {}');
    def[def.class] = eval(def.class);

    // Apply developer-defined methods
    if (def.methods) {
      DSUtils.deepMixIn(def[def.class].prototype, def.methods);
    }

    // Prepare for computed properties
    if (def.computed) {
      DSUtils.forOwn(def.computed, function (fn, field) {
        if (DSUtils.isFunction(fn)) {
          def.computed[field] = [fn];
          fn = def.computed[field];
        }
        if (def.methods && field in def.methods) {
          console.warn('Computed property "' + field + '" conflicts with previously defined prototype method!');
        }
        var deps;
        if (fn.length === 1) {
          var match = fn[0].toString().match(/function.*?\(([\s\S]*?)\)/);
          deps = match[1].split(',');
          def.computed[field] = deps.concat(fn);
          fn = def.computed[field];
          if (deps.length) {
            console.warn('Use the computed property array syntax for compatibility with minified code!');
          }
        }
        deps = fn.slice(0, fn.length - 1);
        DSUtils.forEach(deps, function (val, index) {
          deps[index] = val.trim();
        });
        fn.deps = DSUtils.filter(deps, function (dep) {
          return !!dep;
        });
      });

      def[def.class].prototype.DSCompute = function () {
        return DS.compute(def.name, this);
      };
    }

    // Initialize store data for the new resource
    DS.store[def.name] = {
      collection: [],
      completedQueries: {},
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

    // Proxy DS methods with shorthand ones
    DSUtils.forEach(methodsToProxy, function (name) {
      def[name] = function () {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(def.name);
        return DS[name].apply(DS, args);
      };
    });

    def.beforeValidate = DSUtils.promisify(def.beforeValidate);
    def.validate = DSUtils.promisify(def.validate);
    def.afterValidate = DSUtils.promisify(def.afterValidate);
    def.beforeCreate = DSUtils.promisify(def.beforeCreate);
    def.afterCreate = DSUtils.promisify(def.afterCreate);
    def.beforeUpdate = DSUtils.promisify(def.beforeUpdate);
    def.afterUpdate = DSUtils.promisify(def.afterUpdate);
    def.beforeDestroy = DSUtils.promisify(def.beforeDestroy);
    def.afterDestroy = DSUtils.promisify(def.afterDestroy);

    // Mix-in events
    DSUtils.Events(def);

    return def;
  } catch (err) {
    console.error(err);
    delete definitions[definition.name];
    delete DS.store[definition.name];
    throw err;
  }
}

module.exports = defineResource;

},{"../../errors":87,"../../utils":89}],72:[function(require,module,exports){
var observe = require('../../../lib/observe-js/observe-js');

/**
 * @doc method
 * @id DS.sync methods:digest
 * @name digest
 * @description
 * Trigger a digest loop that checks for changes and updates the `lastModified` timestamp if an object has changed.
 * If your browser supports `Object.observe` then this function has no effect.
 *
 * ## Signature:
 * ```js
 * DS.digest()
 * ```
 *
 */
function digest() {
  observe.Platform.performMicrotaskCheckpoint();
}

module.exports = digest;

},{"../../../lib/observe-js/observe-js":1}],73:[function(require,module,exports){
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function eject(resourceName, id) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var resource = _this.store[resourceName];
  var item;
  var found = false;

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new DSErrors.NER(resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA('"id" must be a string or a number!');
  }

  for (var i = 0; i < resource.collection.length; i++) {
    if (resource.collection[i][definition.idAttribute] == id) {
      item = resource.collection[i];
      found = true;
      break;
    }
  }
  if (found) {
    _this.unlinkInverse(definition.name, id);
    resource.collection.splice(i, 1);
    resource.observers[id].close();
    delete resource.observers[id];

    delete resource.index[id];
    delete resource.previousAttributes[id];
    delete resource.completedQueries[id];
    delete resource.pendingQueries[id];
    DSUtils.forEach(resource.changeHistories[id], function (changeRecord) {
      DSUtils.remove(resource.changeHistory, changeRecord);
    });
    delete resource.changeHistories[id];
    delete resource.modified[id];
    delete resource.saved[id];
    resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);

    _this.notify(definition, 'eject', item);

    return item;
  }
}

module.exports = eject;

},{"../../errors":87,"../../utils":89}],74:[function(require,module,exports){
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function ejectAll(resourceName, params) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  params = params || {};

  if (!definition) {
    throw new DSErrors.NER(resourceName);
  } else if (!DSUtils.isObject(params)) {
    throw new DSErrors.IA('"params" must be an object!');
  }
  var resource = _this.store[resourceName];
  if (DSUtils.isEmpty(params)) {
    resource.completedQueries = {};
  }
  var queryHash = DSUtils.toJson(params);
  var items = _this.filter(definition.name, params);
  var ids = DSUtils.toLookup(items, definition.idAttribute);

  DSUtils.forOwn(ids, function (item, id) {
    _this.eject(definition.name, id);
  });

  delete resource.completedQueries[queryHash];
  resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);

  _this.notify(definition, 'eject', items);

  return items;
}

module.exports = ejectAll;

},{"../../errors":87,"../../utils":89}],75:[function(require,module,exports){
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function filter(resourceName, params, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  options = options || {};

  if (!definition) {
    throw new DSErrors.NER(resourceName);
  } else if (params && !DSUtils.isObject(params)) {
    throw new DSErrors.IA('"params" must be an object!');
  } else if (!DSUtils.isObject(options)) {
    throw new DSErrors.IA('"options" must be an object!');
  }
  var resource = _this.store[resourceName];

  // Protect against null
  params = params || {};

  if (!('allowSimpleWhere' in options)) {
    options.allowSimpleWhere = true;
  }

  var queryHash = DSUtils.toJson(params);

  if (!(queryHash in resource.completedQueries) && options.loadFromServer) {
    // This particular query has never been completed

    if (!resource.pendingQueries[queryHash]) {
      // This particular query has never even been started
      _this.findAll(resourceName, params, options);
    }
  }

  return definition.defaultFilter.call(_this, resource.collection, resourceName, params, options);
}

module.exports = filter;

},{"../../errors":87,"../../utils":89}],76:[function(require,module,exports){
function errorPrefix(resourceName, id) {
  return 'DS.get(' + resourceName + ', ' + id + '): ';
}

/**
 * @doc method
 * @id DS.sync methods:get
 * @name get
 * @description
 * Synchronously return the resource with the given id. The data store will forward the request to an adapter if
 * `loadFromServer` is `true` in the options hash.
 *
 * ## Signature:
 * ```js
 * DS.get(resourceName, id[, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 * DS.get('document', 5'); // { author: 'John Anderson', id: 5 }
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to retrieve.
 * @param {object=} options Optional configuration. Also passed along to `DS.find` if `loadFromServer` is `true`. Properties:
 *
 * - `{boolean=}` - `loadFromServer` - Send the query to server if it has not been sent yet. Default: `false`.
 *
 * @returns {object} The item of the type specified by `resourceName` with the primary key specified by `id`.
 */
function get(resourceName, id, options) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;

  options = options || {};

  if (!DS.definitions[resourceName]) {
    throw new DSErrors.NER(errorPrefix(resourceName, id) + resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA(errorPrefix(resourceName, id) + 'id: Must be a string or a number!');
  } else if (!DSUtils.isObject(options)) {
    throw new DSErrors.IA(errorPrefix(resourceName, id) + 'options: Must be an object!');
  }
  // cache miss, request resource from server
  var item = DS.store[resourceName].index[id];
  if (!item && options.loadFromServer) {
    DS.find(resourceName, id, options).then(null, function (err) {
      return err;
    });
  }

  // return resource from cache
  return item;
}

module.exports = get;

},{}],77:[function(require,module,exports){
function errorPrefix(resourceName, id) {
  return 'DS.hasChanges(' + resourceName + ', ' + id + '): ';
}

function diffIsEmpty(utils, diff) {
  return !(utils.isEmpty(diff.added) &&
    utils.isEmpty(diff.removed) &&
    utils.isEmpty(diff.changed));
}

/**
 * @doc method
 * @id DS.sync methods:hasChanges
 * @name hasChanges
 * @description
 * Synchronously return whether object of the item of the type specified by `resourceName` that has the primary key
 * specified by `id` has changes.
 *
 * ## Signature:
 * ```js
 * DS.hasChanges(resourceName, id)
 * ```
 *
 * ## Example:
 *
 * ```js
 * var d = DS.get('document', 5); // { author: 'John Anderson', id: 5 }
 *
 * d.author = 'Sally';
 *
 * // You may have to do DS.digest() first
 *
 * DS.hasChanges('document', 5); // true
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item.
 * @returns {boolean} Whether the item of the type specified by `resourceName` with the primary key specified by `id` has changes.
 */
function hasChanges(resourceName, id) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;

  id = DSUtils.resolveId(DS.definitions[resourceName], id);
  if (!DS.definitions[resourceName]) {
    throw new DSErrors.NER(errorPrefix(resourceName, id) + resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA(errorPrefix(resourceName, id) + 'id: Must be a string or a number!');
  }

  // return resource from cache
  if (DS.get(resourceName, id)) {
    return diffIsEmpty(DSUtils, DS.changes(resourceName, id));
  } else {
    return false;
  }
}

module.exports = hasChanges;

},{}],78:[function(require,module,exports){
module.exports = {

  /**
   * @doc method
   * @id DS.sync methods:changes
   * @name changes
   * @methodOf DS
   * @description
   * See [DS.changes](/documentation/api/api/DS.sync methods:changes).
   */
  changes: require('./changes'),

  /**
   * @doc method
   * @id DS.sync methods:changeHistory
   * @name changeHistory
   * @methodOf DS
   * @description
   * See [DS.changeHistory](/documentation/api/api/DS.sync methods:changeHistory).
   */
  changeHistory: require('./changeHistory'),

  /**
   * @doc method
   * @id DS.sync methods:compute
   * @name compute
   * @methodOf DS
   * @description
   * See [DS.compute](/documentation/api/api/DS.sync methods:compute).
   */
  compute: require('./compute').compute,

  /**
   * @doc method
   * @id DS.sync methods:createInstance
   * @name createInstance
   * @methodOf DS
   * @description
   * See [DS.createInstance](/documentation/api/api/DS.sync methods:createInstance).
   */
  createInstance: require('./createInstance'),

  /**
   * @doc method
   * @id DS.sync methods:defineResource
   * @name defineResource
   * @methodOf DS
   * @description
   * See [DS.defineResource](/documentation/api/api/DS.sync methods:defineResource).
   */
  defineResource: require('./defineResource'),

  /**
   * @doc method
   * @id DS.sync methods:digest
   * @name digest
   * @methodOf DS
   * @description
   * See [DS.digest](/documentation/api/api/DS.sync methods:digest).
   */
  digest: require('./digest'),

  /**
   * @doc method
   * @id DS.sync methods:eject
   * @name eject
   * @methodOf DS
   * @description
   * See [DS.eject](/documentation/api/api/DS.sync methods:eject).
   */
  eject: require('./eject'),

  /**
   * @doc method
   * @id DS.sync methods:ejectAll
   * @name ejectAll
   * @methodOf DS
   * @description
   * See [DS.ejectAll](/documentation/api/api/DS.sync methods:ejectAll).
   */
  ejectAll: require('./ejectAll'),

  /**
   * @doc method
   * @id DS.sync methods:filter
   * @name filter
   * @methodOf DS
   * @description
   * See [DS.filter](/documentation/api/api/DS.sync methods:filter).
   */
  filter: require('./filter'),

  /**
   * @doc method
   * @id DS.sync methods:get
   * @name get
   * @methodOf DS
   * @description
   * See [DS.get](/documentation/api/api/DS.sync methods:get).
   */
  get: require('./get'),

  /**
   * @doc method
   * @id DS.sync methods:hasChanges
   * @name hasChanges
   * @methodOf DS
   * @description
   * See [DS.hasChanges](/documentation/api/api/DS.sync methods:hasChanges).
   */
  hasChanges: require('./hasChanges'),

  /**
   * @doc method
   * @id DS.sync methods:inject
   * @name inject
   * @methodOf DS
   * @description
   * See [DS.inject](/documentation/api/api/DS.sync methods:inject).
   */
  inject: require('./inject'),

  /**
   * @doc method
   * @id DS.sync methods:lastModified
   * @name lastModified
   * @methodOf DS
   * @description
   * See [DS.lastModified](/documentation/api/api/DS.sync methods:lastModified).
   */
  lastModified: require('./lastModified'),

  /**
   * @doc method
   * @id DS.sync methods:lastSaved
   * @name lastSaved
   * @methodOf DS
   * @description
   * See [DS.lastSaved](/documentation/api/api/DS.sync methods:lastSaved).
   */
  lastSaved: require('./lastSaved'),

  /**
   * @doc method
   * @id DS.sync methods:link
   * @name link
   * @methodOf DS
   * @description
   * See [DS.link](/documentation/api/api/DS.sync methods:link).
   */
  link: require('./link'),

  /**
   * @doc method
   * @id DS.sync methods:linkAll
   * @name linkAll
   * @methodOf DS
   * @description
   * See [DS.linkAll](/documentation/api/api/DS.sync methods:linkAll).
   */
  linkAll: require('./linkAll'),

  /**
   * @doc method
   * @id DS.sync methods:linkInverse
   * @name linkInverse
   * @methodOf DS
   * @description
   * See [DS.linkInverse](/documentation/api/api/DS.sync methods:linkInverse).
   */
  linkInverse: require('./linkInverse'),

  /**
   * @doc method
   * @id DS.sync methods:previous
   * @name previous
   * @methodOf DS
   * @description
   * See [DS.previous](/documentation/api/api/DS.sync methods:previous).
   */
  previous: require('./previous'),

  /**
   * @doc method
   * @id DS.sync methods:unlinkInverse
   * @name unlinkInverse
   * @methodOf DS
   * @description
   * See [DS.unlinkInverse](/documentation/api/api/DS.sync methods:unlinkInverse).
   */
  unlinkInverse: require('./unlinkInverse')
};

},{"./changeHistory":67,"./changes":68,"./compute":69,"./createInstance":70,"./defineResource":71,"./digest":72,"./eject":73,"./ejectAll":74,"./filter":75,"./get":76,"./hasChanges":77,"./inject":79,"./lastModified":80,"./lastSaved":81,"./link":82,"./linkAll":83,"./linkInverse":84,"./previous":85,"./unlinkInverse":86}],79:[function(require,module,exports){
var observe = require('../../../lib/observe-js/observe-js');
var _compute = require('./compute')._compute;
var stack = 0;
var data = {
  injectedSoFar: {}
};

function errorPrefix(resourceName) {
  return 'DS.inject(' + resourceName + ', attrs[, options]): ';
}

function _inject(definition, resource, attrs, options) {
  var DS = this;

  function _react(added, removed, changed, oldValueFn, firstTime) {
    var target = this;
    var item;
    var innerId = (oldValueFn && oldValueFn(definition.idAttribute)) ? oldValueFn(definition.idAttribute) : target[definition.idAttribute];

    DS.utils.forEach(definition.relationFields, function (field) {
      delete added[field];
      delete removed[field];
      delete changed[field];
    });

    if (!DS.utils.isEmpty(added) || !DS.utils.isEmpty(removed) || !DS.utils.isEmpty(changed) || firstTime) {
      item = DS.get(definition.name, innerId);
      resource.modified[innerId] = DS.utils.updateTimestamp(resource.modified[innerId]);
      resource.collectionModified = DS.utils.updateTimestamp(resource.collectionModified);
      if (definition.keepChangeHistory) {
        var changeRecord = {
          resourceName: definition.name,
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
      item = item || DS.get(definition.name, innerId);
      DS.utils.forOwn(definition.computed, function (fn, field) {
        var compute = false;
        // check if required fields changed
        DS.utils.forEach(fn.deps, function (dep) {
          if (dep in added || dep in removed || dep in changed || !(field in item)) {
            compute = true;
          }
        });
        compute = compute || !fn.deps.length;
        if (compute) {
          _compute.call(item, fn, field, DS.utils);
        }
      });
    }

    if (definition.relations) {
      item = item || DS.get(definition.name, innerId);
      DS.utils.forEach(definition.relationList, function (def) {
        if (item[def.localField] && (def.localKey in added || def.localKey in removed || def.localKey in changed)) {
          DS.link(definition.name, item[definition.idAttribute], [def.relation]);
        }
      });
    }

    if (definition.idAttribute in changed) {
      console.error('Doh! You just changed the primary key of an object! ' +
        'I don\'t know how to handle this yet, so your data for the "' + definition.name +
        '" resource is now in an undefined (probably broken) state.');
    }
  }

  var injected;
  if (DS.utils.isArray(attrs)) {
    injected = [];
    for (var i = 0; i < attrs.length; i++) {
      injected.push(_inject.call(DS, definition, resource, attrs[i], options));
    }
  } else {
    // check if "idAttribute" is a computed property
    var c = definition.computed;
    var idA = definition.idAttribute;
    if (c && c[idA]) {
      var args = [];
      DS.utils.forEach(c[idA].deps, function (dep) {
        args.push(attrs[dep]);
      });
      attrs[idA] = c[idA][c[idA].length - 1].apply(attrs, args);
    }
    if (!(idA in attrs)) {
      var error = new DS.errors.R(errorPrefix(definition.name) + 'attrs: Must contain the property specified by `idAttribute`!');
      console.error(error);
      throw error;
    } else {
      try {
        definition.beforeInject(definition.name, attrs);
        var id = attrs[idA];
        var item = DS.get(definition.name, id);

        if (!item) {
          if (options.useClass) {
            if (attrs instanceof definition[definition.class]) {
              item = attrs;
            } else {
              item = new definition[definition.class]();
            }
          } else {
            item = {};
          }
          resource.previousAttributes[id] = {};

          DS.utils.deepMixIn(item, attrs);
          DS.utils.deepMixIn(resource.previousAttributes[id], attrs);

          resource.collection.push(item);

          resource.changeHistories[id] = [];
          resource.observers[id] = new observe.ObjectObserver(item);
          resource.observers[id].open(_react, item);
          resource.index[id] = item;

          _react.call(item, {}, {}, {}, null, true);
        } else {
          DS.utils.deepMixIn(item, attrs);
          if (definition.resetHistoryOnInject) {
            resource.previousAttributes[id] = {};
            DS.utils.deepMixIn(resource.previousAttributes[id], attrs);
            if (resource.changeHistories[id].length) {
              DS.utils.forEach(resource.changeHistories[id], function (changeRecord) {
                DS.utils.remove(resource.changeHistory, changeRecord);
              });
              resource.changeHistories[id].splice(0, resource.changeHistories[id].length);
            }
          }
          resource.observers[id].deliver();
        }
        resource.saved[id] = DS.utils.updateTimestamp(resource.saved[id]);
        definition.afterInject(definition.name, item);
        injected = item;
      } catch (err) {
        console.error(err);
        console.error('inject failed!', definition.name, attrs);
      }
    }
  }
  return injected;
}

function _injectRelations(definition, injected, options) {
  var DS = this;

  function _process(def, relationName, injected) {
    var relationDef = DS.definitions[relationName];
    if (relationDef && injected[def.localField] && !data.injectedSoFar[relationName + injected[def.localField][relationDef.idAttribute]]) {
      try {
        data.injectedSoFar[relationName + injected[def.localField][relationDef.idAttribute]] = 1;
        injected[def.localField] = DS.inject(relationName, injected[def.localField], options);
      } catch (err) {
        DS.console.error(errorPrefix(definition.name) + 'Failed to inject ' + def.type + ' relation: "' + relationName + '"!', err);
      }
    } else if (options.findBelongsTo && def.type === 'belongsTo') {
      if (DS.utils.isArray(injected)) {
        DS.utils.forEach(injected, function (injectedItem) {
          DS.link(definition.name, injectedItem[definition.idAttribute], [relationName]);
        });
      } else {
        DS.link(definition.name, injected[definition.idAttribute], [relationName]);
      }
    } else if ((options.findHasMany && def.type === 'hasMany') || (options.findHasOne && def.type === 'hasOne')) {
      if (DS.utils.isArray(injected)) {
        DS.utils.forEach(injected, function (injectedItem) {
          DS.link(definition.name, injectedItem[definition.idAttribute], [relationName]);
        });
      } else {
        DS.link(definition.name, injected[definition.idAttribute], [relationName]);
      }
    }
  }

  DS.utils.forEach(definition.relationList, function (def) {
    if (DS.utils.isArray(injected)) {
      DS.utils.forEach(injected, function (injectedI) {
        _process(def, def.relation, injectedI);
      });
    } else {
      _process(def, def.relation, injected);
    }
  });
}

/**
 * @doc method
 * @id DS.sync methods:inject
 * @name inject
 * @description
 * Inject the given item into the data store as the specified type. If `attrs` is an array, inject each item into the
 * data store. Injecting an item into the data store does not save it to the server. Emits a `"DS.inject"` event.
 *
 * ## Signature:
 * ```js
 * DS.inject(resourceName, attrs[, options])
 * ```
 *
 * ## Examples:
 *
 * ```js
 * DS.get('document', 45); // undefined
 *
 * DS.inject('document', { title: 'How to Cook', id: 45 });
 *
 * DS.get('document', 45); // { title: 'How to Cook', id: 45 }
 * ```
 *
 * Inject a collection into the data store:
 *
 * ```js
 * DS.filter('document'); // [ ]
 *
 * DS.inject('document', [ { title: 'How to Cook', id: 45 }, { title: 'How to Eat', id: 46 } ]);
 *
 * DS.filter('document'); // [ { title: 'How to Cook', id: 45 }, { title: 'How to Eat', id: 46 } ]
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object|array} attrs The item or collection of items to inject into the data store.
 * @param {object=} options The item or collection of items to inject into the data store. Properties:
 *
 * - `{boolean=}` - `useClass` - Whether to wrap the injected item with the resource's instance constructor.
 * - `{boolean=}` - `findBelongsTo` - Find and attach any existing "belongsTo" relationships to the newly injected item. Potentially expensive if enabled. Default: `false`.
 * - `{boolean=}` - `findHasMany` - Find and attach any existing "hasMany" relationships to the newly injected item. Potentially expensive if enabled. Default: `false`.
 * - `{boolean=}` - `findHasOne` - Find and attach any existing "hasOne" relationships to the newly injected item. Potentially expensive if enabled. Default: `false`.
 * - `{boolean=}` - `linkInverse` - Look in the data store for relations of the injected item(s) and update their links to the injected. Potentially expensive if enabled. Default: `false`.
 *
 * @returns {object|array} A reference to the item that was injected into the data store or an array of references to
 * the items that were injected into the data store.
 */
function inject(resourceName, attrs, options) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];

  options = options || {};

  if (!definition) {
    throw new DSErrors.NER(errorPrefix(resourceName) + resourceName);
  } else if (!DSUtils.isObject(attrs) && !DSUtils.isArray(attrs)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'attrs: Must be an object or an array!');
  } else if (!DSUtils.isObject(options)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'options: Must be an object!');
  }
  var resource = DS.store[resourceName];
  var injected;

  stack++;

  try {
    if (!('useClass' in options)) {
      options.useClass = definition.useClass;
    }
    injected = _inject.call(DS, definition, resource, attrs, options);
    if (definition.relations) {
      _injectRelations.call(DS, definition, injected, options);
    }

    if (options.linkInverse) {
      if (DSUtils.isArray(injected) && injected.length) {
        DS.linkInverse(definition.name, injected[0][definition.idAttribute]);
      } else {
        DS.linkInverse(definition.name, injected[definition.idAttribute]);
      }
    }

    DS.notify(definition, 'inject', injected);

    stack--;
  } catch (err) {
    stack--;
    throw err;
  }

  if (!stack) {
    data.injectedSoFar = {};
  }

  return injected;
}

module.exports = inject;

},{"../../../lib/observe-js/observe-js":1,"./compute":69}],80:[function(require,module,exports){
function errorPrefix(resourceName, id) {
  return 'DS.lastModified(' + resourceName + '[, ' + id + ']): ';
}

/**
 * @doc method
 * @id DS.sync methods:lastModified
 * @name lastModified
 * @description
 * Return the timestamp of the last time either the collection for `resourceName` or the item of type `resourceName`
 * with the given primary key was modified.
 *
 * ## Signature:
 * ```js
 * DS.lastModified(resourceName[, id])
 * ```
 *
 * ## Example:
 *
 * ```js
 * DS.lastModified('document', 5); // undefined
 *
 * DS.find('document', 5).then(function (document) {
 *   DS.lastModified('document', 5); // 1234235825494
 * });
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number=} id The primary key of the item to remove.
 * @returns {number} The timestamp of the last time either the collection for `resourceName` or the item of type
 * `resourceName` with the given primary key was modified.
 */
function lastModified(resourceName, id) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var resource = DS.store[resourceName];

  id = DSUtils.resolveId(DS.definitions[resourceName], id);
  if (!DS.definitions[resourceName]) {
    throw new DSErrors.NER(errorPrefix(resourceName, id) + resourceName);
  } else if (id && !DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA(errorPrefix(resourceName, id) + 'id: Must be a string or a number!');
  }
  if (id) {
    if (!(id in resource.modified)) {
      resource.modified[id] = 0;
    }
    return resource.modified[id];
  }
  return resource.collectionModified;
}

module.exports = lastModified;

},{}],81:[function(require,module,exports){
function errorPrefix(resourceName, id) {
  return 'DS.lastSaved(' + resourceName + '[, ' + id + ']): ';
}

/**
 * @doc method
 * @id DS.sync methods:lastSaved
 * @name lastSaved
 * @description
 * Return the timestamp of the last time either the collection for `resourceName` or the item of type `resourceName`
 * with the given primary key was saved via an async adapter.
 *
 * ## Signature:
 * ```js
 * DS.lastSaved(resourceName[, id])
 * ```
 *
 * ## Example:
 *
 * ```js
 * DS.lastModified('document', 5); // undefined
 * DS.lastSaved('document', 5); // undefined
 *
 * DS.find('document', 5).then(function (document) {
 *   DS.lastModified('document', 5); // 1234235825494
 *   DS.lastSaved('document', 5); // 1234235825494
 *
 *   document.author = 'Sally';
 *
 *   // You may have to call DS.digest() first
 *
 *   DS.lastModified('document', 5); // 1234304985344 - something different
 *   DS.lastSaved('document', 5); // 1234235825494 - still the same
 * });
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item for which to retrieve the lastSaved timestamp.
 * @returns {number} The timestamp of the last time the item of type `resourceName` with the given primary key was saved.
 */
function lastSaved(resourceName, id) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var resource = DS.store[resourceName];

  id = DSUtils.resolveId(DS.definitions[resourceName], id);
  if (!DS.definitions[resourceName]) {
    throw new DSErrors.NER(errorPrefix(resourceName, id) + resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA(errorPrefix(resourceName, id) + 'id: Must be a string or a number!');
  }
  if (!(id in resource.saved)) {
    resource.saved[id] = 0;
  }
  return resource.saved[id];
}

module.exports = lastSaved;

},{}],82:[function(require,module,exports){
function errorPrefix(resourceName) {
  return 'DS.link(' + resourceName + ', id[, relations]): ';
}

function _link(definition, linked, relations) {
  var DS = this;
  DS.utils.forEach(definition.relationList, function (def) {
    var relationName = def.relation;
    if (relations.length && !DS.utils.contains(relations, relationName)) {
      return;
    }
    var params = {};
    if (def.type === 'belongsTo') {
      var parent = linked[def.localKey] ? DS.get(relationName, linked[def.localKey]) : null;
      if (parent) {
        linked[def.localField] = parent;
      }
    } else if (def.type === 'hasMany') {
      params[def.foreignKey] = linked[definition.idAttribute];
      linked[def.localField] = DS.defaults.constructor.prototype.defaultFilter.call(DS, DS.store[relationName].collection, relationName, params, { allowSimpleWhere: true });
    } else if (def.type === 'hasOne') {
      params[def.foreignKey] = linked[definition.idAttribute];
      var children = DS.defaults.constructor.prototype.defaultFilter.call(DS, DS.store[relationName].collection, relationName, params, { allowSimpleWhere: true });
      if (children.length) {
        linked[def.localField] = children[0];
      }
    }
  });
}

/**
 * @doc method
 * @id DS.sync methods:link
 * @name link
 * @description
 * Find relations of the item with the given primary key that are already in the data store and link them to the item.
 *
 * ## Signature:
 * ```js
 * DS.link(resourceName, id[, relations])
 * ```
 *
 * ## Examples:
 *
 * Assume `user` has `hasMany` relationships to `post` and `comment`.
 * ```js
 * DS.get('user', 1); // { name: 'John', id: 1 }
 *
 * // link posts
 * DS.link('user', 1, ['post']);
 *
 * DS.get('user', 1); // { name: 'John', id: 1, posts: [...] }
 *
 * // link all relations
 * DS.link('user', 1);
 *
 * DS.get('user', 1); // { name: 'John', id: 1, posts: [...], comments: [...] }
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item for to link relations.
 * @param {array=} relations The relations to be linked. If not provided then all relations will be linked. Default: `[]`.
 * @returns {object|array} A reference to the item with its linked relations.
 */
function link(resourceName, id, relations) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];

  relations = relations || [];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new DSErrors.NER(errorPrefix(resourceName) + resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'id: Must be a string or a number!');
  } else if (!DSUtils.isArray(relations)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'relations: Must be an array!');
  }
  var linked = DS.get(resourceName, id);

  if (linked) {
    _link.call(DS, definition, linked, relations);
  }

  return linked;
}

module.exports = link;

},{}],83:[function(require,module,exports){
function errorPrefix(resourceName) {
  return 'DS.linkAll(' + resourceName + '[, params][, relations]): ';
}

function _linkAll(definition, linked, relations) {
  var DS = this;
  DS.utils.forEach(definition.relationList, function (def) {
    var relationName = def.relation;
    if (relations.length && !DS.utils.contains(relations, relationName)) {
      return;
    }
    if (def.type === 'belongsTo') {
      DS.utils.forEach(linked, function (injectedItem) {
        var parent = injectedItem[def.localKey] ? DS.get(relationName, injectedItem[def.localKey]) : null;
        if (parent) {
          injectedItem[def.localField] = parent;
        }
      });
    } else if (def.type === 'hasMany') {
      DS.utils.forEach(linked, function (injectedItem) {
        var params = {};
        params[def.foreignKey] = injectedItem[definition.idAttribute];
        injectedItem[def.localField] = DS.defaults.constructor.prototype.defaultFilter.call(DS, DS.store[relationName].collection, relationName, params, { allowSimpleWhere: true });
      });
    } else if (def.type === 'hasOne') {
      DS.utils.forEach(linked, function (injectedItem) {
        var params = {};
        params[def.foreignKey] = injectedItem[definition.idAttribute];
        var children = DS.defaults.constructor.prototype.defaultFilter.call(DS, DS.store[relationName].collection, relationName, params, { allowSimpleWhere: true });
        if (children.length) {
          injectedItem[def.localField] = children[0];
        }
      });
    }
  });
}

/**
 * @doc method
 * @id DS.sync methods:linkAll
 * @name linkAll
 * @description
 * Find relations of a collection of items that are already in the data store and link them to the items.
 *
 * ## Signature:
 * ```js
 * DS.linkAll(resourceName[, params][, relations])
 * ```
 *
 * ## Examples:
 *
 * Assume `user` has `hasMany` relationships to `post` and `comment`.
 * ```js
 * DS.filter('user'); // [{ name: 'John', id: 1 }, { name: 'Sally', id: 2 }]
 *
 * // link posts
 * DS.linkAll('user', {
 *   name: : 'John'
 * }, ['post']);
 *
 * DS.filter('user'); // [{ name: 'John', id: 1, posts: [...] }, { name: 'Sally', id: 2 }]
 *
 * // link all relations
 * DS.linkAll('user', { name: : 'John' });
 *
 * DS.filter('user'); // [{ name: 'John', id: 1, posts: [...], comments: [...] }, { name: 'Sally', id: 2 }]
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object=} params Parameter object that is used to filter items. Properties:
 *
 *  - `{object=}` - `where` - Where clause.
 *  - `{number=}` - `limit` - Limit clause.
 *  - `{number=}` - `skip` - Skip clause.
 *  - `{number=}` - `offset` - Same as skip.
 *  - `{string|array=}` - `orderBy` - OrderBy clause.
 *
 * @param {array=} relations The relations to be linked. If not provided then all relations will be linked. Default: `[]`.
 * @returns {object|array} A reference to the item with its linked relations.
 */
function linkAll(resourceName, params, relations) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];

  relations = relations || [];

  if (!definition) {
    throw new DSErrors.NER(errorPrefix(resourceName) + resourceName);
  } else if (params && !DSUtils.isObject(params)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'params: Must be an object!');
  } else if (!DSUtils.isArray(relations)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'relations: Must be an array!');
  }
  var linked = DS.filter(resourceName, params);

  if (linked) {
    _linkAll.call(DS, definition, linked, relations);
  }

  return linked;
}

module.exports = linkAll;

},{}],84:[function(require,module,exports){
function errorPrefix(resourceName) {
  return 'DS.linkInverse(' + resourceName + ', id[, relations]): ';
}

function _linkInverse(definition, relations) {
  var DS = this;
  DS.utils.forOwn(DS.definitions, function (d) {
    DS.utils.forOwn(d.relations, function (relatedModels) {
      DS.utils.forOwn(relatedModels, function (defs, relationName) {
        if (relations.length && !DS.utils.contains(relations, d.name)) {
          return;
        }
        if (definition.name === relationName) {
          DS.linkAll(d.name, {}, [definition.name]);
        }
      });
    });
  });
}

/**
 * @doc method
 * @id DS.sync methods:linkInverse
 * @name linkInverse
 * @description
 * Find relations of the item with the given primary key that are already in the data store and link this item to those
 * relations. This creates links in the opposite direction of `DS.link`.
 *
 * ## Signature:
 * ```js
 * DS.linkInverse(resourceName, id[, relations])
 * ```
 *
 * ## Examples:
 *
 * Assume `organization` has `hasMany` relationship to `user` and `post` has a `belongsTo` relationship to `user`.
 * ```js
 * DS.get('user', 1); // { organizationId: 5, id: 1 }
 * DS.get('organization', 5); // { id: 5 }
 * DS.filter('post', { userId: 1 }); // [ { id: 23, userId: 1 }, { id: 44, userId: 1 }]
 *
 * // link user to its relations
 * DS.linkInverse('user', 1, ['organization']);
 *
 * DS.get('organization', 5); // { id: 5, users: [{ organizationId: 5, id: 1 }] }
 *
 * // link user to all of its all relations
 * DS.linkInverse('user', 1);
 *
 * DS.get('user', 1); // { organizationId: 5, id: 1 }
 * DS.get('organization', 5); // { id: 5, users: [{ organizationId: 5, id: 1 }] }
 * DS.filter('post', { userId: 1 }); // [ { id: 23, userId: 1, user: {...} }, { id: 44, userId: 1, user: {...} }]
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item for to link relations.
 * @param {array=} relations The relations to be linked. If not provided then all relations will be linked. Default: `[]`.
 * @returns {object|array} A reference to the item with its linked relations.
 */
function linkInverse(resourceName, id, relations) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];

  relations = relations || [];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new DSErrors.NER(errorPrefix(resourceName) + resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'id: Must be a string or a number!');
  } else if (!DSUtils.isArray(relations)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'relations: Must be an array!');
  }
  var linked = DS.get(resourceName, id);

  if (linked) {
    _linkInverse.call(DS, definition, relations);
  }

  return linked;
}

module.exports = linkInverse;

},{}],85:[function(require,module,exports){
function errorPrefix(resourceName, id) {
  return 'DS.previous(' + resourceName + '[, ' + id + ']): ';
}

/**
 * @doc method
 * @id DS.sync methods:previous
 * @name previous
 * @description
 * Synchronously return the previous attributes of the item of the type specified by `resourceName` that has the primary key
 * specified by `id`. This object represents the state of the item the last time it was saved via an async adapter.
 *
 * ## Signature:
 * ```js
 * DS.previous(resourceName, id)
 * ```
 *
 * ## Example:
 *
 * ```js
 * var d = DS.get('document', 5); // { author: 'John Anderson', id: 5 }
 *
 * d.author = 'Sally';
 *
 * d; // { author: 'Sally', id: 5 }
 *
 * // You may have to do DS.digest() first
 *
 * DS.previous('document', 5); // { author: 'John Anderson', id: 5 }
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item whose previous attributes are to be retrieved.
 * @returns {object} The previous attributes of the item of the type specified by `resourceName` with the primary key specified by `id`.
 */
function previous(resourceName, id) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var resource = DS.store[resourceName];

  id = DSUtils.resolveId(DS.definitions[resourceName], id);
  if (!DS.definitions[resourceName]) {
    throw new DSErrors.NER(errorPrefix(resourceName, id) + resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA(errorPrefix(resourceName, id) + 'id: Must be a string or a number!');
  }

  // return resource from cache
  return resource.previousAttributes[id] ? DSUtils.merge({}, resource.previousAttributes[id]) : undefined;
}

module.exports = previous;

},{}],86:[function(require,module,exports){
function errorPrefix(resourceName) {
  return 'DS.unlinkInverse(' + resourceName + ', id[, relations]): ';
}

function _unlinkInverse(definition, linked) {
  var DS = this;
  DS.utils.forOwn(DS.definitions, function (d) {
    DS.utils.forOwn(d.relations, function (relatedModels) {
      DS.utils.forOwn(relatedModels, function (defs, relationName) {
        if (definition.name === relationName) {
          DS.utils.forEach(defs, function (def) {
            DS.utils.forEach(DS.store[def.name].collection, function (item) {
              if (def.type === 'hasMany' && item[def.localField]) {
                var index;
                DS.utils.forEach(item[def.localField], function (subItem, i) {
                  if (subItem === linked) {
                    index = i;
                  }
                });
                item[def.localField].splice(index, 1);
              } else if (item[def.localField] === linked) {
                delete item[def.localField];
              }
            });
          });
        }
      });
    });
  });
}

/**
 * @doc method
 * @id DS.sync methods:unlinkInverse
 * @name unlinkInverse
 * @description
 * Find relations of the item with the given primary key that are already in the data store and _unlink_ this item from those
 * relations. This unlinks links that would be created by `DS.linkInverse`.
 *
 * ## Signature:
 * ```js
 * DS.unlinkInverse(resourceName, id[, relations])
 * ```
 *
 * ## Examples:
 *
 * Assume `organization` has `hasMany` relationship to `user` and `post` has a `belongsTo` relationship to `user`.
 * ```js
 * DS.get('organization', 5); // { id: 5, users: [{ organizationId: 5, id: 1 }] }
 *
 * // unlink user 1 from its relations
 * DS.unlinkInverse('user', 1, ['organization']);
 *
 * DS.get('organization', 5); // { id: 5, users: [] }
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item for which to unlink relations.
 * @param {array=} relations The relations to be unlinked. If not provided then all relations will be unlinked. Default: `[]`.
 * @returns {object|array} A reference to the item that has been unlinked.
 */
function unlinkInverse(resourceName, id, relations) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];

  relations = relations || [];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new DSErrors.NER(errorPrefix(resourceName) + resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'id: Must be a string or a number!');
  } else if (!DSUtils.isArray(relations)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'relations: Must be an array!');
  }
  var linked = DS.get(resourceName, id);

  if (linked) {
    _unlinkInverse.call(DS, definition, linked, relations);
  }

  return linked;
}

module.exports = unlinkInverse;

},{}],87:[function(require,module,exports){
/**
 * @doc function
 * @id errors.types:IllegalArgumentError
 * @name IllegalArgumentError
 * @description Error that is thrown/returned when a caller does not honor the pre-conditions of a method/function.
 * @param {string=} message Error message. Default: `"Illegal Argument!"`.
 * @returns {IllegalArgumentError} A new instance of `IllegalArgumentError`.
 */
function IllegalArgumentError(message) {
  Error.call(this);
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * @doc property
   * @id errors.types:IllegalArgumentError.type
   * @name type
   * @propertyOf errors.types:IllegalArgumentError
   * @description Name of error type. Default: `"IllegalArgumentError"`.
   */
  this.type = this.constructor.name;

  /**
   * @doc property
   * @id errors.types:IllegalArgumentError.message
   * @name message
   * @propertyOf errors.types:IllegalArgumentError
   * @description Error message. Default: `"Illegal Argument!"`.
   */
  this.message = message || 'Illegal Argument!';
}

IllegalArgumentError.prototype = Object.create(Error.prototype);
IllegalArgumentError.prototype.constructor = IllegalArgumentError;

/**
 * @doc function
 * @id errors.types:RuntimeError
 * @name RuntimeError
 * @description Error that is thrown/returned for invalid state during runtime.
 * @param {string=} message Error message. Default: `"Runtime Error!"`.
 * @returns {RuntimeError} A new instance of `RuntimeError`.
 */
function RuntimeError(message) {
  Error.call(this);
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * @doc property
   * @id errors.types:RuntimeError.type
   * @name type
   * @propertyOf errors.types:RuntimeError
   * @description Name of error type. Default: `"RuntimeError"`.
   */
  this.type = this.constructor.name;

  /**
   * @doc property
   * @id errors.types:RuntimeError.message
   * @name message
   * @propertyOf errors.types:RuntimeError
   * @description Error message. Default: `"Runtime Error!"`.
   */
  this.message = message || 'RuntimeError Error!';
}

RuntimeError.prototype = Object.create(Error.prototype);
RuntimeError.prototype.constructor = RuntimeError;

/**
 * @doc function
 * @id errors.types:NonexistentResourceError
 * @name NonexistentResourceError
 * @description Error that is thrown/returned when trying to access a resource that does not exist.
 * @param {string=} resourceName Name of non-existent resource.
 * @returns {NonexistentResourceError} A new instance of `NonexistentResourceError`.
 */
function NonexistentResourceError(resourceName) {
  Error.call(this);
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * @doc property
   * @id errors.types:NonexistentResourceError.type
   * @name type
   * @propertyOf errors.types:NonexistentResourceError
   * @description Name of error type. Default: `"NonexistentResourceError"`.
   */
  this.type = this.constructor.name;

  /**
   * @doc property
   * @id errors.types:NonexistentResourceError.message
   * @name message
   * @propertyOf errors.types:NonexistentResourceError
   * @description Error message. Default: `"Runtime Error!"`.
   */
  this.message = (resourceName || '') + ' is not a registered resource!';
}

NonexistentResourceError.prototype = Object.create(Error.prototype);
NonexistentResourceError.prototype.constructor = NonexistentResourceError;

/**
 * @doc interface
 * @id errors
 * @name js-data error types
 * @description
 * Various error types that may be thrown by js-data.
 *
 * - [IllegalArgumentError](/documentation/api/api/errors.types:IllegalArgumentError)
 * - [RuntimeError](/documentation/api/api/errors.types:RuntimeError)
 * - [NonexistentResourceError](/documentation/api/api/errors.types:NonexistentResourceError)
 *
 * References to the constructor functions of these errors can be found in `DS.errors`.
 */
module.exports = {
  IllegalArgumentError: IllegalArgumentError,
  IA: IllegalArgumentError,
  RuntimeError: RuntimeError,
  R: RuntimeError,
  NonexistentResourceError: NonexistentResourceError,
  NER: NonexistentResourceError
};

},{}],88:[function(require,module,exports){
var DS = require('./datastore');

/**
 * @doc overview
 * @id js-data
 * @name js-data
 * @description
 * __Version:__ 0.0.1
 *
 * ## Install
 *
 * `bower install --save js-data` or `npm install --save js-data`
 *
 * #### Manual download
 * Download js-data from the [Releases](https://github.com/js-data/js-data/releases) section of the js-data GitHub project.
 *
 * - `DS`
 * - `DSHttpAdapter`
 * - `DSLocalStorageAdapter`
 * - `DSUtils`
 * - `DSErrors`
 *
 * [DS](/documentation/api/api/DS) is the Data Store itself, which you will inject often.
 * [DSHttpAdapter](/documentation/api/api/DSHttpAdapter) is useful as a wrapper for `http` and is configurable.
 * [DSLocalStorageAdapter](/documentation/api/api/DSLocalStorageAdapter) is useful as a wrapper for `localStorage` and is configurable.
 * [DSUtils](/documentation/api/api/DSUtils) has some useful utility methods.
 * [DSErrors](/documentation/api/api/DSErrors) provides references to the various errors thrown by the data store.
 */
module.exports = {
  DS: DS,
  createStore: function () {
    return new DS();
  },
  DSUtils: require('./utils'),
  DSErrors: require('./errors')
};

},{"./datastore":66,"./errors":87,"./utils":89}],89:[function(require,module,exports){
function Events(target) {
  var events = {};
  target = target || this;
  /**
   *  On: listen to events
   */
  target.on = function (type, func, ctx) {
    events[type] = events[type] || [];
    events[type].push({
      f: func,
      c: ctx
    });
  };

  /**
   *  Off: stop listening to event / specific callback
   */
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

module.exports = {
  isBoolean: require('mout/lang/isBoolean'),
  isString: require('mout/lang/isString'),
  isArray: require('mout/lang/isArray'),
  isObject: require('mout/lang/isObject'),
  isNumber: require('mout/lang/isNumber'),
  isFunction: require('mout/lang/isFunction'),
  isEmpty: require('mout/lang/isEmpty'),
  toJson: JSON.stringify,
  fromJson: JSON.parse,
  makePath: require('mout/string/makePath'),
  upperCase: require('mout/string/upperCase'),
  pascalCase: require('mout/string/pascalCase'),
  deepMixIn: require('mout/object/deepMixIn'),
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
  updateTimestamp: function (timestamp) {
    var newTimestamp = typeof Date.now === 'function' ? Date.now() : new Date().getTime();
    if (timestamp && newTimestamp <= timestamp) {
      return timestamp + 1;
    } else {
      return newTimestamp;
    }
  },
  Promise: require('es6-promise').Promise,
  deepFreeze: function deepFreeze(o) {
    if (typeof Object.freeze === 'function') {
      var prop, propKey;
      Object.freeze(o); // First freeze the object.
      for (propKey in o) {
        prop = o[propKey];
        if (!o.hasOwnProperty(propKey) || typeof prop !== 'object' || Object.isFrozen(prop)) {
          // If the object is on the prototype, not an object, or is already frozen,
          // skip it. Note that this might leave an unfrozen reference somewhere in the
          // object if there is an already frozen object containing an unfrozen object.
          continue;
        }

        deepFreeze(prop); // Recursively call deepFreeze.
      }
    }
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

},{"es6-promise":2,"mout/array/contains":13,"mout/array/filter":14,"mout/array/forEach":15,"mout/array/remove":18,"mout/array/slice":19,"mout/array/sort":20,"mout/array/toLookup":21,"mout/lang/isArray":27,"mout/lang/isBoolean":28,"mout/lang/isEmpty":29,"mout/lang/isFunction":30,"mout/lang/isNumber":32,"mout/lang/isObject":33,"mout/lang/isString":35,"mout/object/deepMixIn":39,"mout/object/forOwn":41,"mout/object/merge":43,"mout/object/pick":46,"mout/object/set":47,"mout/string/makePath":50,"mout/string/pascalCase":51,"mout/string/upperCase":54}]},{},[88])(88)
});