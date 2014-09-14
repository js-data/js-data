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
  merge: require('mout/object/merge'),
  forOwn: require('mout/object/forOwn'),
  forEach: require('mout/array/forEach'),
  pick: require('mout/object/pick'),
  set: require('mout/object/set'),
  contains: require('mout/array/contains'),
  filter: require('mout/array/filter'),
  toLookup: require('mout/array/toLookup'),
  remove: require('mout/array/remove'),
  slice: require('mout/array/slice'),
  sort: require('mout/array/sort'),
  updateTimestamp: function (timestamp) {
    var newTimestamp = typeof Date.now === 'function' ? Date.now() : new Date().getTime();
    if (timestamp && newTimestamp <= timestamp) {
      return timestamp + 1;
    } else {
      return newTimestamp;
    }
  },
  Promise: require('es6-promises'),
  http: require('axios'),
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
          fn.apply(target || this, args);
        } catch (err) {
          reject(err);
        }
      });
    };
  }
};
