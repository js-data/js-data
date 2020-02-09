/*!
* js-data
* @version 4.0.0-beta.4 - Homepage <http://www.js-data.io/>
* @author js-data project authors
* @copyright (c) 2014-2016 js-data project authors
* @license MIT <https://github.com/js-data/js-data/blob/master/LICENSE>
*
* @overview js-data is a framework-agnostic, datastore-agnostic ORM/ODM for Node.js and the Browser.
*/
/**
 * Utility methods used by JSData.
 *
 * @example
 * import { utils } from 'js-data';
 * console.log(utils.isString('foo')); // true
 *
 * @namespace utils
 * @type {Object}
 */
const DOMAIN = 'utils';
const INFINITY = 1 / 0;
const MAX_INTEGER = 1.7976931348623157e308;
const BOOL_TAG = '[object Boolean]';
const DATE_TAG = '[object Date]';
const FUNC_TAG = '[object Function]';
const NUMBER_TAG = '[object Number]';
const OBJECT_TAG = '[object Object]';
const REGEXP_TAG = '[object RegExp]';
const STRING_TAG = '[object String]';
const objToString = Object.prototype.toString;
const PATH = /^(.+)\.(.+)$/;
const ERRORS = {
    '400'(...args) {
        return `expected: ${args[0]}, found: ${args[2] ? args[1] : typeof args[1]}`;
    },
    '404'(...args) {
        return `${args[0]} not found`;
    }
};
const toInteger = value => {
    if (!value) {
        return 0;
    }
    // Coerce to number
    value = +value;
    if (value === INFINITY || value === -INFINITY) {
        const sign = value < 0 ? -1 : 1;
        return sign * MAX_INTEGER;
    }
    const remainder = value % 1;
    return value === value ? (remainder ? value - remainder : value) : 0; // eslint-disable-line
};
const toStr = value => objToString.call(value);
const isPlainObject = value => !!value && typeof value === 'object' && value.constructor === Object;
const mkdirP = (object, path) => {
    if (!path) {
        return object;
    }
    const parts = path.split('.');
    parts.forEach(key => {
        if (!object[key]) {
            object[key] = {};
        }
        object = object[key];
    });
    return object;
};
const utils = {
    /**
     * Shallow copy properties that meet the following criteria from `src` to
     * `dest`:
     *
     * - own enumerable
     * - not a function
     * - does not start with "_"
     *
     * @method utils._
     * @param {object} dest Destination object.
     * @param {object} src Source object.
     * @private
     * @since 3.0.0
     */
    _(dest, src) {
        utils.forOwn(src, (value, key) => {
            if (key && dest[key] === undefined && !utils.isFunction(value) && key.indexOf('_') !== 0) {
                dest[key] = value;
            }
        });
    },
    /**
     * Recursively iterates over relations found in `opts.with`.
     *
     * @method utils._forRelation
     * @param {object} opts Configuration options.
     * @param {Relation} def Relation definition.
     * @param {Function} fn Callback function.
     * @param {*} [thisArg] Execution context for the callback function.
     * @private
     * @since 3.0.0
     */
    _forRelation(opts = {}, def, fn, thisArg) {
        const relationName = def.relation;
        let containedName = null;
        let index;
        opts.with = opts.with || [];
        if ((index = utils._getIndex(opts.with, relationName)) >= 0) {
            containedName = relationName;
        }
        else if ((index = utils._getIndex(opts.with, def.localField)) >= 0) {
            containedName = def.localField;
        }
        if (opts.withAll) {
            fn.call(thisArg, def, {});
            return;
        }
        else if (!containedName) {
            return;
        }
        const optsCopy = {};
        utils.fillIn(optsCopy, def.getRelation());
        utils.fillIn(optsCopy, opts);
        optsCopy.with = opts.with.slice();
        optsCopy._activeWith = optsCopy.with.splice(index, 1)[0];
        optsCopy.with.forEach((relation, i) => {
            if (relation &&
                relation.indexOf(containedName) === 0 &&
                relation.length >= containedName.length &&
                relation[containedName.length] === '.') {
                optsCopy.with[i] = relation.substr(containedName.length + 1);
            }
            else {
                optsCopy.with[i] = '';
            }
        });
        fn.call(thisArg, def, optsCopy);
    },
    /**
     * Find the index of a relation in the given list
     *
     * @method utils._getIndex
     * @param {string[]} list List to search.
     * @param {string} relation Relation to find.
     * @private
     * @returns {number}
     */
    _getIndex(list, relation) {
        let index = -1;
        list.forEach((_relation, i) => {
            if (_relation === relation) {
                index = i;
                return false;
            }
            else if (utils.isObject(_relation)) {
                if (_relation.relation === relation) {
                    index = i;
                    return false;
                }
            }
        });
        return index;
    },
    /**
     * Define hidden (non-enumerable), writable properties on `target` from the
     * provided `props`.
     *
     * @example
     * import { utils } from 'js-data';
     * function Cat () {}
     * utils.addHiddenPropsToTarget(Cat.prototype, {
     *   say () {
     *     console.log('meow');
     *   }
     * });
     * const cat = new Cat();
     * cat.say(); // "meow"
     *
     * @method utils.addHiddenPropsToTarget
     * @param {object} target That to which `props` should be added.
     * @param {object} props Properties to be added to `target`.
     * @since 3.0.0
     */
    addHiddenPropsToTarget(target, props) {
        const map = {};
        Object.keys(props).forEach(propName => {
            const descriptor = Object.getOwnPropertyDescriptor(props, propName);
            descriptor.enumerable = false;
            map[propName] = descriptor;
        });
        Object.defineProperties(target, map);
    },
    /**
     * Return whether the two objects are deeply different.
     *
     * @example
     * import { utils } from 'js-data';
     * utils.areDifferent({}, {}); // false
     * utils.areDifferent({ a: 1 }, { a: 1 }); // false
     * utils.areDifferent({ foo: 'bar' }, {}); // true
     *
     * @method utils.areDifferent
     * @param newObject
     * @param oldObject
     * @param {object} [opts] Configuration options.
     * @param {Function} [opts.equalsFn={@link utils.deepEqual}] Equality function.
     * @param {array} [opts.ignore=[]] Array of strings or RegExp of fields to ignore.
     * @returns {boolean} Whether the two objects are deeply different.
     * @see utils.diffObjects
     * @since 3.0.0
     */
    areDifferent(newObject, oldObject, opts = {}) {
        const diff = utils.diffObjects(newObject, oldObject, opts);
        const diffCount = Object.keys(diff.added).length + Object.keys(diff.removed).length + Object.keys(diff.changed).length;
        return diffCount > 0;
    },
    /**
     * Deep copy a value.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = { foo: { bar: 'baz' } };
     * const b = utils.copy(a);
     * a === b; // false
     * utils.areDifferent(a, b); // false
     *
     * @param {*} from Value to deep copy.
     * @param {*} [to] Destination object for the copy operation.
     * @param {*} [stackFrom] For internal use.
     * @param {*} [stackTo] For internal use.
     * @param {string[]|RegExp[]} [blacklist] List of strings or RegExp of
     * properties to skip.
     * @param {boolean} [plain] Whether to make a plain copy (don't try to use
     * original prototype).
     * @returns {*} Deep copy of `from`.
     * @since 3.0.0
     */
    copy(from, to, stackFrom, stackTo, blacklist, plain) {
        if (!to) {
            to = from;
            if (from) {
                if (utils.isArray(from)) {
                    to = utils.copy(from, [], stackFrom, stackTo, blacklist, plain);
                }
                else if (utils.isDate(from)) {
                    to = new Date(from.getTime());
                }
                else if (utils.isRegExp(from)) {
                    to = new RegExp(from.source, from.toString().match(/[^/]*$/)[0]);
                    to.lastIndex = from.lastIndex;
                }
                else if (utils.isObject(from)) {
                    if (plain) {
                        to = utils.copy(from, {}, stackFrom, stackTo, blacklist, plain);
                    }
                    else {
                        to = utils.copy(from, Object.create(Object.getPrototypeOf(from)), stackFrom, stackTo, blacklist, plain);
                    }
                }
            }
        }
        else {
            if (from === to) {
                throw utils.err(`${DOMAIN}.copy`)(500, 'Cannot copy! Source and destination are identical.');
            }
            stackFrom = stackFrom || [];
            stackTo = stackTo || [];
            if (utils.isObject(from)) {
                const index = stackFrom.indexOf(from);
                if (index !== -1) {
                    return stackTo[index];
                }
                stackFrom.push(from);
                stackTo.push(to);
            }
            let result;
            if (utils.isArray(from)) {
                let i;
                to.length = 0;
                for (i = 0; i < from.length; i++) {
                    result = utils.copy(from[i], null, stackFrom, stackTo, blacklist, plain);
                    if (utils.isObject(from[i])) {
                        stackFrom.push(from[i]);
                        stackTo.push(result);
                    }
                    to.push(result);
                }
            }
            else {
                if (utils.isArray(to)) {
                    to.length = 0;
                }
                else {
                    utils.forOwn(to, (value, key) => {
                        delete to[key];
                    });
                }
                for (const key in from) {
                    if (from.hasOwnProperty(key)) {
                        if (utils.isBlacklisted(key, blacklist)) {
                            continue;
                        }
                        result = utils.copy(from[key], null, stackFrom, stackTo, blacklist, plain);
                        if (utils.isObject(from[key])) {
                            stackFrom.push(from[key]);
                            stackTo.push(result);
                        }
                        to[key] = result;
                    }
                }
            }
        }
        return to;
    },
    /**
     * Recursively shallow fill in own enumerable properties from `source` to
     * `dest`.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = { foo: { bar: 'baz' }, beep: 'boop' };
     * const b = { beep: 'bip' };
     * utils.deepFillIn(b, a);
     * console.log(b); // {"foo":{"bar":"baz"},"beep":"bip"}
     *
     * @method utils.deepFillIn
     * @param {object} dest The destination object.
     * @param {object} source The source object.
     * @see utils.fillIn
     * @see utils.deepMixIn
     * @since 3.0.0
     */
    deepFillIn(dest, source) {
        if (source) {
            utils.forOwn(source, (value, key) => {
                const existing = dest[key];
                if (isPlainObject(value) && isPlainObject(existing)) {
                    utils.deepFillIn(existing, value);
                }
                else if (!dest.hasOwnProperty(key) || dest[key] === undefined) {
                    dest[key] = value;
                }
            });
        }
        return dest;
    },
    /**
     * Recursively shallow copy enumerable properties from `source` to `dest`.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = { foo: { bar: 'baz' }, beep: 'boop' };
     * const b = { beep: 'bip' };
     * utils.deepFillIn(b, a);
     * console.log(b); // {"foo":{"bar":"baz"},"beep":"boop"}
     *
     * @method utils.deepMixIn
     * @param {object} dest The destination object.
     * @param {object} source The source object.
     * @see utils.fillIn
     * @see utils.deepFillIn
     * @since 3.0.0
     */
    deepMixIn(dest, source) {
        if (source) {
            // tslint:disable-next-line:forin
            for (const key in source) {
                const value = source[key];
                const existing = dest[key];
                if (isPlainObject(value) && isPlainObject(existing)) {
                    utils.deepMixIn(existing, value);
                }
                else {
                    dest[key] = value;
                }
            }
        }
        return dest;
    },
    /**
     * Return a diff of the base object to the comparison object.
     *
     * @example
     * import { utils } from 'js-data';
     * const oldObject = { foo: 'bar', a: 1234 };
     * const newObject = { beep: 'boop', a: 5678 };
     * const diff = utils.diffObjects(oldObject, newObject);
     * console.log(diff.added); // {"beep":"boop"}
     * console.log(diff.changed); // {"a":5678}
     * console.log(diff.removed); // {"foo":undefined}
     *
     * @method utils.diffObjects
     * @param {object} newObject Comparison object.
     * @param {object} oldObject Base object.
     * @param {object} [opts] Configuration options.
     * @param {Function} [opts.equalsFn={@link utils.deepEqual}] Equality function.
     * @param {array} [opts.ignore=[]] Array of strings or RegExp of fields to ignore.
     * @returns {Object} The diff from the base object to the comparison object.
     * @see utils.areDifferent
     * @since 3.0.0
     */
    diffObjects(newObject, oldObject, opts = {}) {
        let equalsFn = opts.equalsFn;
        const blacklist = opts.ignore;
        const diff = {
            added: {},
            changed: {},
            removed: {}
        };
        if (!utils.isFunction(equalsFn)) {
            equalsFn = utils.deepEqual;
        }
        const newKeys = Object.keys(newObject).filter(key => !utils.isBlacklisted(key, blacklist));
        const oldKeys = Object.keys(oldObject).filter(key => !utils.isBlacklisted(key, blacklist));
        // Check for properties that were added or changed
        newKeys.forEach(key => {
            const oldValue = oldObject[key];
            const newValue = newObject[key];
            if (equalsFn(oldValue, newValue)) {
                return;
            }
            if (oldValue === undefined) {
                diff.added[key] = newValue;
            }
            else {
                diff.changed[key] = newValue;
            }
        });
        // Check for properties that were removed
        oldKeys.forEach(key => {
            const oldValue = oldObject[key];
            const newValue = newObject[key];
            if (newValue === undefined && oldValue !== undefined) {
                diff.removed[key] = undefined;
            }
        });
        return diff;
    },
    /**
     * Return whether the two values are equal according to the `==` operator.
     *
     * @example
     * import { utils } from 'js-data';
     * console.log(utils.equal(1,1)); // true
     * console.log(utils.equal(1,'1')); // true
     * console.log(utils.equal(93, 66)); // false
     *
     * @method utils.equal
     * @param {*} a First value in the comparison.
     * @param {*} b Second value in the comparison.
     * @returns {boolean} Whether the two values are equal according to `==`.
     * @since 3.0.0
     */
    equal(a, b) {
        // tslint:disable-next-line:triple-equals
        return a == b; // eslint-disable-line
    },
    /**
     * Produce a factory function for making Error objects with the provided
     * metadata. Used throughout the various js-data components.
     *
     * @example
     * import { utils } from 'js-data';
     * const errorFactory = utils.err('domain', 'target');
     * const error400 = errorFactory(400, 'expected type', 'actual type');
     * console.log(error400); // [Error: [domain:target] expected: expected type, found: string
     * http://www.js-data.io/v3.0/docs/errors#400]
     * @method utils.err
     * @param {string} domain Namespace.
     * @param {string} target Target.
     * @returns {Function} Factory function.
     * @since 3.0.0
     */
    err(domain, target) {
        return (code, ...args) => {
            const prefix = `[${domain}:${target}] `;
            let message = ERRORS[code].apply(null, args);
            message = `${prefix}${message}
http://www.js-data.io/v3.0/docs/errors#${code}`;
            return new Error(message);
        };
    },
    /**
     * Add eventing capabilities into the target object.
     *
     * @example
     * import { utils } from 'js-data';
     * const user = { name: 'John' };
     * utils.eventify(user);
     * user.on('foo', () => console.log(arguments));
     * user.emit('foo', 1, 'bar'); // should log to console values (1, "bar")
     *
     * @method utils.eventify
     * @param {object} target Target object.
     * @param {Function} [getter] Custom getter for retrieving the object's event
     * listeners.
     * @param {Function} [setter] Custom setter for setting the object's event
     * listeners.
     * @since 3.0.0
     */
    eventify(target, getter, setter) {
        target = target || this;
        let _events = {};
        if (!getter && !setter) {
            getter = () => _events;
            setter = value => (_events = value);
        }
        Object.defineProperties(target, {
            emit: {
                value(...args) {
                    const events = getter.call(this) || {};
                    const type = args.shift();
                    let listeners = events[type] || [];
                    let i;
                    for (i = 0; i < listeners.length; i++) {
                        listeners[i].f.apply(listeners[i].c, args);
                    }
                    listeners = events.all || [];
                    args.unshift(type);
                    for (i = 0; i < listeners.length; i++) {
                        listeners[i].f.apply(listeners[i].c, args);
                    }
                }
            },
            off: {
                value(type, func) {
                    const events = getter.call(this);
                    const listeners = events[type];
                    if (!listeners) {
                        setter.call(this, {});
                    }
                    else if (func) {
                        for (let i = 0; i < listeners.length; i++) {
                            if (listeners[i].f === func) {
                                listeners.splice(i, 1);
                                break;
                            }
                        }
                    }
                    else {
                        listeners.splice(0, listeners.length);
                    }
                }
            },
            on: {
                value(type, func, thisArg) {
                    if (!getter.call(this)) {
                        setter.call(this, {});
                    }
                    const events = getter.call(this);
                    events[type] = events[type] || [];
                    events[type].push({
                        c: thisArg,
                        f: func
                    });
                }
            }
        });
    },
    /**
     * Shallow copy own enumerable properties from `src` to `dest` that are on
     * `src` but are missing from `dest.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = { foo: 'bar', beep: 'boop' };
     * const b = { beep: 'bip' };
     * utils.fillIn(b, a);
     * console.log(b); // {"foo":"bar","beep":"bip"}
     *
     * @method utils.fillIn
     * @param {object} dest The destination object.
     * @param src
     * @see utils.deepFillIn
     * @see utils.deepMixIn
     * @since 3.0.0
     */
    fillIn(dest, src) {
        utils.forOwn(src, (value, key) => {
            if (!dest.hasOwnProperty(key) || dest[key] === undefined) {
                dest[key] = value;
            }
        });
    },
    /**
     * Find the last index of an item in an array according to the given checker function.
     *
     * @example
     * import { utils } from 'js-data';
     *
     * const john = { name: 'John', age: 20 };
     * const sara = { name: 'Sara', age: 25 };
     * const dan = { name: 'Dan', age: 20 };
     * const users = [john, sara, dan];
     *
     * console.log(utils.findIndex(users, (user) => user.age === 25)); // 1
     * console.log(utils.findIndex(users, (user) => user.age > 19)); // 2
     * console.log(utils.findIndex(users, (user) => user.name === 'John')); // 0
     * console.log(utils.findIndex(users, (user) => user.name === 'Jimmy')); // -1
     *
     * @method utils.findIndex
     * @param {array} array The array to search.
     * @param {Function} fn Checker function.
     * @returns {number} Index if found or -1 if not found.
     * @since 3.0.0
     */
    findIndex(array, fn) {
        let index = -1;
        if (!array) {
            return index;
        }
        array.forEach((record, i) => {
            if (fn(record)) {
                index = i;
                return false;
            }
        });
        return index;
    },
    /**
     * Recursively iterate over a {@link Mapper}'s relations according to
     * `opts.with`.
     *
     * @method utils.forEachRelation
     * @param {Mapper} mapper Mapper.
     * @param {object} opts Configuration options.
     * @param {Function} fn Callback function.
     * @param {*} thisArg Execution context for the callback function.
     * @since 3.0.0
     */
    forEachRelation(mapper, opts, fn, thisArg) {
        const relationList = mapper.relationList || [];
        if (!relationList.length) {
            return;
        }
        relationList.forEach(def => {
            utils._forRelation(opts, def, fn, thisArg);
        });
    },
    /**
     * Iterate over an object's own enumerable properties.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = { b: 1, c: 4 };
     * let sum = 0;
     * utils.forOwn(a, function (value, key) {
     *   sum += value;
     * });
     * console.log(sum); // 5
     *
     * @method utils.forOwn
     * @param obj
     * @param {Function} fn Iteration function.
     * @param {object} [thisArg] Content to which to bind `fn`.
     * @since 3.0.0
     */
    forOwn(obj, fn, thisArg) {
        const keys = Object.keys(obj);
        const len = keys.length;
        let i;
        for (i = 0; i < len; i++) {
            if (fn.call(thisArg, obj[keys[i]], keys[i], obj) === false) {
                break;
            }
        }
    },
    /**
     * Proxy for `JSON.parse`.
     *
     * @example
     * import { utils } from 'js-data';
     *
     * const a = utils.fromJson('{"name" : "John"}');
     * console.log(a); // { name: 'John' }
     *
     * @method utils.fromJson
     * @param {string} json JSON to parse.
     * @returns {Object} Parsed object.
     * @see utils.toJson
     * @since 3.0.0
     */
    fromJson(json) {
        return utils.isString(json) ? JSON.parse(json) : json;
    },
    /**
     * Retrieve the specified property from the given object. Supports retrieving
     * nested properties.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = { foo: { bar: 'baz' }, beep: 'boop' };
     * console.log(utils.get(a, 'beep')); // "boop"
     * console.log(utils.get(a, 'foo.bar')); // "baz"
     *
     * @method utils.get
     * @param {object} object Object from which to retrieve a property's value.
     * @param {string} prop Property to retrieve.
     * @returns {*} Value of the specified property.
     * @see utils.set
     * @since 3.0.0
     */
    get(object, prop) {
        if (!prop) {
            return;
        }
        /* if prop is function, get the property by calling a function, passing an object as a parameter */
        if (utils.isFunction(prop)) {
            return prop(object);
        }
        const parts = prop.split('.');
        const last = parts.pop();
        while ((prop = parts.shift())) {
            // eslint-disable-line
            object = object[prop];
            if (object == null) {
                // eslint-disable-line
                return;
            }
        }
        return object[last];
    },
    /**
     * Return the superclass for the given instance or subclass. If an instance is
     * provided, then finds the parent class of the instance's constructor.
     *
     * @example
     * import { utils } from 'js-data';
     * // using ES2015 classes
     * class Foo {}
     * class Bar extends Foo {}
     * const barInstance = new Bar();
     * let baseType = utils.getSuper(barInstance);
     * console.log(Foo === baseType); // true
     *
     * // using Function constructor with utils.extend
     * function Foo () {}
     * Foo.extend = utils.extend;
     * const Bar = Foo.extend();
     * const barInstance = new Bar();
     * let baseType = utils.getSuper(barInstance);
     * console.log(Foo === baseType); // true
     *
     * @method utils.getSuper
     * @param {Object|Function} instance Instance or constructor.
     * @param {boolean} [isCtor=false] Whether `instance` is a constructor.
     * @returns {Constructor} The superclass (grandparent constructor).
     * @since 3.0.0
     */
    getSuper(instance, isCtor) {
        const ctor = isCtor ? instance : instance.constructor;
        if (ctor.hasOwnProperty('__super__')) {
            return ctor.__super__;
        }
        return Object.getPrototypeOf(ctor) || ctor.__proto__; // eslint-disable-line
    },
    /**
     * Return the intersection of two arrays.
     *
     * @example
     * import { utils } from 'js-data';
     * const arrA = ['green', 'red', 'blue', 'red'];
     * const arrB = ['green', 'yellow', 'red'];
     * const intersected = utils.intersection(arrA, arrB);
     *
     * console.log(intersected); // ['green', 'red'])
     *
     * @method utils.intersection
     * @param {array} array1 First array.
     * @param {array} array2 Second array.
     * @returns {Array} Array of elements common to both arrays.
     * @since 3.0.0
     */
    intersection(array1, array2) {
        if (!array1 || !array2) {
            return [];
        }
        array1 = Array.isArray(array1) ? array1 : [array1];
        array2 = Array.isArray(array2) ? array2 : [array2];
        const result = [];
        let item;
        let i;
        const len = array1.length;
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
    },
    /**
     * Proxy for `Array.isArray`.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = [1,2,3,4,5];
     * const b = { foo: "bar" };
     * console.log(utils.isArray(a)); // true
     * console.log(utils.isArray(b)); // false
     *
     * @method utils.isArray
     * @param {*} value The value to test.
     * @returns {boolean} Whether the provided value is an array.
     * @since 3.0.0
     */
    isArray: Array.isArray,
    /**
     * Return whether `prop` is matched by any string or regular expression in
     * `blacklist`.
     *
     * @example
     * import { utils } from 'js-data';
     * const blacklist = [/^\$hashKey/g, /^_/g, 'id'];
     * console.log(utils.isBlacklisted("$hashKey", blacklist)); // true
     * console.log(utils.isBlacklisted("id", blacklist)); // true
     * console.log(utils.isBlacklisted("_myProp", blacklist)); // true
     * console.log(utils.isBlacklisted("my_id", blacklist)); // false
     *
     * @method utils.isBlacklisted
     * @param {string} prop The name of a property to check.
     * @param {array} blacklist Array of strings and regular expressions.
     * @returns {boolean} Whether `prop` was matched.
     * @since 3.0.0
     */
    isBlacklisted(prop, blacklist) {
        if (!blacklist || !blacklist.length) {
            return false;
        }
        let matches;
        for (const item of blacklist) {
            if ((toStr(item) === REGEXP_TAG && item.test(prop)) || item === prop) {
                matches = prop;
                return !!matches;
            }
        }
        return !!matches;
    },
    /**
     * Return whether the provided value is a boolean.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = true;
     * const b = { foo: "bar" };
     * console.log(utils.isBoolean(a)); // true
     * console.log(utils.isBoolean(b)); // false
     *
     * @method utils.isBoolean
     * @param {*} value The value to test.
     * @returns {boolean} Whether the provided value is a boolean.
     * @since 3.0.0
     */
    isBoolean(value) {
        return toStr(value) === BOOL_TAG;
    },
    /**
     * Return whether the provided value is a date.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = new Date();
     * const b = { foo: "bar" };
     * console.log(utils.isDate(a)); // true
     * console.log(utils.isDate(b)); // false
     *
     * @method utils.isDate
     * @param {*} value The value to test.
     * @returns {Date} Whether the provided value is a date.
     * @since 3.0.0
     */
    isDate(value) {
        return value && typeof value === 'object' && toStr(value) === DATE_TAG;
    },
    /**
     * Return whether the provided value is a function.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = function () { console.log('foo bar'); };
     * const b = { foo: "bar" };
     * console.log(utils.isFunction(a)); // true
     * console.log(utils.isFunction(b)); // false
     *
     * @method utils.isFunction
     * @param {*} value The value to test.
     * @returns {boolean} Whether the provided value is a function.
     * @since 3.0.0
     */
    isFunction(value) {
        return typeof value === 'function' || (value && toStr(value) === FUNC_TAG);
    },
    /**
     * Return whether the provided value is an integer.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = 1;
     * const b = 1.25;
     * const c = '1';
     * console.log(utils.isInteger(a)); // true
     * console.log(utils.isInteger(b)); // false
     * console.log(utils.isInteger(c)); // false
     *
     * @method utils.isInteger
     * @param {*} value The value to test.
     * @returns {boolean} Whether the provided value is an integer.
     * @since 3.0.0
     */
    isInteger(value) {
        // tslint:disable-next-line:triple-equals
        return toStr(value) === NUMBER_TAG && value == toInteger(value); // eslint-disable-line
    },
    /**
     * Return whether the provided value is `null`.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = null;
     * const b = { foo: "bar" };
     * console.log(utils.isNull(a)); // true
     * console.log(utils.isNull(b)); // false
     *
     * @method utils.isNull
     * @param {*} value The value to test.
     * @returns {boolean} Whether the provided value is `null`.
     * @since 3.0.0
     */
    isNull(value) {
        return value === null;
    },
    /**
     * Return whether the provided value is a number.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = 1;
     * const b = -1.25;
     * const c = '1';
     * console.log(utils.isNumber(a)); // true
     * console.log(utils.isNumber(b)); // true
     * console.log(utils.isNumber(c)); // false
     *
     * @method utils.isNumber
     * @param {*} value The value to test.
     * @returns {boolean} Whether the provided value is a number.
     * @since 3.0.0
     */
    isNumber(value) {
        const type = typeof value;
        return type === 'number' || (value && type === 'object' && toStr(value) === NUMBER_TAG);
    },
    /**
     * Return whether the provided value is an object.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = { foo: "bar" };
     * const b = 'foo bar';
     * console.log(utils.isObject(a)); // true
     * console.log(utils.isObject(b)); // false
     *
     * @method utils.isObject
     * @param {*} value The value to test.
     * @returns {boolean} Whether the provided value is an object.
     * @since 3.0.0
     */
    isObject(value) {
        return toStr(value) === OBJECT_TAG;
    },
    /**
     * Return whether the provided value is a regular expression.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = /^\$.+$/ig;
     * const b = new RegExp('^\$.+$', 'ig');
     * const c = { foo: "bar" };
     * console.log(utils.isRegExp(a)); // true
     * console.log(utils.isRegExp(b)); // true
     * console.log(utils.isRegExp(c)); // false
     *
     * @method utils.isRegExp
     * @param {*} value The value to test.
     * @returns {boolean} Whether the provided value is a regular expression.
     * @since 3.0.0
     */
    isRegExp(value) {
        return toStr(value) === REGEXP_TAG;
    },
    /**
     * Return whether the provided value is a string or a number.
     *
     * @example
     * import { utils } from 'js-data';
     * console.log(utils.isSorN('')); // true
     * console.log(utils.isSorN(-1.65)); // true
     * console.log(utils.isSorN('my string')); // true
     * console.log(utils.isSorN({})); // false
     * console.log(utils.isSorN([1,2,4])); // false
     *
     * @method utils.isSorN
     * @param {*} value The value to test.
     * @returns {boolean} Whether the provided value is a string or a number.
     * @since 3.0.0
     */
    isSorN(value) {
        return utils.isString(value) || utils.isNumber(value);
    },
    /**
     * Return whether the provided value is a string.
     *
     * @example
     * import { utils } from 'js-data';
     * console.log(utils.isString('')); // true
     * console.log(utils.isString('my string')); // true
     * console.log(utils.isString(100)); // false
     * console.log(utils.isString([1,2,4])); // false
     *
     * @method utils.isString
     * @param {*} value The value to test.
     * @returns {boolean} Whether the provided value is a string.
     * @since 3.0.0
     */
    isString(value) {
        return typeof value === 'string' || (value && typeof value === 'object' && toStr(value) === STRING_TAG);
    },
    /**
     * Return whether the provided value is a `undefined`.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = undefined;
     * const b = { foo: "bar"};
     * console.log(utils.isUndefined(a)); // true
     * console.log(utils.isUndefined(b.baz)); // true
     * console.log(utils.isUndefined(b)); // false
     * console.log(utils.isUndefined(b.foo)); // false
     *
     * @method utils.isUndefined
     * @param {*} value The value to test.
     * @returns {boolean} Whether the provided value is a `undefined`.
     * @since 3.0.0
     */
    isUndefined(value) {
        return value === undefined;
    },
    /**
     * Mix in logging capabilities to the target.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = { foo: "bar"};
     *
     * // Add standard logging to an object
     * utils.logify(a);
     * a.log('info', 'test log info'); // output 'test log info' to console.
     *
     * // Toggle debug output of an object
     * a.dbg('test debug output'); // does not output because debug is off.
     * a.debug = true;
     * a.dbg('test debug output'); // output 'test debug output' to console.
     *
     * @method utils.logify
     * @param {*} target The target.
     * @since 3.0.0
     */
    logify(target) {
        utils.addHiddenPropsToTarget(target, {
            dbg(...args) {
                if (utils.isFunction(this.log)) {
                    this.log('debug', ...args);
                }
            },
            log(level, ...args) {
                if (level && !args.length) {
                    args.push(level);
                    level = 'debug';
                }
                if (level === 'debug' && !this.debug) {
                    return;
                }
                const prefix = `${level.toUpperCase()}: (${this.name || this.constructor.name})`;
                if (utils.isFunction(console[level])) {
                    console[level](prefix, ...args);
                }
                else {
                    console.log(prefix, ...args);
                }
            }
        });
    },
    /**
     * Adds the given record to the provided array only if it's not already in the
     * array.
     *
     * @example
     * import { utils } from 'js-data';
     * const colors = ['red', 'green', 'yellow'];
     *
     * console.log(colors.length); // 3
     * utils.noDupeAdd(colors, 'red');
     * console.log(colors.length); // 3, red already exists
     *
     * utils.noDupeAdd(colors, 'blue');
     * console.log(colors.length); // 4, blue was added
     *
     * @method utils.noDupeAdd
     * @param {array} array The array.
     * @param {*} record The value to add.
     * @param {Function} fn Callback function passed to {@link utils.findIndex}.
     * @since 3.0.0
     */
    noDupeAdd(array, record, fn) {
        if (!array) {
            return;
        }
        const index = this.findIndex(array, fn);
        if (index < 0) {
            array.push(record);
        }
    },
    /**
     * Return a shallow copy of the provided object, minus the properties
     * specified in `keys`.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = { name: 'John', $hashKey: 1214910 };
     *
     * let b = utils.omit(a, ['$hashKey']);
     * console.log(b); // { name: 'John' }
     *
     * @method utils.omit
     * @param {object} props The object to copy.
     * @param {string[]} keys Array of strings, representing properties to skip.
     * @returns {Object} Shallow copy of `props`, minus `keys`.
     * @since 3.0.0
     */
    omit(props, keys) {
        const _props = {};
        utils.forOwn(props, (value, key) => {
            if (keys.indexOf(key) === -1) {
                _props[key] = value;
            }
        });
        return _props;
    },
    /**
     * Return a shallow copy of the provided object, but only include the
     * properties specified in `keys`.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = { name: 'John', $hashKey: 1214910 };
     *
     * let b = utils.pick(a, ['$hashKey']);
     * console.log(b); // { $hashKey: 1214910 }
     *
     * @method utils.pick
     * @param {object} props The object to copy.
     * @param {string[]} keys Array of strings, representing properties to keep.
     * @returns {Object} Shallow copy of `props`, but only including `keys`.
     * @since 3.0.0
     */
    pick(props, keys) {
        return keys.reduce((map, key) => {
            map[key] = props[key];
            return map;
        }, {});
    },
    /**
     * Return a plain copy of the given value.
     *
     * @example
     * import { utils } from 'js-data';
     * const a = { name: 'John' };
     * let b = utils.plainCopy(a);
     * console.log(a === b); // false
     *
     * @method utils.plainCopy
     * @param {*} value The value to copy.
     * @returns {*} Plain copy of `value`.
     * @see utils.copy
     * @since 3.0.0
     */
    plainCopy(value) {
        return utils.copy(value, undefined, undefined, undefined, undefined, true);
    },
    /**
     * Shortcut for `utils.Promise.reject(value)`.
     *
     * @example
     * import { utils } from 'js-data';
     *
     * utils.reject("Testing static reject").then(function (data) {
     *   // not called
     * }).catch(function (reason) {
     *   console.log(reason); // "Testing static reject"
     * });
     *
     * @method utils.reject
     * @param {*} [value] Value with which to reject the Promise.
     * @returns {Promise} Promise reject with `value`.
     */
    reject(value) {
        return Promise.reject(value);
    },
    /**
     * Remove the last item found in array according to the given checker function.
     *
     * @example
     * import { utils } from 'js-data';
     *
     * const colors = ['red', 'green', 'yellow', 'red'];
     * utils.remove(colors, (color) => color === 'red');
     * console.log(colors); // ['red', 'green', 'yellow']
     *
     * @method utils.remove
     * @param {array} array The array to search.
     * @param {Function} fn Checker function.
     */
    remove(array, fn) {
        if (!array || !array.length) {
            return;
        }
        const index = this.findIndex(array, fn);
        if (index >= 0) {
            array.splice(index, 1); // todo should this be recursive?
        }
    },
    /**
     * Shortcut for `utils.Promise.resolve(value)`.
     *
     * @example
     * import { utils } from 'js-data';
     *
     * utils.resolve("Testing static resolve").then(function (data) {
     *   console.log(data); // "Testing static resolve"
     * }).catch(function (reason) {
     *   // not called
     * });
     *
     * @param {*} [value] Value with which to resolve the Promise.
     * @returns {Promise} Promise resolved with `value`.
     */
    resolve(value) {
        return Promise.resolve(value);
    },
    /**
     * Set the value at the provided key or path.
     *
     * @example
     * import { utils } from 'js-data';
     *
     * const john = {
     *   name: 'John',
     *   age: 25,
     *   parent: {
     *     name: 'John's Mom',
     *     age: 50
     *   }
     * };
     * // set value by key
     * utils.set(john, 'id', 98);
     * console.log(john.id); // 98
     *
     * // set value by path
     * utils.set(john, 'parent.id', 20);
     * console.log(john.parent.id); // 20
     *
     * // set value by path/value map
     * utils.set(john, {
     *   'id': 1098,
     *   'parent': { id: 1020 },
     *   'parent.age': '55'
     * });
     * console.log(john.id); // 1098
     * console.log(john.parent.id); // 1020
     * console.log(john.parent.age); // 55
     *
     * @method utils.set
     * @param {object} object The object on which to set a property.
     * @param {(string|Object)} path The key or path to the property. Can also
     * pass in an object of path/value pairs, which will all be set on the target
     * object.
     * @param {*} [value] The value to set.
     */
    set(object, path, value, opts) {
        if (utils.isObject(path)) {
            utils.forOwn(path, (value, _path) => {
                utils.set(object, _path, value);
            });
        }
        else {
            const parts = PATH.exec(path);
            if (parts) {
                mkdirP(object, parts[1])[parts[2]] = value;
            }
            else {
                object[path] = value;
            }
        }
    },
    /**
     * Check whether the two provided objects are deeply equal.
     *
     * @example
     * import { utils } from 'js-data';
     *
     * const objA = {
     *   name: 'John',
     *   id: 27,
     *   nested: {
     *     item: 'item 1',
     *     colors: ['red', 'green', 'blue']
     *   }
     * };
     *
     * const objB = {
     *   name: 'John',
     *   id: 27,
     *   nested: {
     *     item: 'item 1',
     *     colors: ['red', 'green', 'blue']
     *   }
     * };
     *
     * console.log(utils.deepEqual(a,b)); // true
     * objB.nested.colors.add('yellow'); // make a change to a nested object's array
     * console.log(utils.deepEqual(a,b)); // false
     *
     * @method utils.deepEqual
     * @param {object} a First object in the comparison.
     * @param {object} b Second object in the comparison.
     * @returns {boolean} Whether the two provided objects are deeply equal.
     * @see utils.equal
     * @since 3.0.0
     */
    deepEqual(a, b) {
        if (a === b) {
            return true;
        }
        let _equal = true;
        if (utils.isArray(a) && utils.isArray(b)) {
            if (a.length !== b.length) {
                return false;
            }
            for (let i = a.length; i--;) {
                if (!utils.deepEqual(a[i], b[i])) {
                    // Exit loop early
                    return false;
                }
            }
        }
        else if (utils.isObject(a) && utils.isObject(b)) {
            utils.forOwn(a, (value, key) => {
                if (!(_equal = utils.deepEqual(value, b[key]))) {
                    // Exit loop early
                    return false;
                }
            });
            if (_equal) {
                utils.forOwn(b, (value, key) => {
                    if (!(_equal = utils.deepEqual(value, a[key]))) {
                        // Exit loop early
                        return false;
                    }
                });
            }
        }
        else {
            return false;
        }
        return _equal;
    },
    /**
     * Proxy for `JSON.stringify`.
     *
     * @example
     * import { utils } from 'js-data';
     *
     * const a = { name: 'John' };
     * let jsonVal = utils.toJson(a);
     * console.log(jsonVal); // '{"name" : "John"}'
     *
     * @method utils.toJson
     * @param {*} value Value to serialize to JSON.
     * @returns {string} JSON string.
     * @see utils.fromJson
     * @since 3.0.0
     */
    toJson: JSON.stringify,
    /**
     * Unset the value at the provided key or path.
     *
     * @example
     * import { utils } from 'js-data';
     *
     * const john = {
     *   name: 'John',
     *   age: 25,
     *   parent: {
     *     name: 'John's Mom',
     *     age: 50
     *   }
     * };
     *
     * utils.unset(john, age);
     * utils.unset(john, parent.age);
     *
     * console.log(john.age); // null
     * console.log(john.parent.age); // null
     *
     * @method utils.unset
     * @param {object} object The object from which to delete the property.
     * @param {string} path The key or path to the property.
     * @see utils.set
     * @since 3.0.0
     */
    unset(object, path) {
        const parts = path.split('.');
        const last = parts.pop();
        while ((path = parts.shift())) {
            // eslint-disable-line
            object = object[path];
            if (object == null) {
                // eslint-disable-line
                return;
            }
        }
        object[last] = undefined;
    },
    /**
     * Gets default locale for the js-data context.
     *
     * @example
     * import { utils } from 'js-data';
     *
     *
     * utils.getDefaultLocale();
     *
     * @method utils.getDefaultLocale
     * @since 4.0.0
     */
    getDefaultLocale() {
        return 'en';
    }
};
const safeSetProp = (record, field, value) => {
    var _a;
    if ((_a = record) === null || _a === void 0 ? void 0 : _a._set) {
        record._set(`props.${field}`, value);
    }
    else {
        utils.set(record, field, value);
    }
};
const safeSetLink = (record, field, value) => {
    var _a;
    if ((_a = record) === null || _a === void 0 ? void 0 : _a._set) {
        record._set(`links.${field}`, value);
    }
    else {
        utils.set(record, field, value);
    }
};

/**
 * A base class which gives instances private properties.
 *
 * Typically you won't instantiate this class directly, but you may find it
 * useful as an abstract class for your own components.
 *
 * @example
 * import {Settable} from 'js-data';
 *
 * class CustomSettableClass extends Settable {
 *   foo () { return 'bar'; }
 *   static beep () { return 'boop'; }
 * }
 *
 * const customSettable = new CustomSettableClass();
 * console.log(customSettable.foo());
 * console.log(CustomSettableClass.beep());
 *
 * @since 3.0.0
 */
class Settable {
    constructor() {
        const _props = {};
        Object.defineProperties(this, {
            _get: {
                value(key) {
                    return utils.get(_props, key);
                }
            },
            _set: {
                value(key, value) {
                    return utils.set(_props, key, value);
                }
            },
            _unset: {
                value(key) {
                    return utils.unset(_props, key);
                }
            }
        });
    }
}

/**
 * The base class from which all JSData components inherit some basic
 * functionality.
 *
 * Typically you won't instantiate this class directly, but you may find it
 * useful as an abstract class for your own components.
 *
 * @example
 * import {Component} from 'js-data'
 *
 * class CustomComponentClass extends Component {
 *   foo () { return 'bar'; }
 *   static beep () { return 'boop'; }
 * }
 * const customComponent = new CustomComponentClass();
 * console.log(customComponent.foo());
 * console.log(CustomComponentClass.beep());
 * ```
 *
 * @param {object} [opts] Configuration options.
 * @param {boolean} [opts.debug=false] See {@link Component#debug}.
 * @returns {Component} A new {@link Component} instance.
 * @since 3.0.0
 */
class Component extends Settable {
    constructor(opts = {}) {
        var _a;
        super();
        /**
         * Event listeners attached to this Component. __Do not modify.__ Use
         * {@link Component#on} and {@link Component#off} instead.
         *
         * @name Component#_listeners
         * @private
         * @instance
         * @since 3.0.0
         * @type {Object}
         */
        this._listeners = {};
        this.debug = (_a = opts.debug, (_a !== null && _a !== void 0 ? _a : false));
    }
}
utils.logify(Component.prototype);
utils.eventify(Component.prototype, function () {
    return this._listeners;
}, function (value) {
    this._listeners = value;
});

const DOMAIN$1 = 'Query';
const INDEX_ERR = 'Index inaccessible after first operation';
// Reserved words used by JSData's Query Syntax
const reserved = {
    limit: '',
    offset: '',
    orderBy: '',
    skip: '',
    sort: '',
    where: '',
    locale: ''
};
// Used by our JavaScript implementation of the LIKE operator
const escapeRegExp = /([.*+?^=!:${}()|[\]/\\])/g;
const percentRegExp = /%/g;
const underscoreRegExp = /_/g;
function escape(pattern) {
    return pattern.replace(escapeRegExp, '\\$1');
}
/**
 * A class used by the {@link Collection} class to build queries to be executed
 * against the collection's data. An instance of `Query` is returned by
 * {@link Collection#query}. Query instances are typically short-lived, and you
 * shouldn't have to create them yourself. Just use {@link Collection#query}.
 *
 * ```javascript
 * import { Query } from 'js-data';
 * ```
 *
 * @example <caption>Query intro</caption>
 * const JSData = require('js-data');
 * const { DataStore } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * const store = new DataStore();
 * store.defineMapper('post');
 * const posts = [
 *   { author: 'John', age: 30, status: 'published', id: 1 },
 *   { author: 'Sally', age: 31, status: 'draft', id: 2 },
 *   { author: 'Mike', age: 32, status: 'draft', id: 3 },
 *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
 *   { author: 'Adam', age: 33, status: 'draft', id: 5 }
 * ]
 * store.add('post', posts);
 * const drafts = store.query('post').filter({ status: 'draft' }).limit(2).run();
 * console.log(drafts);
 *
 * @class Query
 * @extends Component
 * @param {Collection} collection The collection on which this query operates.
 * @since 3.0.0
 */
class Query extends Component {
    constructor(collection) {
        super();
        this.collection = collection;
        /**
         * The current data result of this query.
         *
         * @name Query#data
         * @since 3.0.0
         * @type {Array}
         */
        this.data = null;
    }
    _applyWhereFromObject(where) {
        const fields = [];
        const ops = [];
        const predicates = [];
        utils.forOwn(where, (clause, field) => {
            if (!utils.isObject(clause)) {
                clause = {
                    '==': clause
                };
            }
            utils.forOwn(clause, (expr, op) => {
                fields.push(field);
                ops.push(op);
                predicates.push(expr);
            });
        });
        return {
            fields,
            ops,
            predicates
        };
    }
    _applyWhereFromArray(where) {
        const groups = [];
        where.forEach((_where, i) => {
            if (utils.isString(_where)) {
                return;
            }
            const prev = where[i - 1];
            const parser = utils.isArray(_where) ? this._applyWhereFromArray : this._applyWhereFromObject;
            const group = parser.call(this, _where);
            if (prev === 'or') {
                group.isOr = true;
            }
            groups.push(group);
        });
        groups.isArray = true;
        return groups;
    }
    _testObjectGroup(keep, first, group, item) {
        let i;
        const fields = group.fields;
        const ops = group.ops;
        const predicates = group.predicates;
        const len = ops.length;
        for (i = 0; i < len; i++) {
            let op = ops[i];
            const isOr = op.charAt(0) === '|';
            op = isOr ? op.substr(1) : op;
            const expr = this.evaluate(utils.get(item, fields[i]), op, predicates[i]);
            if (expr !== undefined) {
                keep = first ? expr : isOr ? keep || expr : keep && expr;
            }
            first = false;
        }
        return { keep, first };
    }
    _testArrayGroup(keep, first, groups, item) {
        let i;
        const len = groups.length;
        for (i = 0; i < len; i++) {
            const group = groups[i];
            const parser = group.isArray ? this._testArrayGroup : this._testObjectGroup;
            const result = parser.call(this, true, true, group, item);
            if (groups[i - 1]) {
                if (group.isOr) {
                    keep = keep || result.keep;
                }
                else {
                    keep = keep && result.keep;
                }
            }
            else {
                keep = result.keep;
            }
            first = result.first;
        }
        return { keep, first };
    }
    /**
     * Find all entities between two boundaries.
     *
     * @example <caption>Get the users ages 18 to 30.</caption>
     * const JSData = require('js-data');
     * const { DataStore } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const store = new DataStore();
     * store.defineMapper('user');
     * const users = [
     *   { name: 'Peter', age: 25, id: 1 },
     *   { name: 'Jim', age: 19, id: 2 },
     *   { name: 'Mike', age: 17, id: 3 },
     *   { name: 'Alan', age: 29, id: 4 },
     *   { name: 'Katie', age: 33, id: 5 }
     * ];
     * store.add('user', users)
     * const filteredUsers = store
     *   .query('user')
     *   .between(18, 30, { index: 'age' })
     *   .run();
     * console.log(filteredUsers);
     *
     * @example <caption>Same as above.</caption>
     * const JSData = require('js-data');
     * const { DataStore } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const store = new DataStore();
     * store.defineMapper('user');
     * const users = [
     *   { name: 'Peter', age: 25, id: 1 },
     *   { name: 'Jim', age: 19, id: 2 },
     *   { name: 'Mike', age: 17, id: 3 },
     *   { name: 'Alan', age: 29, id: 4 },
     *   { name: 'Katie', age: 33, id: 5 }
     * ];
     * store.add('user', users)
     * const filteredUsers = store
     *   .query('user')
     *   .between([18], [30], { index: 'age' })
     *   .run();
     * console.log(filteredUsers);
     *
     * @method Query#between
     * @param {array} leftKeys Keys defining the left boundary.
     * @param {array} rightKeys Keys defining the right boundary.
     * @param {object} [opts] Configuration options.
     * @param {string} [opts.index] Name of the secondary index to use in the
     * query. If no index is specified, the main index is used.
     * @param {boolean} [opts.leftInclusive=true] Whether to include entities
     * on the left boundary.
     * @param {boolean} [opts.rightInclusive=false] Whether to include entities
     * on the left boundary.
     * @param {boolean} [opts.limit] Limit the result to a certain number.
     * @param {boolean} [opts.offset] The number of resulting entities to skip.
     * @returns {Query} A reference to itself for chaining.
     * @since 3.0.0
     */
    between(leftKeys, rightKeys, opts = {}) {
        if (this.data) {
            throw utils.err(`${DOMAIN$1}#between`)(500, 'Cannot access index');
        }
        this.data = this.collection.getIndex(opts.index).between(leftKeys, rightKeys, opts);
        return this;
    }
    /**
     * The comparison function used by the {@link Query} class.
     *
     * @method Query#compare
     * @param {array} orderBy An orderBy clause used for sorting and sub-sorting.
     * @param {number} index The index of the current orderBy clause being used.
     * @param {*} a The first item in the comparison.
     * @param {*} b The second item in the comparison.
     * @returns {number} -1 if `b` should preceed `a`. 0 if `a` and `b` are equal.
     * 1 if `a` should preceed `b`.
     * @since 3.0.0
     */
    compare(orderBy, index, a, b, compare) {
        const def = orderBy[index];
        let cA = utils.get(a, def[0]);
        let cB = utils.get(b, def[0]);
        if (cA && utils.isString(cA)) {
            cA = cA.toUpperCase();
        }
        if (cB && utils.isString(cB)) {
            cB = cB.toUpperCase();
        }
        if (a === undefined) {
            a = null;
        }
        if (b === undefined) {
            b = null;
        }
        if (def[1].toUpperCase() === 'DESC') {
            const temp = cB;
            cB = cA;
            cA = temp;
        }
        /* Fix: compare by using collator */
        // let isNumeric = false
        // if (utils.isNumber(cA) || utils.isNumber(cB)) {
        //   isNumeric = true
        // }
        const n = compare(cA, cB);
        if (n === -1 || n === 1) {
            return n;
        }
        else {
            if (index < orderBy.length - 1) {
                return this.compare(orderBy, index + 1, a, b, compare);
            }
            else {
                return 0;
            }
        }
    }
    /**
     * Predicate evaluation function used by the {@link Query} class.
     *
     * @method Query#evaluate
     * @param {*} value The value to evaluate.
     * @param {string} op The operator to use in this evaluation.
     * @param {*} predicate The predicate to use in this evaluation.
     * @returns {boolean} Whether the value passed the evaluation or not.
     * @since 3.0.0
     */
    evaluate(value, op, predicate) {
        const ops = Query.ops;
        if (ops[op]) {
            return ops[op](value, predicate);
        }
        if (op.indexOf('like') === 0) {
            return this.like(predicate, op.substr(4)).exec(value) !== null;
        }
        else if (op.indexOf('notLike') === 0) {
            return this.like(predicate, op.substr(7)).exec(value) === null;
        }
    }
    /**
     * Find the record or records that match the provided query or are accepted by
     * the provided filter function.
     *
     * @example <caption>Get the draft posts by authors younger than 30</caption>
     * const JSData = require('js-data');
     * const { DataStore } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const store = new DataStore();
     * store.defineMapper('post')
     * const posts = [
     *   { author: 'John', age: 30, status: 'published', id: 1 },
     *   { author: 'Sally', age: 31, status: 'published', id: 2 },
     *   { author: 'Mike', age: 32, status: 'draft', id: 3 },
     *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
     *   { author: 'Adam', age: 33, status: 'published', id: 5 }
     *   { author: 'Peter', age: 25, status: 'deleted', id: 6 },
     *   { author: 'Sally', age: 21, status: 'draft', id: 7 },
     *   { author: 'Jim', age: 27, status: 'draft', id: 8 },
     *   { author: 'Jim', age: 27, status: 'published', id: 9 },
     *   { author: 'Jason', age: 55, status: 'published', id: 10 }
     * ];
     * store.add('post', posts);
     * const results = store
     *   .query('post')
     *   .filter({
     *     where: {
     *       status: {
     *         '==': 'draft'
     *       },
     *       age: {
     *         '<': 30
     *       }
     *     }
     *   })
     *   .run();
     * console.log(results);
     *
     * @example <caption>Use a custom filter function</caption>
     * const posts = query
     *   .filter(function (post) {
     *     return post.isReady();
     *   })
     *   .run();
     *
     * @method Query#filter
     * @param {(Object|Function)} [query={}] Selection query or filter
     * function.
     * @param {Function} [thisArg] Context to which to bind `queryOrFn` if
     * `queryOrFn` is a function.
     * @returns {Query} A reference to itself for chaining.
     * @since 3.0.0
     */
    filter(query = {}, thisArg) {
        /**
         * Selection query as defined by JSData's [Query Syntax][querysyntax].
         *
         * [querysyntax]: http://www.js-data.io/v3.0/docs/query-syntax
         *
         * @example <caption>Empty "findAll" query</caption>
         * const JSData = require('js-data');
         * const { DataStore } = JSData;
         * console.log('Using JSData v' + JSData.version.full);
         *
         * const store = new DataStore();
         * store.defineMapper('post')
         * store.findAll('post').then((posts) => {
         *   console.log(posts); // [...]
         * });
         *
         * @example <caption>Empty "filter" query</caption>
         * const JSData = require('js-data');
         * const { DataStore } = JSData;
         * console.log('Using JSData v' + JSData.version.full);
         *
         * const store = new DataStore();
         * store.defineMapper('post');
         * const posts = store.filter('post');
         * console.log(posts); // [...]
         *
         * @example <caption>Complex "filter" query</caption>
         * const JSData = require('js-data');
         * const { DataStore } = JSData;
         * console.log('Using JSData v' + JSData.version.full);
         *
         * const store = new DataStore();
         * const PAGE_SIZE = 2;
         * let currentPage = 3;
         *
         * store.defineMapper('post');
         * const posts = [
         *   { author: 'John', age: 30, status: 'published', id: 1 },
         *   { author: 'Sally', age: 31, status: 'published', id: 2 },
         *   { author: 'Mike', age: 32, status: 'draft', id: 3 },
         *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
         *   { author: 'Adam', age: 33, status: 'published', id: 5 }
         *   { author: 'Peter', age: 25, status: 'deleted', id: 6 },
         *   { author: 'Sally', age: 21, status: 'draft', id: 7 },
         *   { author: 'Jim', age: 27, status: 'draft', id: 8 },
         *   { author: 'Jim', age: 27, status: 'published', id: 9 },
         *   { author: 'Jason', age: 55, status: 'published', id: 10 }
         * ];
         * store.add('post', posts);
         * // Retrieve a filtered page of blog posts
         * // Would typically replace filter with findAll
         * const results = store.filter('post', {
         *   where: {
         *     status: {
         *       // WHERE status = 'published'
         *       '==': 'published'
         *     },
         *     author: {
         *       // AND author IN ('bob', 'alice')
         *       'in': ['bob', 'alice'],
         *       // OR author IN ('karen')
         *       '|in': ['karen']
         *     }
         *   },
         *   orderBy: [
         *     // ORDER BY date_published DESC,
         *     ['date_published', 'DESC'],
         *     // ORDER BY title ASC
         *     ['title', 'ASC']
         *   ],
         *   // LIMIT 2
         *   limit: PAGE_SIZE,
         *   // SKIP 4
         *   offset: PAGE_SIZE * (currentPage - 1)
         * });
         * console.log(results);
         *
         * @namespace query
         * @property {number} [limit] See {@link query.limit}.
         * @property {number} [offset] See {@link query.offset}.
         * @property {string|Array[]} [orderBy] See {@link query.orderBy}.
         * @property {number} [skip] Alias for {@link query.offset}.
         * @property {string|Array[]} [sort] Alias for {@link query.orderBy}.
         * @property {Object} [where] See {@link query.where}.
         * @property {String} [locale] See {@link query.locale}.
         * @since 3.0.0
         * @tutorial ["http://www.js-data.io/v3.0/docs/query-syntax","JSData's Query Syntax"]
         */
        this.getData();
        if (utils.isObject(query)) {
            let where = {};
            /**
             * Filtering criteria. Records that do not meet this criteria will be exluded
             * from the result.
             *
             * @example <caption>Return posts where author is at least 32 years old</caption>
             * const JSData = require('js-data');
             * const { DataStore } = JSData;
             * console.log('Using JSData v' + JSData.version.full);
             *
             * const store = new DataStore();
             * store.defineMapper('post')
             * const posts = [
             *   { author: 'John', age: 30, id: 5 },
             *   { author: 'Sally', age: 31, id: 6 },
             *   { author: 'Mike', age: 32, id: 7 },
             *   { author: 'Adam', age: 33, id: 8 },
             *   { author: 'Adam', age: 33, id: 9 }
             * ];
             * store.add('post', posts);
             * const results = store.filter('post', {
             *   where: {
             *     age: {
             *       '>=': 30
             *     }
             *   }
             * });
             * console.log(results);
             *
             * @name query.where
             * @type {Object}
             * @see http://www.js-data.io/v3.0/docs/query-syntax
             * @since 3.0.0
             */
            if (utils.isObject(query.where) || utils.isArray(query.where)) {
                where = query.where;
            }
            utils.forOwn(query, (value, key) => {
                if (!(key in reserved) && !(key in where)) {
                    where[key] = {
                        '==': value
                    };
                }
            });
            let groups;
            // Apply filter for each field
            if (utils.isObject(where) && Object.keys(where).length !== 0) {
                groups = this._applyWhereFromArray([where]);
            }
            else if (utils.isArray(where)) {
                groups = this._applyWhereFromArray(where);
            }
            if (groups) {
                this.data = this.data.filter(item => this._testArrayGroup(true, true, groups, item).keep);
            }
            // Sort
            let orderBy = query.orderBy || query.sort;
            if (utils.isString(orderBy)) {
                orderBy = [[orderBy, 'ASC']];
            }
            if (!utils.isArray(orderBy)) {
                orderBy = null;
            }
            /**
             * Determines how records should be ordered in the result.
             *
             * @example <caption>Order posts by `author` then by `id` descending </caption>
             * const JSData = require('js-data');
             * const { DataStore } = JSData;
             * console.log('Using JSData v' + JSData.version.full);
             *
             * const store = new DataStore();
             * store.defineMapper('post')
             * const posts = [
             *   { author: 'John', age: 30, id: 5 },
             *   { author: 'Sally', age: 31, id: 6 },
             *   { author: 'Mike', age: 32, id: 7 },
             *   { author: 'Adam', age: 33, id: 8 },
             *   { author: 'Adam', age: 33, id: 9 }
             * ];
             * store.add('post', posts);
             * const results = store.filter('post', {
             *     orderBy:[['author','ASC'],['id','DESC']]
             * });
             * console.log(results);
             *
             * @name query.orderBy
             * @type {string|Array[]}
             * @see http://www.js-data.io/v3.0/docs/query-syntax
             * @since 3.0.0
             */
            if (orderBy) {
                const index = 0;
                orderBy.forEach((def, i) => {
                    if (utils.isString(def)) {
                        orderBy[i] = [def, 'ASC'];
                    }
                });
                let locale = utils.getDefaultLocale();
                if (utils.isString(query.locale)) {
                    locale = query.locale;
                }
                /** The locale params has to be explicitly set for the collator.compare to work.
                *
                * @example <caption>Order posts with specific locale, defaults to 'en'</caption>
                * const JSData = require('js-data');
                * const { DataStore } = JSData;
                * console.log('Using JSData v' + JSData.version.full);
                *
                * const store = new DataStore();
                * store.defineMapper('post')
                * const posts = [
                *   { author: 'คลอน', age: 30, id: 5 },
                *   { author: 'กลอน', age: 31, id: 6 },
                *   { author: 'สาระ', age: 32, id: 7 },
                *   { author: 'ศาลา', age: 33, id: 8 },
                *   { author: 'จักรพรรณ', age: 33, id: 9 }
                * ];
                * store.add('post', posts);
                * const results = store.filter('post', {
                *     orderBy:[['author','ASC'],['id','DESC']],
                *     locale: 'th'
                * });
                * console.log(results);
                *
                * @name query.locale
                * @type {string}
                * @see http://www.js-data.io/v4.0/docs/query-syntax
                * @since 4.0.0
                */
                const collator = new Intl.Collator(locale, {
                    numeric: true
                });
                this.data.sort((a, b) => this.compare(orderBy, index, a, b, collator.compare));
            }
            /**
             * Number of records to skip.
             *
             * @example <caption>Retrieve the first "page" of blog posts using findAll</caption>
             * const JSData = require('js-data');
             * const { DataStore } = JSData;
             * console.log('Using JSData v' + JSData.version.full);
             *
             * const store = new DataStore();
             * store.defineMapper('post');
             * const PAGE_SIZE = 10;
             * let currentPage = 1;
             * store.findAll('post', {
             *   offset: PAGE_SIZE * (currentPage 1)
             *   limit: PAGE_SIZE
             * });
             *
             * @example <caption>Retrieve the last "page" of blog posts using filter</caption>
             * const JSData = require('js-data');
             * const { DataStore } = JSData;
             * console.log('Using JSData v' + JSData.version.full);
             *
             * const store = new DataStore();
             *
             * const PAGE_SIZE = 5;
             * let currentPage = 2;
             * store.defineMapper('post');
             * const posts = [
             *   { author: 'John', age: 30, id: 1 },
             *   { author: 'Sally', age: 31, id: 2 },
             *   { author: 'Mike', age: 32, id: 3 },
             *   { author: 'Adam', age: 33, id: 4 },
             *   { author: 'Adam', age: 33, id: 5 },
             *   { author: 'Peter', age: 25, id: 6 },
             *   { author: 'Sally', age: 21, id: 7 },
             *   { author: 'Jim', age: 27, id: 8 },
             *   { author: 'Jim', age: 27, id: 9 },
             *   { author: 'Jason', age: 55, id: 10 }
             * ];
             * store.add('post', posts);
             * const results = store.filter('post', {
             *   offset: PAGE_SIZE * (currentPage 1)
             *   limit: PAGE_SIZE
             * });
             * console.log(results)
             *
             * @name query.offset
             * @type {number}
             * @see http://www.js-data.io/v3.0/docs/query-syntax
             * @since 3.0.0
             */
            if (utils.isNumber(query.skip)) {
                this.skip(query.skip);
            }
            else if (utils.isNumber(query.offset)) {
                this.skip(query.offset);
            }
            /**
             * Maximum number of records to retrieve.
             *
             * @example <caption>Retrieve the first "page" of blog posts using findAll</caption>
             * const JSData = require('js-data');
             * const { DataStore } = JSData;
             * console.log('Using JSData v' + JSData.version.full);
             *
             * const store = new DataStore();
             * store.defineMapper('post');
             *
             * const PAGE_SIZE = 10
             * let currentPage = 1
             * store.findAll('post', {
             *   offset: PAGE_SIZE * (currentPage 1)
             *   limit: PAGE_SIZE
             * });
             *
             * @example <caption>Retrieve the last "page" of blog posts using filter</caption>
             * const JSData = require('js-data');
             * const { DataStore } = JSData;
             * console.log('Using JSData v' + JSData.version.full);
             *
             * const store = new DataStore();
             *
             * const PAGE_SIZE = 5
             * let currentPage = 2
             * store.defineMapper('post')
             * const posts = [
             *   { author: 'John', age: 30, id: 1 },
             *   { author: 'Sally', age: 31, id: 2 },
             *   { author: 'Mike', age: 32, id: 3 },
             *   { author: 'Adam', age: 33, id: 4 },
             *   { author: 'Adam', age: 33, id: 5 },
             *   { author: 'Peter', age: 25, id: 6 },
             *   { author: 'Sally', age: 21, id: 7 },
             *   { author: 'Jim', age: 27, id: 8 },
             *   { author: 'Jim', age: 27, id: 9 },
             *   { author: 'Jason', age: 55, id: 10 }
             * ];
             * store.add('post', posts);
             * const results = store.filter('post', {
             *   offset: PAGE_SIZE * (currentPage 1)
             *   limit: PAGE_SIZE
             * });
             * console.log(results)
             *
             * @name query.limit
             * @type {number}
             * @see http://www.js-data.io/v3.0/docs/query-syntax
             * @since 3.0.0
             */
            if (utils.isNumber(query.limit)) {
                this.limit(query.limit);
            }
        }
        else if (utils.isFunction(query)) {
            this.data = this.data.filter(query, thisArg);
        }
        return this;
    }
    /**
     * Iterate over all entities.
     *
     * @method Query#forEach
     * @param {Function} forEachFn Iteration function.
     * @param {*} [thisArg] Context to which to bind `forEachFn`.
     * @returns {Query} A reference to itself for chaining.
     * @since 3.0.0
     */
    forEach(forEachFn, thisArg) {
        this.getData().forEach(forEachFn, thisArg);
        return this;
    }
    /**
     * Find the entity or entities that match the provided key.
     *
     * @example <caption>Get the entity whose primary key is 25.</caption>
     * const entities = query.get(25).run();
     *
     * @example <caption>Same as above.</caption>
     * const entities = query.get([25]).run();
     *
     * @example <caption>Get all users who are active and have the "admin" role.</caption>
     * const activeAdmins = query.get(['active', 'admin'], {
     *   index: 'activityAndRoles'
     * }).run();
     *
     * @example <caption>Get all entities that match a certain weather condition.</caption>
     * const niceDays = query.get(['sunny', 'humid', 'calm'], {
     *   index: 'weatherConditions'
     * }).run();
     *
     * @method Query#get
     * @param {array} keyList Key(s) defining the entity to retrieve. If
     * `keyList` is not an array (i.e. for a single-value key), it will be
     * wrapped in an array.
     * @param {object} [opts] Configuration options.
     * @param {string} [opts.string] Name of the secondary index to use in the
     * query. If no index is specified, the main index is used.
     * @returns {Query} A reference to itself for chaining.
     * @since 3.0.0
     */
    get(keyList = [], opts = {}) {
        if (this.data) {
            throw utils.err(`${DOMAIN$1}#get`)(500, INDEX_ERR);
        }
        if (keyList && !utils.isArray(keyList)) {
            keyList = [keyList];
        }
        if (!keyList.length) {
            this.getData();
            return this;
        }
        this.data = this.collection.getIndex(opts.index).get(keyList);
        return this;
    }
    getAll(...args) {
        let opts = {};
        if (this.data) {
            throw utils.err(`${DOMAIN$1}#getAll`)(500, INDEX_ERR);
        }
        if (!args.length || (args.length === 1 && utils.isObject(args[0]))) {
            this.getData();
            return this;
        }
        else if (args.length && utils.isObject(args[args.length - 1])) {
            opts = args[args.length - 1];
            args.pop();
        }
        const index = this.collection.getIndex(opts.index);
        this.data = [];
        args.forEach(keyList => {
            this.data = this.data.concat(index.get(keyList));
        });
        return this;
    }
    /**
     * Return the current data result of this query.
     *
     * @method Query#getData
     * @returns {Array} The data in this query.
     * @since 3.0.0
     */
    getData() {
        if (!this.data) {
            this.data = this.collection.index.getAll();
        }
        return this.data;
    }
    /**
     * Implementation used by the `like` operator. Takes a pattern and flags and
     * returns a `RegExp` instance that can test strings.
     *
     * @method Query#like
     * @param {string} pattern Testing pattern.
     * @param {string} flags Flags for the regular expression.
     * @returns {RegExp} Regular expression for testing strings.
     * @since 3.0.0
     */
    like(pattern, flags) {
        return new RegExp(`^${escape(pattern)
            .replace(percentRegExp, '.*')
            .replace(underscoreRegExp, '.')}$`, flags);
    }
    /**
     * Limit the result.
     *
     * @example <caption>Get only the first 2 posts.</caption>
     * const store = new JSData.DataStore();
     * store.defineMapper('post');
     * const posts = [
     *   { author: 'John', age: 30, status: 'published', id: 1 },
     *   { author: 'Sally', age: 31, status: 'draft', id: 2 },
     *   { author: 'Mike', age: 32, status: 'draft', id: 3 },
     *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
     *   { author: 'Adam', age: 33, status: 'draft', id: 5 }
     * ];
     * store.add('post', posts);
     * const results = store.query('post').limit(2).run();
     * console.log(results);
     *
     * @method Query#limit
     * @param {number} num The maximum number of entities to keep in the result.
     * @returns {Query} A reference to itself for chaining.
     * @since 3.0.0
     */
    limit(num) {
        if (!utils.isNumber(num)) {
            throw utils.err(`${DOMAIN$1}#limit`, 'num')(400, 'number', num);
        }
        const data = this.getData();
        this.data = data.slice(0, Math.min(data.length, num));
        return this;
    }
    /**
     * Apply a mapping function to the result data.
     *
     * @example
     * const JSData = require('js-data');
     * const { DataStore } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const store = new DataStore();
     * store.defineMapper('user');
     * const users = [
     *   { name: 'Peter', age: 25, id: 1 },
     *   { name: 'Jim', age: 19, id: 2 },
     *   { name: 'Mike', age: 17, id: 3 },
     *   { name: 'Alan', age: 29, id: 4 },
     *   { name: 'Katie', age: 33, id: 5 }
     * ];
     * store.add('user', users);
     * const ages = store
     *   .query('user')
     *   .map(function (user) {
     *     return user.age;
     *   })
     *   .run();
     * console.log(ages);
     *
     * @method Query#map
     * @param {Function} mapFn Mapping function.
     * @param {*} [thisArg] Context to which to bind `mapFn`.
     * @returns {Query} A reference to itself for chaining.
     * @since 3.0.0
     */
    map(mapFn, thisArg) {
        this.data = this.getData().map(mapFn, thisArg);
        return this;
    }
    /**
     * Return the result of calling the specified function on each item in this
     * collection's main index.
     *
     * @example
     * const stringAges = UserCollection.query().mapCall('toString').run();
     *
     * @method Query#mapCall
     * @param {string} funcName Name of function to call
     * @param args Remaining arguments to be passed to the function.
     * @returns {Query} A reference to itself for chaining.
     * @since 3.0.0
     */
    mapCall(funcName, ...args) {
        this.data = this.getData().map(item => item[funcName](...args));
        return this;
    }
    /**
     * Complete the execution of the query and return the resulting data.
     *
     * @method Query#run
     * @returns {Array} The result of executing this query.
     * @since 3.0.0
     */
    run() {
        const data = this.data;
        this.data = null;
        return data;
    }
    /**
     * Skip a number of results.
     *
     * @example <caption>Get all but the first 2 posts.</caption>
     * const JSData = require('js-data');
     * const { DataStore } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const store = new DataStore();
     * store.defineMapper('post');
     * const posts = [
     *   { author: 'John', age: 30, status: 'published', id: 1 },
     *   { author: 'Sally', age: 31, status: 'draft', id: 2 },
     *   { author: 'Mike', age: 32, status: 'draft', id: 3 },
     *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
     *   { author: 'Adam', age: 33, status: 'draft', id: 5 }
     * ];
     * store.add('post', posts);
     * const results = store.query('post').skip(2).run();
     * console.log(results);
     *
     * @method Query#skip
     * @param {number} num The number of entities to skip.
     * @returns {Query} A reference to itself for chaining.
     * @since 3.0.0
     */
    skip(num) {
        if (!utils.isNumber(num)) {
            throw utils.err(`${DOMAIN$1}#skip`, 'num')(400, 'number', num);
        }
        const data = this.getData();
        if (num < data.length) {
            this.data = data.slice(num);
        }
        else {
            this.data = [];
        }
        return this;
    }
}
/**
 * The filtering operators supported by {@link Query#filter}, and which are
 * implemented by adapters (for the most part).
 *
 * @example <caption>Variant 1</caption>
 * const JSData = require('js-data');
 * const { DataStore } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * const store = new DataStore();
 * store.defineMapper('post');
 * const posts = [
 *   { author: 'John', age: 30, status: 'published', id: 1 },
 *   { author: 'Sally', age: 31, status: 'published', id: 2 },
 *   { author: 'Mike', age: 32, status: 'published', id: 3 },
 *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
 *   { author: 'Adam', age: 33, status: 'published', id: 5 }
 * ];
 * store.add('post', posts);
 * const publishedPosts = store.filter('post', {
 *   status: 'published',
 *   limit: 2
 * });
 * console.log(publishedPosts);
 *
 *
 * @example <caption>Variant 2</caption>
 * const JSData = require('js-data');
 * const { DataStore } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * const store = new DataStore();
 * store.defineMapper('post')
 * const posts = [
 *   { author: 'John', age: 30, status: 'published', id: 1 },
 *   { author: 'Sally', age: 31, status: 'published', id: 2 },
 *   { author: 'Mike', age: 32, status: 'published', id: 3 },
 *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
 *   { author: 'Adam', age: 33, status: 'published', id: 5 }
 * ];
 * store.add('post', posts);
 * const publishedPosts = store.filter('post', {
 *   where: {
 *     status: {
 *       '==': 'published'
 *     }
 *   },
 *   limit: 2
 * });
 * console.log(publishedPosts);
 *
 * @example <caption>Variant 3</caption>
 * const JSData = require('js-data');
 * const { DataStore } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * const store = new DataStore();
 * store.defineMapper('post');
 * const posts = [
 *   { author: 'John', age: 30, status: 'published', id: 1 },
 *   { author: 'Sally', age: 31, status: 'published', id: 2 },
 *   { author: 'Mike', age: 32, status: 'published', id: 3 },
 *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
 *   { author: 'Adam', age: 33, status: 'published', id: 5 }
 * ];
 * store.add('post', posts);
 * const publishedPosts = store
 *   .query('post')
 *   .filter({ status: 'published' })
 *   .limit(2)
 *   .run();
 * console.log(publishedPosts);
 *
 * @example <caption>Variant 4</caption>
 * const JSData = require('js-data');
 * const { DataStore } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * const store = new DataStore();
 * store.defineMapper('post');
 * const posts = [
 *   { author: 'John', age: 30, status: 'published', id: 1 },
 *   { author: 'Sally', age: 31, status: 'published', id: 2 },
 *   { author: 'Mike', age: 32, status: 'published', id: 3 },
 *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
 *   { author: 'Adam', age: 33, status: 'published', id: 5 }
 * ];
 * store.add('post', posts);
 * const publishedPosts = store
 *   .query('post')
 *   .filter({
 *     where: {
 *       status: {
 *         '==': 'published'
 *       }
 *     }
 *   })
 *   .limit(2)
 *   .run();
 * console.log(publishedPosts);
 *
 * @example <caption>Multiple operators</caption>
 * const JSData = require('js-data');
 * const { DataStore } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * const store = new DataStore();
 * store.defineMapper('post');
 * const posts = [
 *   { author: 'John', age: 30, status: 'published', id: 1 },
 *   { author: 'Sally', age: 31, status: 'published', id: 2 },
 *   { author: 'Mike', age: 32, status: 'published', id: 3 },
 *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
 *   { author: 'Adam', age: 33, status: 'published', id: 5 }
 * ];
 * store.add('post', posts);
 *
 * const myPublishedPosts = store.filter('post', {
 *   where: {
 *     status: {
 *       '==': 'published'
 *     },
 *     user_id: {
 *       '==': currentUser.id
 *     }
 *   }
 * });
 *
 * console.log(myPublishedPosts);
 *
 * @name Query.ops
 * @property {Function} == Equality operator.
 * @property {Function} != Inequality operator.
 * @property {Function} > Greater than operator.
 * @property {Function} >= Greater than (inclusive) operator.
 * @property {Function} < Less than operator.
 * @property {Function} <= Less than (inclusive) operator.
 * @property {Function} isectEmpty Operator that asserts that the intersection
 * between two arrays is empty.
 * @property {Function} isectNotEmpty Operator that asserts that the
 * intersection between two arrays is __not__ empty.
 * @property {Function} in Operator that asserts whether a value is in an
 * array.
 * @property {Function} notIn Operator that asserts whether a value is __not__
 * in an array.
 * @property {Function} contains Operator that asserts whether an array
 * contains a value.
 * @property {Function} notContains Operator that asserts whether an array
 * does __not__ contain a value.
 * @since 3.0.0
 * @type {Object}
 */
Query.ops = {
    '='(value, predicate) {
        // tslint:disable-next-line:triple-equals
        return value == predicate; // eslint-disable-line
    },
    '=='(value, predicate) {
        // tslint:disable-next-line:triple-equals
        return value == predicate; // eslint-disable-line
    },
    '==='(value, predicate) {
        return value === predicate;
    },
    '!='(value, predicate) {
        // tslint:disable-next-line:triple-equals
        return value != predicate; // eslint-disable-line
    },
    '!=='(value, predicate) {
        return value !== predicate;
    },
    '>'(value, predicate) {
        return value > predicate;
    },
    '>='(value, predicate) {
        return value >= predicate;
    },
    '<'(value, predicate) {
        return value < predicate;
    },
    '<='(value, predicate) {
        return value <= predicate;
    },
    isectEmpty(value, predicate) {
        return !utils.intersection(value || [], predicate || []).length;
    },
    isectNotEmpty(value, predicate) {
        return utils.intersection(value || [], predicate || []).length;
    },
    in(value, predicate) {
        return predicate.indexOf(value) !== -1;
    },
    notIn(value, predicate) {
        return predicate.indexOf(value) === -1;
    },
    contains(value, predicate) {
        return (value || []).indexOf(predicate) !== -1;
    },
    notContains(value, predicate) {
        return (value || []).indexOf(predicate) === -1;
    }
};

// TODO: remove this when the rest of the project is cleaned
const belongsToType = 'belongsTo';
const hasManyType = 'hasMany';
const hasOneType = 'hasOne';
const DOMAIN$2 = 'Relation';
class Relation {
    constructor(relatedMapper, options = {}) {
        this.TYPE_NAME = DOMAIN$2;
        options.type = this.constructor.TYPE_NAME;
        this.validateOptions(relatedMapper, options);
        if (typeof relatedMapper === 'object') {
            this.relatedMapper = relatedMapper;
        }
        utils.fillIn(this, options);
    }
    get canAutoAddLinks() {
        return this.add === undefined || !!this.add;
    }
    get relatedCollection() {
        return this.mapper.datastore.getCollection(this.relation);
    }
    validateOptions(related, opts) {
        const DOMAIN_ERR = `new ${DOMAIN$2}`;
        const localField = opts.localField;
        if (!localField) {
            throw utils.err(DOMAIN_ERR, 'opts.localField')(400, 'string', localField);
        }
        const foreignKey = (opts.foreignKey = opts.foreignKey || opts.localKey);
        if (!foreignKey && (opts.type === belongsToType || opts.type === hasOneType)) {
            throw utils.err(DOMAIN_ERR, 'opts.foreignKey')(400, 'string', foreignKey);
        }
        if (utils.isString(related)) {
            opts.relation = related;
            if (!utils.isFunction(opts.getRelation)) {
                throw utils.err(DOMAIN_ERR, 'opts.getRelation')(400, 'function', opts.getRelation);
            }
        }
        else if (related) {
            opts.relation = related.name;
        }
        else {
            throw utils.err(DOMAIN_ERR, 'related')(400, 'Mapper or string', related);
        }
    }
    assignTo(mapper) {
        this.name = mapper.name;
        Object.defineProperty(this, 'mapper', { value: mapper });
        if (!mapper.relationList)
            Object.defineProperty(mapper, 'relationList', { value: [] });
        if (!mapper.relationFields)
            Object.defineProperty(mapper, 'relationFields', { value: [] });
        mapper.relationList.push(this);
        mapper.relationFields.push(this.localField);
    }
    canFindLinkFor(record) {
        return !!(this.foreignKey || this.localKey);
    }
    getRelation() {
        return this.relatedMapper;
    }
    getForeignKey(record) {
        return utils.get(record, this.mapper.idAttribute);
    }
    setForeignKey(record, relatedRecord) {
        if (!record || !relatedRecord) {
            return;
        }
        this._setForeignKey(record, relatedRecord);
    }
    _setForeignKey(record, relatedRecords) {
        const idAttribute = this.mapper.idAttribute;
        if (!utils.isArray(relatedRecords)) {
            relatedRecords = [relatedRecords];
        }
        relatedRecords.forEach(relatedRecord => {
            utils.set(relatedRecord, this.foreignKey, utils.get(record, idAttribute));
        });
    }
    getLocalField(record) {
        return utils.get(record, this.localField);
    }
    setLocalField(record, relatedData) {
        return utils.set(record, this.localField, relatedData);
    }
    getInverse(mapper) {
        if (!this.inverse) {
            this.findInverseRelation(mapper);
        }
        return this.inverse;
    }
    findInverseRelation(mapper) {
        this.getRelation().relationList.forEach(def => {
            if (def.getRelation() === mapper && this.isInversedTo(def) && this !== def) {
                this.inverse = def;
                return true;
            }
        });
    }
    isInversedTo(def) {
        return !def.foreignKey || def.foreignKey === this.foreignKey;
    }
    addLinkedRecords(records) {
        const datastore = this.mapper.datastore;
        records.forEach(record => {
            let relatedData = this.getLocalField(record);
            if (utils.isFunction(this.add)) {
                relatedData = this.add(datastore, this, record);
            }
            else if (relatedData) {
                relatedData = this.linkRecord(record, relatedData);
            }
            const isEmptyLinks = !relatedData || (utils.isArray(relatedData) && !relatedData.length);
            if (isEmptyLinks && this.canFindLinkFor(record)) {
                relatedData = this.findExistingLinksFor(record);
            }
            if (relatedData) {
                this.setLocalField(record, relatedData);
            }
        });
    }
    removeLinkedRecords(relatedMapper, records) {
        const localField = this.localField;
        records.forEach(record => {
            utils.set(record, localField, undefined);
        });
    }
    linkRecord(record, relatedRecord) {
        const relatedId = utils.get(relatedRecord, this.mapper.idAttribute);
        if (relatedId === undefined) {
            const unsaved = this.relatedCollection.unsaved();
            if (unsaved.indexOf(relatedRecord) === -1) {
                if (this.canAutoAddLinks) {
                    relatedRecord = this.relatedCollection.add(relatedRecord);
                }
            }
        }
        else {
            if (relatedRecord !== this.relatedCollection.get(relatedId)) {
                this.setForeignKey(record, relatedRecord);
                if (this.canAutoAddLinks) {
                    relatedRecord = this.relatedCollection.add(relatedRecord);
                }
            }
        }
        return relatedRecord;
    }
    // e.g. user hasMany post via "foreignKey", so find all posts of user
    findExistingLinksByForeignKey(id) {
        if (id === undefined || id === null) {
            return;
        }
        return this.relatedCollection.filter({
            [this.foreignKey]: id
        });
    }
    ensureLinkedDataHasProperType(props, opts) {
        const relatedMapper = this.getRelation();
        const relationData = this.getLocalField(props);
        if (utils.isArray(relationData) && (!relationData.length || relatedMapper.is(relationData[0]))) {
            return;
        }
        if (relationData && !relatedMapper.is(relationData)) {
            utils.set(props, this.localField, relatedMapper.createRecord(relationData, opts));
        }
    }
    isRequiresParentId() {
        return false;
    }
    isRequiresChildId() {
        return false;
    }
    createChildRecord(props, relationData, opts) {
        this.setForeignKey(props, relationData);
        return this.createLinked(relationData, opts).then(result => {
            this.setLocalField(props, result);
        });
    }
    createLinked(props, opts) {
        const create = utils.isArray(props) ? 'createMany' : 'create';
        return this.getRelation()[create](props, opts);
    }
}

const DOMAIN$3 = 'Record';
function superMethod(mapper, name) {
    var _a;
    const store = mapper.datastore;
    if ((_a = store) === null || _a === void 0 ? void 0 : _a[name]) {
        return (...args) => store[name](mapper.name, ...args);
    }
    return mapper[name].bind(mapper);
}
// Cache these strings
const creatingPath = 'creating';
const noValidatePath = 'noValidate';
const keepChangeHistoryPath = 'keepChangeHistory';
const previousPath = 'previous';
/**
 * js-data's Record class. An instance of `Record` corresponds to an in-memory
 * representation of a single row or document in a database, Firebase,
 * localstorage, etc. Basically, a `Record` instance represents whatever kind of
 * entity in your persistence layer that has a primary key.
 *
 * ```javascript
 * import {Record} from 'js-data'
 * ```
 *
 * @example <caption>Record#constructor</caption>
 * const JSData = require('js-data');
 * const { Record } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * // Instantiate a plain record
 * let record = new Record();
 * console.log('record: ' + JSON.stringify(record));
 *
 * // You can supply properties on instantiation
 * record = new Record({ name: 'John' });
 * console.log('record: ' + JSON.stringify(record));
 *
 * @example <caption>Record#constructor2</caption>
 * const JSData = require('js-data');
 * const { Mapper } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * // Instantiate a record that's associated with a Mapper:
 * const UserMapper = new Mapper({ name: 'user' });
 * const User = UserMapper.recordClass;
 * const user = UserMapper.createRecord({ name: 'John' });
 * const user2 = new User({ name: 'Sally' });
 * console.log('user: ' + JSON.stringify(user));
 * console.log('user2: ' + JSON.stringify(user2));
 *
 * @example <caption>Record#constructor3</caption>
 * const JSData = require('js-data');
 * const { Container } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * const store = new Container();
 * store.defineMapper('user');
 *
 * // Instantiate a record that's associated with a store's Mapper
 * const user = store.createRecord('user', { name: 'John' });
 * console.log('user: ' + JSON.stringify(user));
 *
 * @example <caption>Record#constructor4</caption>
 * const JSData = require('js-data');
 * const { Container } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * const store = new Container();
 * store.defineMapper('user', {
 *   schema: {
 *     properties: {
 *       name: { type: 'string' }
 *     }
 *   }
 * });
 *
 * // Validate on instantiation
 * const user = store.createRecord('user', { name: 1234 });
 * console.log('user: ' + JSON.stringify(user));
 *
 * @example <caption>Record#constructor5</caption>
 * const JSData = require('js-data');
 * const { Container } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * const store = new Container();
 * store.defineMapper('user', {
 *   schema: {
 *     properties: {
 *       name: { type: 'string' }
 *     }
 *   }
 * });
 *
 * // Skip validation on instantiation
 * const user = store.createRecord('user', { name: 1234 }, { noValidate: true });
 * console.log('user: ' + JSON.stringify(user));
 * console.log('user.isValid(): ' + user.isValid());
 *
 * @class Record
 * @extends Settable
 * @param {object} [props] The initial properties of the new Record instance.
 * @param {object} [opts] Configuration options.
 * @param {boolean} [opts.noValidate=false] Whether to skip validation on the
 * initial properties.
 * @param {boolean} [opts.validateOnSet=true] Whether to enable setter
 * validation on properties after the Record has been initialized.
 * @since 3.0.0
 */
class Record extends Settable {
    constructor(props = {}, opts = {}) {
        var _a;
        super();
        const _set = this._set;
        const mapper = this.constructor.mapper;
        _set(creatingPath, true);
        _set(noValidatePath, !!opts.noValidate);
        _set(keepChangeHistoryPath, opts.keepChangeHistory === undefined ? (mapper ? mapper.keepChangeHistory : true) : opts.keepChangeHistory);
        // Set the idAttribute value first, if it exists.
        const id = mapper ? utils.get(props, mapper.idAttribute) : undefined;
        if (id !== undefined) {
            utils.set(this, mapper.idAttribute, id);
        }
        utils.fillIn(this, props);
        _set(creatingPath, false);
        if (opts.validateOnSet !== undefined) {
            _set(noValidatePath, !opts.validateOnSet);
        }
        else if (((_a = mapper) === null || _a === void 0 ? void 0 : _a.validateOnSet) !== undefined) {
            _set(noValidatePath, !mapper.validateOnSet);
        }
        else {
            _set(noValidatePath, false);
        }
        _set(previousPath, mapper ? mapper.toJSON(props) : utils.plainCopy(props));
    }
    /**
     * Returns the {@link Mapper} paired with this record's class, if any.
     *
     * @method Record#_mapper
     * @returns {Mapper} The {@link Mapper} paired with this record's class, if any.
     * @since 3.0.0
     */
    _mapper() {
        const mapper = this.constructor.mapper;
        if (!mapper) {
            throw utils.err(`${DOMAIN$3}#_mapper`, '')(404, 'mapper');
        }
        return mapper;
    }
    /**
     * Lifecycle hook.
     *
     * @method Record#afterLoadRelations
     * @param {string[]} relations The `relations` argument passed to {@link Record#loadRelations}.
     * @param {object} opts The `opts` argument passed to {@link Record#loadRelations}.
     * @since 3.0.0
     */
    afterLoadRelations(relations, opts) { }
    /**
     * Lifecycle hook.
     *
     * @method Record#beforeLoadRelations
     * @param {string[]} relations The `relations` argument passed to {@link Record#loadRelations}.
     * @param {object} opts The `opts` argument passed to {@link Record#loadRelations}.
     * @since 3.0.0
     */
    beforeLoadRelations(relations, opts) { }
    /**
     * Return the change history of this record since it was instantiated or
     * {@link Record#commit} was called.
     *
     * @method Record#changeHistory
     * @since 3.0.0
     */
    changeHistory() {
        return (this._get('history') || []).slice();
    }
    /**
     * Return changes to this record since it was instantiated or
     * {@link Record#commit} was called.
     *
     * @example <caption>Record#changes</caption>
     * const JSData = require('js-data');
     * const { Container } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const store = new Container();
     * store.defineMapper('user');
     * const user = store.createRecord('user');
     * console.log('user changes: ' + JSON.stringify(user.changes()));
     * user.name = 'John';
     * console.log('user changes: ' + JSON.stringify(user.changes()));
     *
     * @method Record#changes
     * @param [opts] Configuration options.
     * @param {Function} [opts.equalsFn={@link utils.deepEqual}] Equality function.
     * @param {array} [opts.ignore=[]] Array of strings or RegExp of fields to ignore.
     * @returns {Object} Object describing the changes to this record since it was
     * instantiated or its {@link Record#commit} method was last called.
     * @since 3.0.0
     */
    changes(opts = {}) {
        return utils.diffObjects(typeof this.toJSON === 'function' ? this.toJSON(opts) : this, this._get('previous'), opts);
    }
    /**
     * Make the record's current in-memory state it's only state, with any
     * previous property values being set to current values.
     *
     * @example <caption>Record#commit</caption>
     * const JSData = require('js-data');
     * const { Container } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const store = new Container();
     * store.defineMapper('user');
     * const user = store.createRecord('user');
     * console.log('user hasChanges: ' + user.hasChanges());
     * user.name = 'John';
     * console.log('user hasChanges: ' + user.hasChanges());
     * user.commit();
     * console.log('user hasChanges: ' + user.hasChanges());
     *
     * @method Record#commit
     * @param {object} [opts] Configuration options. Passed to {@link Record#toJSON}.
     * @since 3.0.0
     */
    commit(opts) {
        this._set('changed'); // unset
        this._set('changing', false);
        this._set('history', []); // clear history
        this._set('previous', this.toJSON(opts));
    }
    /**
     * Call {@link Mapper#destroy} using this record's primary key.
     *
     * @example
     * import { Container } from 'js-data';
     * import { RethinkDBAdapter } from 'js-data-rethinkdb';
     *
     * const store = new Container();
     * store.registerAdapter('rethink', new RethinkDBAdapter(), { default: true });
     * store.defineMapper('user');
     * store.find('user', 1234).then((user) => {
     *   console.log(user.id); // 1234
     *
     *   // Destroy this user from the database
     *   return user.destroy();
     * });
     *
     * @method Record#destroy
     * @param {object} [opts] Configuration options passed to {@link Mapper#destroy}.
     * @returns {Promise} The result of calling {@link Mapper#destroy} with the
     * primary key of this record.
     * @since 3.0.0
     */
    destroy(opts = {}) {
        const mapper = this._mapper();
        return superMethod(mapper, 'destroy')(utils.get(this, mapper.idAttribute), opts);
    }
    /**
     * Return the value at the given path for this instance.
     *
     * @example <caption>Record#get</caption>
     * const JSData = require('js-data');
     * const { Container } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     * const store = new Container();
     * store.defineMapper('user');
     *
     * const user = store.createRecord('user', { name: 'Bob' });
     * console.log('user.get("name"): ' + user.get('name'));
     *
     * @method Record#get
     * @param {string} key Path of value to retrieve.
     * @returns {*} Value at path.
     * @since 3.0.0
     */
    get(key) {
        return utils.get(this, key);
    }
    /**
     * Return whether this record has changed since it was instantiated or
     * {@link Record#commit} was called.
     *
     * @example <caption>Record#hasChanges</caption>
     * const JSData = require('js-data');
     * const { Container } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     * const store = new Container();
     * store.defineMapper('user');
     * const user = store.createRecord('user');
     * console.log('user hasChanges: ' + user.hasChanges());
     * user.name = 'John';
     * console.log('user hasChanges: ' + user.hasChanges());
     * user.commit();
     * console.log('user hasChanges: ' + user.hasChanges());
     *
     * @method Record#hasChanges
     * @param [opts] Configuration options.
     * @param {Function} [opts.equalsFn={@link utils.deepEqual}] Equality function.
     * @param {array} [opts.ignore=[]] Array of strings or RegExp of fields to ignore.
     * @returns {boolean} Return whether the record has changed since it was
     * instantiated or since its {@link Record#commit} method was called.
     * @since 3.0.0
     */
    hasChanges(opts) {
        const quickHasChanges = !!(this._get('changed') || []).length;
        return (quickHasChanges ||
            utils.areDifferent(typeof this.toJSON === 'function' ? this.toJSON(opts) : this, this._get('previous'), opts));
    }
    /**
     * Return whether the record is unsaved. Records that have primary keys are
     * considered "saved". Records without primary keys are considered "unsaved".
     *
     * @example <caption>Record#isNew</caption>
     * const JSData = require('js-data');
     * const { Container } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     * const store = new Container();
     * store.defineMapper('user');
     * const user = store.createRecord('user', {
     *   id: 1234
     * });
     * const user2 = store.createRecord('user');
     * console.log('user isNew: ' + user.isNew()); // false
     * console.log('user2 isNew: ' + user2.isNew()); // true
     *
     * @method Record#isNew
     * @returns {boolean} Whether the record is unsaved.
     * @since 3.0.0
     */
    isNew(opts) {
        return utils.get(this, this._mapper().idAttribute) === undefined;
    }
    /**
     * Return whether the record in its current state passes validation.
     *
     * @example <caption>Record#isValid</caption>
     * const JSData = require('js-data');
     * const { Container } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     * const store = new Container();
     * store.defineMapper('user', {
     *   schema: {
     *     properties: {
     *       name: { type: 'string' }
     *     }
     *   }
     * });
     * const user = store.createRecord('user', {
     *   name: 1234
     * }, {
     *   noValidate: true // this allows us to put the record into an invalid state
     * });
     * console.log('user isValid: ' + user.isValid());
     * user.name = 'John';
     * console.log('user isValid: ' + user.isValid());
     *
     * @method Record#isValid
     * @param {object} [opts] Configuration options. Passed to {@link Mapper#validate}.
     * @returns {boolean} Whether the record in its current state passes
     * validation.
     * @since 3.0.0
     */
    isValid(opts) {
        return !this._mapper().validate(this, opts);
    }
    removeInverseRelation(currentParent, id, inverseDef, idAttribute) {
        if (inverseDef.type === hasOneType) {
            safeSetLink(currentParent, inverseDef.localField, undefined);
        }
        else if (inverseDef.type === hasManyType) {
            // e.g. remove comment from otherPost.comments
            const children = utils.get(currentParent, inverseDef.localField);
            if (id === undefined) {
                utils.remove(children, child => child === this);
            }
            else {
                utils.remove(children, child => child === this || id === utils.get(child, idAttribute));
            }
        }
    }
    setupInverseRelation(record, id, inverseDef, idAttribute) {
        // Update (set) inverse relation
        if (inverseDef.type === hasOneType) {
            // e.g. someUser.profile = profile
            safeSetLink(record, inverseDef.localField, this);
        }
        else if (inverseDef.type === hasManyType) {
            // e.g. add comment to somePost.comments
            const children = utils.get(record, inverseDef.localField);
            if (id === undefined) {
                utils.noDupeAdd(children, this, child => child === this);
            }
            else {
                utils.noDupeAdd(children, this, child => child === this || id === utils.get(child, idAttribute));
            }
        }
    }
    /**
     * Lazy load relations of this record, to be attached to the record once their
     * loaded.
     *
     * @example
     * import { Container } from 'js-data';
     * import { RethinkDBAdapter } from 'js-data-rethinkdb';
     *
     * const store = new Container();
     * store.registerAdapter('rethink', new RethinkDBAdapter(), { default: true });
     * store.defineMapper('user', {
     *   relations: {
     *     hasMany: {
     *       post: {
     *         localField: 'posts',
     *         foreignKey: 'user_id'
     *       }
     *     }
     *   }
     * });
     * store.defineMapper('post', {
     *   relations: {
     *     belongsTo: {
     *       user: {
     *         localField: 'user',
     *         foreignKey: 'user_id'
     *       }
     *     }
     *   }
     * });
     * store.find('user', 1234).then((user) => {
     *   console.log(user.id); // 1234
     *
     *   // Load the user's post relations
     *   return user.loadRelations(['post']);
     * }).then((user) => {
     *   console.log(user.posts); // [{...}, {...}, ...]
     * });
     *
     * @method Record#loadRelations
     * @param {string[]} [relations] List of relations to load. Can use localField
     * names or Mapper names to pick relations.
     * @param {object} [opts] Configuration options.
     * @returns {Promise} Resolves with the record, with the loaded relations now
     * attached.
     * @since 3.0.0
     */
    loadRelations(relations = [], opts = {}) {
        let op;
        const mapper = this._mapper();
        if (utils.isString(relations)) {
            relations = [relations];
        }
        opts.with = relations;
        // Fill in "opts" with the Model's configuration
        utils._(opts, mapper);
        opts.adapter = mapper.getAdapterName(opts);
        // beforeLoadRelations lifecycle hook
        op = opts.op = 'beforeLoadRelations';
        return utils
            .resolve(this[op](relations, opts))
            .then(() => {
            // Now delegate to the adapter
            op = opts.op = 'loadRelations';
            mapper.dbg(op, this, relations, opts);
            const tasks = [];
            let task;
            utils.forEachRelation(mapper, opts, (def, optsCopy) => {
                const relatedMapper = def.getRelation();
                optsCopy.raw = false;
                if (utils.isFunction(def.load)) {
                    task = def.load(mapper, def, this, opts);
                }
                else if (def.type === 'hasMany' || def.type === 'hasOne') {
                    if (def.foreignKey) {
                        task = superMethod(relatedMapper, 'findAll')({
                            [def.foreignKey]: utils.get(this, mapper.idAttribute)
                        }, optsCopy).then(relatedData => def.type === 'hasOne' ? (relatedData.length ? relatedData[0] : undefined) : relatedData);
                    }
                    else if (def.localKeys) {
                        task = superMethod(relatedMapper, 'findAll')({
                            where: {
                                [relatedMapper.idAttribute]: {
                                    in: utils.get(this, def.localKeys)
                                }
                            }
                        });
                    }
                    else if (def.foreignKeys) {
                        task = superMethod(relatedMapper, 'findAll')({
                            where: {
                                [def.foreignKeys]: {
                                    contains: utils.get(this, mapper.idAttribute)
                                }
                            }
                        }, opts);
                    }
                }
                else if (def.type === 'belongsTo') {
                    const key = utils.get(this, def.foreignKey);
                    if (utils.isSorN(key)) {
                        task = superMethod(relatedMapper, 'find')(key, optsCopy);
                    }
                }
                if (task) {
                    task = task.then(relatedData => {
                        def.setLocalField(this, relatedData);
                    });
                    tasks.push(task);
                }
            });
            return Promise.all(tasks);
        })
            .then(() => {
            // afterLoadRelations lifecycle hook
            op = opts.op = 'afterLoadRelations';
            return utils.resolve(this[op](relations, opts)).then(() => this);
        });
    }
    /**
     * Return the properties with which this record was instantiated.
     *
     * @example <caption>Record#previous</caption>
     * const JSData = require('js-data');
     * const { Container } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     * const store = new Container();
     * store.defineMapper('user');
     * const user = store.createRecord('user', {
     *   name: 'William'
     * });
     * console.log('user previous: ' + JSON.stringify(user.previous()));
     * user.name = 'Bob';
     * console.log('user previous: ' + JSON.stringify(user.previous()));
     * user.commit();
     * console.log('user previous: ' + JSON.stringify(user.previous()));
     *
     * @method Record#previous
     * @param {string} [key] If specified, return just the initial value of the
     * given key.
     * @returns {Object} The initial properties of this record.
     * @since 3.0.0
     */
    previous(key) {
        if (key) {
            return this._get(`previous.${key}`);
        }
        return this._get('previous');
    }
    /**
     * Revert changes to this record back to the properties it had when it was
     * instantiated.
     *
     * @example <caption>Record#revert</caption>
     * const JSData = require('js-data');
     * const { Container } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     * const store = new Container();
     * store.defineMapper('user');
     * const user = store.createRecord('user', {
     *   name: 'William'
     * });
     * console.log('user: ' + JSON.stringify(user));
     * user.name = 'Bob';
     * console.log('user: ' + JSON.stringify(user));
     * user.revert();
     * console.log('user: ' + JSON.stringify(user));
     *
     * @method Record#revert
     * @param {object} [opts] Configuration options.
     * @param {string[]} [opts.preserve] Array of strings or Regular Expressions
     * denoting properties that should not be reverted.
     * @since 3.0.0
     */
    revert(opts = {}) {
        const previous = this._get('previous');
        opts.preserve = opts.preserve || [];
        utils.forOwn(this, (value, key) => {
            if (key !== this._mapper().idAttribute &&
                !previous.hasOwnProperty(key) &&
                this.hasOwnProperty(key) &&
                opts.preserve.indexOf(key) === -1) {
                delete this[key];
            }
        });
        utils.forOwn(previous, (value, key) => {
            if (opts.preserve.indexOf(key) === -1) {
                this[key] = value;
            }
        });
        this.commit();
    }
    /**
     * Delegates to {@link Mapper#create} or {@link Mapper#update}.
     *
     * @example
     * import { Container } from 'js-data';
     * import { RethinkDBAdapter } from 'js-data-rethinkdb';
     *
     * const store = new Container();
     * store.registerAdapter('rethink', new RethinkDBAdapter(), { default: true });
     * store.defineMapper('session');
     * const session = store.createRecord('session', { topic: 'Node.js' });
     *
     * // Create a new record in the database
     * session.save().then(() => {
     *   console.log(session.id); // 1234
     *
     *   session.skill_level = 'beginner';
     *
     *   // Update the record in the database
     *   return session.save();
     * });
     *
     * @method Record#save
     * @param {object} [opts] Configuration options. See {@link Mapper#create} and
     * {@link Mapper#update}.
     * @param {boolean} [opts.changesOnly] Equality function. Default uses `===`.
     * @param {Function} [opts.equalsFn] Passed to {@link Record#changes} when
     * `opts.changesOnly` is `true`.
     * @param {array} [opts.ignore] Passed to {@link Record#changes} when
     * `opts.changesOnly` is `true`.
     * @returns {Promise} The result of calling {@link Mapper#create} or
     * {@link Mapper#update}.
     * @since 3.0.0
     */
    save(opts = {}) {
        const mapper = this._mapper();
        const id = utils.get(this, mapper.idAttribute);
        let props = this;
        const postProcess = result => {
            const record = opts.raw ? result.data : result;
            if (record) {
                utils.deepMixIn(this, record);
                this.commit();
            }
            return result;
        };
        if (id === undefined) {
            return superMethod(mapper, 'create')(props, opts).then(postProcess);
        }
        if (opts.changesOnly) {
            const changes = this.changes(opts);
            props = {};
            utils.fillIn(props, changes.added);
            utils.fillIn(props, changes.changed);
        }
        return superMethod(mapper, 'update')(id, props, opts).then(postProcess);
    }
    /**
     * Set the value for a given key, or the values for the given keys if "key" is
     * an object. Triggers change events on those properties that have `track: true`
     * in {@link Mapper#schema}.
     *
     * @example <caption>Record#set</caption>
     * const JSData = require('js-data');
     * const { Container } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     * const store = new Container();
     * store.defineMapper('user');
     *
     * const user = store.createRecord('user');
     * console.log('user: ' + JSON.stringify(user));
     *
     * user.set('name', 'Bob');
     * console.log('user: ' + JSON.stringify(user));
     *
     * user.set({ age: 30, role: 'admin' });
     * console.log('user: ' + JSON.stringify(user));
     *
     * @fires Record#change
     * @method Record#set
     * @param {(string|Object)} key Key to set or hash of key-value pairs to set.
     * @param {*} [value] Value to set for the given key.
     * @param {object} [opts] Configuration options.
     * @param {boolean} [opts.silent=false] Whether to trigger change events.
     * @since 3.0.0
     */
    set(key, value, opts) {
        if (utils.isObject(key)) {
            opts = value;
        }
        opts = opts || {};
        if (opts.silent) {
            this._set('silent', true);
        }
        utils.set(this, key, value);
        if (!this._get('eventId')) {
            this._set('silent'); // unset
        }
    }
    /**
     * Return a plain object representation of this record. If the class from
     * which this record was created has a Mapper, then {@link Mapper#toJSON} will
     * be called with this record instead.
     *
     * @example <caption>Record#toJSON</caption>
     * const JSData = require('js-data');
     * const { Container } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     * const store = new Container();
     * store.defineMapper('user', {
     *   schema: {
     *     properties: {
     *       name: { type: 'string' }
     *     }
     *   }
     * });
     *
     * const user = store.createRecord('user', {
     *   name: 'John',
     *   $$hashKey: '1234'
     * });
     * console.log('user: ' + JSON.stringify(user.toJSON()));
     *
     * @method Record#toJSON
     * @param {object} [opts] Configuration options.
     * @param {string[]} [opts.with] Array of relation names or relation fields
     * to include in the representation. Only available as an option if the class
     * from which this record was created has a Mapper and this record resides in
     * an instance of {@link DataStore}.
     * @returns {Object} Plain object representation of this record.
     * @since 3.0.0
     */
    toJSON(opts) {
        const mapper = this.constructor.mapper;
        if (mapper) {
            return mapper.toJSON(this, opts);
        }
        else {
            const json = {};
            utils.forOwn(this, (prop, key) => {
                json[key] = utils.plainCopy(prop);
            });
            return json;
        }
    }
    /**
     * Unset the value for a given key. Triggers change events on those properties
     * that have `track: true` in {@link Mapper#schema}.
     *
     * @example <caption>Record#unset</caption>
     * const JSData = require('js-data');
     * const { Container } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     * const store = new Container();
     * store.defineMapper('user');
     *
     * const user = store.createRecord('user', {
     *   name: 'John'
     * });
     * console.log('user: ' + JSON.stringify(user));
     *
     * user.unset('name');
     * console.log('user: ' + JSON.stringify(user));
     *
     * @method Record#unset
     * @param {string} key Key to unset.
     * @param {object} [opts] Configuration options.
     * @param {boolean} [opts.silent=false] Whether to trigger change events.
     * @since 3.0.0
     */
    unset(key, opts) {
        this.set(key, undefined, opts);
    }
    /**
     * Validate this record based on its current properties.
     *
     * @example <caption>Record#validate</caption>
     * const JSData = require('js-data');
     * const { Container } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     * const store = new Container();
     * store.defineMapper('user', {
     *   schema: {
     *     properties: {
     *       name: { type: 'string' }
     *     }
     *   }
     * });
     * const user = store.createRecord('user', {
     *   name: 1234
     * }, {
     *   noValidate: true // this allows us to put the record into an invalid state
     * });
     * console.log('user validation: ' + JSON.stringify(user.validate()));
     * user.name = 'John';
     * console.log('user validation: ' + user.validate());
     *
     * @method Record#validate
     * @param {object} [opts] Configuration options. Passed to {@link Mapper#validate}.
     * @returns {*} Array of errors or `undefined` if no errors.
     * @since 3.0.0
     */
    validate(opts) {
        return this._mapper().validate(this, opts);
    }
}
Record.creatingPath = creatingPath;
Record.noValidatePath = noValidatePath;
Record.keepChangeHistoryPath = keepChangeHistoryPath;
Record.previousPath = previousPath;
/**
 * Allow records to emit events.
 *
 * An record's registered listeners are stored in the record's private data.
 */
utils.eventify(Record.prototype, function () {
    return this._get('events');
}, function (value) {
    this._set('events', value);
});
/**
 * Fired when a record changes. Only works for records that have tracked fields.
 * See {@link Record~changeListener} on how to listen for this event.
 *
 * @event Record#change
 * @see Record~changeListener
 */
/**
 * Callback signature for the {@link Record#event:change} event.
 *
 * @example
 * function onChange (record, changes) {
 *   // do something
 * }
 * record.on('change', onChange);
 *
 * @callback Record~changeListener
 * @param {Record} The Record that changed.
 * @param {object} The changes.
 * @see Record#event:change
 * @since 3.0.0
 */
/**
 * Create a subclass of this Record:
 * @example <caption>Record.extend</caption>
 * const JSData = require('js-data');
 * const { Record } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * // Extend the class using ES2015 class syntax.
 * class CustomRecordClass extends Record {
 *   foo () { return 'bar'; }
 *   static beep () { return 'boop'; }
 * }
 * const customRecord = new CustomRecordClass();
 * console.log(customRecord.foo());
 * console.log(CustomRecordClass.beep());
 *
 * // Extend the class using alternate method.
 * const OtherRecordClass = Record.extend({
 *   foo () { return 'bar'; }
 * }, {
 *   beep () { return 'boop'; }
 * });
 * const otherRecord = new OtherRecordClass();
 * console.log(otherRecord.foo());
 * console.log(OtherRecordClass.beep());
 *
 * // Extend the class, providing a custom constructor.
 * function AnotherRecordClass () {
 *   Record.call(this);
 *   this.created_at = new Date().getTime();
 * }
 * Record.extend({
 *   constructor: AnotherRecordClass,
 *   foo () { return 'bar'; }
 * }, {
 *   beep () { return 'boop'; }
 * });
 * const anotherRecord = new AnotherRecordClass();
 * console.log(anotherRecord.created_at);
 * console.log(anotherRecord.foo());
 * console.log(AnotherRecordClass.beep());
 *
 * @method Record.extend
 * @param {object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {object} [props.constructor] Provide a custom constructor function
 * to be used as the subclass itself.
 * @param {object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this Record class.
 * @since 3.0.0
 */

function sort(a, b, hashCode) {
    // Short-circuit comparison if a and b are strictly equal
    // This is absolutely necessary for indexed objects that
    // don't have the idAttribute field
    if (a === b) {
        return 0;
    }
    else if (hashCode) {
        a = hashCode(a);
        b = hashCode(b);
    }
    return (a === null && b === null) || (a === undefined && b === undefined)
        ? -1
        : a === null || a === undefined
            ? -1
            : b === null || b === undefined
                ? 1
                : a < b
                    ? -1
                    : a > b
                        ? 1
                        : 0;
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
    let lo = 0;
    let hi = array.length;
    let compared;
    let mid;
    while (lo < hi) {
        // tslint:disable-next-line:no-bitwise
        mid = ((lo + hi) / 2) | 0;
        compared = sort(value, array[mid], field);
        if (compared === 0) {
            return {
                found: true,
                index: mid
            };
        }
        else if (compared < 0) {
            hi = mid;
        }
        else {
            lo = mid + 1;
        }
    }
    return {
        found: false,
        index: hi
    };
}

// Copyright (c) 2015, InternalFX.
class Index {
    constructor(fieldList = [], opts = {}) {
        if (!utils.isArray(fieldList)) {
            throw new Error('fieldList must be an array.');
        }
        this.fieldList = fieldList;
        this.fieldGetter = opts.fieldGetter;
        this.hashCode = opts.hashCode;
        this.isIndex = true;
        this.keys = [];
        this.values = [];
    }
    set(keyList, value) {
        if (!utils.isArray(keyList)) {
            keyList = [keyList];
        }
        const key = keyList.shift() || undefined;
        const pos = binarySearch(this.keys, key);
        if (keyList.length === 0) {
            if (pos.found) {
                const dataLocation = binarySearch(this.values[pos.index], value, this.hashCode);
                if (!dataLocation.found) {
                    insertAt(this.values[pos.index], dataLocation.index, value);
                }
            }
            else {
                insertAt(this.keys, pos.index, key);
                insertAt(this.values, pos.index, [value]);
            }
        }
        else {
            if (pos.found) {
                this.values[pos.index].set(keyList, value);
            }
            else {
                insertAt(this.keys, pos.index, key);
                const newIndex = new Index([], { hashCode: this.hashCode });
                newIndex.set(keyList, value);
                insertAt(this.values, pos.index, newIndex);
            }
        }
    }
    get(keyList) {
        if (!utils.isArray(keyList)) {
            keyList = [keyList];
        }
        const key = keyList.shift() || undefined;
        const pos = binarySearch(this.keys, key);
        if (keyList.length === 0) {
            if (pos.found) {
                if (this.values[pos.index].isIndex) {
                    return this.values[pos.index].getAll();
                }
                else {
                    return this.values[pos.index].slice();
                }
            }
            else {
                return [];
            }
        }
        else {
            if (pos.found) {
                return this.values[pos.index].get(keyList);
            }
            else {
                return [];
            }
        }
    }
    getAll(opts = {}) {
        let results = [];
        const values = this.values;
        if (opts.order === 'desc') {
            for (let i = values.length - 1; i >= 0; i--) {
                const value = values[i];
                if (value.isIndex) {
                    results = results.concat(value.getAll(opts));
                }
                else {
                    results = results.concat(value);
                }
            }
        }
        else {
            for (const value of values) {
                if (value.isIndex) {
                    results = results.concat(value.getAll(opts));
                }
                else {
                    results = results.concat(value);
                }
            }
        }
        return results;
    }
    visitAll(cb, thisArg) {
        this.values.forEach(value => {
            if (value.isIndex) {
                value.visitAll(cb, thisArg);
            }
            else {
                value.forEach(cb, thisArg);
            }
        });
    }
    between(leftKeys, rightKeys, opts = {}) {
        if (!utils.isArray(leftKeys)) {
            leftKeys = [leftKeys];
        }
        if (!utils.isArray(rightKeys)) {
            rightKeys = [rightKeys];
        }
        utils.fillIn(opts, {
            leftInclusive: true,
            rightInclusive: false,
            limit: undefined,
            offset: 0
        });
        const results = this._between(leftKeys, rightKeys, opts);
        if (opts.limit) {
            return results.slice(opts.offset, opts.limit + opts.offset);
        }
        else {
            return results.slice(opts.offset);
        }
    }
    _between(leftKeys, rightKeys, opts) {
        let results = [];
        const leftKey = leftKeys.shift();
        const rightKey = rightKeys.shift();
        let pos;
        if (leftKey !== undefined) {
            pos = binarySearch(this.keys, leftKey);
        }
        else {
            pos = {
                found: false,
                index: 0
            };
        }
        if (leftKeys.length === 0) {
            if (pos.found && opts.leftInclusive === false) {
                pos.index += 1;
            }
            for (let i = pos.index; i < this.keys.length; i += 1) {
                if (rightKey !== undefined) {
                    if (opts.rightInclusive) {
                        if (this.keys[i] > rightKey) {
                            break;
                        }
                    }
                    else {
                        if (this.keys[i] >= rightKey) {
                            break;
                        }
                    }
                }
                if (this.values[i].isIndex) {
                    results = results.concat(this.values[i].getAll());
                }
                else {
                    results = results.concat(this.values[i]);
                }
                if (opts.limit) {
                    if (results.length >= opts.limit + opts.offset) {
                        break;
                    }
                }
            }
        }
        else {
            for (let i = pos.index; i < this.keys.length; i += 1) {
                const currKey = this.keys[i];
                if (currKey > rightKey) {
                    break;
                }
                if (this.values[i].isIndex) {
                    if (currKey === leftKey) {
                        results = results.concat(this.values[i]._between(utils.copy(leftKeys), rightKeys.map(() => undefined), opts));
                    }
                    else if (currKey === rightKey) {
                        results = results.concat(this.values[i]._between(leftKeys.map(() => undefined), utils.copy(rightKeys), opts));
                    }
                    else {
                        results = results.concat(this.values[i].getAll());
                    }
                }
                else {
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
        }
        else {
            return results;
        }
    }
    peek() {
        return this.values.length ? (this.values[0].isIndex ? this.values[0].peek() : this.values[0]) : [];
    }
    clear() {
        this.keys = [];
        this.values = [];
    }
    insertRecord(data) {
        const keyList = this.fieldList.map(field => utils.isFunction(field) ? field(data) || undefined : data[field] || undefined);
        this.set(keyList, data);
    }
    removeRecord(data) {
        let removed;
        const isUnique = this.hashCode(data) !== undefined;
        this.values.forEach((value, i) => {
            if (value.isIndex) {
                if (value.removeRecord(data)) {
                    if (value.keys.length === 0) {
                        removeAt(this.keys, i);
                        removeAt(this.values, i);
                    }
                    removed = true;
                    return false;
                }
            }
            else {
                let dataLocation = {};
                if (this.keys[i] === undefined || !isUnique) {
                    for (let j = value.length - 1; j >= 0; j--) {
                        if (value[j] === data) {
                            dataLocation = {
                                found: true,
                                index: j
                            };
                            break;
                        }
                    }
                }
                else if (isUnique) {
                    dataLocation = binarySearch(value, data, this.hashCode);
                }
                if (dataLocation.found) {
                    removeAt(value, dataLocation.index);
                    if (value.length === 0) {
                        removeAt(this.keys, i);
                        removeAt(this.values, i);
                    }
                    removed = true;
                    return false;
                }
            }
        });
        return removed ? data : undefined;
    }
    updateRecord(data) {
        const removed = this.removeRecord(data);
        if (removed !== undefined) {
            this.insertRecord(data);
        }
    }
}

const { noValidatePath: noValidatePath$1 } = Record;
const DOMAIN$4 = 'Collection';
const COLLECTION_DEFAULTS = {
    commitOnMerge: true,
    emitRecordEvents: true,
    idAttribute: 'id',
    onConflict: 'merge'
};
/**
 * An ordered set of {@link Record} instances.
 *
 * @example <caption>Collection#constructor</caption>
 * // import { Collection, Record } from 'js-data';
 * const JSData = require('js-data');
 * const {Collection, Record} = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * const user1 = new Record({ id: 1 });
 * const user2 = new Record({ id: 2 });
 * const UserCollection = new Collection([user1, user2]);
 * console.log(UserCollection.get(1) === user1);
 *
 * @class Collection
 * @extends Component
 * @param {array} [records] Initial set of records to insert into the
 * collection.
 * @param {object} [opts] Configuration options.
 * @param {string} [opts.commitOnMerge] See {@link Collection#commitOnMerge}.
 * @param {string} [opts.idAttribute] See {@link Collection#idAttribute}.
 * @param {string} [opts.onConflict="merge"] See {@link Collection#onConflict}.
 * @param {string} [opts.mapper] See {@link Collection#mapper}.
 * @since 3.0.0
 */
class Collection extends Component {
    constructor(records = {}, opts = {}) {
        super(opts);
        /**
         * Object that holds the secondary indexes of this collection.
         *
         * @name Collection#indexes
         * @type {Object.<string, Index>}
         */
        this.indexes = {};
        this._added = {};
        if (records && !utils.isArray(records)) {
            opts = records;
            records = [];
        }
        if (utils.isString(opts)) {
            opts = { idAttribute: opts };
        }
        // Apply user-provided configuration
        utils.fillIn(this, opts);
        // Fill in any missing options with the defaults
        utils.fillIn(this, utils.copy(COLLECTION_DEFAULTS));
        if (!this.queryClass) {
            this.queryClass = Query;
        }
        const idAttribute = this.recordId();
        this.index = new Index([idAttribute], {
            hashCode(obj) {
                return utils.get(obj, idAttribute);
            }
        });
        // Insert initial data into the collection
        if (utils.isObject(records) || (utils.isArray(records) && records.length)) {
            this.add(records);
        }
    }
    /**
     * Used to bind to events emitted by records in this Collection.
     *
     * @method Collection#_onRecordEvent
     * @since 3.0.0
     * @private
     * @param {...*} [args] Args passed to {@link Collection#emit}.
     */
    _onRecordEvent(...args) {
        if (this.emitRecordEvents) {
            this.emit(...args);
        }
    }
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
     * @method Collection#add
     * @since 3.0.0
     * @param {(Object|Object[]|Record|Record[])} records The record or records to insert.
     * @param {object} [opts] Configuration options.
     * @param {boolean} [opts.commitOnMerge=true] See {@link Collection#commitOnMerge}.
     * @param {boolean} [opts.noValidate] See {@link Record#noValidate}.
     * @param {string} [opts.onConflict] See {@link Collection#onConflict}.
     * @returns {(Object|Object[]|Record|Record[])} The added record or records.
     */
    add(records, opts = {}) {
        // Fill in "opts" with the Collection's configuration
        utils._(opts, this);
        records = this.beforeAdd(records, opts) || records;
        // Track whether just one record or an array of records is being inserted
        let singular = false;
        const idAttribute = this.recordId();
        if (!utils.isArray(records)) {
            if (utils.isObject(records)) {
                records = [records];
                singular = true;
            }
            else {
                throw utils.err(`${DOMAIN$4}#add`, 'records')(400, 'object or array', records);
            }
        }
        // Map the provided records to existing records.
        // New records will be inserted. If any records map to existing records,
        // they will be merged into the existing records according to the onConflict
        // option.
        records = records.map(record => {
            const id = this.recordId(record);
            // Grab existing record if there is one
            const existing = id === undefined ? id : this.get(id);
            // If the currently visited record is just a reference to an existing
            // record, then there is nothing to be done. Exit early.
            if (record === existing) {
                return existing;
            }
            if (existing) {
                // Here, the currently visited record corresponds to a record already
                // in the collection, so we need to merge them
                const onConflict = opts.onConflict || this.onConflict;
                if (onConflict !== 'merge' &&
                    onConflict !== 'replace' &&
                    onConflict !== 'skip') {
                    throw utils.err(`${DOMAIN$4}#add`, 'opts.onConflict')(400, 'one of (merge, replace, skip)', onConflict, true);
                }
                const existingNoValidate = existing._get(noValidatePath$1);
                if (opts.noValidate) {
                    // Disable validation
                    existing._set(noValidatePath$1, true);
                }
                if (onConflict === 'merge') {
                    utils.deepMixIn(existing, record);
                }
                else if (onConflict === 'replace') {
                    utils.forOwn(existing, (value, key) => {
                        if (key !== idAttribute && record[key] === undefined) {
                            existing[key] = undefined;
                        }
                    });
                    existing.set(record);
                } // else if(onConflict === 'skip'){ do nothing }
                if (opts.noValidate) {
                    // Restore previous `noValidate` value
                    existing._set(noValidatePath$1, existingNoValidate);
                }
                record = existing;
                if (opts.commitOnMerge && utils.isFunction(record.commit)) {
                    record.commit();
                }
                // Update all indexes in the collection
                this.updateIndexes(record);
            }
            else {
                // Here, the currently visited record does not correspond to any record
                // in the collection, so (optionally) instantiate this record and insert
                // it into the collection
                record = this.mapper ? this.mapper.createRecord(record, opts) : record;
                this.index.insertRecord(record);
                utils.forOwn(this.indexes, (index, name) => {
                    index.insertRecord(record);
                });
                if (record && utils.isFunction(record.on)) {
                    record.on('all', this._onRecordEvent, this);
                }
            }
            return record;
        });
        // Finally, return the inserted data
        const result = singular ? records[0] : records;
        if (!opts.silent) {
            this.emit('add', result);
        }
        return this.afterAdd(records, opts, result) || result;
    }
    /**
     * Lifecycle hook called by {@link Collection#add}. If this method returns a
     * value then {@link Collection#add} will return that same value.
     *
     * @method Collection#method
     * @since 3.0.0
     * @param {(Object|Object[]|Record|Record[])} record The record or records
     * that were added to this Collection by {@link Collection#add}.
     * @param {object} opts The `opts` argument passed to {@link Collection#add}.
     * @param result
     */
    afterAdd(record, opts, result) {
        return null;
    }
    /**
     * Lifecycle hook called by {@link Collection#remove}. If this method returns
     * a value then {@link Collection#remove} will return that same value.
     *
     * @method Collection#afterRemove
     * @since 3.0.0
     * @param {(string|number)} id The `id` argument passed to {@link Collection#remove}.
     * @param {object} opts The `opts` argument passed to {@link Collection#remove}.
     * @param {object} record The result that will be returned by {@link Collection#remove}.
     */
    afterRemove(id, opts, record) {
        return null;
    }
    /**
     * Lifecycle hook called by {@link Collection#removeAll}. If this method
     * returns a value then {@link Collection#removeAll} will return that same
     * value.
     *
     * @method Collection#afterRemoveAll
     * @since 3.0.0
     * @param {object} query The `query` argument passed to {@link Collection#removeAll}.
     * @param {object} opts The `opts` argument passed to {@link Collection#removeAll}.
     * @param {object} records The result that will be returned by {@link Collection#removeAll}.
     */
    afterRemoveAll(query, opts, records) {
        return null;
    }
    /**
     * Lifecycle hook called by {@link Collection#add}. If this method returns a
     * value then the `records` argument in {@link Collection#add} will be
     * re-assigned to the returned value.
     *
     * @method Collection#beforeAdd
     * @since 3.0.0
     * @param {(Object|Object[]|Record|Record[])} records The `records` argument passed to {@link Collection#add}.
     * @param {object} opts The `opts` argument passed to {@link Collection#add}.
     */
    beforeAdd(records, opts) {
        return null;
    }
    /**
     * Lifecycle hook called by {@link Collection#remove}.
     *
     * @method Collection#beforeRemove
     * @since 3.0.0
     * @param {(string|number)} id The `id` argument passed to {@link Collection#remove}.
     * @param {object} opts The `opts` argument passed to {@link Collection#remove}.
     */
    beforeRemove(id, opts) {
        return null;
    }
    /**
     * Lifecycle hook called by {@link Collection#removeAll}.
     *
     * @method Collection#beforeRemoveAll
     * @since 3.0.0
     * @param {object} query The `query` argument passed to {@link Collection#removeAll}.
     * @param {object} opts The `opts` argument passed to {@link Collection#removeAll}.
     */
    beforeRemoveAll(query, opts) {
        return null;
    }
    /**
     * Find all records between two boundaries.
     *
     * Shortcut for `collection.query().between(18, 30, { index: 'age' }).run()`
     *
     * @example
     * // Get all users ages 18 to 30
     * const users = collection.between(18, 30, { index: 'age' });
     *
     * @example
     * // Same as above
     * const users = collection.between([18], [30], { index: 'age' });
     *
     * @method Collection#between
     * @since 3.0.0
     * @param {array} leftKeys Keys defining the left boundary.
     * @param {array} rightKeys Keys defining the right boundary.
     * @param {object} [opts] Configuration options.
     * @param {string} [opts.index] Name of the secondary index to use in the
     * query. If no index is specified, the main index is used.
     * @param {boolean} [opts.leftInclusive=true] Whether to include records
     * on the left boundary.
     * @param {boolean} [opts.rightInclusive=false] Whether to include records
     * on the left boundary.
     * @param {boolean} [opts.limit] Limit the result to a certain number.
     * @param {boolean} [opts.offset] The number of resulting records to skip.
     * @returns {Object[]|Record[]} The result.
     */
    between(leftKeys, rightKeys, opts) {
        return this.query()
            .between(leftKeys, rightKeys, opts)
            .run();
    }
    /**
     * Create a new secondary index on the contents of the collection.
     *
     * @example
     * // Index users by age
     * collection.createIndex('age');
     *
     * @example
     * // Index users by status and role
     * collection.createIndex('statusAndRole', ['status', 'role']);
     *
     * @method Collection#createIndex
     * @since 3.0.0
     * @param {string} name The name of the new secondary index.
     * @param {string[]} [fieldList] Array of field names to use as the key or
     * compound key of the new secondary index. If no fieldList is provided, then
     * the name will also be the field that is used to index the collection.
     * @param opts
     */
    createIndex(name, fieldList, opts = {}) {
        if (utils.isString(name) && fieldList === undefined) {
            fieldList = [name];
        }
        opts.hashCode = opts.hashCode || (obj => this.recordId(obj));
        const index = (this.indexes[name] = new Index(fieldList, opts));
        this.index.visitAll(index.insertRecord, index);
    }
    /**
     * Find the record or records that match the provided query or pass the
     * provided filter function.
     *
     * Shortcut for `collection.query().filter(queryOrFn[, thisArg]).run()`
     *
     * @example <caption>Collection#filter</caption>
     * const JSData = require('js-data');
     * const { Collection } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const collection = new Collection([
     *   { id: 1, status: 'draft', created_at_timestamp: new Date().getTime() }
     * ]);
     *
     * // Get the draft posts created less than three months ago
     * let posts = collection.filter({
     *   where: {
     *     status: {
     *       '==': 'draft'
     *     },
     *     created_at_timestamp: {
     *       '>=': (new Date().getTime() - (1000 \* 60 \* 60 \* 24 \* 30 \* 3)) // 3 months ago
     *     }
     *   }
     * });
     * console.log(posts);
     *
     * // Use a custom filter function
     * posts = collection.filter((post) => post.id % 2 === 0);
     *
     * @method Collection#filter
     * @param {(Object|Function)} [queryOrFn={}] Selection query or filter
     * function.
     * @param {object} [thisArg] Context to which to bind `queryOrFn` if
     * `queryOrFn` is a function.
     * @returns {Array} The result.
     * @see query
     * @since 3.0.0
     */
    filter(queryOrFn, thisArg) {
        return this.query()
            .filter(queryOrFn, thisArg)
            .run();
    }
    /**
     * Iterate over all records.
     *
     * @example
     * collection.forEach(function (record) {
     *   // do something
     * });
     *
     * @method Collection#forEach
     * @since 3.0.0
     * @param {Function} forEachFn Iteration function.
     * @param {*} [thisArg] Context to which to bind `forEachFn`.
     * @returns {Array} The result.
     */
    forEach(forEachFn, thisArg) {
        this.index.visitAll(forEachFn, thisArg);
    }
    /**
     * Get the record with the given id.
     *
     * @method Collection#get
     * @since 3.0.0
     * @param {(string|number)} id The primary key of the record to get.
     * @returns {(Object|Record)} The record with the given id.
     */
    get(id) {
        const instances = id === undefined
            ? []
            : this.query()
                .get(id)
                .run();
        return instances.length ? instances[0] : undefined;
    }
    getAll(...args) {
        return this.query()
            .getAll(...args)
            .run();
    }
    /**
     * Return the index with the given name. If no name is provided, return the
     * main index. Throws an error if the specified index does not exist.
     *
     * @method Collection#getIndex
     * @since 3.0.0
     * @param {string} [name] The name of the index to retrieve.
     */
    getIndex(name) {
        const index = name ? this.indexes[name] : this.index;
        if (!index) {
            throw utils.err(`${DOMAIN$4}#getIndex`, name)(404, 'index');
        }
        return index;
    }
    /**
     * Limit the result.
     *
     * Shortcut for `collection.query().limit(maximumNumber).run()`
     *
     * @example
     * const posts = collection.limit(10);
     *
     * @method Collection#limit
     * @since 3.0.0
     * @param {number} num The maximum number of records to keep in the result.
     * @returns {Array} The result.
     */
    limit(num) {
        return this.query()
            .limit(num)
            .run();
    }
    /**
     * Apply a mapping function to all records.
     *
     * @example
     * const names = collection.map((user) => user.name);
     *
     * @method Collection#map
     * @since 3.0.0
     * @param {Function} mapFn Mapping function.
     * @param {*} [thisArg] Context to which to bind `mapFn`.
     * @returns {Array} The result of the mapping.
     */
    map(cb, thisArg) {
        const data = [];
        this.index.visitAll(value => {
            data.push(cb.call(thisArg, value));
        });
        return data;
    }
    /**
     * Return the result of calling the specified function on each record in this
     * collection's main index.
     *
     * @method Collection#mapCall
     * @since 3.0.0
     * @param {string} funcName Name of function to call
     * @param {...*} [args] Remaining arguments to be passed to the function.
     * @returns {Array} The result.
     */
    mapCall(funcName, ...args) {
        const data = [];
        this.index.visitAll(record => {
            data.push(record[funcName](...args));
        });
        return data;
    }
    /**
     * Return all "unsaved" (not uniquely identifiable) records in this colleciton.
     *
     * @method Collection#prune
     * @param {object} [opts] Configuration options, passed to {@link Collection#removeAll}.
     * @since 3.0.0
     * @returns {Array} The removed records, if any.
     */
    prune(opts) {
        return this.removeAll(this.unsaved(), opts);
    }
    /**
     * Create a new query to be executed against the contents of the collection.
     * The result will be all or a subset of the contents of the collection.
     *
     * @example
     * // Grab page 2 of users between ages 18 and 30
     * collection.query()
     *   .between(18, 30, { index: 'age' }) // between ages 18 and 30
     *   .skip(10) // second page
     *   .limit(10) // page size
     *   .run();
     *
     * @method Collection#query
     * @since 3.0.0
     * @returns {Query} New query object.
     */
    query() {
        const Ctor = this.queryClass;
        return new Ctor(this);
    }
    /**
     * Return the primary key of the given, or if no record is provided, return the
     * name of the field that holds the primary key of records in this Collection.
     *
     * @method Collection#recordId
     * @since 3.0.0
     * @param {(Object|Record)} [record] The record whose primary key is to be
     * returned.
     * @returns {(string|number)} Primary key or name of field that holds primary
     * key.
     */
    recordId(record) {
        if (record) {
            return utils.get(record, this.recordId());
        }
        return this.mapper ? this.mapper.idAttribute : this.idAttribute;
    }
    /**
     * Reduce the data in the collection to a single value and return the result.
     *
     * @example
     * const totalVotes = collection.reduce((prev, record) => {
     *   return prev + record.upVotes + record.downVotes;
     * }, 0);
     *
     * @method Collection#reduce
     * @since 3.0.0
     * @param {Function} cb Reduction callback.
     * @param {*} initialValue Initial value of the reduction.
     * @returns {*} The result.
     */
    reduce(cb, initialValue) {
        const data = this.getAll();
        return data.reduce(cb, initialValue);
    }
    /**
     * Remove the record with the given id from this Collection.
     *
     * @method Collection#remove
     * @since 3.0.0
     * @param {(string|number|object|Record)} idOrRecord The primary key of the
     * record to be removed, or a reference to the record that is to be removed.
     * @param {object} [opts] Configuration options.
     * @returns {Object|Record} The removed record, if any.
     */
    remove(idOrRecord, opts = {}) {
        this.beforeRemove(idOrRecord, opts);
        let record = utils.isSorN(idOrRecord) ? this.get(idOrRecord) : idOrRecord;
        // The record is in the collection, remove it
        if (utils.isObject(record)) {
            record = this.index.removeRecord(record);
            if (record) {
                utils.forOwn(this.indexes, (index, name) => {
                    index.removeRecord(record);
                });
                if (utils.isFunction(record.off)) {
                    record.off('all', this._onRecordEvent, this);
                }
                if (!opts.silent) {
                    this.emit('remove', record);
                }
            }
        }
        return this.afterRemove(idOrRecord, opts, record) || record;
    }
    /**
     * Remove from this collection the given records or the records selected by
     * the given "query".
     *
     * @method Collection#removeAll
     * @since 3.0.0
     * @param {Object|Object[]|Record[]} [queryOrRecords={}] Records to be removed or selection query. See {@link query}.
     * @param {object} [queryOrRecords.where] See {@link query.where}.
     * @param {number} [queryOrRecords.offset] See {@link query.offset}.
     * @param {number} [queryOrRecords.limit] See {@link query.limit}.
     * @param {string|Array[]} [queryOrRecords.orderBy] See {@link query.orderBy}.
     * @param {object} [opts] Configuration options.
     * @returns {(Object[]|Record[])} The removed records, if any.
     */
    removeAll(queryOrRecords, opts = {}) {
        this.beforeRemoveAll(queryOrRecords, opts);
        let records = utils.isArray(queryOrRecords)
            ? queryOrRecords.slice()
            : this.filter(queryOrRecords);
        // Remove each selected record from the collection
        const optsCopy = utils.plainCopy(opts);
        optsCopy.silent = true;
        records = records
            .map(record => this.remove(record, optsCopy))
            .filter(record => record);
        if (!opts.silent) {
            this.emit('remove', records);
        }
        return this.afterRemoveAll(queryOrRecords, opts, records) || records;
    }
    /**
     * Skip a number of results.
     *
     * Shortcut for `collection.query().skip(numberToSkip).run()`
     *
     * @example
     * const posts = collection.skip(10);
     *
     * @method Collection#skip
     * @since 3.0.0
     * @param {number} num The number of records to skip.
     * @returns {Array} The result.
     */
    skip(num) {
        return this.query()
            .skip(num)
            .run();
    }
    /**
     * Return the plain JSON representation of all items in this collection.
     * Assumes records in this collection have a toJSON method.
     *
     * @method Collection#toJSON
     * @since 3.0.0
     * @param {object} [opts] Configuration options.
     * @param {string[]} [opts.with] Array of relation names or relation fields
     * to include in the representation.
     * @returns {Array} The records.
     */
    toJSON(opts) {
        return this.mapCall('toJSON', opts);
    }
    /**
     * Return all "unsaved" (not uniquely identifiable) records in this colleciton.
     *
     * @method Collection#unsaved
     * @since 3.0.0
     * @returns {Array} The unsaved records, if any.
     */
    unsaved(opts) {
        return this.index.get();
    }
    /**
     * Update a record's position in a single index of this collection. See
     * {@link Collection#updateIndexes} to update a record's position in all
     * indexes at once.
     *
     * @method Collection#updateIndex
     * @since 3.0.0
     * @param {object} record The record to update.
     * @param {object} [opts] Configuration options.
     * @param {string} [opts.index] The index in which to update the record's
     * position. If you don't specify an index then the record will be updated
     * in the main index.
     */
    updateIndex(record, opts = {}) {
        this.getIndex(opts.index).updateRecord(record);
    }
    /**
     * Updates all indexes in this collection for the provided record. Has no
     * effect if the record is not in the collection.
     *
     * @method Collection#updateIndexes
     * @since 3.0.0
     * @param {object} record TODO
     */
    updateIndexes(record) {
        this.index.updateRecord(record);
        utils.forOwn(this.indexes, index => index.updateRecord(record));
    }
}
/**
 * Fired when a record changes. Only works for records that have tracked changes.
 * See {@link Collection~changeListener} on how to listen for this event.
 *
 * @event Collection#change
 * @see Collection~changeListener
 */
/**
 * Callback signature for the {@link Collection#event:change} event.
 *
 * @example
 * function onChange (record, changes) {
 *   // do something
 * }
 * collection.on('change', onChange);
 *
 * @callback Collection~changeListener
 * @param {Record} The Record that changed.
 * @param {object} The changes.
 * @see Collection#event:change
 * @since 3.0.0
 */
/**
 * Fired when one or more records are added to the Collection. See
 * {@link Collection~addListener} on how to listen for this event.
 *
 * @event Collection#add
 * @see Collection~addListener
 * @see Collection#event:add
 * @see Collection#add
 */
/**
 * Callback signature for the {@link Collection#event:add} event.
 *
 * @example
 * function onAdd (recordOrRecords) {
 *   // do something
 * }
 * collection.on('add', onAdd);
 *
 * @callback Collection~addListener
 * @param {Record|Record[]} The Record or Records that were added.
 * @see Collection#event:add
 * @see Collection#add
 * @since 3.0.0
 */
/**
 * Fired when one or more records are removed from the Collection. See
 * {@link Collection~removeListener} for how to listen for this event.
 *
 * @event Collection#remove
 * @see Collection~removeListener
 * @see Collection#event:remove
 * @see Collection#remove
 * @see Collection#removeAll
 */
/**
 * Callback signature for the {@link Collection#event:remove} event.
 *
 * @example
 * function onRemove (recordsOrRecords) {
 *   // do something
 * }
 * collection.on('remove', onRemove);
 *
 * @callback Collection~removeListener
 * @param {Record|Record[]} Record or Records that were removed.
 * @see Collection#event:remove
 * @see Collection#remove
 * @see Collection#removeAll
 * @since 3.0.0
 */
/**
 * Create a subclass of this Collection:
 * @example <caption>Collection.extend</caption>
 * const JSData = require('js-data');
 * const { Collection } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * // Extend the class using ES2015 class syntax.
 * class CustomCollectionClass extends Collection {
 *   foo () { return 'bar'; }
 *   static beep () { return 'boop'; }
 * }
 * const customCollection = new CustomCollectionClass();
 * console.log(customCollection.foo());
 * console.log(CustomCollectionClass.beep());
 *
 * // Extend the class using alternate method.
 * const OtherCollectionClass = Collection.extend({
 *   foo () { return 'bar'; }
 * }, {
 *   beep () { return 'boop'; }
 * });
 * const otherCollection = new OtherCollectionClass();
 * console.log(otherCollection.foo());
 * console.log(OtherCollectionClass.beep());
 *
 * // Extend the class, providing a custom constructor.
 * function AnotherCollectionClass () {
 *   Collection.call(this);
 *   this.created_at = new Date().getTime();
 * }
 * Collection.extend({
 *   constructor: AnotherCollectionClass,
 *   foo () { return 'bar'; }
 * }, {
 *   beep () { return 'boop'; }
 * });
 * const anotherCollection = new AnotherCollectionClass();
 * console.log(anotherCollection.created_at);
 * console.log(anotherCollection.foo());
 * console.log(AnotherCollectionClass.beep());
 *
 * @method Collection.extend
 * @param {object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {object} [props.constructor] Provide a custom constructor function
 * to be used as the subclass itself.
 * @param {object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this Collection class.
 * @since 3.0.0
 */

class TsDataError extends Error {
}

const DOMAIN$5 = 'Schema';
/**
 * A function map for each of the seven primitive JSON types defined by the core specification.
 * Each function will check a given value and return true or false if the value is an instance of that type.
 * ```
 *   types.integer(1) // returns true
 *   types.string({}) // returns false
 * ```
 * http://json-schema.org/latest/json-schema-core.html#anchor8
 * @name Schema.types
 * @type {object}
 */
const types = {
    array: utils.isArray,
    boolean: utils.isBoolean,
    integer: utils.isInteger,
    null: utils.isNull,
    number: utils.isNumber,
    object: utils.isObject,
    string: utils.isString
};
/**
 * @ignore
 */
function segmentToString(segment, prev) {
    let str = '';
    if (segment) {
        if (utils.isNumber(segment)) {
            str += `[${segment}]`;
        }
        else if (prev) {
            str += `.${segment}`;
        }
        else {
            str += `${segment}`;
        }
    }
    return str;
}
/**
 * @ignore
 */
function makePath(opts = {}) {
    let path = '';
    const segments = opts.path || [];
    segments.forEach(segment => {
        path += segmentToString(segment, path);
    });
    path += segmentToString(opts.prop, path);
    return path;
}
/**
 * @ignore
 */
function makeError(actual, expected, opts) {
    return {
        expected,
        actual: '' + actual,
        path: makePath(opts)
    };
}
/**
 * @ignore
 */
function addError(actual, expected, opts, errors) {
    errors.push(makeError(actual, expected, opts));
}
/**
 * @ignore
 */
function maxLengthCommon(keyword, value, schema, opts) {
    const max = schema[keyword];
    if (value.length > max) {
        return makeError(value.length, `length no more than ${max}`, opts);
    }
}
/**
 * @ignore
 */
function minLengthCommon(keyword, value, schema, opts) {
    const min = schema[keyword];
    if (value.length < min) {
        return makeError(value.length, `length no less than ${min}`, opts);
    }
}
/**
 * A map of all object member validation functions for each keyword defined in the JSON Schema.
 * @name Schema.validationKeywords
 * @type {object}
 */
const validationKeywords = {
    /**
     * Validates the provided value against all schemas defined in the Schemas `allOf` keyword.
     * The instance is valid against if and only if it is valid against all the schemas declared in the Schema's value.
     *
     * The value of this keyword MUST be an array. This array MUST have at least one element.
     * Each element of this array MUST be a valid JSON Schema.
     *
     * see http://json-schema.org/latest/json-schema-validation.html#anchor82
     *
     * @name Schema.validationKeywords.allOf
     * @method
     * @param {*} value Value to be validated.
     * @param {object} schema Schema containing the `allOf` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    allOf(value, schema, opts) {
        let allErrors = [];
        schema.allOf.forEach(_schema => {
            allErrors = allErrors.concat(validate(value, _schema, opts) || []);
        });
        return allErrors.length ? allErrors : undefined;
    },
    /**
     * Validates the provided value against all schemas defined in the Schemas `anyOf` keyword.
     * The instance is valid against this keyword if and only if it is valid against
     * at least one of the schemas in this keyword's value.
     *
     * The value of this keyword MUST be an array. This array MUST have at least one element.
     * Each element of this array MUST be an object, and each object MUST be a valid JSON Schema.
     * see http://json-schema.org/latest/json-schema-validation.html#anchor85
     *
     * @name Schema.validationKeywords.anyOf
     * @method
     * @param {*} value Value to be validated.
     * @param {object} schema Schema containing the `anyOf` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    anyOf(value, schema, opts) {
        let validated = false;
        let allErrors = [];
        schema.anyOf.forEach(_schema => {
            const errors = validate(value, _schema, opts);
            if (errors) {
                allErrors = allErrors.concat(errors);
            }
            else {
                validated = true;
            }
        });
        return validated ? undefined : allErrors;
    },
    /**
     * http://json-schema.org/latest/json-schema-validation.html#anchor70
     *
     * @name Schema.validationKeywords.dependencies
     * @method
     * @param {*} value TODO
     * @param {object} schema TODO
     * @param {object} opts TODO
     */
    dependencies(value, schema, opts) {
        // TODO
    },
    /**
     * Validates the provided value against an array of possible values defined by the Schema's `enum` keyword
     * Validation succeeds if the value is deeply equal to one of the values in the array.
     * see http://json-schema.org/latest/json-schema-validation.html#anchor76
     *
     * @name Schema.validationKeywords.enum
     * @method
     * @param {*} value Value to validate
     * @param {object} schema Schema containing the `enum` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    enum(value, schema, opts) {
        const possibleValues = schema.enum;
        if (utils.findIndex(possibleValues, item => utils.deepEqual(item, value)) === -1) {
            return makeError(value, `one of (${possibleValues.join(', ')})`, opts);
        }
    },
    /**
     * Validates each of the provided array values against a schema or an array of schemas defined by the Schema's
     * `items` keyword
     * see http://json-schema.org/latest/json-schema-validation.html#anchor37 for validation rules.
     *
     * @name Schema.validationKeywords.items
     * @method
     * @param {*} value Array to be validated.
     * @param {object} schema Schema containing the items keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    items(value, schema, opts = {}) {
        // TODO: additionalItems
        let items = schema.items;
        let errors = [];
        const checkingTuple = utils.isArray(items);
        const length = value.length;
        for (let prop = 0; prop < length; prop++) {
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
     * Validates the provided number against a maximum value defined by the Schema's `maximum` keyword
     * Validation succeeds if the value is a number, and is less than, or equal to, the value of this keyword.
     * http://json-schema.org/latest/json-schema-validation.html#anchor17
     *
     * @name Schema.validationKeywords.maximum
     * @method
     * @param {*} value Number to validate against the keyword.
     * @param {object} schema Schema containing the `maximum` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    maximum(value, schema, opts) {
        // Must be a number
        const maximum = schema.maximum;
        // Must be a boolean
        // Depends on maximum
        // default: false
        const exclusiveMaximum = schema.exclusiveMaximum;
        if (typeof value === typeof maximum && !(exclusiveMaximum ? maximum > value : maximum >= value)) {
            return exclusiveMaximum
                ? makeError(value, `no more than nor equal to ${maximum}`, opts)
                : makeError(value, `no more than ${maximum}`, opts);
        }
    },
    /**
     * Validates the length of the provided array against a maximum value defined by the Schema's `maxItems` keyword.
     * Validation succeeds if the length of the array is less than, or equal to the value of this keyword.
     * see http://json-schema.org/latest/json-schema-validation.html#anchor42
     *
     * @name Schema.validationKeywords.maxItems
     * @method
     * @param {*} value Array to be validated.
     * @param {object} schema Schema containing the `maxItems` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    maxItems(value, schema, opts) {
        if (utils.isArray(value)) {
            return maxLengthCommon('maxItems', value, schema, opts);
        }
    },
    /**
     * Validates the length of the provided string against a maximum value defined in the Schema's `maxLength` keyword.
     * Validation succeeds if the length of the string is less than, or equal to the value of this keyword.
     * see http://json-schema.org/latest/json-schema-validation.html#anchor26
     *
     * @name Schema.validationKeywords.maxLength
     * @method
     * @param {*} value String to be validated.
     * @param {object} schema Schema containing the `maxLength` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    maxLength(value, schema, opts) {
        return maxLengthCommon('maxLength', value, schema, opts);
    },
    /**
     * Validates the count of the provided object's properties against a maximum value defined in the Schema's
     * `maxProperties` keyword.
     * Validation succeeds if the object's property count is less than, or equal to the value of this keyword.
     * see http://json-schema.org/latest/json-schema-validation.html#anchor54
     *
     * @name Schema.validationKeywords.maxProperties
     * @method
     * @param {*} value Object to be validated.
     * @param {object} schema Schema containing the `maxProperties` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    maxProperties(value, schema, opts) {
        // validate only objects
        if (!utils.isObject(value))
            return;
        const maxProperties = schema.maxProperties;
        const length = Object.keys(value).length;
        if (length > maxProperties) {
            return makeError(length, `no more than ${maxProperties} properties`, opts);
        }
    },
    /**
     * Validates the provided value against a minimum value defined by the Schema's `minimum` keyword
     * Validation succeeds if the value is a number and is greater than, or equal to, the value of this keyword.
     * http://json-schema.org/latest/json-schema-validation.html#anchor21
     *
     * @name Schema.validationKeywords.minimum
     * @method
     * @param {*} value Number to validate against the keyword.
     * @param {object} schema Schema containing the `minimum` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    minimum(value, schema, opts) {
        // Must be a number
        const minimum = schema.minimum;
        // Must be a boolean
        // Depends on minimum
        // default: false
        const exclusiveMinimum = schema.exclusiveMinimum;
        if (typeof value === typeof minimum && !(exclusiveMinimum ? value > minimum : value >= minimum)) {
            return exclusiveMinimum
                ? makeError(value, `no less than nor equal to ${minimum}`, opts)
                : makeError(value, `no less than ${minimum}`, opts);
        }
    },
    /**
     * Validates the length of the provided array against a minimum value defined by the Schema's `minItems` keyword.
     * Validation succeeds if the length of the array is greater than, or equal to the value of this keyword.
     * see http://json-schema.org/latest/json-schema-validation.html#anchor45
     *
     * @name Schema.validationKeywords.minItems
     * @method
     * @param {*} value Array to be validated.
     * @param {object} schema Schema containing the `minItems` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    minItems(value, schema, opts) {
        if (utils.isArray(value)) {
            return minLengthCommon('minItems', value, schema, opts);
        }
    },
    /**
     * Validates the length of the provided string against a minimum value defined in the Schema's `minLength` keyword.
     * Validation succeeds if the length of the string is greater than, or equal to the value of this keyword.
     * see http://json-schema.org/latest/json-schema-validation.html#anchor29
     *
     * @name Schema.validationKeywords.minLength
     * @method
     * @param {*} value String to be validated.
     * @param {object} schema Schema containing the `minLength` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    minLength(value, schema, opts) {
        return minLengthCommon('minLength', value, schema, opts);
    },
    /**
     * Validates the count of the provided object's properties against a minimum value defined in the Schema's
     * `minProperties` keyword.
     * Validation succeeds if the object's property count is greater than, or equal to the value of this keyword.
     * see http://json-schema.org/latest/json-schema-validation.html#anchor57
     *
     * @name Schema.validationKeywords.minProperties
     * @method
     * @param {*} value Object to be validated.
     * @param {object} schema Schema containing the `minProperties` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    minProperties(value, schema, opts) {
        // validate only objects
        if (!utils.isObject(value))
            return;
        const minProperties = schema.minProperties;
        const length = Object.keys(value).length;
        if (length < minProperties) {
            return makeError(length, `no more than ${minProperties} properties`, opts);
        }
    },
    /**
     * Validates the provided number is a multiple of the number defined in the Schema's `multipleOf` keyword.
     * Validation succeeds if the number can be divided equally into the value of this keyword.
     * see http://json-schema.org/latest/json-schema-validation.html#anchor14
     *
     * @name Schema.validationKeywords.multipleOf
     * @method
     * @param {*} value Number to be validated.
     * @param {object} schema Schema containing the `multipleOf` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    multipleOf(value, schema, opts) {
        const multipleOf = schema.multipleOf;
        if (utils.isNumber(value)) {
            if ((value / multipleOf) % 1 !== 0) {
                return makeError(value, `multipleOf ${multipleOf}`, opts);
            }
        }
    },
    /**
     * Validates the provided value is not valid with any of the schemas defined in the Schema's `not` keyword.
     * An instance is valid against this keyword if and only if it is NOT valid against the schemas in this keyword's
     * value.
     *
     * see http://json-schema.org/latest/json-schema-validation.html#anchor91
     * @name Schema.validationKeywords.not
     * @method
     * @param {*} value to be checked.
     * @param {object} schema Schema containing the not keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    not(value, schema, opts) {
        if (!validate(value, schema.not, opts)) {
            // TODO: better messaging
            return makeError('succeeded', 'should have failed', opts);
        }
    },
    /**
     * Validates the provided value is valid with one and only one of the schemas defined in the Schema's `oneOf` keyword.
     * An instance is valid against this keyword if and only if it is valid against a single schemas in this keyword's
     * value.
     *
     * see http://json-schema.org/latest/json-schema-validation.html#anchor88
     * @name Schema.validationKeywords.oneOf
     * @method
     * @param {*} value to be checked.
     * @param {object} schema Schema containing the `oneOf` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    oneOf(value, schema, opts) {
        let validated = false;
        let allErrors = [];
        schema.oneOf.forEach(_schema => {
            const errors = validate(value, _schema, opts);
            if (errors) {
                allErrors = allErrors.concat(errors);
            }
            else if (validated) {
                allErrors = [makeError('valid against more than one', 'valid against only one', opts)];
                validated = false;
                return false;
            }
            else {
                validated = true;
            }
        });
        return validated ? undefined : allErrors;
    },
    /**
     * Validates the provided string matches a pattern defined in the Schema's `pattern` keyword.
     * Validation succeeds if the string is a match of the regex value of this keyword.
     *
     * see http://json-schema.org/latest/json-schema-validation.html#anchor33
     * @name Schema.validationKeywords.pattern
     * @method
     * @param {*} value String to be validated.
     * @param {object} schema Schema containing the `pattern` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    pattern(value, schema, opts) {
        const pattern = schema.pattern;
        if (utils.isString(value) && !value.match(pattern)) {
            return makeError(value, pattern, opts);
        }
    },
    /**
     * Validates the provided object's properties against a map of values defined in the Schema's `properties` keyword.
     * Validation succeeds if the object's property are valid with each of the schema's in the provided map.
     * Validation also depends on the additionalProperties and or patternProperties.
     *
     * see http://json-schema.org/latest/json-schema-validation.html#anchor64 for more info.
     *
     * @name Schema.validationKeywords.properties
     * @method
     * @param {*} value Object to be validated.
     * @param {object} schema Schema containing the `properties` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    properties(value, schema, opts = {}) {
        if (utils.isArray(value)) {
            return;
        }
        // Can be a boolean or an object
        // Technically the default is an "empty schema", but here "true" is
        // functionally the same
        const additionalProperties = schema.additionalProperties === undefined ? true : schema.additionalProperties;
        const validated = [];
        // "p": The property set from "properties".
        // Default is an object
        const properties = schema.properties || {};
        // "pp": The property set from "patternProperties".
        // Default is an object
        const patternProperties = schema.patternProperties || {};
        let errors = [];
        utils.forOwn(properties, (_schema, prop) => {
            opts.prop = prop;
            errors = errors.concat(validate(value[prop], _schema, opts) || []);
            validated.push(prop);
        });
        const toValidate = utils.omit(value, validated);
        utils.forOwn(patternProperties, (_schema, pattern) => {
            utils.forOwn(toValidate, (undef, prop) => {
                if (prop.match(pattern)) {
                    opts.prop = prop;
                    errors = errors.concat(validate(value[prop], _schema, opts) || []);
                    validated.push(prop);
                }
            });
        });
        const keys = Object.keys(utils.omit(value, validated));
        // If "s" is not empty, validation fails
        if (additionalProperties === false) {
            if (keys.length) {
                const origProp = opts.prop;
                opts.prop = '';
                addError(`extra fields: ${keys.join(', ')}`, 'no extra fields', opts, errors);
                opts.prop = origProp;
            }
        }
        else if (utils.isObject(additionalProperties)) {
            // Otherwise, validate according to provided schema
            keys.forEach(prop => {
                opts.prop = prop;
                errors = errors.concat(validate(value[prop], additionalProperties, opts) || []);
            });
        }
        return errors.length ? errors : undefined;
    },
    /**
     * Validates the provided object's has all properties listed in the Schema's `properties` keyword array.
     * Validation succeeds if the object contains all properties provided in the array value of this keyword.
     * see http://json-schema.org/latest/json-schema-validation.html#anchor61
     *
     * @name Schema.validationKeywords.required
     * @method
     * @param {*} value Object to be validated.
     * @param {object} schema Schema containing the `required` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    required(value, schema, opts = {}) {
        const required = schema.required;
        const errors = [];
        if (!opts.existingOnly) {
            required.forEach(prop => {
                if (utils.get(value, prop) === undefined) {
                    const prevProp = opts.prop;
                    opts.prop = prop;
                    addError(undefined, 'a value', opts, errors);
                    opts.prop = prevProp;
                }
            });
        }
        return errors.length ? errors : undefined;
    },
    /**
     * Validates the provided value's type is equal to the type, or array of types, defined in the Schema's `type`
     * keyword.
     * see http://json-schema.org/latest/json-schema-validation.html#anchor79
     *
     * @name Schema.validationKeywords.type
     * @method
     * @param {*} value Value to be validated.
     * @param {object} schema Schema containing the `type` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    type(value, schema, opts) {
        let type = schema.type;
        let validType;
        // Can be one of several types
        if (utils.isString(type)) {
            type = [type];
        }
        // Try to match the value against an expected type
        type.forEach(_type => {
            // TODO: throw an error if type is not defined
            if (types[_type](value, schema, opts)) {
                // Matched a type
                validType = _type;
                return false;
            }
        });
        // Value did not match any expected type
        if (!validType) {
            return makeError(value !== undefined && value !== null ? typeof value : '' + value, `one of (${type.join(', ')})`, opts);
        }
        // Run keyword validators for matched type
        // http://json-schema.org/latest/json-schema-validation.html#anchor12
        const validator = typeGroupValidators[validType];
        if (validator) {
            return validator(value, schema, opts);
        }
    },
    /**
     * Validates the provided array values are unique.
     * Validation succeeds if the items in the array are unique, but only if the value of this keyword is true
     * see http://json-schema.org/latest/json-schema-validation.html#anchor49
     *
     * @name Schema.validationKeywords.uniqueItems
     * @method
     * @param {*} value Array to be validated.
     * @param {object} schema Schema containing the `uniqueItems` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    uniqueItems(value, schema, opts) {
        var _a;
        if (((_a = value) === null || _a === void 0 ? void 0 : _a.length) && schema.uniqueItems) {
            const length = value.length;
            let item, i, j;
            // Check n - 1 items
            for (i = length - 1; i > 0; i--) {
                item = value[i];
                // Only compare against unchecked items
                for (j = i - 1; j >= 0; j--) {
                    // Found a duplicate
                    if (utils.deepEqual(item, value[j])) {
                        return makeError(item, 'no duplicates', opts);
                    }
                }
            }
        }
    }
};
/**
 * @ignore
 */
function runOps(ops, value, schema, opts) {
    let errors = [];
    ops.forEach(op => {
        if (schema[op] !== undefined) {
            errors = errors.concat(validationKeywords[op](value, schema, opts) || []);
        }
    });
    return errors.length ? errors : undefined;
}
/**
 * Validation keywords validated for any type:
 *
 * - `enum`
 * - `type`
 * - `allOf`
 * - `anyOf`
 * - `oneOf`
 * - `not`
 *
 * @name Schema.ANY_OPS
 * @type {string[]}
 */
const ANY_OPS = ['enum', 'type', 'allOf', 'anyOf', 'oneOf', 'not'];
/**
 * Validation keywords validated for array types:
 *
 * - `items`
 * - `maxItems`
 * - `minItems`
 * - `uniqueItems`
 *
 * @name Schema.ARRAY_OPS
 * @type {string[]}
 */
const ARRAY_OPS = ['items', 'maxItems', 'minItems', 'uniqueItems'];
/**
 * Validation keywords validated for numeric (number and integer) types:
 *
 * - `multipleOf`
 * - `maximum`
 * - `minimum`
 *
 * @name Schema.NUMERIC_OPS
 * @type {string[]}
 */
const NUMERIC_OPS = ['multipleOf', 'maximum', 'minimum'];
/**
 * Validation keywords validated for object types:
 *
 * - `maxProperties`
 * - `minProperties`
 * - `required`
 * - `properties`
 * - `dependencies`
 *
 * @name Schema.OBJECT_OPS
 * @type {string[]}
 */
const OBJECT_OPS = ['maxProperties', 'minProperties', 'required', 'properties', 'dependencies'];
/**
 * Validation keywords validated for string types:
 *
 * - `maxLength`
 * - `minLength`
 * - `pattern`
 *
 * @name Schema.STRING_OPS
 * @type {string[]}
 */
const STRING_OPS = ['maxLength', 'minLength', 'pattern'];
/**
 * http://json-schema.org/latest/json-schema-validation.html#anchor75
 * @ignore
 */
const validateAny = (value, schema, opts) => runOps(ANY_OPS, value, schema, opts);
/**
 * Validates the provided value against a given Schema according to the http://json-schema.org/ v4 specification.
 *
 * @name Schema.validate
 * @method
 * @param {*} value Value to be validated.
 * @param {object} schema Valid Schema according to the http://json-schema.org/ v4 specification.
 * @param {object} [opts] Configuration options.
 * @returns {(array|undefined)} Array of errors or `undefined` if valid.
 */
const validate = (value, schema, opts = {}) => {
    let errors = [];
    opts.ctx = opts.ctx || { value, schema };
    let shouldPop;
    const prevProp = opts.prop;
    if (schema === undefined) {
        return;
    }
    if (!utils.isObject(schema)) {
        throw utils.err(`${DOMAIN$5}#validate`)(500, `Invalid schema at path: "${opts.path}"`);
    }
    if (opts.path === undefined) {
        opts.path = [];
    }
    // Track our location as we recurse
    if (opts.prop !== undefined) {
        shouldPop = true;
        opts.path.push(opts.prop);
        opts.prop = undefined;
    }
    // Validate against parent schema
    if (schema.extends) {
        // opts.path = path
        // opts.prop = prop
        if (utils.isFunction(schema.extends.validate)) {
            errors = errors.concat(schema.extends.validate(value, opts) || []);
        }
        else {
            errors = errors.concat(validate(value, schema.extends, opts) || []);
        }
    }
    if (value === undefined) {
        // Check if property is required
        if (schema.required === true && !opts.existingOnly) {
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
// These strings are cached for optimal performance of the change detection
// boolean - Whether a Record is changing in the current execution frame
const changingPath = 'changing';
// string[] - Properties that have changed in the current execution frame
const changedPath = 'changed';
// Object[] - History of change records
const changeHistoryPath = 'history';
// boolean - Whether a Record is currently being instantiated
const creatingPath$1 = 'creating';
// number - The setTimeout change event id of a Record, if any
const eventIdPath = 'eventId';
// boolean - Whether to skip validation for a Record's currently changing property
const noValidatePath$2 = 'noValidate';
// boolean - Whether to preserve Change History for a Record
const keepChangeHistoryPath$1 = 'keepChangeHistory';
// boolean - Whether to skip change notification for a Record's currently
// changing property
const silentPath = 'silent';
const validationFailureMsg = 'validation failed';
/**
 * A map of validation functions grouped by type.
 *
 * @name Schema.typeGroupValidators
 * @type {object}
 */
const typeGroupValidators = {
    /**
     * Validates the provided value against the schema using all of the validation keywords specific to instances of an
     * array.
     * The validation keywords for the type `array` are:
     * ```
     * ['items', 'maxItems', 'minItems', 'uniqueItems']
     * ```
     * see http://json-schema.org/latest/json-schema-validation.html#anchor25
     *
     * @name Schema.typeGroupValidators.array
     * @method
     * @param {*} value Array to be validated.
     * @param {object} schema Schema containing at least one array keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    array: (value, schema, opts) => runOps(ARRAY_OPS, value, schema, opts),
    /**
     * Validates the provided value against the schema using all of the validation keywords specific to instances of an
     * integer.
     * The validation keywords for the type `integer` are:
     * ```
     * ['multipleOf', 'maximum', 'minimum']
     * ```
     * @name Schema.typeGroupValidators.integer
     * @method
     * @param {*} value Number to be validated.
     * @param {object} schema Schema containing at least one `integer` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    integer: (value, schema, opts) => 
    // Additional validations for numerics are the same
    typeGroupValidators.numeric(value, schema, opts),
    /**
     * Validates the provided value against the schema using all of the validation keywords specific to instances of an
     * number.
     * The validation keywords for the type `number` are:
     * ```
     * ['multipleOf', 'maximum', 'minimum']
     * ```
     * @name Schema.typeGroupValidators.number
     * @method
     * @param {*} value Number to be validated.
     * @param {object} schema Schema containing at least one `number` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    number: (value, schema, opts) => 
    // Additional validations for numerics are the same
    typeGroupValidators.numeric(value, schema, opts),
    /**
     * Validates the provided value against the schema using all of the validation keywords specific to instances of a
     * number or integer.
     * The validation keywords for the type `numeric` are:
     * ```
     * ['multipleOf', 'maximum', 'minimum']
     * ```
     * See http://json-schema.org/latest/json-schema-validation.html#anchor13.
     *
     * @name Schema.typeGroupValidators.numeric
     * @method
     * @param {*} value Number to be validated.
     * @param {object} schema Schema containing at least one `numeric` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    numeric: (value, schema, opts) => runOps(NUMERIC_OPS, value, schema, opts),
    /**
     * Validates the provided value against the schema using all of the validation keywords specific to instances of an
     * object.
     * The validation keywords for the type `object` are:
     * ```
     * ['maxProperties', 'minProperties', 'required', 'properties', 'dependencies']
     * ```
     * See http://json-schema.org/latest/json-schema-validation.html#anchor53.
     *
     * @name Schema.typeGroupValidators.object
     * @method
     * @param {*} value Object to be validated.
     * @param {object} schema Schema containing at least one `object` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    object: (value, schema, opts) => runOps(OBJECT_OPS, value, schema, opts),
    /**
     * Validates the provided value against the schema using all of the validation keywords specific to instances of an
     * string.
     * The validation keywords for the type `string` are:
     * ```
     * ['maxLength', 'minLength', 'pattern']
     * ```
     * See http://json-schema.org/latest/json-schema-validation.html#anchor25.
     *
     * @name Schema.typeGroupValidators.string
     * @method
     * @param {*} value String to be validated.
     * @param {object} schema Schema containing at least one `string` keyword.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    string: (value, schema, opts) => runOps(STRING_OPS, value, schema, opts)
};
/**
 * js-data's Schema class.
 *
 * @example <caption>Schema#constructor</caption>
 * const JSData = require('js-data');
 * const { Schema } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * const PostSchema = new Schema({
 *   type: 'object',
 *   properties: {
 *     title: { type: 'string' }
 *   }
 * });
 * PostSchema.validate({ title: 1234 });
 *
 * @example
 * const JSData = require('js-data');
 * const { Schema } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * class CustomSchemaClass extends Schema {
 *   foo () { return 'bar'; }
 *   static beep () { return 'boop'; }
 * }
 * const customSchema = new CustomSchemaClass();
 * console.log(customSchema.foo());
 * console.log(CustomSchemaClass.beep());
 *
 * @class Schema
 * @extends Component
 * @param {object} definition Schema definition according to json-schema.org
 */
class Schema extends Component {
    constructor(definition = {}) {
        super();
        // TODO: schema validation
        utils.fillIn(this, definition);
        if (this.type === 'object') {
            this.properties = this.properties || {};
            utils.forOwn(this.properties, (_definition, prop) => {
                if (!(_definition instanceof Schema)) {
                    this.properties[prop] = new Schema(_definition);
                }
            });
        }
        else if (this.type === 'array' && this.items && !(this.items instanceof Schema)) {
            this.items = new Schema(this.items);
        }
        if (this.extends && !(this.extends instanceof Schema)) {
            this.extends = new Schema(this.extends);
        }
        ['allOf', 'anyOf', 'oneOf'].forEach(validationKeyword => {
            if (this[validationKeyword]) {
                this[validationKeyword].forEach((_definition, i) => {
                    if (!(_definition instanceof Schema)) {
                        this[validationKeyword][i] = new Schema(_definition);
                    }
                });
            }
        });
    }
    /**
     * This adds ES5 getters/setters to the target based on the "properties" in
     * this Schema, which makes possible change tracking and validation on
     * property assignment.
     *
     * @name Schema#apply
     * @method
     * @param {object} target The prototype to which to apply this schema.
     * @param opts
     */
    apply(target, opts = {}) {
        opts.getter = opts.getter || '_get';
        opts.setter = opts.setter || '_set';
        opts.unsetter = opts.unsetter || '_unset';
        opts.track = opts.track || this.track;
        const properties = this.properties || {};
        utils.forOwn(properties, (schema, prop) => {
            Object.defineProperty(target, prop, this.makeDescriptor(prop, schema, opts));
        });
    }
    /**
     * Apply default values to the target object for missing values.
     *
     * @name Schema#applyDefaults
     * @method
     * @param {object} target The target to which to apply values for missing values.
     */
    applyDefaults(target) {
        if (!target) {
            return;
        }
        const properties = this.properties || {};
        const hasSet = utils.isFunction(target.set) || utils.isFunction(target._set);
        utils.forOwn(properties, (schema, prop) => {
            if (schema.hasOwnProperty('default') && utils.get(target, prop) === undefined) {
                if (hasSet) {
                    target.set(prop, utils.plainCopy(schema.default), { silent: true });
                }
                else {
                    utils.set(target, prop, utils.plainCopy(schema.default));
                }
            }
            if (schema.type === 'object' && schema.properties) {
                if (hasSet) {
                    const orig = target._get('noValidate');
                    target._set('noValidate', true);
                    utils.set(target, prop, utils.get(target, prop) || {}, { silent: true });
                    target._set('noValidate', orig);
                }
                else {
                    utils.set(target, prop, utils.get(target, prop) || {});
                }
                schema.applyDefaults(utils.get(target, prop));
            }
        });
    }
    /**
     * Assemble a property descriptor for tracking and validating changes to
     * a property according to the given schema. This method is called when
     * {@link Mapper#applySchema} is set to `true`.
     *
     * @name Schema#makeDescriptor
     * @method
     * @param {string} prop The property name.
     * @param {(Schema|object)} schema The schema for the property.
     * @param {object} [opts] Optional configuration.
     * @param {function} [opts.getter] Custom getter function.
     * @param {function} [opts.setter] Custom setter function.
     * @param {function} [opts.track] Whether to track changes.
     * @returns {object} A property descriptor for the given schema.
     */
    makeDescriptor(prop, schema, opts) {
        const descriptor = {
            // Better to allow configurability, but at the user's own risk
            configurable: true,
            // These properties are enumerable by default, but regardless of their
            // enumerability, they won't be "own" properties of individual records
            enumerable: schema.enumerable === undefined ? true : !!schema.enumerable,
            get() {
                return this._get(keyPath);
            },
            set(value) {
                // These are accessed a lot
                const _get = this[getter];
                const _set = this[setter];
                const _unset = this[unsetter];
                // Optionally check that the new value passes validation
                if (!_get(noValidatePath$2)) {
                    const errors = schema.validate(value, { path: [prop] });
                    if (errors) {
                        // Immediately throw an error, preventing the record from getting into
                        // an invalid state
                        const error = new TsDataError(validationFailureMsg);
                        error.errors = errors;
                        throw error;
                    }
                }
                // TODO: Make it so tracking can be turned on for all properties instead of
                // only per-property
                if (track && !_get(creatingPath$1)) {
                    // previous is versioned on database commit
                    // props are versioned on set()
                    const previous = _get(previousPath);
                    const current = _get(keyPath);
                    let changing = _get(changingPath);
                    let changed = _get(changedPath);
                    if (!changing) {
                        // Track properties that are changing in the current event loop
                        changed = [];
                    }
                    // Add changing properties to this array once at most
                    const index = changed.indexOf(prop);
                    if (current !== value && index === -1) {
                        changed.push(prop);
                    }
                    if (previous === value) {
                        if (index >= 0) {
                            changed.splice(index, 1);
                        }
                    }
                    // No changes in current event loop
                    if (!changed.length) {
                        changing = false;
                        _unset(changingPath);
                        _unset(changedPath);
                        // Cancel pending change event
                        if (_get(eventIdPath)) {
                            clearTimeout(_get(eventIdPath));
                            _unset(eventIdPath);
                        }
                    }
                    // Changes detected in current event loop
                    if (!changing && changed.length) {
                        _set(changedPath, changed);
                        _set(changingPath, true);
                        // Saving the timeout id allows us to batch all changes in the same
                        // event loop into a single "change"
                        // TODO: Optimize
                        _set(eventIdPath, setTimeout(() => {
                            // Previous event loop where changes were gathered has ended, so
                            // notify any listeners of those changes and prepare for any new
                            // changes
                            _unset(changedPath);
                            _unset(eventIdPath);
                            _unset(changingPath);
                            // TODO: Optimize
                            if (!_get(silentPath)) {
                                let i;
                                for (i = 0; i < changed.length; i++) {
                                    this.emit('change:' + changed[i], this, utils.get(this, changed[i]));
                                }
                                const changes = utils.diffObjects({ [prop]: value }, { [prop]: current });
                                if (_get(keepChangeHistoryPath$1)) {
                                    const changeRecord = utils.plainCopy(changes);
                                    changeRecord.timestamp = new Date().getTime();
                                    let changeHistory = _get(changeHistoryPath);
                                    if (!changeHistory)
                                        _set(changeHistoryPath, (changeHistory = []));
                                    changeHistory.push(changeRecord);
                                }
                                this.emit('change', this, changes);
                            }
                            _unset(silentPath);
                        }, 0));
                    }
                }
                _set(keyPath, value);
                return value;
            }
        };
        // Cache a few strings for optimal performance
        const keyPath = `props.${prop}`;
        const previousPath = `previous.${prop}`;
        const getter = opts.getter;
        const setter = opts.setter;
        const unsetter = opts.unsetter;
        const track = utils.isBoolean(opts.track) ? opts.track : schema.track;
        if (utils.isFunction(schema.get)) {
            const originalGet = descriptor.get;
            descriptor.get = function () {
                return schema.get.call(this, originalGet);
            };
        }
        if (utils.isFunction(schema.set)) {
            const originalSet = descriptor.set;
            descriptor.set = function (value) {
                return schema.set.call(this, value, originalSet);
            };
        }
        return descriptor;
    }
    /**
     * Create a copy of the given value that contains only the properties defined
     * in this schema.
     *
     * @name Schema#pick
     * @method
     * @param {*} value The value to copy.
     * @returns {*} The copy.
     */
    pick(value, opts) {
        if (value === undefined) {
            return;
        }
        if (this.type === 'object') {
            const copy = {};
            const properties = this.properties;
            if (properties) {
                utils.forOwn(properties, (_definition, prop) => {
                    copy[prop] = _definition.pick(value[prop]);
                });
            }
            if (this.extends) {
                utils.fillIn(copy, this.extends.pick(value));
            }
            // Conditionally copy properties not defined in "properties"
            if (this.additionalProperties) {
                for (const key in value) {
                    if (!properties[key]) {
                        copy[key] = utils.plainCopy(value[key]);
                    }
                }
            }
            return copy;
        }
        else if (this.type === 'array') {
            return value.map(item => {
                const _copy = this.items ? this.items.pick(item) : {};
                if (this.extends) {
                    utils.fillIn(_copy, this.extends.pick(item));
                }
                return _copy;
            });
        }
        return utils.plainCopy(value);
    }
    /**
     * Validate the provided value against this schema.
     *
     * @name Schema#validate
     * @method
     * @param {*} value Value to validate.
     * @param {object} [opts] Configuration options.
     * @returns {(array|undefined)} Array of errors or `undefined` if valid.
     */
    validate(value, opts) {
        return validate(value, this, opts);
    }
}
Schema.ANY_OPS = ANY_OPS;
Schema.ARRAY_OPS = ARRAY_OPS;
Schema.NUMERIC_OPS = NUMERIC_OPS;
Schema.OBJECT_OPS = OBJECT_OPS;
Schema.STRING_OPS = STRING_OPS;
Schema.typeGroupValidators = typeGroupValidators;
Schema.types = types;
Schema.validate = validate;
Schema.validationKeywords = validationKeywords;

class BelongsToRelation extends Relation {
    getForeignKey(record) {
        return utils.get(record, this.foreignKey);
    }
    _setForeignKey(record, relatedRecord) {
        utils.set(record, this.foreignKey, utils.get(relatedRecord, this.getRelation().idAttribute));
    }
    findExistingLinksFor(record) {
        // console.log('\tBelongsTo#findExistingLinksFor', record)
        if (!record) {
            return;
        }
        const relatedId = utils.get(record, this.foreignKey);
        if (relatedId !== undefined && relatedId !== null) {
            return this.relatedCollection.get(relatedId);
        }
    }
    isRequiresParentId() {
        return true;
    }
    createParentRecord(props, opts) {
        const relationData = this.getLocalField(props);
        return this.createLinked(relationData, opts).then(record => {
            this.setForeignKey(props, record);
        });
    }
    createChildRecord() {
        throw new Error('"BelongsTo" relation does not support child creation as it cannot have children.');
    }
}
BelongsToRelation.TYPE_NAME = 'belongsTo';

class HasManyRelation extends Relation {
    validateOptions(related, opts) {
        super.validateOptions(related, opts);
        const { localKeys, foreignKeys, foreignKey } = opts;
        if (!foreignKey && !localKeys && !foreignKeys) {
            throw utils.err('new Relation', 'opts.<foreignKey|localKeys|foreignKeys>')(400, 'string', foreignKey);
        }
    }
    canFindLinkFor(record) {
        const hasForeignKeys = this.foreignKey || this.foreignKeys;
        return !!(hasForeignKeys || (this.localKeys && utils.get(record, this.localKeys)));
    }
    linkRecord(record, relatedRecords) {
        const relatedCollection = this.relatedCollection;
        const canAutoAddLinks = this.canAutoAddLinks;
        const foreignKey = this.foreignKey;
        const unsaved = this.relatedCollection.unsaved();
        return relatedRecords.map(relatedRecord => {
            const relatedId = relatedCollection.recordId(relatedRecord);
            if ((relatedId === undefined && unsaved.indexOf(relatedRecord) === -1) ||
                relatedRecord !== relatedCollection.get(relatedId)) {
                if (foreignKey) {
                    // TODO: slow, could be optimized? But user loses hook
                    this.setForeignKey(record, relatedRecord);
                }
                if (canAutoAddLinks) {
                    relatedRecord = relatedCollection.add(relatedRecord);
                }
            }
            return relatedRecord;
        });
    }
    findExistingLinksFor(record) {
        var _a;
        const id = utils.get(record, this.mapper.idAttribute);
        const ids = this.localKeys ? utils.get(record, this.localKeys) : null;
        let records;
        if (id !== undefined && this.foreignKey) {
            records = this.findExistingLinksByForeignKey(id);
        }
        else if (this.localKeys && ids) {
            records = this.findExistingLinksByLocalKeys(ids);
        }
        else if (id !== undefined && this.foreignKeys) {
            records = this.findExistingLinksByForeignKeys(id);
        }
        if ((_a = records) === null || _a === void 0 ? void 0 : _a.length) {
            return records;
        }
    }
    // e.g. user hasMany group via "foreignKeys", so find all users of a group
    findExistingLinksByLocalKeys(ids) {
        return this.relatedCollection.filter({
            where: {
                [this.relatedCollection.mapper.idAttribute]: {
                    in: ids
                }
            }
        });
    }
    // e.g. group hasMany user via "localKeys", so find all groups that own a user
    findExistingLinksByForeignKeys(id) {
        return this.relatedCollection.filter({
            where: {
                [this.foreignKeys]: {
                    contains: id
                }
            }
        });
    }
    isRequiresParentId() {
        return !!this.localKeys && this.localKeys.length > 0;
    }
    isRequiresChildId() {
        return !!this.foreignKey;
    }
    createParentRecord(props, opts) {
        const relationData = this.getLocalField(props);
        const foreignIdField = this.getRelation().idAttribute;
        return this.createLinked(relationData, opts).then(records => {
            utils.set(props, this.localKeys, records.map(record => utils.get(record, foreignIdField)));
        });
    }
    createLinked(props, opts) {
        return this.getRelation().createMany(props, opts);
    }
}
HasManyRelation.TYPE_NAME = 'hasMany';

class HasOneRelation extends Relation {
    findExistingLinksFor(relatedMapper, record) {
        var _a;
        const recordId = utils.get(record, relatedMapper.idAttribute);
        const records = this.findExistingLinksByForeignKey(recordId);
        if ((_a = records) === null || _a === void 0 ? void 0 : _a.length) {
            return records[0];
        }
    }
    isRequiresChildId() {
        return true;
    }
}
HasOneRelation.TYPE_NAME = 'hasOne';

[BelongsToRelation, HasManyRelation, HasOneRelation].forEach(RelationType => {
    Relation[RelationType.TYPE_NAME] = (related, options) => new RelationType(related, options);
});

/**
 * BelongsTo relation decorator. You probably won't use this directly.
 *
 * @method
 * @param {Mapper} related The relation the target belongs to.
 * @param {object} opts Configuration options.
 * @param {string} opts.foreignKey The field that holds the primary key of the
 * related record.
 * @param {string} opts.localField The field that holds a reference to the
 * related record object.
 * @returns {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
function belongsTo(related, opts) {
    return mapper => {
        Relation.belongsTo(related, opts).assignTo(mapper);
    };
}
/**
 * HasMany relation decorator. You probably won't use this directly.
 *
 * @method
 * @param {Mapper} related The relation of which the target has many.
 * @param {object} opts Configuration options.
 * @param {string} [opts.foreignKey] The field that holds the primary key of the
 * related record.
 * @param {string} opts.localField The field that holds a reference to the
 * related record object.
 * @returns {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
function hasMany(related, opts) {
    return mapper => {
        Relation.hasMany(related, opts).assignTo(mapper);
    };
}
/**
 * HasOne relation decorator. You probably won't use this directly.
 *
 * @method
 * @param {Mapper} related The relation of which the target has one.
 * @param {object} opts Configuration options.
 * @param {string} [opts.foreignKey] The field that holds the primary key of the
 * related record.
 * @param {string} opts.localField The field that holds a reference to the
 * related record object.
 * @returns {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
function hasOne(related, opts) {
    return mapper => {
        Relation.hasOne(related, opts).assignTo(mapper);
    };
}

const DOMAIN$6 = 'Mapper';
const applyDefaultsHooks = ['beforeCreate', 'beforeCreateMany'];
const validatingHooks = ['beforeCreate', 'beforeCreateMany', 'beforeUpdate', 'beforeUpdateAll', 'beforeUpdateMany'];
function makeNotify(num) {
    return function (...args) {
        var _a;
        const opts = args[args.length - num];
        const op = opts.op;
        this.dbg(op, ...args);
        if (applyDefaultsHooks.indexOf(op) !== -1 && opts.applyDefaults !== false) {
            const schema = this.getSchema();
            if ((_a = schema) === null || _a === void 0 ? void 0 : _a.applyDefaults) {
                let toProcess = args[0];
                if (!utils.isArray(toProcess)) {
                    toProcess = [toProcess];
                }
                toProcess.forEach(record => {
                    schema.applyDefaults(record);
                });
            }
        }
        // Automatic validation
        if (validatingHooks.indexOf(op) !== -1 && !opts.noValidate) {
            // Save current value of option
            const originalExistingOnly = opts.existingOnly;
            // For updates, ignore required fields if they aren't present
            if (op.indexOf('beforeUpdate') === 0 && opts.existingOnly === undefined) {
                opts.existingOnly = true;
            }
            const errors = this.validate(args[op === 'beforeUpdate' ? 1 : 0], utils.pick(opts, ['existingOnly']));
            // Restore option
            opts.existingOnly = originalExistingOnly;
            // Abort lifecycle due to validation errors
            if (errors) {
                const err = new TsDataError('validation failed');
                err.errors = errors;
                return utils.reject(err);
            }
        }
        // Emit lifecycle event
        if (opts.notify || (opts.notify === undefined && this.notify)) {
            setTimeout(() => {
                this.emit(op, ...args);
            });
        }
    };
}
// These are the default implementations of all of the lifecycle hooks
const notify = makeNotify(1);
const notify2 = makeNotify(2);
// This object provides meta information used by Mapper#crud to actually
// execute each lifecycle method
const LIFECYCLE_METHODS = {
    count: {
        defaults: [{}, {}],
        skip: true,
        types: []
    },
    destroy: {
        defaults: [{}, {}],
        skip: true,
        types: []
    },
    destroyAll: {
        defaults: [{}, {}],
        skip: true,
        types: []
    },
    find: {
        defaults: [undefined, {}],
        types: []
    },
    findAll: {
        defaults: [{}, {}],
        types: []
    },
    sum: {
        defaults: [undefined, {}, {}],
        skip: true,
        types: []
    },
    update: {
        adapterArgs(mapper, id, props, opts) {
            return [id, mapper.toJSON(props, opts), opts];
        },
        beforeAssign: 1,
        defaults: [undefined, {}, {}],
        types: []
    },
    updateAll: {
        adapterArgs(mapper, props, query, opts) {
            return [mapper.toJSON(props, opts), query, opts];
        },
        beforeAssign: 0,
        defaults: [{}, {}, {}],
        types: []
    },
    updateMany: {
        adapterArgs(mapper, records, opts) {
            return [records.map(record => mapper.toJSON(record, opts)), opts];
        },
        beforeAssign: 0,
        defaults: [[], {}],
        types: []
    }
};
const MAPPER_DEFAULTS = {
    _adapters: {},
    applyDefaults: true,
    applySchema: true,
    defaultAdapter: 'http',
    idAttribute: 'id',
    keepChangeHistory: true,
    notify: true,
    noValidate: false,
    raw: false,
    validateOnSet: true
};
/**
 * The core of JSData's [ORM/ODM][orm] implementation. Given a minimum amount of
 * meta information about a resource, a Mapper can perform generic CRUD
 * operations against that resource. Apart from its configuration, a Mapper is
 * stateless. The particulars of various persistence layers have been abstracted
 * into adapters, which a Mapper uses to perform its operations.
 *
 * The term "Mapper" comes from the [Data Mapper Pattern][pattern] described in
 * Martin Fowler's [Patterns of Enterprise Application Architecture][book]. A
 * Data Mapper moves data between [in-memory object instances][record] and a
 * relational or document-based database. JSData's Mapper can work with any
 * persistence layer you can write an adapter for.
 *
 * _("Model" is a heavily overloaded term and is avoided in this documentation
 * to prevent confusion.)_
 *
 * [orm]: https://en.wikipedia.org/wiki/Object-relational_mapping
 *
 * @example
 * [pattern]: https://en.wikipedia.org/wiki/Data_mapper_pattern
 * [book]: http://martinfowler.com/books/eaa.html
 * [record]: Record.html
 * // Import and instantiate
 * import { Mapper } from 'js-data';
 * const UserMapper = new Mapper({ name: 'user' });
 *
 * @example
 * // Define a Mapper using the Container component
 * import { Container } from 'js-data';
 * const store = new Container();
 * store.defineMapper('user');
 *
 * @class Mapper
 * @extends Component
 * @param {object} opts Configuration options.
 * @param {boolean} [opts.applySchema=true] See {@link Mapper#applySchema}.
 * @param {boolean} [opts.debug=false] See {@link Component#debug}.
 * @param {string} [opts.defaultAdapter=http] See {@link Mapper#defaultAdapter}.
 * @param {string} [opts.idAttribute=id] See {@link Mapper#idAttribute}.
 * @param {object} [opts.methods] See {@link Mapper#methods}.
 * @param {string} opts.name See {@link Mapper#name}.
 * @param {boolean} [opts.notify] See {@link Mapper#notify}.
 * @param {boolean} [opts.raw=false] See {@link Mapper#raw}.
 * @param {Function|boolean} [opts.recordClass] See {@link Mapper#recordClass}.
 * @param {Object|Schema} [opts.schema] See {@link Mapper#schema}.
 * @returns {Mapper} A new {@link Mapper} instance.
 * @see http://www.js-data.io/v3.0/docs/components-of-jsdata#mapper
 * @since 3.0.0
 * @tutorial ["http://www.js-data.io/v3.0/docs/components-of-jsdata#mapper","Components of JSData: Mapper"]
 * @tutorial ["http://www.js-data.io/v3.0/docs/modeling-your-data","Modeling your data"]
 */
class Mapper extends Component {
    constructor(opts = {}) {
        super();
        /**
         * The meta information describing this Mapper's available lifecycle
         * methods. __Do not modify.__
         *
         * @name Mapper#lifecycleMethods
         * @since 3.0.0
         * @type {Object}
         */
        this.lifecycleMethods = LIFECYCLE_METHODS;
        /**
         * Mapper lifecycle hook called by {@link Mapper#count}. If this method
         * returns a promise then {@link Mapper#count} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#afterCount
         * @param {object} query The `query` argument passed to {@link Mapper#count}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#count}.
         * @param {*} result The result, if any.
         * @since 3.0.0
         */
        this.afterCount = notify2;
        /**
         * Mapper lifecycle hook called by {@link Mapper#create}. If this method
         * returns a promise then {@link Mapper#create} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#afterCreate
         * @param {object} props The `props` argument passed to {@link Mapper#create}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#create}.
         * @param {*} result The result, if any.
         * @since 3.0.0
         */
        this.afterCreate = notify2;
        /**
         * Mapper lifecycle hook called by {@link Mapper#createMany}. If this method
         * returns a promise then {@link Mapper#createMany} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#afterCreateMany
         * @param {array} records The `records` argument passed to {@link Mapper#createMany}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#createMany}.
         * @param {*} result The result, if any.
         * @since 3.0.0
         */
        this.afterCreateMany = notify2;
        /**
         * Mapper lifecycle hook called by {@link Mapper#destroy}. If this method
         * returns a promise then {@link Mapper#destroy} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#afterDestroy
         * @param {(string|number)} id The `id` argument passed to {@link Mapper#destroy}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#destroy}.
         * @param {*} result The result, if any.
         * @since 3.0.0
         */
        this.afterDestroy = notify2;
        /**
         * Mapper lifecycle hook called by {@link Mapper#destroyAll}. If this method
         * returns a promise then {@link Mapper#destroyAll} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#afterDestroyAll
         * @param {*} data The `data` returned by the adapter.
         * @param {query} query The `query` argument passed to {@link Mapper#destroyAll}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#destroyAll}.
         * @param {*} result The result, if any.
         * @since 3.0.0
         */
        this.afterDestroyAll = notify2;
        /**
         * Mapper lifecycle hook called by {@link Mapper#find}. If this method
         * returns a promise then {@link Mapper#find} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#afterFind
         * @param {(string|number)} id The `id` argument passed to {@link Mapper#find}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#find}.
         * @param {*} result The result, if any.
         * @since 3.0.0
         */
        this.afterFind = notify2;
        /**
         * Mapper lifecycle hook called by {@link Mapper#findAll}. If this method
         * returns a promise then {@link Mapper#findAll} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#afterFindAll
         * @param {object} query The `query` argument passed to {@link Mapper#findAll}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#findAll}.
         * @param {*} result The result, if any.
         * @since 3.0.0
         */
        this.afterFindAll = notify2;
        /**
         * Mapper lifecycle hook called by {@link Mapper#sum}. If this method
         * returns a promise then {@link Mapper#sum} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#afterSum
         * @param {object} query The `query` argument passed to {@link Mapper#sum}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#sum}.
         * @param {*} result The result, if any.
         * @since 3.0.0
         */
        this.afterSum = notify2;
        /**
         * Mapper lifecycle hook called by {@link Mapper#update}. If this method
         * returns a promise then {@link Mapper#update} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#afterUpdate
         * @param {(string|number)} id The `id` argument passed to {@link Mapper#update}.
         * @param {props} props The `props` argument passed to {@link Mapper#update}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#update}.
         * @param {*} result The result, if any.
         * @since 3.0.0
         */
        this.afterUpdate = notify2;
        /**
         * Mapper lifecycle hook called by {@link Mapper#updateAll}. If this method
         * returns a promise then {@link Mapper#updateAll} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#afterUpdateAll
         * @param {object} props The `props` argument passed to {@link Mapper#updateAll}.
         * @param {object} query The `query` argument passed to {@link Mapper#updateAll}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#updateAll}.
         * @param {*} result The result, if any.
         * @since 3.0.0
         */
        this.afterUpdateAll = notify2;
        /**
         * Mapper lifecycle hook called by {@link Mapper#updateMany}. If this method
         * returns a promise then {@link Mapper#updateMany} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#afterUpdateMany
         * @param {array} records The `records` argument passed to {@link Mapper#updateMany}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#updateMany}.
         * @param {*} result The result, if any.
         * @since 3.0.0
         */
        this.afterUpdateMany = notify2;
        /**
         * Mapper lifecycle hook called by {@link Mapper#create}. If this method
         * returns a promise then {@link Mapper#create} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#beforeCreate
         * @param {object} props The `props` argument passed to {@link Mapper#create}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#create}.
         * @since 3.0.0
         */
        this.beforeCreate = notify;
        /**
         * Mapper lifecycle hook called by {@link Mapper#createMany}. If this method
         * returns a promise then {@link Mapper#createMany} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#beforeCreateMany
         * @param {array} records The `records` argument passed to {@link Mapper#createMany}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#createMany}.
         * @since 3.0.0
         */
        this.beforeCreateMany = notify;
        /**
         * Mapper lifecycle hook called by {@link Mapper#count}. If this method
         * returns a promise then {@link Mapper#count} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#beforeCount
         * @param {object} query The `query` argument passed to {@link Mapper#count}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#count}.
         * @since 3.0.0
         */
        this.beforeCount = notify;
        /**
         * Mapper lifecycle hook called by {@link Mapper#destroy}. If this method
         * returns a promise then {@link Mapper#destroy} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#beforeDestroy
         * @param {(string|number)} id The `id` argument passed to {@link Mapper#destroy}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#destroy}.
         * @since 3.0.0
         */
        this.beforeDestroy = notify;
        /**
         * Mapper lifecycle hook called by {@link Mapper#destroyAll}. If this method
         * returns a promise then {@link Mapper#destroyAll} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#beforeDestroyAll
         * @param {query} query The `query` argument passed to {@link Mapper#destroyAll}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#destroyAll}.
         * @since 3.0.0
         */
        this.beforeDestroyAll = notify;
        /**
         * Mappers lifecycle hook called by {@link Mapper#find}. If this method
         * returns a promise then {@link Mapper#find} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#beforeFind
         * @param {(string|number)} id The `id` argument passed to {@link Mapper#find}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#find}.
         * @since 3.0.0
         */
        this.beforeFind = notify;
        /**
         * Mapper lifecycle hook called by {@link Mapper#findAll}. If this method
         * returns a promise then {@link Mapper#findAll} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#beforeFindAll
         * @param {object} query The `query` argument passed to {@link Mapper#findAll}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#findAll}.
         * @since 3.0.0
         */
        this.beforeFindAll = notify;
        /**
         * Mapper lifecycle hook called by {@link Mapper#sum}. If this method
         * returns a promise then {@link Mapper#sum} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#beforeSum
         * @param {string} field The `field` argument passed to {@link Mapper#sum}.
         * @param {object} query The `query` argument passed to {@link Mapper#sum}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#sum}.
         * @since 3.0.0
         */
        this.beforeSum = notify;
        /**
         * Mapper lifecycle hook called by {@link Mapper#update}. If this method
         * returns a promise then {@link Mapper#update} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#beforeUpdate
         * @param {(string|number)} id The `id` argument passed to {@link Mapper#update}.
         * @param {props} props The `props` argument passed to {@link Mapper#update}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#update}.
         * @since 3.0.0
         */
        this.beforeUpdate = notify;
        /**
         * Mapper lifecycle hook called by {@link Mapper#updateAll}. If this method
         * returns a promise then {@link Mapper#updateAll} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#beforeUpdateAll
         * @param {object} props The `props` argument passed to {@link Mapper#updateAll}.
         * @param {object} query The `query` argument passed to {@link Mapper#updateAll}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#updateAll}.
         * @since 3.0.0
         */
        this.beforeUpdateAll = notify;
        /**
         * Mapper lifecycle hook called by {@link Mapper#updateMany}. If this method
         * returns a promise then {@link Mapper#updateMany} will wait for the promise
         * to resolve before continuing.
         *
         * @method Mapper#beforeUpdateMany
         * @param {array} records The `records` argument passed to {@link Mapper#updateMany}.
         * @param {object} opts The `opts` argument passed to {@link Mapper#updateMany}.
         * @since 3.0.0
         */
        this.beforeUpdateMany = notify;
        // Apply user-provided configuration
        utils.fillIn(this, opts);
        // Fill in any missing options with the defaults
        utils.fillIn(this, utils.copy(MAPPER_DEFAULTS));
        /**
         * The name for this Mapper. This is the minimum amount of meta information
         * required for a Mapper to be able to execute CRUD operations for a
         * Resource.
         *
         * @name Mapper#name
         * @since 3.0.0
         * @type {string}
         */
        if (!this.name) {
            throw utils.err(`new ${DOMAIN$6}`, 'opts.name')(400, 'string', this.name);
        }
        // Setup schema, with an empty default schema if necessary
        if (this.schema) {
            this.schema.type = this.schema.type || 'object';
            if (!(this.schema instanceof Schema)) {
                this.schema = new Schema(this.schema || { type: 'object' });
            }
        }
        // Create a subclass of Record that's tied to this Mapper
        if (this.recordClass === undefined) {
            // tslint:disable-next-line:max-classes-per-file
            this.recordClass = class TiedRecord extends Record {
            };
        }
        if (this.recordClass) {
            this.recordClass.mapper = this;
            /**
             * Functions that should be added to the prototype of {@link Mapper#recordClass}.
             *
             * @name Mapper#methods
             * @since 3.0.0
             * @type {Object}
             */
            if (utils.isObject(this.methods)) {
                utils.addHiddenPropsToTarget(this.recordClass.prototype, this.methods);
            }
            // We can only apply the schema to the prototype of this.recordClass if the
            // class extends Record
            if (Record.prototype.isPrototypeOf(Object.create(this.recordClass.prototype)) &&
                this.schema &&
                this.schema.apply &&
                this.applySchema) {
                this.schema.apply(this.recordClass.prototype);
            }
        }
    }
    /**
     * This method is called at the end of most lifecycle methods. It does the
     * following:
     *
     * 1. If `opts.raw` is `true`, add this Mapper's configuration to the `opts`
     * argument as metadata for the operation.
     * 2. Wrap the result data appropriately using {@link Mapper#wrap}, which
     * calls {@link Mapper#createRecord}.
     *
     * @method Mapper#_end
     * @private
     * @since 3.0.0
     */
    _end(result, opts, skip = false) {
        if (opts.raw) {
            utils._(result, opts);
        }
        if (skip) {
            return result;
        }
        let _data = opts.raw ? result.data : result;
        if (_data && utils.isFunction(this.wrap)) {
            _data = this.wrap(_data, opts);
            if (opts.raw) {
                result.data = _data;
            }
            else {
                result = _data;
            }
        }
        return result;
    }
    /**
     * Define a belongsTo relationship. Only useful if you're managing your
     * Mappers manually and not using a Container or DataStore component.
     *
     * @example
     * PostMapper.belongsTo(UserMapper, {
     *   // post.user_id points to user.id
     *   foreignKey: 'user_id'
     *   // user records will be attached to post records at "post.user"
     *   localField: 'user'
     * });
     *
     * CommentMapper.belongsTo(UserMapper, {
     *   // comment.user_id points to user.id
     *   foreignKey: 'user_id'
     *   // user records will be attached to comment records at "comment.user"
     *   localField: 'user'
     * });
     * CommentMapper.belongsTo(PostMapper, {
     *   // comment.post_id points to post.id
     *   foreignKey: 'post_id'
     *   // post records will be attached to comment records at "comment.post"
     *   localField: 'post'
     * });
     *
     * @method Mapper#belongsTo
     * @see http://www.js-data.io/v3.0/docs/relations
     * @since 3.0.0
     */
    belongsTo(relatedMapper, opts) {
        return belongsTo(relatedMapper, opts)(this);
    }
    /**
     * Select records according to the `query` argument and return the count.
     *
     * {@link Mapper#beforeCount} will be called before calling the adapter.
     * {@link Mapper#afterCount} will be called after calling the adapter.
     *
     * @example
     * // Get the number of published blog posts
     * PostMapper.count({ status: 'published' }).then((numPublished) => {
     *   console.log(numPublished); // e.g. 45
     * });
     *
     * @method Mapper#count
     * @param {object} [query={}] Selection query. See {@link query}.
     * @param {object} [query.where] See {@link query.where}.
     * @param {number} [query.offset] See {@link query.offset}.
     * @param {number} [query.limit] See {@link query.limit}.
     * @param {string|Array[]} [query.orderBy] See {@link query.orderBy}.
     * @param {object} [opts] Configuration options. Refer to the `count` method
     * of whatever adapter you're using for more configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
     * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
     * @returns {Promise} Resolves with the count of the selected records.
     * @since 3.0.0
     */
    count(query, opts) {
        return this.crud('count', query, opts);
    }
    /**
     * Fired during {@link Mapper#create}. See
     * {@link Mapper~beforeCreateListener} for how to listen for this event.
     *
     * @event Mapper#beforeCreate
     * @see Mapper~beforeCreateListener
     * @see Mapper#create
     */
    /**
     * Callback signature for the {@link Mapper#event:beforeCreate} event.
     *
     * @example
     * function onBeforeCreate (props, opts) {
     *   // do something
     * }
     * store.on('beforeCreate', onBeforeCreate);
     *
     * @callback Mapper~beforeCreateListener
     * @param {object} props The `props` argument passed to {@link Mapper#beforeCreate}.
     * @param {object} opts The `opts` argument passed to {@link Mapper#beforeCreate}.
     * @see Mapper#event:beforeCreate
     * @see Mapper#create
     * @since 3.0.0
     */
    /**
     * Fired during {@link Mapper#create}. See
     * {@link Mapper~afterCreateListener} for how to listen for this event.
     *
     * @event Mapper#afterCreate
     * @see Mapper~afterCreateListener
     * @see Mapper#create
     */
    /**
     * Callback signature for the {@link Mapper#event:afterCreate} event.
     *
     * @example
     * function onAfterCreate (props, opts, result) {
     *   // do something
     * }
     * store.on('afterCreate', onAfterCreate);
     *
     * @callback Mapper~afterCreateListener
     * @param {object} props The `props` argument passed to {@link Mapper#afterCreate}.
     * @param {object} opts The `opts` argument passed to {@link Mapper#afterCreate}.
     * @param {object} result The `result` argument passed to {@link Mapper#afterCreate}.
     * @see Mapper#event:afterCreate
     * @see Mapper#create
     * @since 3.0.0
     */
    /**
     * Create and save a new the record using the provided `props`.
     *
     * {@link Mapper#beforeCreate} will be called before calling the adapter.
     * {@link Mapper#afterCreate} will be called after calling the adapter.
     *
     * @example
     * // Create and save a new blog post
     * PostMapper.create({
     *   title: 'Modeling your data',
     *   status: 'draft'
     * }).then((post) => {
     *   console.log(post); // { id: 1234, status: 'draft', ... }
     * });
     *
     * @fires Mapper#beforeCreate
     * @fires Mapper#afterCreate
     * @method Mapper#create
     * @param {object} props The properties for the new record.
     * @param {object} [opts] Configuration options. Refer to the `create` method
     * of whatever adapter you're using for more configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.noValidate={@link Mapper#noValidate}] See {@link Mapper#noValidate}.
     * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
     * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
     * @param {string[]} [opts.with=[]] Relations to create in a cascading
     * create if `props` contains nested relations. NOT performed in a
     * transaction. Each nested create will result in another {@link Mapper#create}
     * or {@link Mapper#createMany} call.
     * @param {string[]} [opts.pass=[]] Relations to send to the adapter as part
     * of the payload. Normally relations are not sent.
     * @returns {Promise} Resolves with the created record.
     * @since 3.0.0
     */
    create(props = {}, opts = {}) {
        const originalRecord = props;
        let parentRelationMap = {};
        let adapterResponse = {};
        // Fill in "opts" with the Mapper's configuration
        utils._(opts, this);
        opts.adapter = this.getAdapterName(opts);
        opts.op = 'beforeCreate';
        return this._runHook(opts.op, props, opts)
            .then(props => {
            opts.with = opts.with || [];
            return this._createParentRecordIfRequired(props, opts);
        })
            .then(relationMap => {
            parentRelationMap = relationMap;
        })
            .then(() => {
            opts.op = 'create';
            return this._invokeAdapterMethod(opts.op, props, opts);
        })
            .then(result => {
            adapterResponse = result;
        })
            .then(() => {
            const createdProps = opts.raw ? adapterResponse.data : adapterResponse;
            return this._createOrAssignChildRecordIfRequired(createdProps, {
                opts,
                parentRelationMap,
                originalProps: props
            });
        })
            .then(createdProps => {
            return this._commitChanges(originalRecord, createdProps);
        })
            .then(record => {
            if (opts.raw) {
                adapterResponse.data = record;
            }
            else {
                adapterResponse = record;
            }
            const result = this._end(adapterResponse, opts);
            opts.op = 'afterCreate';
            return this._runHook(opts.op, props, opts, result);
        });
    }
    _commitChanges(recordOrRecords, newValues) {
        if (utils.isArray(recordOrRecords)) {
            return recordOrRecords.map((record, i) => this._commitChanges(record, newValues[i]));
        }
        utils.set(recordOrRecords, newValues, { silent: true });
        if (utils.isFunction(recordOrRecords.commit)) {
            recordOrRecords.commit();
        }
        return recordOrRecords;
    }
    /**
     * Use {@link Mapper#createRecord} instead.
     * @deprecated
     * @method Mapper#createInstance
     * @param {Object|Array} props See {@link Mapper#createRecord}.
     * @param {object} [opts] See {@link Mapper#createRecord}.
     * @returns {Object|Array} See {@link Mapper#createRecord}.
     * @see Mapper#createRecord
     * @since 3.0.0
     */
    createInstance(props, opts) {
        return this.createRecord(props, opts);
    }
    /**
     * Creates parent record for relation types like BelongsTo or HasMany with localKeys
     * in order to satisfy foreignKey dependency (so called child records).
     * @param {object} props See {@link Mapper#create}.
     * @param {object} opts See {@link Mapper#create}.
     * @returns {Object} cached parent records map
     * @see Mapper#create
     * @since 3.0.0
     */
    _createParentRecordIfRequired(props, opts) {
        const tasks = [];
        const relations = [];
        utils.forEachRelation(this, opts, (def, optsCopy) => {
            if (!def.isRequiresParentId() || !def.getLocalField(props)) {
                return;
            }
            optsCopy.raw = false;
            relations.push(def);
            tasks.push(def.createParentRecord(props, optsCopy));
        });
        return Promise.all(tasks).then(records => {
            return relations.reduce((map, relation, index) => {
                relation.setLocalField(map, records[index]);
                return map;
            }, {});
        });
    }
    /**
     * Creates child record for relation types like HasOne or HasMany with foreignKey
     * in order to satisfy foreignKey dependency (so called parent records).
     * @param {object} props See {@link Mapper#create}.
     * @param {object} context contains collected information.
     * @param {object} context.opts See {@link Mapper#create}.
     * @param {object} context.parentRelationMap contains parent records map
     * @param {object} context.originalProps contains data passed into {@link Mapper#create} method
     * @return {Promise} updated props
     * @see Mapper#create
     * @since 3.0.0
     */
    _createOrAssignChildRecordIfRequired(props, context) {
        const tasks = [];
        utils.forEachRelation(this, context.opts, (def, optsCopy) => {
            const relationData = def.getLocalField(context.originalProps);
            if (!relationData) {
                return;
            }
            optsCopy.raw = false;
            // Create hasMany and hasOne after the main create because we needed
            // a generated id to attach to these items
            if (def.isRequiresChildId()) {
                tasks.push(def.createChildRecord(props, relationData, optsCopy));
            }
            else if (def.isRequiresParentId()) {
                const parent = def.getLocalField(context.parentRelationMap);
                if (parent) {
                    def.setLocalField(props, parent);
                }
            }
        });
        return Promise.all(tasks).then(() => props);
    }
    /**
     * Fired during {@link Mapper#createMany}. See
     * {@link Mapper~beforeCreateManyListener} for how to listen for this event.
     *
     * @event Mapper#beforeCreateMany
     * @see Mapper~beforeCreateManyListener
     * @see Mapper#createMany
     */
    /**
     * Callback signature for the {@link Mapper#event:beforeCreateMany} event.
     *
     * @example
     * function onBeforeCreateMany (records, opts) {
     *   // do something
     * }
     * store.on('beforeCreateMany', onBeforeCreateMany);
     *
     * @callback Mapper~beforeCreateManyListener
     * @param {object} records The `records` argument received by {@link Mapper#beforeCreateMany}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeCreateMany}.
     * @see Mapper#event:beforeCreateMany
     * @see Mapper#createMany
     * @since 3.0.0
     */
    /**
     * Fired during {@link Mapper#createMany}. See
     * {@link Mapper~afterCreateManyListener} for how to listen for this event.
     *
     * @event Mapper#afterCreateMany
     * @see Mapper~afterCreateManyListener
     * @see Mapper#createMany
     */
    /**
     * Callback signature for the {@link Mapper#event:afterCreateMany} event.
     *
     * @example
     * function onAfterCreateMany (records, opts, result) {
     *   // do something
     * }
     * store.on('afterCreateMany', onAfterCreateMany);
     *
     * @callback Mapper~afterCreateManyListener
     * @param {object} records The `records` argument received by {@link Mapper#afterCreateMany}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterCreateMany}.
     * @param {object} result The `result` argument received by {@link Mapper#afterCreateMany}.
     * @see Mapper#event:afterCreateMany
     * @see Mapper#createMany
     * @since 3.0.0
     */
    /**
     * Given an array of records, batch create them via an adapter.
     *
     * {@link Mapper#beforeCreateMany} will be called before calling the adapter.
     * {@link Mapper#afterCreateMany} will be called after calling the adapter.
     *
     * @example
     * // Create and save several new blog posts
     * PostMapper.createMany([{
     *   title: 'Modeling your data',
     *   status: 'draft'
     * }, {
     *   title: 'Reading data',
     *   status: 'draft'
     * }]).then((posts) => {
     *   console.log(posts[0]); // { id: 1234, status: 'draft', ... }
     *   console.log(posts[1]); // { id: 1235, status: 'draft', ... }
     * });
     *
     * @fires Mapper#beforeCreate
     * @fires Mapper#afterCreate
     * @method Mapper#createMany
     * @param {Record[]} records Array of records to be created in one batch.
     * @param {object} [opts] Configuration options. Refer to the `createMany`
     * method of whatever adapter you're using for more configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.noValidate={@link Mapper#noValidate}] See {@link Mapper#noValidate}.
     * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
     * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
     * @param {string[]} [opts.with=[]] Relations to create in a cascading
     * create if `records` contains nested relations. NOT performed in a
     * transaction. Each nested create will result in another {@link Mapper#createMany}
     * call.
     * @param {string[]} [opts.pass=[]] Relations to send to the adapter as part
     * of the payload. Normally relations are not sent.
     * @returns {Promise} Resolves with the created records.
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/saving-data","Saving data"]
     */
    createMany(records = [], opts = {}) {
        // Default values for arguments
        const originalRecords = records;
        let adapterResponse;
        // Fill in "opts" with the Mapper's configuration
        utils._(opts, this);
        opts.adapter = this.getAdapterName(opts);
        // beforeCreateMany lifecycle hook
        opts.op = 'beforeCreateMany';
        return this._runHook(opts.op, records, opts)
            .then(records => {
            // Deep pre-create belongsTo relations
            const belongsToRelationData = {};
            opts.with = opts.with || [];
            let tasks = [];
            utils.forEachRelation(this, opts, (def, optsCopy) => {
                const relationData = records.map(record => def.getLocalField(record)).filter(Boolean);
                if (def.type === belongsToType && relationData.length === records.length) {
                    // Create belongsTo relation first because we need a generated id to
                    // attach to the child
                    optsCopy.raw = false;
                    tasks.push(def
                        .createLinked(relationData, optsCopy)
                        .then(relatedRecords => {
                        records.forEach((record, i) => def.setForeignKey(record, relatedRecords[i]));
                    })
                        .then(relatedRecords => {
                        def.setLocalField(belongsToRelationData, relatedRecords);
                    }));
                }
            });
            return Promise.all(tasks)
                .then(() => {
                opts.op = 'createMany';
                return this._invokeAdapterMethod(opts.op, records, opts);
            })
                .then(result => {
                adapterResponse = result;
            })
                .then(() => {
                const createdRecordsData = opts.raw ? adapterResponse.data : adapterResponse;
                // Deep post-create hasOne relations
                tasks = [];
                utils.forEachRelation(this, opts, (def, optsCopy) => {
                    const relationData = records.map(record => def.getLocalField(record)).filter(Boolean);
                    if (relationData.length !== records.length) {
                        return;
                    }
                    optsCopy.raw = false;
                    const belongsToData = def.getLocalField(belongsToRelationData);
                    let task;
                    // Create hasMany and hasOne after the main create because we needed
                    // a generated id to attach to these items
                    if (def.type === hasManyType) {
                        // Not supported
                        this.log('warn', 'deep createMany of hasMany type not supported!');
                    }
                    else if (def.type === hasOneType) {
                        createdRecordsData.forEach((createdRecordData, i) => {
                            def.setForeignKey(createdRecordData, relationData[i]);
                        });
                        task = def
                            .getRelation()
                            .createMany(relationData, optsCopy)
                            .then(relatedData => {
                            createdRecordsData.forEach((createdRecordData, i) => {
                                def.setLocalField(createdRecordData, relatedData[i]);
                            });
                        });
                    }
                    else if (def.type === belongsToType &&
                        belongsToData &&
                        belongsToData.length === createdRecordsData.length) {
                        createdRecordsData.forEach((createdRecordData, i) => {
                            def.setLocalField(createdRecordData, belongsToData[i]);
                        });
                    }
                    if (task) {
                        tasks.push(task);
                    }
                });
                return Promise.all(tasks).then(() => {
                    return this._commitChanges(originalRecords, createdRecordsData);
                });
            });
        })
            .then(records => {
            if (opts.raw) {
                adapterResponse.data = records;
            }
            else {
                adapterResponse = records;
            }
            const result = this._end(adapterResponse, opts);
            opts.op = 'afterCreateMany';
            return this._runHook(opts.op, records, opts, result);
        });
    }
    /**
     * Create an unsaved, uncached instance of this Mapper's
     * {@link Mapper#recordClass}.
     *
     * Returns `props` if `props` is already an instance of
     * {@link Mapper#recordClass}.
     *
     * __Note:__ This method does __not__ interact with any adapter, and does
     * __not__ save any data. It only creates new objects in memory.
     *
     * @example
     * // Create empty unsaved record instance
     * const post = PostMapper.createRecord();
     *
     * @example
     * // Create an unsaved record instance with inital properties
     * const post = PostMapper.createRecord({
     *   title: 'Modeling your data',
     *   status: 'draft'
     * });
     *
     * @example
     * // Create a record instance that corresponds to a saved record
     * const post = PostMapper.createRecord({
     *   // JSData thinks this record has been saved if it has a primary key
     *   id: 1234,
     *   title: 'Modeling your data',
     *   status: 'draft'
     * });
     *
     * @example
     * // Create record instances from an array
     * const posts = PostMapper.createRecord([{
     *   title: 'Modeling your data',
     *   status: 'draft'
     * }, {
     *   title: 'Reading data',
     *   status: 'draft'
     * }]);
     *
     * @example
     * // Records are validated by default
     * import { Mapper } from 'js-data';
     * const PostMapper = new Mapper({
     *   name: 'post',
     *   schema: { properties: { title: { type: 'string' } } }
     * });
     * try {
     *   const post = PostMapper.createRecord({
     *     title: 1234,
     *   });
     * } catch (err) {
     *   console.log(err.errors); // [{ expected: 'one of (string)', actual: 'number', path: 'title' }]
     * }
     *
     * @example
     * // Skip validation
     * import { Mapper } from 'js-data';
     * const PostMapper = new Mapper({
     *   name: 'post',
     *   schema: { properties: { title: { type: 'string' } } }
     * });
     * const post = PostMapper.createRecord({
     *   title: 1234,
     * }, { noValidate: true });
     * console.log(post.isValid()); // false
     *
     * @method Mapper#createRecord
     * @param {Object|Object[]} props The properties for the Record instance or an
     * array of property objects for the Record instances.
     * @param {object} [opts] Configuration options.
     * @param {boolean} [opts.noValidate={@link Mapper#noValidate}] See {@link Mapper#noValidate}.
     * @returns {Record|Record[]} The Record instance or Record instances.
     * @since 3.0.0
     */
    createRecord(props = {}, opts) {
        if (utils.isArray(props)) {
            return props.map(_props => this.createRecord(_props, opts));
        }
        if (!utils.isObject(props)) {
            throw utils.err(`${DOMAIN$6}#createRecord`, 'props')(400, 'array or object', props);
        }
        if (this.relationList) {
            this.relationList.forEach(def => {
                def.ensureLinkedDataHasProperType(props, opts);
            });
        }
        const RecordCtor = this.recordClass;
        const result = !RecordCtor || props instanceof RecordCtor ? props : new RecordCtor(props, opts);
        return result;
        // Record.mapper = this;
        // return new Record(props);
    }
    /**
     * Lifecycle invocation method. You probably won't call this method directly.
     *
     * @method Mapper#crud
     * @param {string} method Name of the lifecycle method to invoke.
     * @param {...*} args Arguments to pass to the lifecycle method.
     * @returns {Promise}
     * @since 3.0.0
     */
    crud(method, ...args) {
        const config = this.lifecycleMethods[method];
        if (!config) {
            throw utils.err(`${DOMAIN$6}#crud`, method)(404, 'method');
        }
        const upper = `${method.charAt(0).toUpperCase()}${method.substr(1)}`;
        const before = `before${upper}`;
        const after = `after${upper}`;
        let op;
        // Default values for arguments
        config.defaults.forEach((value, i) => {
            if (args[i] === undefined) {
                args[i] = utils.copy(value);
            }
        });
        const opts = args[args.length - 1];
        // Fill in "opts" with the Mapper's configuration
        utils._(opts, this);
        const adapter = opts.adapter = this.getAdapterName(opts);
        // before lifecycle hook
        op = opts.op = before;
        return utils
            .resolve(this[op](...args))
            .then(_value => {
            if (args[config.beforeAssign] !== undefined) {
                // Allow for re-assignment from lifecycle hook
                args[config.beforeAssign] = _value === undefined ? args[config.beforeAssign] : _value;
            }
            // Now delegate to the adapter
            op = opts.op = method;
            args = config.adapterArgs ? config.adapterArgs(this, ...args) : args;
            this.dbg(op, ...args);
            return utils.resolve(this.getAdapter(adapter)[op](this, ...args));
        })
            .then(result => {
            // force noValidate on find/findAll
            const noValidate = /find/.test(op) || opts.noValidate;
            const _opts = Object.assign({}, opts, { noValidate });
            result = this._end(result, _opts, !!config.skip);
            args.push(result);
            // after lifecycle hook
            op = opts.op = after;
            return utils.resolve(this[op](...args)).then(_result => {
                // Allow for re-assignment from lifecycle hook
                return _result === undefined ? result : _result;
            });
        });
    }
    /**
     * Fired during {@link Mapper#destroy}. See
     * {@link Mapper~beforeDestroyListener} for how to listen for this event.
     *
     * @event Mapper#beforeDestroy
     * @see Mapper~beforeDestroyListener
     * @see Mapper#destroy
     */
    /**
     * Callback signature for the {@link Mapper#event:beforeDestroy} event.
     *
     * @example
     * function onBeforeDestroy (id, opts) {
     *   // do something
     * }
     * store.on('beforeDestroy', onBeforeDestroy);
     *
     * @callback Mapper~beforeDestroyListener
     * @param {string|number} id The `id` argument passed to {@link Mapper#beforeDestroy}.
     * @param {object} opts The `opts` argument passed to {@link Mapper#beforeDestroy}.
     * @see Mapper#event:beforeDestroy
     * @see Mapper#destroy
     * @since 3.0.0
     */
    /**
     * Fired during {@link Mapper#destroy}. See
     * {@link Mapper~afterDestroyListener} for how to listen for this event.
     *
     * @event Mapper#afterDestroy
     * @see Mapper~afterDestroyListener
     * @see Mapper#destroy
     */
    /**
     * Callback signature for the {@link Mapper#event:afterDestroy} event.
     *
     * @example
     * function onAfterDestroy (id, opts, result) {
     *   // do something
     * }
     * store.on('afterDestroy', onAfterDestroy);
     *
     * @callback Mapper~afterDestroyListener
     * @param {string|number} id The `id` argument passed to {@link Mapper#afterDestroy}.
     * @param {object} opts The `opts` argument passed to {@link Mapper#afterDestroy}.
     * @param {object} result The `result` argument passed to {@link Mapper#afterDestroy}.
     * @see Mapper#event:afterDestroy
     * @see Mapper#destroy
     * @since 3.0.0
     */
    /**
     * Using an adapter, destroy the record with the given primary key.
     *
     * {@link Mapper#beforeDestroy} will be called before destroying the record.
     * {@link Mapper#afterDestroy} will be called after destroying the record.
     *
     * @example
     * // Destroy a specific blog post
     * PostMapper.destroy(1234).then(() => {
     *   // Blog post #1234 has been destroyed
     * });
     *
     * @example
     * // Get full response
     * PostMapper.destroy(1234, { raw: true }).then((result) => {
     *   console.log(result.deleted); e.g. 1
     *   console.log(...); // etc., more metadata can be found on the result
     * });
     *
     * @fires Mapper#beforeDestroy
     * @fires Mapper#afterDestroy
     * @method Mapper#destroy
     * @param {(string|number)} id The primary key of the record to destroy.
     * @param {object} [opts] Configuration options. Refer to the `destroy` method
     * of whatever adapter you're using for more configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
     * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
     * @returns {Promise} Resolves when the record has been destroyed. Resolves
     * even if no record was found to be destroyed.
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/saving-data","Saving data"]
     */
    destroy(id, opts) {
        return this.crud('destroy', id, opts);
    }
    /**
     * Fired during {@link Mapper#destroyAll}. See
     * {@link Mapper~beforeDestroyAllListener} for how to listen for this event.
     *
     * @event Mapper#beforeDestroyAll
     * @see Mapper~beforeDestroyAllListener
     * @see Mapper#destroyAll
     */
    /**
     * Callback signature for the {@link Mapper#event:beforeDestroyAll} event.
     *
     * @example
     * function onBeforeDestroyAll (query, opts) {
     *   // do something
     * }
     * store.on('beforeDestroyAll', onBeforeDestroyAll);
     *
     * @callback Mapper~beforeDestroyAllListener
     * @param {object} query The `query` argument passed to {@link Mapper#beforeDestroyAll}.
     * @param {object} opts The `opts` argument passed to {@link Mapper#beforeDestroyAll}.
     * @see Mapper#event:beforeDestroyAll
     * @see Mapper#destroyAll
     * @since 3.0.0
     */
    /**
     * Fired during {@link Mapper#destroyAll}. See
     * {@link Mapper~afterDestroyAllListener} for how to listen for this event.
     *
     * @event Mapper#afterDestroyAll
     * @see Mapper~afterDestroyAllListener
     * @see Mapper#destroyAll
     */
    /**
     * Callback signature for the {@link Mapper#event:afterDestroyAll} event.
     *
     * @example
     * function onAfterDestroyAll (query, opts, result) {
     *   // do something
     * }
     * store.on('afterDestroyAll', onAfterDestroyAll);
     *
     * @callback Mapper~afterDestroyAllListener
     * @param {object} query The `query` argument passed to {@link Mapper#afterDestroyAll}.
     * @param {object} opts The `opts` argument passed to {@link Mapper#afterDestroyAll}.
     * @param {object} result The `result` argument passed to {@link Mapper#afterDestroyAll}.
     * @see Mapper#event:afterDestroyAll
     * @see Mapper#destroyAll
     * @since 3.0.0
     */
    /**
     * Destroy the records selected by `query` via an adapter. If no `query` is
     * provided then all records will be destroyed.
     *
     * {@link Mapper#beforeDestroyAll} will be called before destroying the records.
     * {@link Mapper#afterDestroyAll} will be called after destroying the records.
     *
     * @example
     * // Destroy all blog posts
     * PostMapper.destroyAll().then(() => {
     *   // All blog posts have been destroyed
     * });
     *
     * @example
     * // Destroy all "draft" blog posts
     * PostMapper.destroyAll({ status: 'draft' }).then(() => {
     *   // All "draft" blog posts have been destroyed
     * });
     *
     * @example
     * // Get full response
     * const query = null;
     * const options = { raw: true };
     * PostMapper.destroyAll(query, options).then((result) => {
     *   console.log(result.deleted); e.g. 14
     *   console.log(...); // etc., more metadata can be found on the result
     * });
     *
     * @fires Mapper#beforeDestroyAll
     * @fires Mapper#afterDestroyAll
     * @method Mapper#destroyAll
     * @param {object} [query={}] Selection query. See {@link query}.
     * @param {object} [query.where] See {@link query.where}.
     * @param {number} [query.offset] See {@link query.offset}.
     * @param {number} [query.limit] See {@link query.limit}.
     * @param {string|Array[]} [query.orderBy] See {@link query.orderBy}.
     * @param {object} [opts] Configuration options. Refer to the `destroyAll`
     * method of whatever adapter you're using for more configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
     * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
     * @returns {Promise} Resolves when the records have been destroyed. Resolves
     * even if no records were found to be destroyed.
     * @see query
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/saving-data","Saving data"]
     */
    destroyAll(query, opts) {
        return this.crud('destroyAll', query, opts);
    }
    /**
     * Fired during {@link Mapper#find}. See
     * {@link Mapper~beforeFindListener} for how to listen for this event.
     *
     * @event Mapper#beforeFind
     * @see Mapper~beforeFindListener
     * @see Mapper#find
     */
    /**
     * Callback signature for the {@link Mapper#event:beforeFind} event.
     *
     * @example
     * function onBeforeFind (id, opts) {
     *   // do something
     * }
     * store.on('beforeFind', onBeforeFind);
     *
     * @callback Mapper~beforeFindListener
     * @param {string|number} id The `id` argument passed to {@link Mapper#beforeFind}.
     * @param {object} opts The `opts` argument passed to {@link Mapper#beforeFind}.
     * @see Mapper#event:beforeFind
     * @see Mapper#find
     * @since 3.0.0
     */
    /**
     * Fired during {@link Mapper#find}. See
     * {@link Mapper~afterFindListener} for how to listen for this event.
     *
     * @event Mapper#afterFind
     * @see Mapper~afterFindListener
     * @see Mapper#find
     */
    /**
     * Callback signature for the {@link Mapper#event:afterFind} event.
     *
     * @example
     * function onAfterFind (id, opts, result) {
     *   // do something
     * }
     * store.on('afterFind', onAfterFind);
     *
     * @callback Mapper~afterFindListener
     * @param {string|number} id The `id` argument passed to {@link Mapper#afterFind}.
     * @param {object} opts The `opts` argument passed to {@link Mapper#afterFind}.
     * @param {object} result The `result` argument passed to {@link Mapper#afterFind}.
     * @see Mapper#event:afterFind
     * @see Mapper#find
     * @since 3.0.0
     */
    /**
     * Retrieve via an adapter the record with the given primary key.
     *
     * {@link Mapper#beforeFind} will be called before calling the adapter.
     * {@link Mapper#afterFind} will be called after calling the adapter.
     *
     * @example
     * PostMapper.find(1).then((post) => {
     *   console.log(post); // { id: 1, ...}
     * });
     *
     * @example
     * // Get full response
     * PostMapper.find(1, { raw: true }).then((result) => {
     *   console.log(result.data); // { id: 1, ...}
     *   console.log(result.found); // 1
     *   console.log(...); // etc., more metadata can be found on the result
     * });
     *
     * @fires Mapper#beforeFind
     * @fires Mapper#afterFind
     * @method Mapper#find
     * @param {(string|number)} id The primary key of the record to retrieve.
     * @param {object} [opts] Configuration options. Refer to the `find` method
     * of whatever adapter you're using for more configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
     * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
     * @param {string[]} [opts.with=[]] Relations to eager load in the request.
     * @returns {Promise} Resolves with the found record. Resolves with
     * `undefined` if no record was found.
     * @see http://www.js-data.io/v3.0/docs/reading-data
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/reading-data","Reading data"]
     */
    find(id, opts) {
        return this.crud('find', id, opts);
    }
    /**
     * Fired during {@link Mapper#findAll}. See
     * {@link Mapper~beforeFindAllListener} for how to listen for this event.
     *
     * @event Mapper#beforeFindAll
     * @see Mapper~beforeFindAllListener
     * @see Mapper#findAll
     */
    /**
     * Callback signature for the {@link Mapper#event:beforeFindAll} event.
     *
     * @example
     * function onBeforeFindAll (query, opts) {
     *   // do something
     * }
     * store.on('beforeFindAll', onBeforeFindAll);
     *
     * @callback Mapper~beforeFindAllListener
     * @param {object} query The `query` argument passed to {@link Mapper#beforeFindAll}.
     * @param {object} opts The `opts` argument passed to {@link Mapper#beforeFindAll}.
     * @see Mapper#event:beforeFindAll
     * @see Mapper#findAll
     * @since 3.0.0
     */
    /**
     * Fired during {@link Mapper#findAll}. See
     * {@link Mapper~afterFindAllListener} for how to listen for this event.
     *
     * @event Mapper#afterFindAll
     * @see Mapper~afterFindAllListener
     * @see Mapper#findAll
     */
    /**
     * Callback signature for the {@link Mapper#event:afterFindAll} event.
     *
     * @example
     * function onAfterFindAll (query, opts, result) {
     *   // do something
     * }
     * store.on('afterFindAll', onAfterFindAll);
     *
     * @callback Mapper~afterFindAllListener
     * @param {object} query The `query` argument passed to {@link Mapper#afterFindAll}.
     * @param {object} opts The `opts` argument passed to {@link Mapper#afterFindAll}.
     * @param {object} result The `result` argument passed to {@link Mapper#afterFindAll}.
     * @see Mapper#event:afterFindAll
     * @see Mapper#findAll
     * @since 3.0.0
     */
    /**
     * Using the `query` argument, select records to retrieve via an adapter.
     *
     * {@link Mapper#beforeFindAll} will be called before calling the adapter.
     * {@link Mapper#afterFindAll} will be called after calling the adapter.
     *
     * @example
     * // Find all "published" blog posts
     * PostMapper.findAll({ status: 'published' }).then((posts) => {
     *   console.log(posts); // [{ id: 1, status: 'published', ...}, ...]
     * });
     *
     * @example
     * // Get full response
     * PostMapper.findAll({ status: 'published' }, { raw: true }).then((result) => {
     *   console.log(result.data); // [{ id: 1, status: 'published', ...}, ...]
     *   console.log(result.found); // e.g. 13
     *   console.log(...); // etc., more metadata can be found on the result
     * });
     *
     * @fires Mapper#beforeFindAll
     * @fires Mapper#afterFindAll
     * @method Mapper#findAll
     * @param {object} [query={}] Selection query. See {@link query}.
     * @param {object} [query.where] See {@link query.where}.
     * @param {number} [query.offset] See {@link query.offset}.
     * @param {number} [query.limit] See {@link query.limit}.
     * @param {string|Array[]} [query.orderBy] See {@link query.orderBy}.
     * @param {object} [opts] Configuration options. Refer to the `findAll` method
     * of whatever adapter you're using for more configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
     * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
     * @param {string[]} [opts.with=[]] Relations to eager load in the request.
     * @returns {Promise} Resolves with the found records, if any.
     * @see query
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/reading-data","Reading data"]
     */
    findAll(query, opts) {
        return this.crud('findAll', query, opts);
    }
    /**
     * Return the registered adapter with the given name or the default adapter if
     * no name is provided.
     *
     * @method Mapper#getAdapter
     * @param {string} [name] The name of the adapter to retrieve.
     * @returns {Adapter} The adapter.
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/connecting-to-a-data-source","Connecting to a data source"]
     */
    getAdapter(name) {
        this.dbg('getAdapter', 'name:', name);
        const adapter = this.getAdapterName(name);
        if (!adapter) {
            throw utils.err(`${DOMAIN$6}#getAdapter`, 'name')(400, 'string', name);
        }
        return this.getAdapters()[adapter];
    }
    /**
     * Return the name of a registered adapter based on the given name or options,
     * or the name of the default adapter if no name provided.
     *
     * @method Mapper#getAdapterName
     * @param {(Object|string)} [opts] The name of an adapter or options, if any.
     * @returns {string} The name of the adapter.
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/connecting-to-a-data-source","Connecting to a data source"]
     */
    getAdapterName(opts = {}) {
        if (utils.isString(opts)) {
            opts = { adapter: opts };
        }
        return opts.adapter || opts.defaultAdapter;
    }
    /**
     * Get the object of registered adapters for this Mapper.
     *
     * @method Mapper#getAdapters
     * @returns {Object} {@link Mapper#_adapters}
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/connecting-to-a-data-source","Connecting to a data source"]
     */
    getAdapters() {
        return this._adapters;
    }
    /**
     * Returns this Mapper's {@link Schema}.
     *
     * @method Mapper#getSchema
     * @returns {Schema} This Mapper's {@link Schema}.
     * @see Mapper#schema
     * @since 3.0.0
     */
    getSchema() {
        return this.schema;
    }
    /**
     * Defines a hasMany relationship. Only useful if you're managing your
     * Mappers manually and not using a Container or DataStore component.
     *
     * @example
     * UserMapper.hasMany(PostMapper, {
     *   // post.user_id points to user.id
     *   foreignKey: 'user_id'
     *   // post records will be attached to user records at "user.posts"
     *   localField: 'posts'
     * });
     *
     * @method Mapper#hasMany
     * @see http://www.js-data.io/v3.0/docs/relations
     * @since 3.0.0
     */
    hasMany(relatedMapper, opts) {
        return hasMany(relatedMapper, opts)(this);
    }
    /**
     * Defines a hasOne relationship. Only useful if you're managing your Mappers
     * manually and not using a {@link Container} or {@link DataStore} component.
     *
     * @example
     * UserMapper.hasOne(ProfileMapper, {
     *   // profile.user_id points to user.id
     *   foreignKey: 'user_id'
     *   // profile records will be attached to user records at "user.profile"
     *   localField: 'profile'
     * });
     *
     * @method Mapper#hasOne
     * @see http://www.js-data.io/v3.0/docs/relations
     * @since 3.0.0
     */
    hasOne(relatedMapper, opts) {
        return hasOne(relatedMapper, opts)(this);
    }
    /**
     * Return whether `record` is an instance of this Mapper's recordClass.
     *
     * @example
     * const post = PostMapper.createRecord();
     *
     * console.log(PostMapper.is(post)); // true
     * // Equivalent to what's above
     * console.log(post instanceof PostMapper.recordClass); // true
     *
     * @method Mapper#is
     * @param {Object|Record} record The record to check.
     * @returns {boolean} Whether `record` is an instance of this Mapper's
     * {@link Mapper#recordClass}.
     * @since 3.0.0
     */
    is(record) {
        const recordClass = this.recordClass;
        return recordClass ? record instanceof recordClass : false;
    }
    /**
     * Register an adapter on this Mapper under the given name.
     *
     * @method Mapper#registerAdapter
     * @param {string} name The name of the adapter to register.
     * @param {Adapter} adapter The adapter to register.
     * @param {object} [opts] Configuration options.
     * @param {boolean} [opts.default=false] Whether to make the adapter the
     * default adapter for this Mapper.
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/connecting-to-a-data-source","Connecting to a data source"]
     */
    registerAdapter(name, adapter, opts = {}) {
        this.getAdapters()[name] = adapter;
        // Optionally make it the default adapter for the target.
        if (opts === true || opts.default) {
            this.defaultAdapter = name;
        }
    }
    _runHook(hookName, ...hookArgs) {
        const defaultValueIndex = hookName.indexOf('after') === 0 ? hookArgs.length - 1 : 0;
        return utils
            .resolve(this[hookName](...hookArgs))
            .then(overridenResult => (overridenResult === undefined ? hookArgs[defaultValueIndex] : overridenResult));
    }
    _invokeAdapterMethod(method, propsOrRecords, opts) {
        const conversionOptions = { with: opts.pass || [] };
        let object;
        this.dbg(opts.op, propsOrRecords, opts);
        if (utils.isArray(propsOrRecords)) {
            object = propsOrRecords.map(record => this.toJSON(record, conversionOptions));
        }
        else {
            object = this.toJSON(propsOrRecords, conversionOptions);
        }
        return this.getAdapter(opts.adapter)[method](this, object, opts);
    }
    /**
     * Select records according to the `query` argument, and aggregate the sum
     * value of the property specified by `field`.
     *
     * {@link Mapper#beforeSum} will be called before calling the adapter.
     * {@link Mapper#afterSum} will be called after calling the adapter.
     *
     * @example
     * PurchaseOrderMapper.sum('amount', { status: 'paid' }).then((amountPaid) => {
     *   console.log(amountPaid); // e.g. 451125.34
     * });
     *
     * @method Mapper#sum
     * @param {string} field The field to sum.
     * @param {object} [query={}] Selection query. See {@link query}.
     * @param {object} [query.where] See {@link query.where}.
     * @param {number} [query.offset] See {@link query.offset}.
     * @param {number} [query.limit] See {@link query.limit}.
     * @param {string|Array[]} [query.orderBy] See {@link query.orderBy}.
     * @param {object} [opts] Configuration options. Refer to the `sum` method
     * of whatever adapter you're using for more configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
     * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
     * @returns {Promise} Resolves with the aggregated sum.
     * @since 3.0.0
     */
    sum(field, query, opts) {
        return this.crud('sum', field, query, opts);
    }
    /**
     * Return a plain object representation of the given record. Relations can
     * be optionally be included. Non-schema properties can be excluded.
     *
     * @example
     * import { Mapper, Schema } from 'js-data';
     * const PersonMapper = new Mapper({
     *   name: 'person',
     *   schema: {
     *     properties: {
     *       name: { type: 'string' },
     *       id: { type: 'string' }
     *     }
     *   }
     * });
     * const person = PersonMapper.createRecord({ id: 1, name: 'John', foo: 'bar' });
     * // "foo" is stripped by toJSON()
     * console.log(PersonMapper.toJSON(person)); // {"id":1,"name":"John"}
     *
     * const PersonRelaxedMapper = new Mapper({
     *   name: 'personRelaxed',
     *   schema: {
     *     properties: {
     *       name: { type: 'string' },
     *       id: { type: 'string' }
     *     },
     *     additionalProperties: true
     *   }
     * });
     * const person2 = PersonRelaxedMapper.createRecord({ id: 1, name: 'John', foo: 'bar' });
     * // "foo" is not stripped by toJSON
     * console.log(PersonRelaxedMapper.toJSON(person2)); // {"id":1,"name":"John","foo":"bar"}
     *
     * @method Mapper#toJSON
     * @param {Record|Record[]} records Record or records from which to create a
     * POJO representation.
     * @param {object} [opts] Configuration options.
     * @param {string[]} [opts.with] Array of relation names or relation fields
     * to include in the POJO representation.
     * @param {boolean} [opts.withAll] Whether to simply include all relations in
     * the representation. Overrides `opts.with`.
     * @returns {Object|Object[]} POJO representation of the record or records.
     * @since 3.0.0
     */
    toJSON(records, opts = {}) {
        let record;
        if (utils.isArray(records)) {
            return records.map(record => this.toJSON(record, opts));
        }
        else {
            record = records;
        }
        const relationFields = (this ? this.relationFields : []) || [];
        let json = {};
        // Copy properties defined in the schema
        if (this && this.schema) {
            json = this.schema.pick(record);
        }
        else {
            for (const key in record) {
                if (relationFields.indexOf(key) === -1) {
                    json[key] = utils.plainCopy(record[key]);
                }
            }
        }
        // The user wants to include relations in the resulting plain object representation
        if (this && opts.withAll) {
            opts.with = relationFields.slice();
        }
        if (this && opts.with) {
            if (utils.isString(opts.with)) {
                opts.with = [opts.with];
            }
            utils.forEachRelation(this, opts, (def, optsCopy) => {
                const relationData = def.getLocalField(record);
                if (relationData) {
                    // The actual recursion
                    if (utils.isArray(relationData)) {
                        def.setLocalField(json, relationData.map(item => {
                            return def.getRelation().toJSON(item, optsCopy);
                        }));
                    }
                    else {
                        def.setLocalField(json, def.getRelation().toJSON(relationData, optsCopy));
                    }
                }
            });
        }
        return json;
    }
    /**
     * Fired during {@link Mapper#update}. See
     * {@link Mapper~beforeUpdateListener} for how to listen for this event.
     *
     * @event Mapper#beforeUpdate
     * @see Mapper~beforeUpdateListener
     * @see Mapper#update
     */
    /**
     * Callback signature for the {@link Mapper#event:beforeUpdate} event.
     *
     * @example
     * function onBeforeUpdate (id, props, opts) {
     *   // do something
     * }
     * store.on('beforeUpdate', onBeforeUpdate);
     *
     * @callback Mapper~beforeUpdateListener
     * @param {string|number} id The `id` argument passed to {@link Mapper#beforeUpdate}.
     * @param {object} props The `props` argument passed to {@link Mapper#beforeUpdate}.
     * @param {object} opts The `opts` argument passed to {@link Mapper#beforeUpdate}.
     * @see Mapper#event:beforeUpdate
     * @see Mapper#update
     * @since 3.0.0
     */
    /**
     * Fired during {@link Mapper#update}. See
     * {@link Mapper~afterUpdateListener} for how to listen for this event.
     *
     * @event Mapper#afterUpdate
     * @see Mapper~afterUpdateListener
     * @see Mapper#update
     */
    /**
     * Callback signature for the {@link Mapper#event:afterUpdate} event.
     *
     * @example
     * function onAfterUpdate (id, props, opts, result) {
     *   // do something
     * }
     * store.on('afterUpdate', onAfterUpdate);
     *
     * @callback Mapper~afterUpdateListener
     * @param {string|number} id The `id` argument passed to {@link Mapper#afterUpdate}.
     * @param {object} props The `props` argument passed to {@link Mapper#afterUpdate}.
     * @param {object} opts The `opts` argument passed to {@link Mapper#afterUpdate}.
     * @param {object} result The `result` argument passed to {@link Mapper#afterUpdate}.
     * @see Mapper#event:afterUpdate
     * @see Mapper#update
     * @since 3.0.0
     */
    /**
     * Using an adapter, update the record with the primary key specified by the
     * `id` argument.
     *
     * {@link Mapper#beforeUpdate} will be called before updating the record.
     * {@link Mapper#afterUpdate} will be called after updating the record.
     *
     * @example
     * // Update a specific post
     * PostMapper.update(1234, {
     *   status: 'published',
     *   published_at: new Date()
     * }).then((post) => {
     *   console.log(post); // { id: 1234, status: 'published', ... }
     * });
     *
     * @fires Mapper#beforeUpdate
     * @fires Mapper#afterUpdate
     * @method Mapper#update
     * @param {(string|number)} id The primary key of the record to update.
     * @param {object} props The update to apply to the record.
     * @param {object} [opts] Configuration options. Refer to the `update` method
     * of whatever adapter you're using for more configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
     * @param {boolean} [opts.noValidate={@link Mapper#noValidate}] See {@link Mapper#noValidate}.
     * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
     * transaction.
     * @returns {Promise} Resolves with the updated record. Rejects if the record
     * could not be found.
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/saving-data","Saving data"]
     */
    update(id, props, opts) {
        return this.crud('update', id, props, opts);
    }
    /**
     * Fired during {@link Mapper#updateAll}. See
     * {@link Mapper~beforeUpdateAllListener} for how to listen for this event.
     *
     * @event Mapper#beforeUpdateAll
     * @see Mapper~beforeUpdateAllListener
     * @see Mapper#updateAll
     */
    /**
     * Callback signature for the {@link Mapper#event:beforeUpdateAll} event.
     *
     * @example
     * function onBeforeUpdateAll (props, query, opts) {
     *   // do something
     * }
     * store.on('beforeUpdateAll', onBeforeUpdateAll);
     *
     * @callback Mapper~beforeUpdateAllListener
     * @param {object} props The `props` argument received by {@link Mapper#beforeUpdateAll}.
     * @param {object} query The `query` argument received by {@link Mapper#beforeUpdateAll}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeUpdateAll}.
     * @see Mapper#event:beforeUpdateAll
     * @see Mapper#updateAll
     * @since 3.0.0
     */
    /**
     * Fired during {@link Mapper#updateAll}. See
     * {@link Mapper~afterUpdateAllListener} for how to listen for this event.
     *
     * @event Mapper#afterUpdateAll
     * @see Mapper~afterUpdateAllListener
     * @see Mapper#updateAll
     */
    /**
     * Callback signature for the {@link Mapper#event:afterUpdateAll} event.
     *
     * @example
     * function onAfterUpdateAll (props, query, opts, result) {
     *   // do something
     * }
     * store.on('afterUpdateAll', onAfterUpdateAll);
     *
     * @callback Mapper~afterUpdateAllListener
     * @param {object} props The `props` argument received by {@link Mapper#afterUpdateAll}.
     * @param {object} query The `query` argument received by {@link Mapper#afterUpdateAll}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterUpdateAll}.
     * @param {object} result The `result` argument received by {@link Mapper#afterUpdateAll}.
     * @see Mapper#event:afterUpdateAll
     * @see Mapper#updateAll
     * @since 3.0.0
     */
    /**
     * Using the `query` argument, perform the a single updated to the selected
     * records.
     *
     * {@link Mapper#beforeUpdateAll} will be called before making the update.
     * {@link Mapper#afterUpdateAll} will be called after making the update.
     *
     * @example
     * // Turn all of John's blog posts into drafts.
     * const update = { status: draft: published_at: null };
     * const query = { userId: 1234 };
     * PostMapper.updateAll(update, query).then((posts) => {
     *   console.log(posts); // [...]
     * });
     *
     * @fires Mapper#beforeUpdateAll
     * @fires Mapper#afterUpdateAll
     * @method Mapper#updateAll
     * @param {object} props Update to apply to selected records.
     * @param {object} [query={}] Selection query. See {@link query}.
     * @param {object} [query.where] See {@link query.where}.
     * @param {number} [query.offset] See {@link query.offset}.
     * @param {number} [query.limit] See {@link query.limit}.
     * @param {string|Array[]} [query.orderBy] See {@link query.orderBy}.
     * @param {object} [opts] Configuration options. Refer to the `updateAll`
     * method of whatever adapter you're using for more configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
     * @param {boolean} [opts.noValidate={@link Mapper#noValidate}] See {@link Mapper#noValidate}.
     * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
     * @returns {Promise} Resolves with the update records, if any.
     * @see query
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/saving-data","Saving data"]
     */
    updateAll(props, query, opts) {
        return this.crud('updateAll', props, query, opts);
    }
    /**
     * Fired during {@link Mapper#updateMany}. See
     * {@link Mapper~beforeUpdateManyListener} for how to listen for this event.
     *
     * @event Mapper#beforeUpdateMany
     * @see Mapper~beforeUpdateManyListener
     * @see Mapper#updateMany
     */
    /**
     * Callback signature for the {@link Mapper#event:beforeUpdateMany} event.
     *
     * @example
     * function onBeforeUpdateMany (records, opts) {
     *   // do something
     * }
     * store.on('beforeUpdateMany', onBeforeUpdateMany);
     *
     * @callback Mapper~beforeUpdateManyListener
     * @param {object} records The `records` argument received by {@link Mapper#beforeUpdateMany}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeUpdateMany}.
     * @see Mapper#event:beforeUpdateMany
     * @see Mapper#updateMany
     * @since 3.0.0
     */
    /**
     * Fired during {@link Mapper#updateMany}. See
     * {@link Mapper~afterUpdateManyListener} for how to listen for this event.
     *
     * @event Mapper#afterUpdateMany
     * @see Mapper~afterUpdateManyListener
     * @see Mapper#updateMany
     */
    /**
     * Callback signature for the {@link Mapper#event:afterUpdateMany} event.
     *
     * @example
     * function onAfterUpdateMany (records, opts, result) {
     *   // do something
     * }
     * store.on('afterUpdateMany', onAfterUpdateMany);
     *
     * @callback Mapper~afterUpdateManyListener
     * @param {object} records The `records` argument received by {@link Mapper#afterUpdateMany}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterUpdateMany}.
     * @param {object} result The `result` argument received by {@link Mapper#afterUpdateMany}.
     * @see Mapper#event:afterUpdateMany
     * @see Mapper#updateMany
     * @since 3.0.0
     */
    /**
     * Given an array of updates, perform each of the updates via an adapter. Each
     * "update" is a hash of properties with which to update an record. Each
     * update must contain the primary key of the record to be updated.
     *
     * {@link Mapper#beforeUpdateMany} will be called before making the update.
     * {@link Mapper#afterUpdateMany} will be called after making the update.
     *
     * @example
     * PostMapper.updateMany([
     *   { id: 1234, status: 'draft' },
     *   { id: 2468, status: 'published', published_at: new Date() }
     * ]).then((posts) => {
     *   console.log(posts); // [...]
     * });
     *
     * @fires Mapper#beforeUpdateMany
     * @fires Mapper#afterUpdateMany
     * @method Mapper#updateMany
     * @param {Record[]} records Array up record updates.
     * @param {object} [opts] Configuration options. Refer to the `updateMany`
     * method of whatever adapter you're using for more configuration options.
     * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
     * adapter to use.
     * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
     * @param {boolean} [opts.noValidate={@link Mapper#noValidate}] See {@link Mapper#noValidate}.
     * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
     * @returns {Promise} Resolves with the updated records. Rejects if any of the
     * records could be found.
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/saving-data","Saving data"]
     */
    updateMany(records, opts) {
        return this.crud('updateMany', records, opts);
    }
    /**
     * Validate the given record or records according to this Mapper's
     * {@link Schema}. If there are no validation errors then the return value
     * will be `undefined`.
     *
     * @example
     * import {Mapper, Schema} from 'js-data'
     * const PersonSchema = new Schema({
     *   properties: {
     *     name: { type: 'string' },
     *     id: { type: 'string' }
     *   }
     * });
     * const PersonMapper = new Mapper({
     *   name: 'person',
     *   schema: PersonSchema
     * });
     * let errors = PersonMapper.validate({ name: 'John' });
     * console.log(errors); // undefined
     * errors = PersonMapper.validate({ name: 123 });
     * console.log(errors); // [{ expected: 'one of (string)', actual: 'number', path: 'name' }]
     *
     * @method Mapper#validate
     * @param {Object|Object[]} record The record or records to validate.
     * @param {object} [opts] Configuration options. Passed to
     * {@link Schema#validate}.
     * @returns {Object[]} Array of errors or `undefined` if no errors.
     * @since 3.0.0
     */
    validate(record, opts = {}) {
        const schema = this.getSchema();
        if (!schema) {
            return;
        }
        const _opts = utils.pick(opts, ['existingOnly']);
        if (utils.isArray(record)) {
            const errors = record.map(_record => schema.validate(_record, utils.pick(_opts, ['existingOnly'])));
            return errors.some(Boolean) ? errors : undefined;
        }
        return schema.validate(record, _opts);
    }
    /**
     * Method used to wrap data returned by an adapter with this Mapper's
     * {@link Mapper#recordClass}. This method is used by all of a Mapper's CRUD
     * methods. The provided implementation of this method assumes that the `data`
     * passed to it is a record or records that need to be wrapped with
     * {@link Mapper#createRecord}. Override with care.
     *
     * Provided implementation of {@link Mapper#wrap}:
     *
     * ```
     * function (data, opts) {
     *   return this.createRecord(data, opts);
     * }
     * ```
     *
     * @example
     * const PostMapper = new Mapper({
     *   name: 'post',
     *   // Override to customize behavior
     *   wrap (data, opts) {
     *     const originalWrap = this.constructor.prototype.wrap;
     *     // Let's say "GET /post" doesn't return JSON quite like JSData expects,
     *     // but the actual post records are nested under a "posts" field. So,
     *     // we override Mapper#wrap to handle this special case.
     *     if (opts.op === 'findAll') {
     *       return originalWrap.call(this, data.posts, opts);
     *     }
     *     // Otherwise perform original behavior
     *     return originalWrap.call(this, data, opts);
     *   }
     * });
     *
     * @method Mapper#wrap
     * @param {Object|Object[]} data The record or records to be wrapped.
     * @param {object} [opts] Configuration options. Passed to {@link Mapper#createRecord}.
     * @returns {Record|Record[]} The wrapped record or records.
     * @since 3.0.0
     */
    wrap(data, opts) {
        return this.createRecord(data, opts);
    }
    /**
     * @ignore
     */
    defineRelations() {
        // Setup the mapper's relations, including generating Mapper#relationList
        // and Mapper#relationFields
        utils.forOwn(this.relations, (group, type) => {
            utils.forOwn(group, (relations, _name) => {
                if (utils.isObject(relations)) {
                    relations = [relations];
                }
                relations.forEach(def => {
                    const relatedMapper = this.datastore.getMapperByName(_name) || _name;
                    def.getRelation = () => this.datastore.getMapper(_name);
                    if (typeof Relation[type] !== 'function') {
                        throw utils.err(DOMAIN$6, 'defineRelations')(400, 'relation type (hasOne, hasMany, etc)', type, true);
                    }
                    this[type](relatedMapper, def);
                });
            });
        });
    }
}
/**
 * Create a subclass of this Mapper:
 *
 * @example <caption>Mapper.extend</caption>
 * const JSData = require('js-data');
 * const { Mapper } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * // Extend the class using ES2015 class syntax.
 * class CustomMapperClass extends Mapper {
 *   foo () { return 'bar'; }
 *   static beep () { return 'boop'; }
 * };
 * const customMapper = new CustomMapperClass();
 * console.log(customMapper.foo());
 * console.log(CustomMapperClass.beep());
 *
 * // Extend the class using alternate method.
 * const OtherMapperClass = Mapper.extend({
 *   foo () { return 'bar'; }
 * }, {
 *   beep () { return 'boop'; }
 * });
 * const otherMapper = new OtherMapperClass();
 * console.log(otherMapper.foo());
 * console.log(OtherMapperClass.beep());
 *
 * // Extend the class, providing a custom constructor.
 * function AnotherMapperClass () {
 *   Mapper.call(this);
 *   this.created_at = new Date().getTime();
 * }
 * Mapper.extend({
 *   constructor: AnotherMapperClass,
 *   foo () { return 'bar'; }
 * }, {
 *   beep () { return 'boop'; }
 * })
 * const anotherMapper = new AnotherMapperClass();
 * console.log(anotherMapper.created_at);
 * console.log(anotherMapper.foo());
 * console.log(AnotherMapperClass.beep());
 *
 * @method Mapper.extend
 * @param {object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {object} [props.constructor] Provide a custom constructor function
 * to be used as the subclass itself.
 * @param {object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this Mapper class.
 * @since 3.0.0
 */

const DOMAIN$7 = 'Container';
const proxiedMapperMethods = [
    'count',
    'create',
    'createMany',
    'createRecord',
    'destroy',
    'destroyAll',
    'find',
    'findAll',
    'getSchema',
    'is',
    'sum',
    'toJSON',
    'update',
    'updateAll',
    'updateMany',
    'validate'
];
/**
 * The `Container` class is a place to define and store {@link Mapper} instances.
 *
 * `Container` makes it easy to manage your Mappers. Without a container, you
 * need to manage Mappers yourself, including resolving circular dependencies
 * among relations. All Mappers in a container share the same adapters, so you
 * don't have to register adapters for every single Mapper.
 *
 * @example <caption>Container#constructor</caption>
 * // import { Container } from 'js-data';
 * const JSData = require('js-data');
 * const {Container} = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * const store = new Container();
 *
 * @class Container
 * @extends Component
 * @param {object} [opts] Configuration options.
 * @param {boolean} [opts.debug=false] See {@link Component#debug}.
 * @param {Constructor} [opts.mapperClass] See {@link Container#mapperClass}.
 * @param {object} [opts.mapperDefaults] See {@link Container#mapperDefaults}.
 * @since 3.0.0
 */
class Container extends Component {
    constructor(opts = {}) {
        super();
        Object.defineProperties(this, {
            /**
             * The adapters registered with this Container, which are also shared by all
             * Mappers in this Container.
             *
             * @name Container#_adapters
             * @see Container#registerAdapter
             * @since 3.0.0
             * @type {Object}
             */
            _adapters: {
                value: {}
            },
            /**
             * The the mappers in this container
             *
             * @name Container#_mappers
             * @see Mapper
             * @since 3.0.0
             * @type {Object}
             */
            _mappers: {
                value: {}
            },
            /**
             * Constructor function to use in {@link Container#defineMapper} to create new
             * {@link Mapper} instances. {@link Container#mapperClass} should extend
             * {@link Mapper}. By default {@link Mapper} is used to instantiate Mappers.
             *
             * @example <caption>Container#mapperClass</caption>
             * // import { Container, Mapper } from 'js-data';
             * const JSData = require('js-data');
             * const { Container, Mapper } = JSData;
             * console.log('Using JSData v' + JSData.version.full);
             *
             * class MyMapperClass extends Mapper {
             *   foo () { return 'bar' }
             * }
             * const store = new Container({
             *   mapperClass: MyMapperClass
             * });
             * store.defineMapper('user');
             * console.log(store.getMapper('user').foo());
             *
             * @name Container#mapperClass
             * @see Mapper
             * @since 3.0.0
             * @type {Constructor}
             */
            mapperClass: {
                value: undefined,
                writable: true
            }
        });
        // Apply options provided by the user
        utils.fillIn(this, opts);
        /**
         * Defaults options to pass to {@link Container#mapperClass} when creating a
         * new {@link Mapper}.
         *
         * @example <caption>Container#mapperDefaults</caption>
         * // import { Container } from 'js-data';
         * const JSData = require('js-data');
         * const { Container } = JSData;
         * console.log('Using JSData v' + JSData.version.full);
         *
         * const store = new Container({
         *   mapperDefaults: {
         *     idAttribute: '_id'
         *   }
         * });
         * store.defineMapper('user');
         * console.log(store.getMapper('user').idAttribute);
         *
         * @default {}
         * @name Container#mapperDefaults
         * @since 3.0.0
         * @type {Object}
         */
        this.mapperDefaults = this.mapperDefaults || {};
        // Use the Mapper class if the user didn't provide a mapperClass
        this.mapperClass = this.mapperClass || Mapper;
    }
    /**
     * Register a new event listener on this Container.
     *
     * Proxy for {@link Component#on}. If an event was emitted by a {@link Mapper}
     * in the Container, then the name of the {@link Mapper} will be prepended to
     * the arugments passed to the listener.
     *
     * @example <caption>Container#on</caption>
     * // import { Container } from 'js-data';
     * const JSData = require('js-data');
     * const { Container } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const store = new Container();
     * store.on('foo', function (...args) { console.log(args.join(':')) });
     * store.defineMapper('user');
     * store.emit('foo', 'arg1', 'arg2');
     * store.getMapper('user').emit('foo', 'arg1', 'arg2');
     *
     * @method Container#on
     * @param {string} event Name of event to subsribe to.
     * @param {Function} listener Listener function to handle the event.
     * @param {*} [ctx] Optional content in which to invoke the listener.
     * @since 3.0.0
     */
    /**
     * Used to bind to events emitted by mappers in this container.
     *
     * @method Container#_onMapperEvent
     * @param {string} name Name of the mapper that emitted the event.
     * @param {...*} [args] Args See {@link Mapper#emit}.
     * @private
     * @since 3.0.0
     */
    _onMapperEvent(name, ...args) {
        const type = args.shift();
        this.emit(type, name, ...args);
    }
    /**
     * Return a container scoped to a particular mapper.
     *
     * @example <caption>Container#as</caption>
     * // import { Container } from 'js-data';
     * const JSData = require('js-data');
     * const { Container } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const store = new Container();
     * const UserMapper = store.defineMapper('user');
     * const UserStore = store.as('user');
     *
     * const user1 = store.createRecord('user', { name: 'John' });
     * const user2 = UserStore.createRecord({ name: 'John' });
     * const user3 = UserMapper.createRecord({ name: 'John' });
     * console.log(user1 === user2);
     * console.log(user2 === user3);
     * console.log(user1 === user3);
     *
     * @method Container#as
     * @param {string} name Name of the {@link Mapper}.
     * @returns {Object} A container scoped to a particular mapper.
     * @since 3.0.0
     */
    as(name) {
        const props = {};
        const original = this;
        proxiedMapperMethods.forEach(method => {
            props[method] = {
                writable: true,
                value(...args) {
                    return original[method](name, ...args);
                }
            };
        });
        props.getMapper = {
            writable: true,
            value() {
                return original.getMapper(name);
            }
        };
        return Object.create(this, props);
    }
    /**
     * Create a new mapper and register it in this container.
     *
     * @example <caption>Container#defineMapper</caption>
     * // import { Container } from 'js-data';
     * const JSData = require('js-data');
     * const { Container } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const store = new Container({
     *   mapperDefaults: { foo: 'bar' }
     * });
     * // Container#defineMapper returns a direct reference to the newly created
     * // Mapper.
     * const UserMapper = store.defineMapper('user');
     * console.log(UserMapper === store.getMapper('user'));
     * console.log(UserMapper === store.as('user').getMapper());
     * console.log(UserMapper.foo);
     *
     * @method Container#defineMapper
     * @param {string} name Name under which to register the new {@link Mapper}.
     * {@link Mapper#name} will be set to this value.
     * @param {object} [opts] Configuration options. Passed to
     * {@link Container#mapperClass} when creating the new {@link Mapper}.
     * @returns {Mapper} The newly created instance of {@link Mapper}.
     * @see Container#as
     * @since 3.0.0
     */
    defineMapper(name, opts) {
        // For backwards compatibility with defineResource
        if (utils.isObject(name)) {
            opts = name;
            name = opts.name;
        }
        if (!utils.isString(name)) {
            throw utils.err(`${DOMAIN$7}#defineMapper`, 'name')(400, 'string', name);
        }
        // Default values for arguments
        opts = opts || {};
        // Set Mapper#name
        opts.name = name;
        opts.relations = opts.relations || {};
        // Check if the user is overriding the datastore's default mapperClass
        const mapperClass = opts.mapperClass || this.mapperClass;
        delete opts.mapperClass;
        // Apply the datastore's defaults to the options going into the mapper
        utils.fillIn(opts, this.mapperDefaults);
        // Instantiate a mapper
        const mapper = (this._mappers[name] = new mapperClass(opts)); // eslint-disable-line
        mapper.relations = mapper.relations || {};
        // Make sure the mapper's name is set
        mapper.name = name;
        // All mappers in this datastore will share adapters
        mapper._adapters = this.getAdapters();
        mapper.datastore = this;
        mapper.on('all', (...args) => this._onMapperEvent(name, ...args));
        mapper.defineRelations();
        return mapper;
    }
    defineResource(name, opts) {
        console.warn('DEPRECATED: defineResource is deprecated, use defineMapper instead');
        return this.defineMapper(name, opts);
    }
    /**
     * Return the registered adapter with the given name or the default adapter if
     * no name is provided.
     *
     * @method Container#getAdapter
     * @param {string} [name] The name of the adapter to retrieve.
     * @returns {Adapter} The adapter.
     * @since 3.0.0
     */
    getAdapter(name) {
        const adapter = this.getAdapterName(name);
        if (!adapter) {
            throw utils.err(`${DOMAIN$7}#getAdapter`, 'name')(400, 'string', name);
        }
        return this.getAdapters()[adapter];
    }
    /**
     * Return the name of a registered adapter based on the given name or options,
     * or the name of the default adapter if no name provided.
     *
     * @method Container#getAdapterName
     * @param {(Object|string)} [opts] The name of an adapter or options, if any.
     * @returns {string} The name of the adapter.
     * @since 3.0.0
     */
    getAdapterName(opts = {}) {
        if (utils.isString(opts)) {
            opts = { adapter: opts };
        }
        return opts.adapter || this.mapperDefaults.defaultAdapter;
    }
    /**
     * Return the registered adapters of this container.
     *
     * @method Container#getAdapters
     * @returns {Adapter}
     * @since 3.0.0
     */
    getAdapters() {
        return this._adapters;
    }
    /**
     * Return the mapper registered under the specified name.
     *
     * @example <caption>Container#getMapper</caption>
     * // import { Container } from 'js-data';
     * const JSData = require('js-data');
     * const { Container } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const store = new Container();
     * // Container#defineMapper returns a direct reference to the newly created
     * // Mapper.
     * const UserMapper = store.defineMapper('user');
     * console.log(UserMapper === store.getMapper('user'));
     * console.log(UserMapper === store.as('user').getMapper());
     * store.getMapper('profile'); // throws Error, there is no mapper with name "profile"
     *
     * @method Container#getMapper
     * @param {string} name {@link Mapper#name}.
     * @returns {Mapper}
     * @since 3.0.0
     */
    getMapper(name) {
        const mapper = this.getMapperByName(name);
        if (!mapper) {
            throw utils.err(`${DOMAIN$7}#getMapper`, name)(404, 'mapper');
        }
        return mapper;
    }
    /**
     * Return the mapper registered under the specified name.
     * Doesn't throw error if mapper doesn't exist.
     *
     * @example <caption>Container#getMapperByName</caption>
     * // import { Container } from 'js-data';
     * const JSData = require('js-data');
     * const { Container } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const store = new Container();
     * // Container#defineMapper returns a direct reference to the newly created
     * // Mapper.
     * const UserMapper = store.defineMapper('user');
     * console.log(UserMapper === store.getMapper('user'));
     * console.log(UserMapper === store.as('user').getMapper());
     * console.log(store.getMapper('profile')); // Does NOT throw an error
     *
     * @method Container#getMapperByName
     * @param {string} name {@link Mapper#name}.
     * @returns {Mapper}
     * @since 3.0.0
     */
    getMapperByName(name) {
        return this._mappers[name];
    }
    /**
     * Register an adapter on this container under the given name. Adapters
     * registered on a container are shared by all mappers in the container.
     *
     * @example
     * import { Container } from 'js-data';
     * import { RethinkDBAdapter } from 'js-data-rethinkdb';
     * const store = new Container();
     * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true });
     *
     * @method Container#registerAdapter
     * @param {string} name The name of the adapter to register.
     * @param {Adapter} adapter The adapter to register.
     * @param {object} [opts] Configuration options.
     * @param {boolean} [opts.default=false] Whether to make the adapter the
     * default adapter for all Mappers in this container.
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/connecting-to-a-data-source","Connecting to a data source"]
     */
    registerAdapter(name, adapter, opts = {}) {
        this.getAdapters()[name] = adapter;
        // Optionally make it the default adapter for the target.
        if (opts === true || opts.default) {
            this.mapperDefaults.defaultAdapter = name;
            utils.forOwn(this._mappers, mapper => {
                mapper.defaultAdapter = name;
            });
        }
    }
    /**
     * Wrapper for {@link Mapper#count}.
     *
     * @example
     * // Get the number of published blog posts
     * import { Container } from 'js-data';
     * import RethinkDBAdapter from 'js-data-rethinkdb';
     * const store = new Container();
     * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true });
     * store.defineMapper('post');
     *
     * store.count('post', { status: 'published' }).then((numPublished) => {
     *   console.log(numPublished); // e.g. 45
     * });
     *
     * @method Container#count
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {object} [query] See {@link Mapper#count}.
     * @param {object} [opts] See {@link Mapper#count}.
     * @returns {Promise} See {@link Mapper#count}.
     * @see Mapper#count
     * @since 3.0.0
     */
    count(name, query, opts) {
        return this.getMapper(name).count(query, opts);
    }
    /**
     * Fired during {@link Container#create}. See
     * {@link Container~beforeCreateListener} for how to listen for this event.
     *
     * @event Container#beforeCreate
     * @see Container~beforeCreateListener
     * @see Container#create
     */
    /**
     * Callback signature for the {@link Container#event:beforeCreate} event.
     *
     * @example
     * function onBeforeCreate (mapperName, props, opts) {
     *   // do something
     * }
     * store.on('beforeCreate', onBeforeCreate);
     *
     * @callback Container~beforeCreateListener
     * @param {string} name The `name` argument received by {@link Mapper#beforeCreate}.
     * @param {object} props The `props` argument received by {@link Mapper#beforeCreate}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeCreate}.
     * @see Container#event:beforeCreate
     * @see Container#create
     * @since 3.0.0
     */
    /**
     * Fired during {@link Container#create}. See
     * {@link Container~afterCreateListener} for how to listen for this event.
     *
     * @event Container#afterCreate
     * @see Container~afterCreateListener
     * @see Container#create
     */
    /**
     * Callback signature for the {@link Container#event:afterCreate} event.
     *
     * @example
     * function onAfterCreate (mapperName, props, opts, result) {
     *   // do something
     * }
     * store.on('afterCreate', onAfterCreate);
     *
     * @callback Container~afterCreateListener
     * @param {string} name The `name` argument received by {@link Mapper#afterCreate}.
     * @param {object} props The `props` argument received by {@link Mapper#afterCreate}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterCreate}.
     * @param {object} result The `result` argument received by {@link Mapper#afterCreate}.
     * @see Container#event:afterCreate
     * @see Container#create
     * @since 3.0.0
     */
    /**
     * Wrapper for {@link Mapper#create}.
     *
     * @example
     * // Create and save a new blog post
     * import { Container } from 'js-data';
     * import RethinkDBAdapter from 'js-data-rethinkdb';
     * const store = new Container();
     * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true });
     * store.defineMapper('post');
     *
     * store.create('post', {
     *   title: 'Modeling your data',
     *   status: 'draft'
     * }).then((post) => {
     *   console.log(post); // { id: 1234, status: 'draft', ... }
     * });
     *
     * @fires Container#beforeCreate
     * @fires Container#afterCreate
     * @method Container#create
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {object} props See {@link Mapper#create}.
     * @param {object} [opts] See {@link Mapper#create}.
     * @returns {Promise} See {@link Mapper#create}.
     * @see Mapper#create
     * @since 3.0.0
     */
    create(name, props, opts) {
        return this.getMapper(name).create(props, opts);
    }
    /**
     * Fired during {@link Container#createMany}. See
     * {@link Container~beforeCreateManyListener} for how to listen for this event.
     *
     * @event Container#beforeCreateMany
     * @see Container~beforeCreateManyListener
     * @see Container#createMany
     */
    /**
     * Callback signature for the {@link Container#event:beforeCreateMany} event.
     *
     * @example
     * function onBeforeCreateMany (mapperName, records, opts) {
     *   // do something
     * }
     * store.on('beforeCreateMany', onBeforeCreateMany);
     *
     * @callback Container~beforeCreateManyListener
     * @param {string} name The `name` argument received by {@link Mapper#beforeCreateMany}.
     * @param {object} records The `records` argument received by {@link Mapper#beforeCreateMany}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeCreateMany}.
     * @see Container#event:beforeCreateMany
     * @see Container#createMany
     * @since 3.0.0
     */
    /**
     * Fired during {@link Container#createMany}. See
     * {@link Container~afterCreateManyListener} for how to listen for this event.
     *
     * @event Container#afterCreateMany
     * @see Container~afterCreateManyListener
     * @see Container#createMany
     */
    /**
     * Callback signature for the {@link Container#event:afterCreateMany} event.
     *
     * @example
     * function onAfterCreateMany (mapperName, records, opts, result) {
     *   // do something
     * }
     * store.on('afterCreateMany', onAfterCreateMany);
     *
     * @callback Container~afterCreateManyListener
     * @param {string} name The `name` argument received by {@link Mapper#afterCreateMany}.
     * @param {object} records The `records` argument received by {@link Mapper#afterCreateMany}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterCreateMany}.
     * @param {object} result The `result` argument received by {@link Mapper#afterCreateMany}.
     * @see Container#event:afterCreateMany
     * @see Container#createMany
     * @since 3.0.0
     */
    /**
     * Wrapper for {@link Mapper#createMany}.
     *
     * @example
     * // Create and save several new blog posts
     * import { Container } from 'js-data';
     * import RethinkDBAdapter from 'js-data-rethinkdb';
     * const store = new Container();
     * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true });
     * store.defineMapper('post');
     *
     * store.createMany('post', [{
     *   title: 'Modeling your data',
     *   status: 'draft'
     * }, {
     *   title: 'Reading data',
     *   status: 'draft'
     * }]).then((posts) => {
     *   console.log(posts[0]); // { id: 1234, status: 'draft', ... }
     *   console.log(posts[1]); // { id: 1235, status: 'draft', ... }
     * });
     *
     * @fires Container#beforeCreateMany
     * @fires Container#afterCreateMany
     * @method Container#createMany
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {Record[]} records See {@link Mapper#createMany}.
     * @param {object} [opts] See {@link Mapper#createMany}.
     * @returns {Promise} See {@link Mapper#createMany}.
     * @see Mapper#createMany
     * @since 3.0.0
     */
    createMany(name, records, opts) {
        return this.getMapper(name).createMany(records, opts);
    }
    /**
     * Wrapper for {@link Mapper#createRecord}.
     *
     * __Note:__ This method does __not__ interact with any adapter, and does
     * __not__ save any data. It only creates new objects in memory.
     *
     * @example
     * // Create empty unsaved record instance
     * import { Container } from 'js-data';
     * const store = new Container();
     * store.defineMapper('post');
     * const post = PostMapper.createRecord();
     *
     * @method Container#createRecord
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {Object|Object[]} props See {@link Mapper#createRecord}.
     * @param {object} [opts] See {@link Mapper#createRecord}.
     * @returns {Promise} See {@link Mapper#createRecord}.
     * @see Mapper#createRecord
     * @since 3.0.0
     */
    createRecord(name, props, opts) {
        return this.getMapper(name).createRecord(props, opts);
    }
    /**
     * Fired during {@link Container#destroy}. See
     * {@link Container~beforeDestroyListener} for how to listen for this event.
     *
     * @event Container#beforeDestroy
     * @see Container~beforeDestroyListener
     * @see Container#destroy
     */
    /**
     * Callback signature for the {@link Container#event:beforeDestroy} event.
     *
     * @example
     * function onBeforeDestroy (mapperName, id, opts) {
     *   // do something
     * }
     * store.on('beforeDestroy', onBeforeDestroy);
     *
     * @callback Container~beforeDestroyListener
     * @param {string} name The `name` argument received by {@link Mapper#beforeDestroy}.
     * @param {string|number} id The `id` argument received by {@link Mapper#beforeDestroy}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeDestroy}.
     * @see Container#event:beforeDestroy
     * @see Container#destroy
     * @since 3.0.0
     */
    /**
     * Fired during {@link Container#destroy}. See
     * {@link Container~afterDestroyListener} for how to listen for this event.
     *
     * @event Container#afterDestroy
     * @see Container~afterDestroyListener
     * @see Container#destroy
     */
    /**
     * Callback signature for the {@link Container#event:afterDestroy} event.
     *
     * @example
     * function onAfterDestroy (mapperName, id, opts, result) {
     *   // do something
     * }
     * store.on('afterDestroy', onAfterDestroy);
     *
     * @callback Container~afterDestroyListener
     * @param {string} name The `name` argument received by {@link Mapper#afterDestroy}.
     * @param {string|number} id The `id` argument received by {@link Mapper#afterDestroy}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterDestroy}.
     * @param {object} result The `result` argument received by {@link Mapper#afterDestroy}.
     * @see Container#event:afterDestroy
     * @see Container#destroy
     * @since 3.0.0
     */
    /**
     * Wrapper for {@link Mapper#destroy}.
     *
     * @example
     * // Destroy a specific blog post
     * import { Container } from 'js-data';
     * import RethinkDBAdapter from 'js-data-rethinkdb';
     * const store = new Container();
     * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true });
     * store.defineMapper('post');
     *
     * store.destroy('post', 1234).then(() => {
     *   // Blog post #1234 has been destroyed
     * });
     *
     * @fires Container#beforeDestroy
     * @fires Container#afterDestroy
     * @method Container#destroy
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {(string|number)} id See {@link Mapper#destroy}.
     * @param {object} [opts] See {@link Mapper#destroy}.
     * @returns {Promise} See {@link Mapper#destroy}.
     * @see Mapper#destroy
     * @since 3.0.0
     */
    destroy(name, id, opts) {
        return this.getMapper(name).destroy(id, opts);
    }
    /**
     * Fired during {@link Container#destroyAll}. See
     * {@link Container~beforeDestroyAllListener} for how to listen for this event.
     *
     * @event Container#beforeDestroyAll
     * @see Container~beforeDestroyAllListener
     * @see Container#destroyAll
     */
    /**
     * Callback signature for the {@link Container#event:beforeDestroyAll} event.
     *
     * @example
     * function onBeforeDestroyAll (mapperName, query, opts) {
     *   // do something
     * }
     * store.on('beforeDestroyAll', onBeforeDestroyAll);
     *
     * @callback Container~beforeDestroyAllListener
     * @param {string} name The `name` argument received by {@link Mapper#beforeDestroyAll}.
     * @param {object} query The `query` argument received by {@link Mapper#beforeDestroyAll}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeDestroyAll}.
     * @see Container#event:beforeDestroyAll
     * @see Container#destroyAll
     * @since 3.0.0
     */
    /**
     * Fired during {@link Container#destroyAll}. See
     * {@link Container~afterDestroyAllListener} for how to listen for this event.
     *
     * @event Container#afterDestroyAll
     * @see Container~afterDestroyAllListener
     * @see Container#destroyAll
     */
    /**
     * Callback signature for the {@link Container#event:afterDestroyAll} event.
     *
     * @example
     * function onAfterDestroyAll (mapperName, query, opts, result) {
     *   // do something
     * }
     * store.on('afterDestroyAll', onAfterDestroyAll);
     *
     * @callback Container~afterDestroyAllListener
     * @param {string} name The `name` argument received by {@link Mapper#afterDestroyAll}.
     * @param {object} query The `query` argument received by {@link Mapper#afterDestroyAll}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterDestroyAll}.
     * @param {object} result The `result` argument received by {@link Mapper#afterDestroyAll}.
     * @see Container#event:afterDestroyAll
     * @see Container#destroyAll
     * @since 3.0.0
     */
    /**
     * Wrapper for {@link Mapper#destroyAll}.
     *
     * @example
     * // Destroy all "draft" blog posts
     * import { Container } from 'js-data';
     * import RethinkDBAdapter from 'js-data-rethinkdb';
     * const store = new Container();
     * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true });
     * store.defineMapper('post');
     *
     * store.destroyAll('post', { status: 'draft' }).then(() => {
     *   // All "draft" blog posts have been destroyed
     * });
     *
     * @fires Container#beforeDestroyAll
     * @fires Container#afterDestroyAll
     * @method Container#destroyAll
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {object} [query] See {@link Mapper#destroyAll}.
     * @param {object} [opts] See {@link Mapper#destroyAll}.
     * @returns {Promise} See {@link Mapper#destroyAll}.
     * @see Mapper#destroyAll
     * @since 3.0.0
     */
    destroyAll(name, query, opts) {
        return this.getMapper(name).destroyAll(query, opts);
    }
    /**
     * Fired during {@link Container#find}. See
     * {@link Container~beforeFindListener} for how to listen for this event.
     *
     * @event Container#beforeFind
     * @see Container~beforeFindListener
     * @see Container#find
     */
    /**
     * Callback signature for the {@link Container#event:beforeFind} event.
     *
     * @example
     * function onBeforeFind (mapperName, id, opts) {
     *   // do something
     * }
     * store.on('beforeFind', onBeforeFind);
     *
     * @callback Container~beforeFindListener
     * @param {string} name The `name` argument received by {@link Mapper#beforeFind}.
     * @param {string|number} id The `id` argument received by {@link Mapper#beforeFind}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeFind}.
     * @see Container#event:beforeFind
     * @see Container#find
     * @since 3.0.0
     */
    /**
     * Fired during {@link Container#find}. See
     * {@link Container~afterFindListener} for how to listen for this event.
     *
     * @event Container#afterFind
     * @see Container~afterFindListener
     * @see Container#find
     */
    /**
     * Callback signature for the {@link Container#event:afterFind} event.
     *
     * @example
     * function onAfterFind (mapperName, id, opts, result) {
     *   // do something
     * }
     * store.on('afterFind', onAfterFind);
     *
     * @callback Container~afterFindListener
     * @param {string} name The `name` argument received by {@link Mapper#afterFind}.
     * @param {string|number} id The `id` argument received by {@link Mapper#afterFind}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterFind}.
     * @param {object} result The `result` argument received by {@link Mapper#afterFind}.
     * @see Container#event:afterFind
     * @see Container#find
     * @since 3.0.0
     */
    /**
     * Wrapper for {@link Mapper#find}.
     *
     * @example
     * import { Container } from 'js-data';
     * import RethinkDBAdapter from 'js-data-rethinkdb';
     * const store = new Container();
     * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true });
     * store.defineMapper('post');
     *
     * store.find('post', 1).then((post) => {
     *   console.log(post) // { id: 1, ...}
     * });
     *
     * @fires Container#beforeFind
     * @fires Container#afterFind
     * @method Container#find
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {(string|number)} id See {@link Mapper#find}.
     * @param {object} [opts] See {@link Mapper#find}.
     * @returns {Promise} See {@link Mapper#find}.
     * @see Mapper#find
     * @since 3.0.0
     */
    find(name, id, opts) {
        return this.getMapper(name).find(id, opts);
    }
    /**
     * Fired during {@link Container#findAll}. See
     * {@link Container~beforeFindAllListener} for how to listen for this event.
     *
     * @event Container#beforeFindAll
     * @see Container~beforeFindAllListener
     * @see Container#findAll
     */
    /**
     * Callback signature for the {@link Container#event:beforeFindAll} event.
     *
     * @example
     * function onBeforeFindAll (mapperName, query, opts) {
     *   // do something
     * }
     * store.on('beforeFindAll', onBeforeFindAll);
     *
     * @callback Container~beforeFindAllListener
     * @param {string} name The `name` argument received by {@link Mapper#beforeFindAll}.
     * @param {object} query The `query` argument received by {@link Mapper#beforeFindAll}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeFindAll}.
     * @see Container#event:beforeFindAll
     * @see Container#findAll
     * @since 3.0.0
     */
    /**
     * Fired during {@link Container#findAll}. See
     * {@link Container~afterFindAllListener} for how to listen for this event.
     *
     * @event Container#afterFindAll
     * @see Container~afterFindAllListener
     * @see Container#findAll
     */
    /**
     * Callback signature for the {@link Container#event:afterFindAll} event.
     *
     * @example
     * function onAfterFindAll (mapperName, query, opts, result) {
     *   // do something
     * }
     * store.on('afterFindAll', onAfterFindAll);
     *
     * @callback Container~afterFindAllListener
     * @param {string} name The `name` argument received by {@link Mapper#afterFindAll}.
     * @param {object} query The `query` argument received by {@link Mapper#afterFindAll}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterFindAll}.
     * @param {object} result The `result` argument received by {@link Mapper#afterFindAll}.
     * @see Container#event:afterFindAll
     * @see Container#findAll
     * @since 3.0.0
     */
    /**
     * Wrapper for {@link Mapper#createRecord}.
     *
     * @example
     * // Find all "published" blog posts
     * import { Container } from 'js-data';
     * import RethinkDBAdapter from 'js-data-rethinkdb';
     * const store = new Container();
     * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true });
     * store.defineMapper('post');
     *
     * store.findAll('post', { status: 'published' }).then((posts) => {
     *   console.log(posts); // [{ id: 1, ...}, ...]
     * });
     *
     * @fires Container#beforeFindAll
     * @fires Container#afterFindAll
     * @method Container#findAll
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {object} [query] See {@link Mapper#findAll}.
     * @param {object} [opts] See {@link Mapper#findAll}.
     * @returns {Promise} See {@link Mapper#findAll}.
     * @see Mapper#findAll
     * @since 3.0.0
     */
    findAll(name, query, opts) {
        return this.getMapper(name).findAll(query, opts);
    }
    /**
     * Wrapper for {@link Mapper#getSchema}.
     *
     * @method Container#getSchema
     * @param {string} name Name of the {@link Mapper} to target.
     * @returns {Schema} See {@link Mapper#getSchema}.
     * @see Mapper#getSchema
     * @since 3.0.0
     */
    getSchema(name) {
        return this.getMapper(name).getSchema();
    }
    /**
     * Wrapper for {@link Mapper#is}.
     *
     * @example
     * import { Container } from 'js-data';
     * const store = new Container();
     * store.defineMapper('post');
     * const post = store.createRecord();
     *
     * console.log(store.is('post', post)); // true
     * // Equivalent to what's above
     * console.log(post instanceof store.getMapper('post').recordClass); // true
     *
     * @method Container#is
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {Object|Record} record See {@link Mapper#is}.
     * @returns {boolean} See {@link Mapper#is}.
     * @see Mapper#is
     * @since 3.0.0
     */
    is(name, record) {
        return this.getMapper(name).is(record);
    }
    /**
     * Wrapper for {@link Mapper#sum}.
     *
     * @example
     * import { Container } from 'js-data';
     * import RethinkDBAdapter from 'js-data-rethinkdb';
     * const store = new Container();
     * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true });
     * store.defineMapper('purchase_order');
     *
     * store.sum('purchase_order', 'amount', { status: 'paid' }).then((amountPaid) => {
     *   console.log(amountPaid); // e.g. 451125.34
     * });
     *
     * @method Container#sum
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {string} field See {@link Mapper#sum}.
     * @param {object} [query] See {@link Mapper#sum}.
     * @param {object} [opts] See {@link Mapper#sum}.
     * @returns {Promise} See {@link Mapper#sum}.
     * @see Mapper#sum
     * @since 3.0.0
     */
    sum(name, field, query, opts) {
        return this.getMapper(name).sum(field, query, opts);
    }
    /**
     * Wrapper for {@link Mapper#toJSON}.
     *
     * @example
     * import { Container } from 'js-data';
     * import RethinkDBAdapter from 'js-data-rethinkdb';
     * const store = new Container();
     * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true });
     * store.defineMapper('person', {
     *   schema: {
     *     properties: {
     *       name: { type: 'string' },
     *       id: { type: 'string' }
     *     }
     *   }
     * });
     * const person = store.createRecord('person', { id: 1, name: 'John', foo: 'bar' });
     * // "foo" is stripped by toJSON()
     * console.log(store.toJSON('person', person)); // {"id":1,"name":"John"}
     *
     * store.defineMapper('personRelaxed', {
     *   schema: {
     *     properties: {
     *       name: { type: 'string' },
     *       id: { type: 'string' }
     *     },
     *     additionalProperties: true
     *   }
     * });
     * const person2 = store.createRecord('personRelaxed', { id: 1, name: 'John', foo: 'bar' });
     * // "foo" is not stripped by toJSON
     * console.log(store.toJSON('personRelaxed', person2)); // {"id":1,"name":"John","foo":"bar"}
     *
     * @method Container#toJSON
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {Record|Record[]} records See {@link Mapper#toJSON}.
     * @param {object} [opts] See {@link Mapper#toJSON}.
     * @returns {Object|Object[]} See {@link Mapper#toJSON}.
     * @see Mapper#toJSON
     * @since 3.0.0
     */
    toJSON(name, records, opts) {
        return this.getMapper(name).toJSON(records, opts);
    }
    /**
     * Fired during {@link Container#update}. See
     * {@link Container~beforeUpdateListener} for how to listen for this event.
     *
     * @event Container#beforeUpdate
     * @see Container~beforeUpdateListener
     * @see Container#update
     */
    /**
     * Callback signature for the {@link Container#event:beforeUpdate} event.
     *
     * @example
     * function onBeforeUpdate (mapperName, id, props, opts) {
     *   // do something
     * }
     * store.on('beforeUpdate', onBeforeUpdate);
     *
     * @callback Container~beforeUpdateListener
     * @param {string} name The `name` argument received by {@link Mapper#beforeUpdate}.
     * @param {string|number} id The `id` argument received by {@link Mapper#beforeUpdate}.
     * @param {object} props The `props` argument received by {@link Mapper#beforeUpdate}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeUpdate}.
     * @see Container#event:beforeUpdate
     * @see Container#update
     * @since 3.0.0
     */
    /**
     * Fired during {@link Container#update}. See
     * {@link Container~afterUpdateListener} for how to listen for this event.
     *
     * @event Container#afterUpdate
     * @see Container~afterUpdateListener
     * @see Container#update
     */
    /**
     * Callback signature for the {@link Container#event:afterUpdate} event.
     *
     * @example
     * function onAfterUpdate (mapperName, id, props, opts, result) {
     *   // do something
     * }
     * store.on('afterUpdate', onAfterUpdate);
     *
     * @callback Container~afterUpdateListener
     * @param {string} name The `name` argument received by {@link Mapper#afterUpdate}.
     * @param {string|number} id The `id` argument received by {@link Mapper#afterUpdate}.
     * @param {object} props The `props` argument received by {@link Mapper#afterUpdate}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterUpdate}.
     * @param {object} result The `result` argument received by {@link Mapper#afterUpdate}.
     * @see Container#event:afterUpdate
     * @see Container#update
     * @since 3.0.0
     */
    /**
     * Wrapper for {@link Mapper#update}.
     *
     * @example
     * import { Container } from 'js-data';
     * import RethinkDBAdapter from 'js-data-rethinkdb';
     * const store = new Container();
     * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true });
     * store.defineMapper('post');
     *
     * store.update('post', 1234, {
     *   status: 'published',
     *   published_at: new Date()
     * }).then((post) => {
     *   console.log(post); // { id: 1234, status: 'published', ... }
     * });
     *
     * @fires Container#beforeUpdate
     * @fires Container#afterUpdate
     * @method Container#update
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {(string|number)} id See {@link Mapper#update}.
     * @param {object} props See {@link Mapper#update}.
     * @param {object} [opts] See {@link Mapper#update}.
     * @returns {Promise} See {@link Mapper#update}.
     * @see Mapper#update
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/saving-data","Saving data"]
     */
    update(name, id, props, opts) {
        return this.getMapper(name).update(id, props, opts);
    }
    /**
     * Fired during {@link Container#updateAll}. See
     * {@link Container~beforeUpdateAllListener} for how to listen for this event.
     *
     * @event Container#beforeUpdateAll
     * @see Container~beforeUpdateAllListener
     * @see Container#updateAll
     */
    /**
     * Callback signature for the {@link Container#event:beforeUpdateAll} event.
     *
     * @example
     * function onBeforeUpdateAll (mapperName, props, query, opts) {
     *   // do something
     * }
     * store.on('beforeUpdateAll', onBeforeUpdateAll);
     *
     * @callback Container~beforeUpdateAllListener
     * @param {string} name The `name` argument received by {@link Mapper#beforeUpdateAll}.
     * @param {object} props The `props` argument received by {@link Mapper#beforeUpdateAll}.
     * @param {object} query The `query` argument received by {@link Mapper#beforeUpdateAll}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeUpdateAll}.
     * @see Container#event:beforeUpdateAll
     * @see Container#updateAll
     * @since 3.0.0
     */
    /**
     * Fired during {@link Container#updateAll}. See
     * {@link Container~afterUpdateAllListener} for how to listen for this event.
     *
     * @event Container#afterUpdateAll
     * @see Container~afterUpdateAllListener
     * @see Container#updateAll
     */
    /**
     * Callback signature for the {@link Container#event:afterUpdateAll} event.
     *
     * @example
     * function onAfterUpdateAll (mapperName, props, query, opts, result) {
     *   // do something
     * }
     * store.on('afterUpdateAll', onAfterUpdateAll);
     *
     * @callback Container~afterUpdateAllListener
     * @param {string} name The `name` argument received by {@link Mapper#afterUpdateAll}.
     * @param {object} props The `props` argument received by {@link Mapper#afterUpdateAll}.
     * @param {object} query The `query` argument received by {@link Mapper#afterUpdateAll}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterUpdateAll}.
     * @param {object} result The `result` argument received by {@link Mapper#afterUpdateAll}.
     * @see Container#event:afterUpdateAll
     * @see Container#updateAll
     * @since 3.0.0
     */
    /**
     * Wrapper for {@link Mapper#updateAll}.
     *
     * @example
     * // Turn all of John's blog posts into drafts.
     * import { Container } from 'js-data';
     * import RethinkDBAdapter from 'js-data-rethinkdb';
     * const store = new Container();
     * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true });
     * store.defineMapper('post');
     *
     * const update = { status: draft: published_at: null };
     * const query = { userId: 1234 };
     * store.updateAll('post', update, query).then((posts) => {
     *   console.log(posts); // [...]
     * });
     *
     * @fires Container#beforeUpdateAll
     * @fires Container#afterUpdateAll
     * @method Container#updateAll
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {object} props See {@link Mapper#updateAll}.
     * @param {object} [query] See {@link Mapper#updateAll}.
     * @param {object} [opts] See {@link Mapper#updateAll}.
     * @returns {Promise} See {@link Mapper#updateAll}.
     * @see Mapper#updateAll
     * @since 3.0.0
     */
    updateAll(name, props, query, opts) {
        return this.getMapper(name).updateAll(props, query, opts);
    }
    /**
     * Fired during {@link Container#updateMany}. See
     * {@link Container~beforeUpdateManyListener} for how to listen for this event.
     *
     * @event Container#beforeUpdateMany
     * @see Container~beforeUpdateManyListener
     * @see Container#updateMany
     */
    /**
     * Callback signature for the {@link Container#event:beforeUpdateMany} event.
     *
     * @example
     * function onBeforeUpdateMany (mapperName, records, opts) {
     *   // do something
     * }
     * store.on('beforeUpdateMany', onBeforeUpdateMany);
     *
     * @callback Container~beforeUpdateManyListener
     * @param {string} name The `name` argument received by {@link Mapper#beforeUpdateMany}.
     * @param {object} records The `records` argument received by {@link Mapper#beforeUpdateMany}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeUpdateMany}.
     * @see Container#event:beforeUpdateMany
     * @see Container#updateMany
     * @since 3.0.0
     */
    /**
     * Fired during {@link Container#updateMany}. See
     * {@link Container~afterUpdateManyListener} for how to listen for this event.
     *
     * @event Container#afterUpdateMany
     * @see Container~afterUpdateManyListener
     * @see Container#updateMany
     */
    /**
     * Callback signature for the {@link Container#event:afterUpdateMany} event.
     *
     * @example
     * function onAfterUpdateMany (mapperName, records, opts, result) {
     *   // do something
     * }
     * store.on('afterUpdateMany', onAfterUpdateMany);
     *
     * @callback Container~afterUpdateManyListener
     * @param {string} name The `name` argument received by {@link Mapper#afterUpdateMany}.
     * @param {object} records The `records` argument received by {@link Mapper#afterUpdateMany}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterUpdateMany}.
     * @param {object} result The `result` argument received by {@link Mapper#afterUpdateMany}.
     * @see Container#event:afterUpdateMany
     * @see Container#updateMany
     * @since 3.0.0
     */
    /**
     * Wrapper for {@link Mapper#updateMany}.
     *
     * @example
     * import { Container } from 'js-data';
     * import RethinkDBAdapter from 'js-data-rethinkdb';
     * const store = new Container();
     * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true });
     * store.defineMapper('post');
     *
     * store.updateMany('post', [
     *   { id: 1234, status: 'draft' },
     *   { id: 2468, status: 'published', published_at: new Date() }
     * ]).then((posts) => {
     *   console.log(posts); // [...]
     * });
     *
     * @fires Container#beforeUpdateMany
     * @fires Container#afterUpdateMany
     * @method Container#updateMany
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {(Object[]|Record[])} records See {@link Mapper#updateMany}.
     * @param {object} [opts] See {@link Mapper#updateMany}.
     * @returns {Promise} See {@link Mapper#updateMany}.
     * @see Mapper#updateMany
     * @since 3.0.0
     */
    updateMany(name, record, opts) {
        return this.getMapper(name).updateMany(record, opts);
    }
    /**
     * Wrapper for {@link Mapper#validate}.
     *
     * @example
     * import { Container } from 'js-data';
     * const store = new Container();
     * store.defineMapper('post', {
     *   schema: {
     *     properties: {
     *       name: { type: 'string' },
     *       id: { type: 'string' }
     *     }
     *   }
     * });
     * let errors = store.validate('post', { name: 'John' });
     * console.log(errors); // undefined
     * errors = store.validate('post', { name: 123 });
     * console.log(errors); // [{ expected: 'one of (string)', actual: 'number', path: 'name' }]
     *
     * @method Container#validate
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {(Object[]|Record[])} records See {@link Mapper#validate}.
     * @param {object} [opts] See {@link Mapper#validate}.
     * @returns {Promise} See {@link Mapper#validate}.
     * @see Mapper#validate
     * @since 3.0.0
     */
    validate(name, record, opts) {
        return this.getMapper(name).validate(record, opts);
    }
}

const DOMAIN$8 = 'SimpleStore';
const proxiedCollectionMethods = [
    'add',
    'between',
    'createIndex',
    'filter',
    'get',
    'getAll',
    'prune',
    'query',
    'toJSON',
    'unsaved'
];
const ownMethodsForScoping = ['addToCache', 'cachedFind', 'cachedFindAll', 'cacheFind', 'cacheFindAll', 'hashQuery'];
const cachedFn = function (name, hashOrId, opts) {
    const cached = this._completedQueries[name][hashOrId];
    if (utils.isFunction(cached)) {
        return cached(name, hashOrId, opts);
    }
    return cached;
};
const SIMPLESTORE_DEFAULTS = {
    /**
     * Whether to use the pending query if a `find` request for the specified
     * record is currently underway. Can be set to `true`, `false`, or to a
     * function that returns `true` or `false`.
     *
     * @default true
     * @name SimpleStore#usePendingFind
     * @since 3.0.0
     * @type {boolean|Function}
     */
    usePendingFind: true,
    /**
     * Whether to use the pending query if a `findAll` request for the given query
     * is currently underway. Can be set to `true`, `false`, or to a function that
     * returns `true` or `false`.
     *
     * @default true
     * @name SimpleStore#usePendingFindAll
     * @since 3.0.0
     * @type {boolean|Function}
     */
    usePendingFindAll: true
};
/**
 * The `SimpleStore` class is an extension of {@link Container}. Not only does
 * `SimpleStore` manage mappers, but also collections. `SimpleStore` implements the
 * asynchronous {@link Mapper} methods, such as {@link Mapper#find} and
 * {@link Mapper#create}. If you use the asynchronous `SimpleStore` methods
 * instead of calling them directly on the mappers, then the results of the
 * method calls will be inserted into the store's collections. You can think of
 * a `SimpleStore` as an [Identity Map](https://en.wikipedia.org/wiki/Identity_map_pattern)
 * for the [ORM](https://en.wikipedia.org/wiki/Object-relational_mapping)
 * (the Mappers).
 *
 * ```javascript
 * import { SimpleStore } from 'js-data';
 * ```
 *
 * @example
 * import { SimpleStore } from 'js-data';
 * import { HttpAdapter } from 'js-data-http';
 * const store = new SimpleStore();
 *
 * // SimpleStore#defineMapper returns a direct reference to the newly created
 * // Mapper.
 * const UserMapper = store.defineMapper('user');
 *
 * // SimpleStore#as returns the store scoped to a particular Mapper.
 * const UserStore = store.as('user');
 *
 * // Call "find" on "UserMapper" (Stateless ORM)
 * UserMapper.find(1).then((user) => {
 *   // retrieved a "user" record via the http adapter, but that's it
 *
 *   // Call "find" on "store" targeting "user" (Stateful SimpleStore)
 *   return store.find('user', 1); // same as "UserStore.find(1)"
 * }).then((user) => {
 *   // not only was a "user" record retrieved, but it was added to the
 *   // store's "user" collection
 *   const cachedUser = store.getCollection('user').get(1);
 *   console.log(user === cachedUser); // true
 * });
 *
 * @class SimpleStore
 * @extends Container
 * @param {object} [opts] Configuration options. See {@link Container}.
 * @param {boolean} [opts.collectionClass={@link Collection}] See {@link SimpleStore#collectionClass}.
 * @param {boolean} [opts.debug=false] See {@link Component#debug}.
 * @param {boolean|Function} [opts.usePendingFind=true] See {@link SimpleStore#usePendingFind}.
 * @param {boolean|Function} [opts.usePendingFindAll=true] See {@link SimpleStore#usePendingFindAll}.
 * @returns {SimpleStore}
 * @see Container
 * @since 3.0.0
 * @tutorial ["http://www.js-data.io/v3.0/docs/components-of-jsdata#SimpleStore","Components of JSData: SimpleStore"]
 * @tutorial ["http://www.js-data.io/v3.0/docs/working-with-the-SimpleStore","Working with the SimpleStore"]
 * @tutorial ["http://www.js-data.io/v3.0/docs/jsdata-and-the-browser","Notes on using JSData in the Browser"]
 */
class SimpleStore extends Container {
    constructor(opts = {}) {
        super(Object.assign(Object.assign({}, SIMPLESTORE_DEFAULTS), opts));
        this._collections = {};
        this._completedQueries = {};
        this._pendingQueries = {};
        /**
         * Retrieve a cached `find` result, if any. This method is called during
         * {@link SimpleStore#find} to determine if {@link Mapper#find} needs to be
         * called. If this method returns `undefined` then {@link Mapper#find} will
         * be called. Otherwise {@link SimpleStore#find} will immediately resolve with
         * the return value of this method.
         *
         * When using {@link SimpleStore} in the browser, you can override this method
         * to implement your own cache-busting strategy.
         *
         * @example
         * const store = new SimpleStore({
         *   cachedFind (mapperName, id, opts) {
         *     // Let's say for a particular Resource, we always want to pull fresh from the server
         *     if (mapperName === 'schedule') {
         *       // Return undefined to trigger a Mapper#find call
         *       return;
         *     }
         *     // Otherwise perform default behavior
         *     return SimpleStore.prototype.cachedFind.call(this, mapperName, id, opts);
         *   }
         * });
         *
         * @example
         * // Extend using ES2015 class syntax.
         * class MyStore extends SimpleStore {
         *   cachedFind (mapperName, id, opts) {
         *     // Let's say for a particular Resource, we always want to pull fresh from the server
         *     if (mapperName === 'schedule') {
         *       // Return undefined to trigger a Mapper#find call
         *       return;
         *     }
         *     // Otherwise perform default behavior
         *     return super.cachedFind(mapperName, id, opts);
         *   }
         * }
         * const store = new MyStore();
         *
         * @method SimpleStore#cachedFind
         * @param {string} name The `name` argument passed to {@link SimpleStore#find}.
         * @param {(string|number)} id The `id` argument passed to {@link SimpleStore#find}.
         * @param {object} opts The `opts` argument passed to {@link SimpleStore#find}.
         * @since 3.0.0
         */
        this.cachedFind = cachedFn;
        /**
         * Retrieve a cached `findAll` result, if any. This method is called during
         * {@link SimpleStore#findAll} to determine if {@link Mapper#findAll} needs to be
         * called. If this method returns `undefined` then {@link Mapper#findAll} will
         * be called. Otherwise {@link SimpleStore#findAll} will immediately resolve with
         * the return value of this method.
         *
         * When using {@link SimpleStore} in the browser, you can override this method
         * to implement your own cache-busting strategy.
         *
         * @example
         * const store = new SimpleStore({
         *   cachedFindAll (mapperName, hash, opts) {
         *     // Let's say for a particular Resource, we always want to pull fresh from the server
         *     if (mapperName === 'schedule') {
         *       // Return undefined to trigger a Mapper#findAll call
         *       return undefined;
         *     }
         *     // Otherwise perform default behavior
         *     return SimpleStore.prototype.cachedFindAll.call(this, mapperName, hash, opts);
         *   }
         * });
         *
         * @example
         * // Extend using ES2015 class syntax.
         * class MyStore extends SimpleStore {
         *   cachedFindAll (mapperName, hash, opts) {
         *     // Let's say for a particular Resource, we always want to pull fresh from the server
         *     if (mapperName === 'schedule') {
         *       // Return undefined to trigger a Mapper#findAll call
         *       return undefined;
         *     }
         *     // Otherwise perform default behavior
         *     return super.cachedFindAll(mapperName, hash, opts);
         *   }
         * }
         * const store = new MyStore();
         *
         * @method SimpleStore#cachedFindAll
         * @param {string} name The `name` argument passed to {@link SimpleStore#findAll}.
         * @param {string} hash The result of calling {@link SimpleStore#hashQuery} on
         * the `query` argument passed to {@link SimpleStore#findAll}.
         * @param {object} opts The `opts` argument passed to {@link SimpleStore#findAll}.
         * @since 3.0.0
         */
        this.cachedFindAll = cachedFn;
        this.collectionClass = this.collectionClass || Collection;
    }
    /**
     * Internal method used to handle Mapper responses.
     *
     * @method SimpleStore#_end
     * @private
     * @param {string} name Name of the {@link Collection} to which to
     * add the data.
     * @param {object} result The result from a Mapper.
     * @param {object} [opts] Configuration options.
     * @returns {(Object|Array)} Result.
     */
    _end(name, result, opts) {
        let data = opts.raw ? result.data : result;
        if (data && utils.isFunction(this.addToCache)) {
            data = this.addToCache(name, data, opts);
            if (opts.raw) {
                result.data = data;
            }
            else {
                result = data;
            }
        }
        return result;
    }
    /**
     * Register a new event listener on this SimpleStore.
     *
     * Proxy for {@link Container#on}. If an event was emitted by a Mapper or
     * Collection in the SimpleStore, then the name of the Mapper or Collection will
     * be prepended to the arugments passed to the provided event handler.
     *
     * @example
     * // Listen for all "afterCreate" events in a SimpleStore
     * store.on('afterCreate', (mapperName, props, opts, result) => {
     *   console.log(mapperName); // "post"
     *   console.log(props.id); // undefined
     *   console.log(result.id); // 1234
     * });
     * store.create('post', { title: 'Modeling your data' }).then((post) => {
     *   console.log(post.id); // 1234
     * });
     *
     * @example
     * // Listen for the "add" event on a collection
     * store.on('add', (mapperName, records) => {
     *   console.log(records); // [...]
     * });
     *
     * @example
     * // Listen for "change" events on a record
     * store.on('change', (mapperName, record, changes) => {
     *   console.log(changes); // { changed: { title: 'Modeling your data' } }
     * });
     * post.title = 'Modeling your data';
     *
     * @method SimpleStore#on
     * @param {string} event Name of event to subsribe to.
     * @param {Function} listener Listener function to handle the event.
     * @param {*} [ctx] Optional content in which to invoke the listener.
     */
    /**
     * Used to bind to events emitted by collections in this store.
     *
     * @method SimpleStore#_onCollectionEvent
     * @private
     * @param {string} name Name of the collection that emitted the event.
     * @param {...*} [args] Args passed to {@link Collection#emit}.
     */
    _onCollectionEvent(name, ...args) {
        const type = args.shift();
        this.emit(type, name, ...args);
    }
    /**
     * This method takes the data received from {@link SimpleStore#find},
     * {@link SimpleStore#findAll}, {@link SimpleStore#update}, etc., and adds the
     * data to the store. _You don't need to call this method directly._
     *
     * If you're using the http adapter and your response data is in an unexpected
     * format, you may need to override this method so the right data gets added
     * to the store.
     *
     * @example
     * const store = new SimpleStore({
     *   addToCache (mapperName, data, opts) {
     *     // Let's say for a particular Resource, response data is in a weird format
     *     if (name === 'comment') {
     *       // Re-assign the variable to add the correct records into the stores
     *       data = data.items;
     *     }
     *     // Now perform default behavior
     *     return SimpleStore.prototype.addToCache.call(this, mapperName, data, opts);
     *   }
     * });
     *
     * @example
     * // Extend using ES2015 class syntax.
     * class MyStore extends SimpleStore {
     *   addToCache (mapperName, data, opts) {
     *     // Let's say for a particular Resource, response data is in a weird format
     *     if (name === 'comment') {
     *       // Re-assign the variable to add the correct records into the stores
     *       data = data.items;
     *     }
     *     // Now perform default behavior
     *     return super.addToCache(mapperName, data, opts);
     *   }
     * }
     * const store = new MyStore();
     *
     * @method SimpleStore#addToCache
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {*} data Data from which data should be selected for add.
     * @param {object} [opts] Configuration options.
     */
    addToCache(name, data, opts) {
        return this.getCollection(name).add(data, opts);
    }
    /**
     * Return the store scoped to a particular mapper/collection pair.
     *
     * @example <caption>SimpleStore.as</caption>
     * const JSData = require('js-data');
     * const { SimpleStore } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const store = new SimpleStore();
     * const UserMapper = store.defineMapper('user');
     * const UserStore = store.as('user');
     *
     * const user1 = store.createRecord('user', { name: 'John' });
     * const user2 = UserStore.createRecord({ name: 'John' });
     * const user3 = UserMapper.createRecord({ name: 'John' });
     * console.log(user1 === user2);
     * console.log(user2 === user3);
     * console.log(user1 === user3);
     *
     * @method SimpleStore#as
     * @param {string} name Name of the {@link Mapper}.
     * @returns {Object} The store, scoped to a particular Mapper/Collection pair.
     * @since 3.0.0
     */
    as(name) {
        const props = {};
        const original = this;
        const methods = ownMethodsForScoping.concat(proxiedMapperMethods).concat(proxiedCollectionMethods);
        methods.forEach(method => {
            props[method] = {
                writable: true,
                value(...args) {
                    return original[method](name, ...args);
                }
            };
        });
        props.getMapper = {
            writable: true,
            value() {
                return original.getMapper(name);
            }
        };
        props.getCollection = {
            writable: true,
            value() {
                return original.getCollection(name);
            }
        };
        return Object.create(this, props);
    }
    /**
     * Mark a {@link Mapper#find} result as cached by adding an entry to
     * {@link SimpleStore#_completedQueries}. By default, once a `find` entry is
     * added it means subsequent calls to the same Resource with the same `id`
     * argument will immediately resolve with the result of calling
     * {@link SimpleStore#get} instead of delegating to {@link Mapper#find}.
     *
     * As part of implementing your own caching strategy, you may choose to
     * override this method.
     *
     * @example
     * const store = new SimpleStore({
     *   cacheFind (mapperName, data, id, opts) {
     *     // Let's say for a particular Resource, we always want to pull fresh from the server
     *     if (mapperName === 'schedule') {
     *       // Return without saving an entry to SimpleStore#_completedQueries
     *       return;
     *     }
     *     // Otherwise perform default behavior
     *     return SimpleStore.prototype.cacheFind.call(this, mapperName, data, id, opts);
     *   }
     * });
     *
     * @example
     * // Extend using ES2015 class syntax.
     * class MyStore extends SimpleStore {
     *   cacheFind (mapperName, data, id, opts) {
     *     // Let's say for a particular Resource, we always want to pull fresh from the server
     *     if (mapperName === 'schedule') {
     *       // Return without saving an entry to SimpleStore#_completedQueries
     *       return;
     *     }
     *     // Otherwise perform default behavior
     *     return super.cacheFind(mapperName, data, id, opts);
     *   }
     * }
     * const store = new MyStore();
     *
     * @method SimpleStore#cacheFind
     * @param {string} name The `name` argument passed to {@link SimpleStore#find}.
     * @param {*} data The result to cache.
     * @param {(string|number)} id The `id` argument passed to {@link SimpleStore#find}.
     * @param {object} opts The `opts` argument passed to {@link SimpleStore#find}.
     * @since 3.0.0
     */
    cacheFind(name, data, id, opts) {
        this._completedQueries[name][id] = (name, id, opts) => this.get(name, id);
    }
    /**
     * Mark a {@link Mapper#findAll} result as cached by adding an entry to
     * {@link SimpleStore#_completedQueries}. By default, once a `findAll` entry is
     * added it means subsequent calls to the same Resource with the same `query`
     * argument will immediately resolve with the result of calling
     * {@link SimpleStore#filter} instead of delegating to {@link Mapper#findAll}.
     *
     * As part of implementing your own caching strategy, you may choose to
     * override this method.
     *
     * @example
     * const store = new SimpleStore({
     *   cachedFindAll (mapperName, data, hash, opts) {
     *     // Let's say for a particular Resource, we always want to pull fresh from the server
     *     if (mapperName === 'schedule') {
     *       // Return without saving an entry to SimpleStore#_completedQueries
     *       return;
     *     }
     *     // Otherwise perform default behavior.
     *     return SimpleStore.prototype.cachedFindAll.call(this, mapperName, data, hash, opts);
     *   }
     * });
     *
     * @example
     * // Extend using ES2015 class syntax.
     * class MyStore extends SimpleStore {
     *   cachedFindAll (mapperName, data, hash, opts) {
     *     // Let's say for a particular Resource, we always want to pull fresh from the server
     *     if (mapperName === 'schedule') {
     *       // Return without saving an entry to SimpleStore#_completedQueries
     *       return;
     *     }
     *     // Otherwise perform default behavior.
     *     return super.cachedFindAll(mapperName, data, hash, opts);
     *   }
     * }
     * const store = new MyStore();
     *
     * @method SimpleStore#cacheFindAll
     * @param {string} name The `name` argument passed to {@link SimpleStore#findAll}.
     * @param {*} data The result to cache.
     * @param {string} hash The result of calling {@link SimpleStore#hashQuery} on
     * the `query` argument passed to {@link SimpleStore#findAll}.
     * @param {object} opts The `opts` argument passed to {@link SimpleStore#findAll}.
     * @since 3.0.0
     */
    cacheFindAll(name, data, hash, opts) {
        this._completedQueries[name][hash] = (name, hash, opts) => this.filter(name, utils.fromJson(hash));
    }
    /**
     * Remove __all__ records from the in-memory store and reset
     * {@link SimpleStore#_completedQueries}.
     *
     * @method SimpleStore#clear
     * @returns {Object} Object containing all records that were in the store.
     * @see SimpleStore#remove
     * @see SimpleStore#removeAll
     * @since 3.0.0
     */
    clear() {
        const removed = {};
        utils.forOwn(this._collections, (collection, name) => {
            removed[name] = collection.removeAll();
            this._completedQueries[name] = {};
        });
        return removed;
    }
    /**
     * Fired during {@link SimpleStore#create}. See
     * {@link SimpleStore~beforeCreateListener} for how to listen for this event.
     *
     * @event SimpleStore#beforeCreate
     * @see SimpleStore~beforeCreateListener
     * @see SimpleStore#create
     */
    /**
     * Callback signature for the {@link SimpleStore#event:beforeCreate} event.
     *
     * @example
     * function onBeforeCreate (mapperName, props, opts) {
     *   // do something
     * }
     * store.on('beforeCreate', onBeforeCreate);
     *
     * @callback SimpleStore~beforeCreateListener
     * @param {string} name The `name` argument received by {@link Mapper#beforeCreate}.
     * @param {object} props The `props` argument received by {@link Mapper#beforeCreate}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeCreate}.
     * @see SimpleStore#event:beforeCreate
     * @see SimpleStore#create
     * @since 3.0.0
     */
    /**
     * Fired during {@link SimpleStore#create}. See
     * {@link SimpleStore~afterCreateListener} for how to listen for this event.
     *
     * @event SimpleStore#afterCreate
     * @see SimpleStore~afterCreateListener
     * @see SimpleStore#create
     */
    /**
     * Callback signature for the {@link SimpleStore#event:afterCreate} event.
     *
     * @example
     * function onAfterCreate (mapperName, props, opts, result) {
     *   // do something
     * }
     * store.on('afterCreate', onAfterCreate);
     *
     * @callback SimpleStore~afterCreateListener
     * @param {string} name The `name` argument received by {@link Mapper#afterCreate}.
     * @param {object} props The `props` argument received by {@link Mapper#afterCreate}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterCreate}.
     * @param {object} result The `result` argument received by {@link Mapper#afterCreate}.
     * @see SimpleStore#event:afterCreate
     * @see SimpleStore#create
     * @since 3.0.0
     */
    /**
     * Wrapper for {@link Mapper#create}. Adds the created record to the store.
     *
     * @example
     * import { SimpleStore } from 'js-data';
     * import { HttpAdapter } from 'js-data-http';
     *
     * const store = new SimpleStore();
     * store.registerAdapter('http', new HttpAdapter(), { default: true });
     *
     * store.defineMapper('book');
     *
     * // Since this example uses the http adapter, we'll get something like:
     * //
     * //   POST /book {"author_id":1234,...}
     * store.create('book', {
     *   author_id: 1234,
     *   edition: 'First Edition',
     *   title: 'Respect your Data'
     * }).then((book) => {
     *   console.log(book.id); // 120392
     *   console.log(book.title); // "Respect your Data"
     * });
     *
     * @fires SimpleStore#beforeCreate
     * @fires SimpleStore#afterCreate
     * @fires SimpleStore#add
     * @method SimpleStore#create
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {object} record Passed to {@link Mapper#create}.
     * @param {object} [opts] Passed to {@link Mapper#create}. See
     * {@link Mapper#create} for more configuration options.
     * @returns {Promise} Resolves with the result of the create.
     * @since 3.0.0
     */
    create(name, record, opts = {}) {
        return super.create(name, record, opts).then(result => this._end(name, result, opts));
    }
    /**
     * Fired during {@link SimpleStore#createMany}. See
     * {@link SimpleStore~beforeCreateManyListener} for how to listen for this event.
     *
     * @event SimpleStore#beforeCreateMany
     * @see SimpleStore~beforeCreateManyListener
     * @see SimpleStore#createMany
     */
    /**
     * Callback signature for the {@link SimpleStore#event:beforeCreateMany} event.
     *
     * @example
     * function onBeforeCreateMany (mapperName, records, opts) {
     *   // do something
     * }
     * store.on('beforeCreateMany', onBeforeCreateMany);
     *
     * @callback SimpleStore~beforeCreateManyListener
     * @param {string} name The `name` argument received by {@link Mapper#beforeCreateMany}.
     * @param {object} records The `records` argument received by {@link Mapper#beforeCreateMany}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeCreateMany}.
     * @see SimpleStore#event:beforeCreateMany
     * @see SimpleStore#createMany
     * @since 3.0.0
     */
    /**
     * Fired during {@link SimpleStore#createMany}. See
     * {@link SimpleStore~afterCreateManyListener} for how to listen for this event.
     *
     * @event SimpleStore#afterCreateMany
     * @see SimpleStore~afterCreateManyListener
     * @see SimpleStore#createMany
     */
    /**
     * Callback signature for the {@link SimpleStore#event:afterCreateMany} event.
     *
     * @example
     * function onAfterCreateMany (mapperName, records, opts, result) {
     *   // do something
     * }
     * store.on('afterCreateMany', onAfterCreateMany);
     *
     * @callback SimpleStore~afterCreateManyListener
     * @param {string} name The `name` argument received by {@link Mapper#afterCreateMany}.
     * @param {object} records The `records` argument received by {@link Mapper#afterCreateMany}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterCreateMany}.
     * @param {object} result The `result` argument received by {@link Mapper#afterCreateMany}.
     * @see SimpleStore#event:afterCreateMany
     * @see SimpleStore#createMany
     * @since 3.0.0
     */
    /**
     * Wrapper for {@link Mapper#createMany}. Adds the created records to the
     * store.
     *
     * @example
     * import { SimpleStore } from 'js-data';
     * import { HttpAdapter } from 'js-data-http';
     *
     * const store = new SimpleStore();
     * store.registerAdapter('http', new HttpAdapter(), { default: true });
     *
     * store.defineMapper('book');
     *
     * // Since this example uses the http adapter, we'll get something like:
     * //
     * //   POST /book [{"author_id":1234,...},{...}]
     * store.createMany('book', [{
     *   author_id: 1234,
     *   edition: 'First Edition',
     *   title: 'Respect your Data'
     * }, {
     *   author_id: 1234,
     *   edition: 'Second Edition',
     *   title: 'Respect your Data'
     * }]).then((books) => {
     *   console.log(books[0].id); // 142394
     *   console.log(books[0].title); // "Respect your Data"
     * });
     *
     * @fires SimpleStore#beforeCreateMany
     * @fires SimpleStore#afterCreateMany
     * @fires SimpleStore#add
     * @method SimpleStore#createMany
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {array} records Passed to {@link Mapper#createMany}.
     * @param {object} [opts] Passed to {@link Mapper#createMany}. See
     * {@link Mapper#createMany} for more configuration options.
     * @returns {Promise} Resolves with the result of the create.
     * @since 3.0.0
     */
    createMany(name, records, opts = {}) {
        return super.createMany(name, records, opts).then(result => this._end(name, result, opts));
    }
    defineMapper(name, opts = {}) {
        const self = this;
        const mapper = super.defineMapper(name, opts);
        self._pendingQueries[name] = {};
        self._completedQueries[name] = {};
        if (!mapper.relationList)
            Object.defineProperty(mapper, 'relationList', { value: [] });
        const collectionOpts = {
            // Make sure the collection has somewhere to store "added" timestamps
            _added: {},
            // Give the collection a reference to this SimpleStore
            datastore: this,
            // The mapper tied to the collection
            mapper
        };
        if (opts && 'onConflict' in opts) {
            collectionOpts.onConflict = opts.onConflict;
        }
        // The SimpleStore uses a subclass of Collection that is "SimpleStore-aware"
        const collection = (self._collections[name] = new self.collectionClass(null, collectionOpts));
        const schema = mapper.schema || {};
        const properties = schema.properties || {};
        // TODO: Make it possible index nested properties?
        utils.forOwn(properties, (opts, prop) => {
            if (opts.indexed) {
                collection.createIndex(prop);
            }
        });
        // Create a secondary index on the "added" timestamps of records in the
        // collection
        collection.createIndex('addedTimestamps', ['$'], {
            fieldGetter(obj) {
                return collection._added[collection.recordId(obj)];
            }
        });
        collection.on('all', (...args) => {
            self._onCollectionEvent(name, ...args);
        });
        return mapper;
    }
    /**
     * Fired during {@link SimpleStore#destroy}. See
     * {@link SimpleStore~beforeDestroyListener} for how to listen for this event.
     *
     * @event SimpleStore#beforeDestroy
     * @see SimpleStore~beforeDestroyListener
     * @see SimpleStore#destroy
     */
    /**
     * Callback signature for the {@link SimpleStore#event:beforeDestroy} event.
     *
     * @example
     * function onBeforeDestroy (mapperName, id, opts) {
     *   // do something
     * }
     * store.on('beforeDestroy', onBeforeDestroy);
     *
     * @callback SimpleStore~beforeDestroyListener
     * @param {string} name The `name` argument received by {@link Mapper#beforeDestroy}.
     * @param {string|number} id The `id` argument received by {@link Mapper#beforeDestroy}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeDestroy}.
     * @see SimpleStore#event:beforeDestroy
     * @see SimpleStore#destroy
     * @since 3.0.0
     */
    /**
     * Fired during {@link SimpleStore#destroy}. See
     * {@link SimpleStore~afterDestroyListener} for how to listen for this event.
     *
     * @event SimpleStore#afterDestroy
     * @see SimpleStore~afterDestroyListener
     * @see SimpleStore#destroy
     */
    /**
     * Callback signature for the {@link SimpleStore#event:afterDestroy} event.
     *
     * @example
     * function onAfterDestroy (mapperName, id, opts, result) {
     *   // do something
     * }
     * store.on('afterDestroy', onAfterDestroy);
     *
     * @callback SimpleStore~afterDestroyListener
     * @param {string} name The `name` argument received by {@link Mapper#afterDestroy}.
     * @param {string|number} id The `id` argument received by {@link Mapper#afterDestroy}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterDestroy}.
     * @param {object} result The `result` argument received by {@link Mapper#afterDestroy}.
     * @see SimpleStore#event:afterDestroy
     * @see SimpleStore#destroy
     * @since 3.0.0
     */
    /**
     * Wrapper for {@link Mapper#destroy}. Removes any destroyed record from the
     * in-memory store. Clears out any {@link SimpleStore#_completedQueries} entries
     * associated with the provided `id`.
     *
     * @example
     * import { SimpleStore } from 'js-data';
     * import { HttpAdapter } from 'js-data-http';
     *
     * const store = new SimpleStore();
     * store.registerAdapter('http', new HttpAdapter(), { default: true });
     *
     * store.defineMapper('book');
     *
     * store.add('book', { id: 1234, title: 'Data Management is Hard' });
     *
     * // Since this example uses the http adapter, we'll get something like:
     * //
     * //   DELETE /book/1234
     * store.destroy('book', 1234).then(() => {
     *   // The book record is no longer in the in-memory store
     *   console.log(store.get('book', 1234)); // undefined
     *
     *   return store.find('book', 1234);
     * }).then((book) {
     *   // The book was deleted from the database too
     *   console.log(book); // undefined
     * });
     *
     * @fires SimpleStore#beforeDestroy
     * @fires SimpleStore#afterDestroy
     * @fires SimpleStore#remove
     * @method SimpleStore#destroy
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {(string|number)} id Passed to {@link Mapper#destroy}.
     * @param {object} [opts] Passed to {@link Mapper#destroy}. See
     * {@link Mapper#destroy} for more configuration options.
     * @returns {Promise} Resolves when the destroy operation completes.
     * @since 3.0.0
     */
    destroy(name, id, opts = {}) {
        return super.destroy(name, id, opts).then(result => {
            const record = this.getCollection(name).remove(id, opts);
            if (opts.raw) {
                result.data = record;
            }
            else {
                result = record;
            }
            delete this._pendingQueries[name][id];
            delete this._completedQueries[name][id];
            return result;
        });
    }
    /**
     * Fired during {@link SimpleStore#destroyAll}. See
     * {@link SimpleStore~beforeDestroyAllListener} for how to listen for this event.
     *
     * @event SimpleStore#beforeDestroyAll
     * @see SimpleStore~beforeDestroyAllListener
     * @see SimpleStore#destroyAll
     */
    /**
     * Callback signature for the {@link SimpleStore#event:beforeDestroyAll} event.
     *
     * @example
     * function onBeforeDestroyAll (mapperName, query, opts) {
     *   // do something
     * }
     * store.on('beforeDestroyAll', onBeforeDestroyAll);
     *
     * @callback SimpleStore~beforeDestroyAllListener
     * @param {string} name The `name` argument received by {@link Mapper#beforeDestroyAll}.
     * @param {object} query The `query` argument received by {@link Mapper#beforeDestroyAll}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeDestroyAll}.
     * @see SimpleStore#event:beforeDestroyAll
     * @see SimpleStore#destroyAll
     * @since 3.0.0
     */
    /**
     * Fired during {@link SimpleStore#destroyAll}. See
     * {@link SimpleStore~afterDestroyAllListener} for how to listen for this event.
     *
     * @event SimpleStore#afterDestroyAll
     * @see SimpleStore~afterDestroyAllListener
     * @see SimpleStore#destroyAll
     */
    /**
     * Callback signature for the {@link SimpleStore#event:afterDestroyAll} event.
     *
     * @example
     * function onAfterDestroyAll (mapperName, query, opts, result) {
     *   // do something
     * }
     * store.on('afterDestroyAll', onAfterDestroyAll);
     *
     * @callback SimpleStore~afterDestroyAllListener
     * @param {string} name The `name` argument received by {@link Mapper#afterDestroyAll}.
     * @param {object} query The `query` argument received by {@link Mapper#afterDestroyAll}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterDestroyAll}.
     * @param {object} result The `result` argument received by {@link Mapper#afterDestroyAll}.
     * @see SimpleStore#event:afterDestroyAll
     * @see SimpleStore#destroyAll
     * @since 3.0.0
     */
    /**
     * Wrapper for {@link Mapper#destroyAll}. Removes any destroyed records from
     * the in-memory store.
     *
     * @example
     * import { SimpleStore } from 'js-data';
     * import { HttpAdapter } from 'js-data-http';
     *
     * const store = new SimpleStore();
     * store.registerAdapter('http', new HttpAdapter(), { default: true });
     *
     * store.defineMapper('book');
     *
     * store.add('book', { id: 1234, title: 'Data Management is Hard' });
     *
     * // Since this example uses the http adapter, we'll get something like:
     * //
     * //   DELETE /book/1234
     * store.destroy('book', 1234).then(() => {
     *   // The book record is gone from the in-memory store
     *   console.log(store.get('book', 1234)); // undefined
     *   return store.find('book', 1234);
     * }).then((book) {
     *   // The book was deleted from the database too
     *   console.log(book); // undefined
     * });
     *
     * @fires SimpleStore#beforeDestroyAll
     * @fires SimpleStore#afterDestroyAll
     * @fires SimpleStore#remove
     * @method SimpleStore#destroyAll
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {object} [query] Passed to {@link Mapper#destroyAll}.
     * @param {object} [opts] Passed to {@link Mapper#destroyAll}. See
     * {@link Mapper#destroyAll} for more configuration options.
     * @returns {Promise} Resolves when the delete completes.
     * @since 3.0.0
     */
    destroyAll(name, query, opts = {}) {
        return super.destroyAll(name, query, opts).then(result => {
            const records = this.getCollection(name).removeAll(query, opts);
            if (opts.raw) {
                result.data = records;
            }
            else {
                result = records;
            }
            const hash = this.hashQuery(name, query, opts);
            delete this._pendingQueries[name][hash];
            delete this._completedQueries[name][hash];
            return result;
        });
    }
    eject(name, id, opts) {
        console.warn('DEPRECATED: "eject" is deprecated, use "remove" instead');
        return this.remove(name, id, opts);
    }
    ejectAll(name, query, opts) {
        console.warn('DEPRECATED: "ejectAll" is deprecated, use "removeAll" instead');
        return this.removeAll(name, query, opts);
    }
    /**
     * Fired during {@link SimpleStore#find}. See
     * {@link SimpleStore~beforeFindListener} for how to listen for this event.
     *
     * @event SimpleStore#beforeFind
     * @see SimpleStore~beforeFindListener
     * @see SimpleStore#find
     */
    /**
     * Callback signature for the {@link SimpleStore#event:beforeFind} event.
     *
     * @example
     * function onBeforeFind (mapperName, id, opts) {
     *   // do something
     * }
     * store.on('beforeFind', onBeforeFind);
     *
     * @callback SimpleStore~beforeFindListener
     * @param {string} name The `name` argument received by {@link Mapper#beforeFind}.
     * @param {string|number} id The `id` argument received by {@link Mapper#beforeFind}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeFind}.
     * @see SimpleStore#event:beforeFind
     * @see SimpleStore#find
     * @since 3.0.0
     */
    /**
     * Fired during {@link SimpleStore#find}. See
     * {@link SimpleStore~afterFindListener} for how to listen for this event.
     *
     * @event SimpleStore#afterFind
     * @see SimpleStore~afterFindListener
     * @see SimpleStore#find
     */
    /**
     * Callback signature for the {@link SimpleStore#event:afterFind} event.
     *
     * @example
     * function onAfterFind (mapperName, id, opts, result) {
     *   // do something
     * }
     * store.on('afterFind', onAfterFind);
     *
     * @callback SimpleStore~afterFindListener
     * @param {string} name The `name` argument received by {@link Mapper#afterFind}.
     * @param {string|number} id The `id` argument received by {@link Mapper#afterFind}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterFind}.
     * @param {object} result The `result` argument received by {@link Mapper#afterFind}.
     * @see SimpleStore#event:afterFind
     * @see SimpleStore#find
     * @since 3.0.0
     */
    /**
     * Wrapper for {@link Mapper#find}. Adds any found record to the store.
     *
     * @example
     * import { SimpleStore } from 'js-data';
     * import { HttpAdapter } from 'js-data-http';
     *
     * const store = new SimpleStore();
     * store.registerAdapter('http', new HttpAdapter(), { default: true });
     *
     * store.defineMapper('book');
     *
     * // Since this example uses the http adapter, we'll get something like:
     * //
     * //   GET /book/1234
     * store.find('book', 1234).then((book) => {
     *   // The book record is now in the in-memory store
     *   console.log(store.get('book', 1234) === book); // true
     * });
     *
     * @fires SimpleStore#beforeFind
     * @fires SimpleStore#afterFind
     * @fires SimpleStore#add
     * @method SimpleStore#find
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {(string|number)} id Passed to {@link Mapper#find}.
     * @param {object} [opts] Passed to {@link Mapper#find}.
     * @param {boolean} [opts.force] Bypass cacheFind
     * @param {boolean|Function} [opts.usePendingFind] See {@link SimpleStore#usePendingFind}
     * @returns {Promise} Resolves with the result, if any.
     * @since 3.0.0
     */
    find(name, id, opts = {}) {
        const mapper = this.getMapper(name);
        const pendingQuery = this._pendingQueries[name][id];
        const usePendingFind = opts.usePendingFind === undefined ? this.usePendingFind : opts.usePendingFind;
        utils._(opts, mapper);
        if (pendingQuery &&
            (utils.isFunction(usePendingFind) ? usePendingFind.call(this, name, id, opts) : usePendingFind)) {
            return pendingQuery;
        }
        const item = this.cachedFind(name, id, opts);
        if (opts.force || !item) {
            const promise = (this._pendingQueries[name][id] = super.find(name, id, opts));
            return promise.then(result => {
                delete this._pendingQueries[name][id];
                result = this._end(name, result, opts);
                this.cacheFind(name, result, id, opts);
                return result;
            }, err => {
                delete this._pendingQueries[name][id];
                return utils.reject(err);
            });
        }
        return utils.resolve(item);
    }
    /**
     * Fired during {@link SimpleStore#findAll}. See
     * {@link SimpleStore~beforeFindAllListener} for how to listen for this event.
     *
     * @event SimpleStore#beforeFindAll
     * @see SimpleStore~beforeFindAllListener
     * @see SimpleStore#findAll
     */
    /**
     * Callback signature for the {@link SimpleStore#event:beforeFindAll} event.
     *
     * @example
     * function onBeforeFindAll (mapperName, query, opts) {
     *   // do something
     * }
     * store.on('beforeFindAll', onBeforeFindAll);
     *
     * @callback SimpleStore~beforeFindAllListener
     * @param {string} name The `name` argument received by {@link Mapper#beforeFindAll}.
     * @param {object} query The `query` argument received by {@link Mapper#beforeFindAll}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeFindAll}.
     * @see SimpleStore#event:beforeFindAll
     * @see SimpleStore#findAll
     * @since 3.0.0
     */
    /**
     * Fired during {@link SimpleStore#findAll}. See
     * {@link SimpleStore~afterFindAllListener} for how to listen for this event.
     *
     * @event SimpleStore#afterFindAll
     * @see SimpleStore~afterFindAllListener
     * @see SimpleStore#findAll
     */
    /**
     * Callback signature for the {@link SimpleStore#event:afterFindAll} event.
     *
     * @example
     * function onAfterFindAll (mapperName, query, opts, result) {
     *   // do something
     * }
     * store.on('afterFindAll', onAfterFindAll);
     *
     * @callback SimpleStore~afterFindAllListener
     * @param {string} name The `name` argument received by {@link Mapper#afterFindAll}.
     * @param {object} query The `query` argument received by {@link Mapper#afterFindAll}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterFindAll}.
     * @param {object} result The `result` argument received by {@link Mapper#afterFindAll}.
     * @see SimpleStore#event:afterFindAll
     * @see SimpleStore#findAll
     * @since 3.0.0
     */
    /**
     * Wrapper for {@link Mapper#findAll}. Adds any found records to the store.
     *
     * @example
     * import { SimpleStore } from 'js-data';
     * import { HttpAdapter } from 'js-data-http';
     *
     * const store = new SimpleStore();
     * store.registerAdapter('http', new HttpAdapter(), { default: true });
     *
     * store.defineMapper('movie');
     *
     * // Since this example uses the http adapter, we'll get something like:
     * //
     * //   GET /movie?rating=PG
     * store.find('movie', { rating: 'PG' }).then((movies) => {
     *   // The movie records are now in the in-memory store
     *   console.log(store.filter('movie'));
     * });
     *
     * @fires SimpleStore#beforeFindAll
     * @fires SimpleStore#afterFindAll
     * @fires SimpleStore#add
     * @method SimpleStore#findAll
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {object} [query] Passed to {@link Mapper.findAll}.
     * @param {object} [opts] Passed to {@link Mapper.findAll}.
     * @param {boolean} [opts.force] Bypass cacheFindAll
     * @param {boolean|Function} [opts.usePendingFindAll] See {@link SimpleStore#usePendingFindAll}
     * @returns {Promise} Resolves with the result, if any.
     * @since 3.0.0
     */
    findAll(name, query, opts = {}) {
        const mapper = this.getMapper(name);
        const hash = this.hashQuery(name, query, opts);
        const pendingQuery = this._pendingQueries[name][hash];
        const usePendingFindAll = opts.usePendingFindAll === undefined ? this.usePendingFindAll : opts.usePendingFindAll;
        utils._(opts, mapper);
        if (pendingQuery &&
            (utils.isFunction(usePendingFindAll) ? usePendingFindAll.call(this, name, query, opts) : usePendingFindAll)) {
            return pendingQuery;
        }
        const items = this.cachedFindAll(name, hash, opts);
        if (opts.force || !items) {
            const promise = (this._pendingQueries[name][hash] = super.findAll(name, query, opts));
            return promise.then(result => {
                delete this._pendingQueries[name][hash];
                result = this._end(name, result, opts);
                this.cacheFindAll(name, result, hash, opts);
                return result;
            }, err => {
                delete this._pendingQueries[name][hash];
                return utils.reject(err);
            });
        }
        return utils.resolve(items);
    }
    /**
     * Return the {@link Collection} with the given name, if for some
     * reason you need a direct reference to the collection.
     *
     * @param {string} name Name of the {@link Collection} to retrieve.
     * @since 3.0.0
     * @throws {Error} Thrown if the specified {@link Collection} does not
     * exist.
     */
    getCollection(name) {
        const collection = this._collections[name];
        if (!collection) {
            throw utils.err(`${DOMAIN$8}#getCollection`, name)(404, 'collection');
        }
        return collection;
    }
    /**
     * Hashing function used to cache {@link SimpleStore#find} and
     * {@link SimpleStore#findAll} requests. This method simply JSONifies the
     * `query` argument passed to {@link SimpleStore#find} or
     * {@link SimpleStore#findAll}.
     *
     * Override this method for custom hashing behavior.
     * @method SimpleStore#hashQuery
     * @param {string} name The `name` argument passed to {@link SimpleStore#find}
     * or {@link SimpleStore#findAll}.
     * @param {object} query The `query` argument passed to {@link SimpleStore#find}
     * or {@link SimpleStore#findAll}.
     * @returns {string} The JSONified `query`.
     * @since 3.0.0
     */
    hashQuery(name, query, opts) {
        return utils.toJson(query || {});
    }
    inject(name, records, opts) {
        console.warn('DEPRECATED: "inject" is deprecated, use "add" instead');
        return this.add(name, records, opts);
    }
    /**
     * Wrapper for {@link Collection#remove}. Removes the specified
     * {@link Record} from the store.
     *
     * @example <caption>SimpleStore#remove</caption>
     * const JSData = require('js-data');
     * const { SimpleStore } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const store = new SimpleStore();
     * store.defineMapper('book');
     * console.log(store.getAll('book').length);
     * store.add('book', { id: 1234 });
     * console.log(store.getAll('book').length);
     * store.remove('book', 1234);
     * console.log(store.getAll('book').length);
     *
     * @fires SimpleStore#remove
     * @method SimpleStore#remove
     * @param {string} name The name of the {@link Collection} to target.
     * @param {string|number} id The primary key of the {@link Record} to remove.
     * @param {object} [opts] Configuration options.
     * @param {string[]} [opts.with] Relations of the {@link Record} to also
     * remove from the store.
     * @returns {Record} The removed {@link Record}, if any.
     * @see Collection#add
     * @see Collection#add
     * @since 3.0.0
     */
    remove(name, id, opts) {
        const record = this.getCollection(name).remove(id, opts);
        if (record) {
            this.removeRelated(name, [record], opts);
        }
        return record;
    }
    /**
     * Wrapper for {@link Collection#removeAll}. Removes the selected
     * {@link Record}s from the store.
     *
     * @example <caption>SimpleStore#removeAll</caption>
     * const JSData = require('js-data');
     * const { SimpleStore } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const store = new SimpleStore();
     * store.defineMapper('movie');
     * console.log(store.getAll('movie').length);
     * store.add('movie', [{ id: 3, rating: 'R' }, { id: 4, rating: 'PG-13' });
     * console.log(store.getAll('movie').length);
     * store.removeAll('movie', { rating: 'R' });
     * console.log(store.getAll('movie').length);
     *
     * @fires SimpleStore#remove
     * @method SimpleStore#removeAll
     * @param {string} name The name of the {@link Collection} to target.
     * @param {object} [query={}] Selection query. See {@link query}.
     * @param {object} [query.where] See {@link query.where}.
     * @param {number} [query.offset] See {@link query.offset}.
     * @param {number} [query.limit] See {@link query.limit}.
     * @param {string|Array[]} [query.orderBy] See {@link query.orderBy}.
     * @param {object} [opts] Configuration options.
     * @param {string[]} [opts.with] Relations of the {@link Record} to also
     * remove from the store.
     * @returns {Record} The removed {@link Record}s, if any.
     * @see Collection#add
     * @see Collection#add
     * @since 3.0.0
     */
    removeAll(name, query, opts) {
        if (!query || !Object.keys(query).length) {
            this._completedQueries[name] = {};
        }
        else {
            this._completedQueries[name][this.hashQuery(name, query, opts)] = undefined;
        }
        const records = this.getCollection(name).removeAll(query, opts);
        if (records.length) {
            this.removeRelated(name, records, opts);
        }
        return records;
    }
    /**
     * Remove from the store {@link Record}s that are related to the provided
     * {@link Record}(s).
     *
     * @fires SimpleStore#remove
     * @method SimpleStore#removeRelated
     * @param {string} name The name of the {@link Collection} to target.
     * @param {Record|Record[]} records {@link Record}s whose relations are to be
     * removed.
     * @param {object} [opts] Configuration options.
     * @param {string[]} [opts.with] Relations of the {@link Record}(s) to remove
     * from the store.
     * @since 3.0.0
     */
    removeRelated(name, records, opts) {
        if (!utils.isArray(records)) {
            records = [records];
        }
        utils.forEachRelation(this.getMapper(name), opts, (def, optsCopy) => {
            records.forEach(record => {
                let relatedData;
                let query;
                if (def.foreignKey && (def.type === hasOneType || def.type === hasManyType)) {
                    query = { [def.foreignKey]: def.getForeignKey(record) };
                }
                else if (def.type === hasManyType && def.localKeys) {
                    query = {
                        where: {
                            [def.getRelation().idAttribute]: {
                                in: utils.get(record, def.localKeys)
                            }
                        }
                    };
                }
                else if (def.type === hasManyType && def.foreignKeys) {
                    query = {
                        where: {
                            [def.foreignKeys]: {
                                contains: def.getForeignKey(record)
                            }
                        }
                    };
                }
                else if (def.type === belongsToType) {
                    relatedData = this.remove(def.relation, def.getForeignKey(record), optsCopy);
                }
                if (query) {
                    relatedData = this.removeAll(def.relation, query, optsCopy);
                }
                if (relatedData) {
                    if (utils.isArray(relatedData) && !relatedData.length) {
                        return;
                    }
                    if (def.type === hasOneType) {
                        relatedData = relatedData[0];
                    }
                    def.setLocalField(record, relatedData);
                }
            });
        });
    }
    /**
     * Fired during {@link SimpleStore#update}. See
     * {@link SimpleStore~beforeUpdateListener} for how to listen for this event.
     *
     * @event SimpleStore#beforeUpdate
     * @see SimpleStore~beforeUpdateListener
     * @see SimpleStore#update
     */
    /**
     * Callback signature for the {@link SimpleStore#event:beforeUpdate} event.
     *
     * @example
     * function onBeforeUpdate (mapperName, id, props, opts) {
     *   // do something
     * }
     * store.on('beforeUpdate', onBeforeUpdate);
     *
     * @callback SimpleStore~beforeUpdateListener
     * @param {string} name The `name` argument received by {@link Mapper#beforeUpdate}.
     * @param {string|number} id The `id` argument received by {@link Mapper#beforeUpdate}.
     * @param {object} props The `props` argument received by {@link Mapper#beforeUpdate}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeUpdate}.
     * @see SimpleStore#event:beforeUpdate
     * @see SimpleStore#update
     * @since 3.0.0
     */
    /**
     * Fired during {@link SimpleStore#update}. See
     * {@link SimpleStore~afterUpdateListener} for how to listen for this event.
     *
     * @event SimpleStore#afterUpdate
     * @see SimpleStore~afterUpdateListener
     * @see SimpleStore#update
     */
    /**
     * Callback signature for the {@link SimpleStore#event:afterUpdate} event.
     *
     * @example
     * function onAfterUpdate (mapperName, id, props, opts, result) {
     *   // do something
     * }
     * store.on('afterUpdate', onAfterUpdate);
     *
     * @callback SimpleStore~afterUpdateListener
     * @param {string} name The `name` argument received by {@link Mapper#afterUpdate}.
     * @param {string|number} id The `id` argument received by {@link Mapper#afterUpdate}.
     * @param {object} props The `props` argument received by {@link Mapper#afterUpdate}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterUpdate}.
     * @param {object} result The `result` argument received by {@link Mapper#afterUpdate}.
     * @see SimpleStore#event:afterUpdate
     * @see SimpleStore#update
     * @since 3.0.0
     */
    /**
     * Wrapper for {@link Mapper#update}. Adds the updated {@link Record} to the
     * store.
     *
     * @example
     * import { SimpleStore } from 'js-data';
     * import { HttpAdapter } from 'js-data-http';
     *
     * const store = new SimpleStore();
     * store.registerAdapter('http', new HttpAdapter(), { default: true });
     *
     * store.defineMapper('post');
     *
     * // Since this example uses the http adapter, we'll get something like:
     * //
     * //   PUT /post/1234 {"status":"published"}
     * store.update('post', 1, { status: 'published' }).then((post) => {
     *   // The post record has also been updated in the in-memory store
     *   console.log(store.get('post', 1234));
     * });
     *
     * @fires SimpleStore#beforeUpdate
     * @fires SimpleStore#afterUpdate
     * @fires SimpleStore#add
     * @method SimpleStore#update
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {(string|number)} id Passed to {@link Mapper#update}.
     * @param {object} record Passed to {@link Mapper#update}.
     * @param {object} [opts] Passed to {@link Mapper#update}. See
     * {@link Mapper#update} for more configuration options.
     * @returns {Promise} Resolves with the result of the update.
     * @since 3.0.0
     */
    update(name, id, record, opts = {}) {
        return super.update(name, id, record, opts).then(result => this._end(name, result, opts));
    }
    /**
     * Fired during {@link SimpleStore#updateAll}. See
     * {@link SimpleStore~beforeUpdateAllListener} for how to listen for this event.
     *
     * @event SimpleStore#beforeUpdateAll
     * @see SimpleStore~beforeUpdateAllListener
     * @see SimpleStore#updateAll
     */
    /**
     * Callback signature for the {@link SimpleStore#event:beforeUpdateAll} event.
     *
     * @example
     * function onBeforeUpdateAll (mapperName, props, query, opts) {
     *   // do something
     * }
     * store.on('beforeUpdateAll', onBeforeUpdateAll);
     *
     * @callback SimpleStore~beforeUpdateAllListener
     * @param {string} name The `name` argument received by {@link Mapper#beforeUpdateAll}.
     * @param {object} props The `props` argument received by {@link Mapper#beforeUpdateAll}.
     * @param {object} query The `query` argument received by {@link Mapper#beforeUpdateAll}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeUpdateAll}.
     * @see SimpleStore#event:beforeUpdateAll
     * @see SimpleStore#updateAll
     * @since 3.0.0
     */
    /**
     * Fired during {@link SimpleStore#updateAll}. See
     * {@link SimpleStore~afterUpdateAllListener} for how to listen for this event.
     *
     * @event SimpleStore#afterUpdateAll
     * @see SimpleStore~afterUpdateAllListener
     * @see SimpleStore#updateAll
     */
    /**
     * Callback signature for the {@link SimpleStore#event:afterUpdateAll} event.
     *
     * @example
     * function onAfterUpdateAll (mapperName, props, query, opts, result) {
     *   // do something
     * }
     * store.on('afterUpdateAll', onAfterUpdateAll);
     *
     * @callback SimpleStore~afterUpdateAllListener
     * @param {string} name The `name` argument received by {@link Mapper#afterUpdateAll}.
     * @param {object} props The `props` argument received by {@link Mapper#afterUpdateAll}.
     * @param {object} query The `query` argument received by {@link Mapper#afterUpdateAll}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterUpdateAll}.
     * @param {object} result The `result` argument received by {@link Mapper#afterUpdateAll}.
     * @see SimpleStore#event:afterUpdateAll
     * @see SimpleStore#updateAll
     * @since 3.0.0
     */
    /**
     * Wrapper for {@link Mapper#updateAll}. Adds the updated {@link Record}s to
     * the store.
     *
     * @example
     * import { SimpleStore } from 'js-data';
     * import { HttpAdapter } from 'js-data-http';
     *
     * const store = new SimpleStore();
     * store.registerAdapter('http', new HttpAdapter(), { default: true });
     *
     * store.defineMapper('post');
     *
     * // Since this example uses the http adapter, we'll get something like:
     * //
     * //   PUT /post?author_id=1234 {"status":"published"}
     * store.updateAll('post', { author_id: 1234 }, { status: 'published' }).then((posts) => {
     *   // The post records have also been updated in the in-memory store
     *   console.log(store.filter('posts', { author_id: 1234 }));
     * });
     *
     * @fires SimpleStore#beforeUpdateAll
     * @fires SimpleStore#afterUpdateAll
     * @fires SimpleStore#add
     * @method SimpleStore#updateAll
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {object} props Passed to {@link Mapper#updateAll}.
     * @param {object} [query] Passed to {@link Mapper#updateAll}.
     * @param {object} [opts] Passed to {@link Mapper#updateAll}. See
     * {@link Mapper#updateAll} for more configuration options.
     * @returns {Promise} Resolves with the result of the update.
     * @since 3.0.0
     */
    updateAll(name, props, query, opts = {}) {
        return super.updateAll(name, props, query, opts).then(result => this._end(name, result, opts));
    }
    /**
     * Fired during {@link SimpleStore#updateMany}. See
     * {@link SimpleStore~beforeUpdateManyListener} for how to listen for this event.
     *
     * @event SimpleStore#beforeUpdateMany
     * @see SimpleStore~beforeUpdateManyListener
     * @see SimpleStore#updateMany
     */
    /**
     * Callback signature for the {@link SimpleStore#event:beforeUpdateMany} event.
     *
     * @example
     * function onBeforeUpdateMany (mapperName, records, opts) {
     *   // do something
     * }
     * store.on('beforeUpdateMany', onBeforeUpdateMany);
     *
     * @callback SimpleStore~beforeUpdateManyListener
     * @param {string} name The `name` argument received by {@link Mapper#beforeUpdateMany}.
     * @param {object} records The `records` argument received by {@link Mapper#beforeUpdateMany}.
     * @param {object} opts The `opts` argument received by {@link Mapper#beforeUpdateMany}.
     * @see SimpleStore#event:beforeUpdateMany
     * @see SimpleStore#updateMany
     * @since 3.0.0
     */
    /**
     * Fired during {@link SimpleStore#updateMany}. See
     * {@link SimpleStore~afterUpdateManyListener} for how to listen for this event.
     *
     * @event SimpleStore#afterUpdateMany
     * @see SimpleStore~afterUpdateManyListener
     * @see SimpleStore#updateMany
     */
    /**
     * Callback signature for the {@link SimpleStore#event:afterUpdateMany} event.
     *
     * @example
     * function onAfterUpdateMany (mapperName, records, opts, result) {
     *   // do something
     * }
     * store.on('afterUpdateMany', onAfterUpdateMany);
     *
     * @callback SimpleStore~afterUpdateManyListener
     * @param {string} name The `name` argument received by {@link Mapper#afterUpdateMany}.
     * @param {object} records The `records` argument received by {@link Mapper#afterUpdateMany}.
     * @param {object} opts The `opts` argument received by {@link Mapper#afterUpdateMany}.
     * @param {object} result The `result` argument received by {@link Mapper#afterUpdateMany}.
     * @see SimpleStore#event:afterUpdateMany
     * @see SimpleStore#updateMany
     * @since 3.0.0
     */
    /**
     * Wrapper for {@link Mapper#updateMany}. Adds the updated {@link Record}s to
     * the store.
     *
     * @example
     * import { SimpleStore } from 'js-data';
     * import { HttpAdapter } from 'js-data-http';
     *
     * const store = new SimpleStore();
     * store.registerAdapter('http', new HttpAdapter(), { default: true });
     *
     * store.defineMapper('post');
     *
     * // Since this example uses the http adapter, we'll get something like:
     * //
     * //   PUT /post [{"id":3,status":"published"},{"id":4,status":"published"}]
     * store.updateMany('post', [
     *   { id: 3, status: 'published' },
     *   { id: 4, status: 'published' }
     * ]).then((posts) => {
     *   // The post records have also been updated in the in-memory store
     *   console.log(store.getAll('post', 3, 4));
     * });
     *
     * @fires SimpleStore#beforeUpdateMany
     * @fires SimpleStore#afterUpdateMany
     * @fires SimpleStore#add
     * @method SimpleStore#updateMany
     * @param {string} name Name of the {@link Mapper} to target.
     * @param {(Object[]|Record[])} records Passed to {@link Mapper#updateMany}.
     * @param {object} [opts] Passed to {@link Mapper#updateMany}. See
     * {@link Mapper#updateMany} for more configuration options.
     * @returns {Promise} Resolves with the result of the update.
     * @since 3.0.0
     */
    updateMany(name, records, opts = {}) {
        return super.updateMany(name, records, opts).then(result => this._end(name, result, opts));
    }
    /**
     * Wrapper for {@link Collection#add}.
     *
     * @example <caption>SimpleStore#add</caption>
     * const JSData = require('js-data');
     * const { SimpleStore } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const store = new SimpleStore();
     * store.defineMapper('book');
     *
     * // Add one book to the in-memory store:
     * store.add('book', { id: 1, title: 'Respect your Data' });
     * // Add multiple books to the in-memory store:
     * store.add('book', [
     *   { id: 2, title: 'Easy data recipes' },
     *   { id: 3, title: 'Active Record 101' }
     * ]);
     *
     * @fires SimpleStore#add
     * @method SimpleStore#add
     * @param {(string|number)} name Name of the {@link Mapper} to target.
     * @param {(Object|Object[]|Record|Record[])} records See {@link Collection#add}.
     * @param {object} [opts] Configuration options. See {@link Collection#add}.
     * @returns {(Object|Object[]|Record|Record[])} See {@link Collection#add}.
     * @see Collection#add
     * @see Collection#add
     * @since 3.0.0
     */
    add(name, records, opts) {
        return this.getCollection(name).add(records, opts);
    }
    /**
     * Wrapper for {@link Collection#between}.
     *
     * @example
     * // Get all users ages 18 to 30
     * const users = store.between('user', 18, 30, { index: 'age' });
     *
     * @example
     * // Same as above
     * const users = store.between('user', [18], [30], { index: 'age' });
     *
     * @method SimpleStore#between
     * @param {(string|number)} name Name of the {@link Mapper} to target.
     * @param {array} leftKeys See {@link Collection#between}.
     * @param {array} rightKeys See {@link Collection#between}.
     * @param {object} [opts] Configuration options. See {@link Collection#between}.
     * @returns {Object[]|Record[]} See {@link Collection#between}.
     * @see Collection#between
     * @see Collection#between
     * @since 3.0.0
     */
    between(name, leftKeys, rightKeys, opts) {
        return this.getCollection(name).between(leftKeys, rightKeys, opts);
    }
    /**
     * Wrapper for {@link Collection#createIndex}.
     *
     * @example
     * // Index users by age
     * store.createIndex('user', 'age');
     *
     * @example
     * // Index users by status and role
     * store.createIndex('user', 'statusAndRole', ['status', 'role']);
     *
     * @method SimpleStore#createIndex
     * @param {(string|number)} name Name of the {@link Mapper} to target.
     * @param {string} indexName See {@link Collection#createIndex}.
     * @param {string[]} [fieldList] See {@link Collection#createIndex}.
     * @param {object} [opts] Configuration options. See {@link Collection#between}.
     * @see Collection#createIndex
     * @see Collection#createIndex
     * @since 3.0.0
     */
    createIndex(name, indexName, fieldList, opts) {
        return this.getCollection(name).createIndex(indexName, fieldList, opts);
    }
    /**
     * Wrapper for {@link Collection#filter}.
     *
     * @example <caption>SimpleStore#filter</caption>
     * const JSData = require('js-data');
     * const { SimpleStore } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const store = new SimpleStore();
     * store.defineMapper('post');
     * store.add('post', [
     *   { id: 1, status: 'draft', created_at_timestamp: new Date().getTime() }
     * ]);
     *
     * // Get the draft posts created less than three months ago
     * let posts = store.filter('post', {
     *   where: {
     *     status: {
     *       '==': 'draft'
     *     },
     *     created_at_timestamp: {
     *       '>=': (new Date().getTime() - (1000 \* 60 \* 60 \* 24 \* 30 \* 3)) // 3 months ago
     *     }
     *   }
     * });
     * console.log(posts);
     *
     * // Use a custom filter function
     * posts = store.filter('post', function (post) { return post.id % 2 === 0 });
     *
     * @method SimpleStore#filter
     * @param {(string|number)} name Name of the {@link Mapper} to target.
     * @param {(Object|Function)} [queryOrFn={}] See {@link Collection#filter}.
     * @param {object} [thisArg] See {@link Collection#filter}.
     * @returns {Array} See {@link Collection#filter}.
     * @see Collection#filter
     * @see Collection#filter
     * @since 3.0.0
     */
    filter(name, queryOrFn, thisArg) {
        return this.getCollection(name).filter(queryOrFn, thisArg);
    }
    /**
     * Wrapper for {@link Collection#get}.
     *
     * @example <caption>SimpleStore#get</caption>
     * const JSData = require('js-data');
     * const { SimpleStore } = JSData;
     * console.log('Using JSData v' + JSData.version.full);
     *
     * const store = new SimpleStore();
     * store.defineMapper('post');
     * store.add('post', [
     *   { id: 1, status: 'draft', created_at_timestamp: new Date().getTime() }
     * ]);
     *
     * console.log(store.get('post', 1)); // {...}
     * console.log(store.get('post', 2)); // undefined
     *
     * @method SimpleStore#get
     * @param {(string|number)} name Name of the {@link Mapper} to target.
     * @param {(string|number)} id See {@link Collection#get}.
     * @returns {(Object|Record)} See {@link Collection#get}.
     * @see Collection#get
     * @see Collection#get
     * @since 3.0.0
     */
    get(name, id) {
        return this.getCollection(name).get(id);
    }
    /**
     * Wrapper for {@link Collection#getAll}.
     *
     * @example
     * // Get the posts where "status" is "draft" or "inReview"
     * const posts = store.getAll('post', 'draft', 'inReview', { index: 'status' });
     *
     * @example
     * // Same as above
     * const posts = store.getAll('post', ['draft'], ['inReview'], { index: 'status' });
     *
     * @method SimpleStore#getAll
     * @param {(string|number)} name Name of the {@link Mapper} to target.
     * @param {...Array} [keyList] See {@link Collection#getAll}.
     * @param {object} [opts] See {@link Collection#getAll}.
     * @returns {Array} See {@link Collection#getAll}.
     * @see Collection#getAll
     * @see Collection#getAll
     * @since 3.0.0
     */
    getAll(name, ...args) {
        return this.getCollection(name).getAll(...args);
    }
    /**
     * Wrapper for {@link Collection#prune}.
     *
     * @method SimpleStore#prune
     * @param name
     * @param {object} [opts] See {@link Collection#prune}.
     * @returns {Array} See {@link Collection#prune}.
     * @see Collection#prune
     * @see Collection#prune
     * @since 3.0.0
     */
    prune(name, opts) {
        return this.getCollection(name).prune(opts);
    }
    /**
     * Wrapper for {@link Collection#query}.
     *
     * @example
     * // Grab page 2 of users between ages 18 and 30
     * store.query('user')
     *   .between(18, 30, { index: 'age' }) // between ages 18 and 30
     *   .skip(10) // second page
     *   .limit(10) // page size
     *   .run();
     *
     * @method SimpleStore#query
     * @param {(string|number)} name Name of the {@link Mapper} to target.
     * @returns {Query} See {@link Collection#query}.
     * @see Collection#query
     * @see Collection#query
     * @since 3.0.0
     */
    query(name) {
        return this.getCollection(name).query();
    }
    /**
     * Wrapper for {@link Collection#toJSON}.
     *
     * @example
     * store.defineMapper('post', {
     *   schema: {
     *     properties: {
     *       id: { type: 'number' },
     *       title: { type: 'string' }
     *     }
     *   }
     * });
     * store.add('post', [
     *   { id: 1, status: 'published', title: 'Respect your Data' },
     *   { id: 2, status: 'draft', title: 'Connecting to a data source' }
     * ]);
     * console.log(store.toJSON('post'));
     * const draftsJSON = store.query('post')
     *   .filter({ status: 'draft' })
     *   .mapCall('toJSON')
     *   .run();
     *
     * @method SimpleStore#toJSON
     * @param {(string|number)} name Name of the {@link Mapper} to target.
     * @param {object} [opts] See {@link Collection#toJSON}.
     * @returns {Array} See {@link Collection#toJSON}.
     * @see Collection#toJSON
     * @see Collection#toJSON
     * @since 3.0.0
     */
    toJSON(name, opts) {
        return this.getCollection(name).toJSON(opts);
    }
    /**
     * Wrapper for {@link Collection#unsaved}.
     *
     * @method SimpleStore#unsaved
     * @returns {Array} See {@link Collection#unsaved}.
     * @see Collection#unsaved
     * @see Collection#unsaved
     * @since 3.0.0
     */
    unsaved(name, opts) {
        return this.getCollection(name).unsaved(opts);
    }
}
/**
 * Fired when a record changes. Only works for records that have tracked fields.
 * See {@link SimpleStore~changeListener} on how to listen for this event.
 *
 * @event SimpleStore#change
 * @see SimpleStore~changeListener
 */
/**
 * Callback signature for the {@link SimpleStore#event:change} event.
 *
 * @example
 * function onChange (mapperName, record, changes) {
 *   // do something
 * }
 * store.on('change', onChange);
 *
 * @callback SimpleStore~changeListener
 * @param {string} name The name of the associated {@link Mapper}.
 * @param {Record} record The Record that changed.
 * @param {object} changes The changes.
 * @see SimpleStore#event:change
 * @since 3.0.0
 */
/**
 * Fired when one or more records are added to the in-memory store. See
 * {@link SimpleStore~addListener} on how to listen for this event.
 *
 * @event SimpleStore#add
 * @see SimpleStore~addListener
 * @see SimpleStore#event:add
 * @see SimpleStore#add
 * @see SimpleStore#create
 * @see SimpleStore#createMany
 * @see SimpleStore#find
 * @see SimpleStore#findAll
 * @see SimpleStore#update
 * @see SimpleStore#updateAll
 * @see SimpleStore#updateMany
 */
/**
 * Callback signature for the {@link SimpleStore#event:add} event.
 *
 * @example
 * function onAdd (mapperName, recordOrRecords) {
 *   // do something
 * }
 * store.on('add', onAdd);
 *
 * @callback SimpleStore~addListener
 * @param {string} name The name of the associated {@link Mapper}.
 * @param {Record|Record[]} The Record or Records that were added.
 * @see SimpleStore#event:add
 * @see SimpleStore#add
 * @see SimpleStore#create
 * @see SimpleStore#createMany
 * @see SimpleStore#find
 * @see SimpleStore#findAll
 * @see SimpleStore#update
 * @see SimpleStore#updateAll
 * @see SimpleStore#updateMany
 * @since 3.0.0
 */
/**
 * Fired when one or more records are removed from the in-memory store. See
 * {@link SimpleStore~removeListener} for how to listen for this event.
 *
 * @event SimpleStore#remove
 * @see SimpleStore~removeListener
 * @see SimpleStore#event:remove
 * @see SimpleStore#clear
 * @see SimpleStore#destroy
 * @see SimpleStore#destroyAll
 * @see SimpleStore#remove
 * @see SimpleStore#removeAll
 */
/**
 * Callback signature for the {@link SimpleStore#event:remove} event.
 *
 * @example
 * function onRemove (mapperName, recordsOrRecords) {
 *   // do something
 * }
 * store.on('remove', onRemove);
 *
 * @callback SimpleStore~removeListener
 * @param {string} name The name of the associated {@link Mapper}.
 * @param {Record|Record[]} Record or Records that were removed.
 * @see SimpleStore#event:remove
 * @see SimpleStore#clear
 * @see SimpleStore#destroy
 * @see SimpleStore#destroyAll
 * @see SimpleStore#remove
 * @see SimpleStore#removeAll
 * @since 3.0.0
 */
/**
 * Create a subclass of this SimpleStore:
 * @example <caption>SimpleStore.extend</caption>
 * const JSData = require('js-data');
 * const { SimpleStore } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * // Extend the class using ES2015 class syntax.
 * class CustomSimpleStoreClass extends SimpleStore {
 *   foo () { return 'bar'; }
 *   static beep () { return 'boop'; }
 * }
 * const customSimpleStore = new CustomSimpleStoreClass();
 * console.log(customSimpleStore.foo());
 * console.log(CustomSimpleStoreClass.beep());
 *
 * // Extend the class using alternate method.
 * const OtherSimpleStoreClass = SimpleStore.extend({
 *   foo () { return 'bar'; }
 * }, {
 *   beep () { return 'boop'; }
 * })
 * const otherSimpleStore = new OtherSimpleStoreClass();
 * console.log(otherSimpleStore.foo());
 * console.log(OtherSimpleStoreClass.beep());
 *
 * // Extend the class, providing a custom constructor.
 * function AnotherSimpleStoreClass () {
 *   SimpleStore.call(this)
 *   this.created_at = new Date().getTime()
 * }
 * SimpleStore.extend({
 *   constructor: AnotherSimpleStoreClass,
 *   foo () { return 'bar'; }
 * }, {
 *   beep () { return 'boop'; }
 * })
 * const anotherSimpleStore = new AnotherSimpleStoreClass();
 * console.log(anotherSimpleStore.created_at);
 * console.log(anotherSimpleStore.foo());
 * console.log(AnotherSimpleStoreClass.beep());
 *
 * @method SimpleStore.extend
 * @param {object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {object} [props.constructor] Provide a custom constructor function
 * to be used as the subclass itself.
 * @param {object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this SimpleStore class.
 * @since 3.0.0
 */

const DOMAIN$9 = 'LinkedCollection';
/**
 * Extends {@link Collection}. Used by a {@link DataStore} to implement an
 * Identity Map.
 *
 * @example
 * import {LinkedCollection} from 'js-data';
 *
 * // Extend the class using ES2015 class syntax.
 * class CustomLinkedCollectionClass extends LinkedCollection {
 *   foo () { return 'bar'; }
 *   static beep () { return 'boop'; }
 * }
 * const customLinkedCollection = new CustomLinkedCollectionClass();
 * console.log(customLinkedCollection.foo());
 * console.log(CustomLinkedCollectionClass.beep());
 *
 * @class LinkedCollection
 * @extends Collection
 * @param {array} [records] Initial set of records to insert into the
 * collection. See {@link Collection}.
 * @param {object} [opts] Configuration options. See {@link Collection}.
 * @returns {Mapper}
 */
class LinkedCollection extends Collection {
    constructor(records, opts) {
        super(records, opts);
        // Make sure this collection has a reference to a datastore
        if (!this.datastore) {
            throw utils.err(`new ${DOMAIN$9}`, 'opts.datastore')(400, 'DataStore', this.datastore);
        }
    }
    _addMeta(record, timestamp) {
        // Track when this record was added
        this._added[this.recordId(record)] = timestamp;
        if (utils.isFunction(record._set)) {
            record._set('$', timestamp);
        }
    }
    _clearMeta(record) {
        delete this._added[this.recordId(record)];
        if (utils.isFunction(record._set)) {
            record._set('$'); // unset
        }
    }
    _onRecordEvent(...args) {
        Collection.prototype._onRecordEvent.apply(this, args);
        const event = args[0];
        // This is a very brute force method
        // Lots of room for optimization
        if (utils.isString(event) && event.indexOf('change') === 0) {
            this.updateIndexes(args[1]);
        }
    }
    add(records, opts) {
        const mapper = this.mapper;
        const timestamp = new Date().getTime();
        const singular = utils.isObject(records) && !utils.isArray(records);
        if (singular) {
            records = [records];
        }
        records = super.add(records, opts);
        if (mapper.relationList.length && records.length) {
            // Check the currently visited record for relations that need to be
            // inserted into their respective collections.
            mapper.relationList.forEach(def => {
                def.addLinkedRecords(records);
            });
        }
        records.forEach(record => this._addMeta(record, timestamp));
        return singular ? records[0] : records;
    }
    remove(idOrRecord, opts) {
        const mapper = this.mapper;
        const record = super.remove(idOrRecord, opts);
        if (record) {
            this._clearMeta(record);
        }
        if (mapper.relationList.length && record) {
            mapper.relationList.forEach(def => {
                def.removeLinkedRecords(mapper, [record]);
            });
        }
        return record;
    }
    removeAll(query, opts) {
        const mapper = this.mapper;
        const records = super.removeAll(query, opts);
        records.forEach(this._clearMeta, this);
        if (mapper.relationList.length && records.length) {
            mapper.relationList.forEach(def => {
                def.removeLinkedRecords(mapper, records);
            });
        }
        return records;
    }
}
/**
 * Create a subclass of this LinkedCollection:
 *
 * // Extend the class using alternate method.
 * const OtherLinkedCollectionClass = LinkedCollection.extend({
 *   foo () { return 'bar'; }
 * }, {
 *   beep () { return 'boop'; }
 * });
 * const otherLinkedCollection = new OtherLinkedCollectionClass();
 * console.log(otherLinkedCollection.foo());
 * console.log(OtherLinkedCollectionClass.beep());
 *
 * // Extend the class, providing a custom constructor.
 * function AnotherLinkedCollectionClass () {
 *   LinkedCollection.call(this);
 *   this.created_at = new Date().getTime();
 * }
 * LinkedCollection.extend({
 *   constructor: AnotherLinkedCollectionClass,
 *   foo () { return 'bar'; }
 * }, {
 *   beep () { return 'boop'; }
 * });
 * const anotherLinkedCollection = new AnotherLinkedCollectionClass();
 * console.log(anotherLinkedCollection.created_at);
 * console.log(anotherLinkedCollection.foo());
 * console.log(AnotherLinkedCollectionClass.beep());
 *
 * @method LinkedCollection.extend
 * @param {object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {object} [props.constructor] Provide a custom constructor function
 * to be used as the subclass itself.
 * @param {object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this LinkedCollection class.
 * @since 3.0.0
 */

const DATASTORE_DEFAULTS = {
    /**
     * Whether in-memory relations should be unlinked from records after they are
     * destroyed.
     *
     * @default true
     * @name DataStore#unlinkOnDestroy
     * @since 3.0.0
     * @type {boolean}
     */
    unlinkOnDestroy: true,
    collectionClass: LinkedCollection
};
/**
 * The `DataStore` class is an extension of {@link SimpleStore}. Not only does
 * `DataStore` manage mappers and store data in collections, it uses the
 * {@link LinkedCollection} class to link related records together in memory.
 *
 * ```javascript
 * import { DataStore } from 'js-data';
 * ```
 *
 * @example
 * import { DataStore } from 'js-data';
 * import HttpAdapter from 'js-data-http';
 * const store = new DataStore();
 *
 * // DataStore#defineMapper returns a direct reference to the newly created
 * // Mapper.
 * const UserMapper = store.defineMapper('user');
 *
 * // DataStore#as returns the store scoped to a particular Mapper.
 * const UserStore = store.as('user');
 *
 * // Call "find" on "UserMapper" (Stateless ORM)
 * UserMapper.find(1).then((user) => {
 *   // retrieved a "user" record via the http adapter, but that's it
 *
 *   // Call "find" on "store" targeting "user" (Stateful DataStore)
 *   return store.find('user', 1); // same as "UserStore.find(1)"
 * }).then((user) => {
 *   // not only was a "user" record retrieved, but it was added to the
 *   // store's "user" collection
 *   const cachedUser = store.getCollection('user').get(1);
 *   console.log(user === cachedUser); // true
 * });
 *
 * @class DataStore
 * @extends SimpleStore
 * @param {object} [opts] Configuration options. See {@link SimpleStore}.
 * @param {boolean} [opts.collectionClass={@link LinkedCollection}] See {@link DataStore#collectionClass}.
 * @param {boolean} [opts.debug=false] See {@link Component#debug}.
 * @param {boolean} [opts.unlinkOnDestroy=true] See {@link DataStore#unlinkOnDestroy}.
 * @param {boolean|Function} [opts.usePendingFind=true] See {@link DataStore#usePendingFind}.
 * @param {boolean|Function} [opts.usePendingFindAll=true] See {@link DataStore#usePendingFindAll}.
 * @returns {DataStore}
 * @see SimpleStore
 * @since 3.0.0
 * @tutorial ["http://www.js-data.io/v3.0/docs/components-of-jsdata#datastore","Components of JSData: DataStore"]
 * @tutorial ["http://www.js-data.io/v3.0/docs/working-with-the-datastore","Working with the DataStore"]
 * @tutorial ["http://www.js-data.io/v3.0/docs/jsdata-and-the-browser","Notes on using JSData in the Browser"]
 */
class DataStore extends SimpleStore {
    constructor(opts = {}) {
        // Fill in any missing options with the defaults
        super(Object.assign(Object.assign({}, DATASTORE_DEFAULTS), opts));
    }
    /**
     * Creates a new [Mapper] with [name] from the [opts]
     * @param {string} name
     * @param {object} opts
     * @returns {*}
     */
    defineMapper(name, opts) {
        // Complexity of this method is beyond simply using => functions to bind context
        const self = this;
        const mapper = super.defineMapper(name, opts);
        const idAttribute = mapper.idAttribute;
        const collection = this.getCollection(name);
        mapper.relationList.forEach(def => {
            const relation = def.relation;
            const localField = def.localField;
            const path = `links.${localField}`;
            const foreignKey = def.foreignKey;
            const type = def.type;
            const updateOpts = { index: foreignKey };
            let descriptor;
            const getter = function () {
                return this._get(path);
            };
            if (type === belongsToType) {
                if (!collection.indexes[foreignKey]) {
                    collection.createIndex(foreignKey);
                }
                descriptor = {
                    get: getter,
                    // e.g. profile.user = someUser
                    // or comment.post = somePost
                    set(record) {
                        // e.g. const otherUser = profile.user
                        const currentParent = this._get(path);
                        // e.g. profile.user === someUser
                        if (record === currentParent) {
                            return currentParent;
                        }
                        const id = utils.get(this, idAttribute);
                        const inverseDef = def.getInverse(mapper);
                        // e.g. profile.user !== someUser
                        // or comment.post !== somePost
                        if (currentParent && inverseDef) {
                            this.removeInverseRelation(currentParent, id, inverseDef, idAttribute);
                        }
                        if (record) {
                            // e.g. profile.user = someUser
                            const relatedIdAttribute = def.getRelation().idAttribute;
                            const relatedId = utils.get(record, relatedIdAttribute);
                            // Prefer store record
                            if (relatedId !== undefined && this._get('$')) {
                                record = self.get(relation, relatedId) || record;
                            }
                            // Set locals
                            // e.g. profile.user = someUser
                            // or comment.post = somePost
                            safeSetLink(this, localField, record);
                            safeSetProp(this, foreignKey, relatedId);
                            collection.updateIndex(this, updateOpts);
                            if (inverseDef) {
                                this.setupInverseRelation(record, id, inverseDef, idAttribute);
                            }
                        }
                        else {
                            // Unset in-memory link only
                            // e.g. profile.user = undefined
                            // or comment.post = undefined
                            safeSetLink(this, localField, undefined);
                        }
                        return record;
                    }
                };
                let foreignKeyDescriptor = Object.getOwnPropertyDescriptor(mapper.recordClass.prototype, foreignKey);
                if (!foreignKeyDescriptor) {
                    foreignKeyDescriptor = {
                        enumerable: true
                    };
                }
                const originalGet = foreignKeyDescriptor.get;
                foreignKeyDescriptor.get = function () {
                    if (originalGet) {
                        return originalGet.call(this);
                    }
                    return this._get(`props.${foreignKey}`);
                };
                const originalSet = foreignKeyDescriptor.set;
                foreignKeyDescriptor.set = function (value) {
                    if (originalSet) {
                        originalSet.call(this, value);
                    }
                    const currentParent = utils.get(this, localField);
                    const id = utils.get(this, idAttribute);
                    const inverseDef = def.getInverse(mapper);
                    const currentParentId = currentParent ? utils.get(currentParent, def.getRelation().idAttribute) : undefined;
                    if (inverseDef && currentParent && currentParentId !== undefined && currentParentId !== value) {
                        if (inverseDef.type === hasOneType) {
                            safeSetLink(currentParent, inverseDef.localField, undefined);
                        }
                        else if (inverseDef.type === hasManyType) {
                            const children = utils.get(currentParent, inverseDef.localField);
                            if (id === undefined) {
                                utils.remove(children, child => child === this);
                            }
                            else {
                                utils.remove(children, child => child === this || id === utils.get(child, idAttribute));
                            }
                        }
                    }
                    safeSetProp(this, foreignKey, value);
                    collection.updateIndex(this, updateOpts);
                    if (value === undefined || value === null) {
                        if (currentParentId !== undefined) {
                            // Unset locals
                            utils.set(this, localField, undefined);
                        }
                    }
                    else if (this._get('$')) {
                        const storeRecord = self.get(relation, value);
                        if (storeRecord) {
                            utils.set(this, localField, storeRecord);
                        }
                    }
                };
                Object.defineProperty(mapper.recordClass.prototype, foreignKey, foreignKeyDescriptor);
            }
            else if (type === hasManyType) {
                const localKeys = def.localKeys;
                const foreignKeys = def.foreignKeys;
                // TODO: Handle case when belongsTo relation isn't ever defined
                if (self._collections[relation] && foreignKey && !self.getCollection(relation).indexes[foreignKey]) {
                    self.getCollection(relation).createIndex(foreignKey);
                }
                descriptor = {
                    get() {
                        const current = getter.call(this);
                        if (!current) {
                            this._set(path, []);
                        }
                        return getter.call(this);
                    },
                    // e.g. post.comments = someComments
                    // or user.groups = someGroups
                    // or group.users = someUsers
                    set(records) {
                        if (records && !utils.isArray(records)) {
                            records = [records];
                        }
                        const id = utils.get(this, idAttribute);
                        const relatedIdAttribute = def.getRelation().idAttribute;
                        const inverseDef = def.getInverse(mapper);
                        const inverseLocalField = inverseDef.localField;
                        const current = this._get(path) || [];
                        const toLink = [];
                        const toLinkIds = {};
                        if (records) {
                            records.forEach(record => {
                                // e.g. comment.id
                                const relatedId = utils.get(record, relatedIdAttribute);
                                const currentParent = utils.get(record, inverseLocalField);
                                if (currentParent && currentParent !== this) {
                                    const currentChildrenOfParent = utils.get(currentParent, localField);
                                    // e.g. somePost.comments.remove(comment)
                                    if (relatedId === undefined) {
                                        utils.remove(currentChildrenOfParent, child => child === record);
                                    }
                                    else {
                                        utils.remove(currentChildrenOfParent, child => child === record || relatedId === utils.get(child, relatedIdAttribute));
                                    }
                                }
                                if (relatedId !== undefined) {
                                    if (this._get('$')) {
                                        // Prefer store record
                                        record = self.get(relation, relatedId) || record;
                                    }
                                    // e.g. toLinkIds[comment.id] = comment
                                    toLinkIds[relatedId] = record;
                                }
                                toLink.push(record);
                            });
                        }
                        // e.g. post.comments = someComments
                        if (foreignKey) {
                            current.forEach(record => {
                                // e.g. comment.id
                                const relatedId = utils.get(record, relatedIdAttribute);
                                if ((relatedId === undefined && toLink.indexOf(record) === -1) ||
                                    (relatedId !== undefined && !(relatedId in toLinkIds))) {
                                    // Update (unset) inverse relation
                                    if (records) {
                                        // e.g. comment.post_id = undefined
                                        safeSetProp(record, foreignKey, undefined);
                                        // e.g. CommentCollection.updateIndex(comment, { index: 'post_id' })
                                        self.getCollection(relation).updateIndex(record, updateOpts);
                                    }
                                    // e.g. comment.post = undefined
                                    safeSetLink(record, inverseLocalField, undefined);
                                }
                            });
                            toLink.forEach(record => {
                                // Update (set) inverse relation
                                // e.g. comment.post_id = post.id
                                safeSetProp(record, foreignKey, id);
                                // e.g. CommentCollection.updateIndex(comment, { index: 'post_id' })
                                self.getCollection(relation).updateIndex(record, updateOpts);
                                // e.g. comment.post = post
                                safeSetLink(record, inverseLocalField, this);
                            });
                        }
                        else if (localKeys) {
                            // Update locals
                            // e.g. group.users = someUsers
                            // Update (set) inverse relation
                            const ids = toLink.map(child => utils.get(child, relatedIdAttribute)).filter(id => id !== undefined);
                            // e.g. group.user_ids = [1,2,3,...]
                            utils.set(this, localKeys, ids);
                            // Update (unset) inverse relation
                            if (inverseDef.foreignKeys) {
                                current.forEach(child => {
                                    const relatedId = utils.get(child, relatedIdAttribute);
                                    if ((relatedId === undefined && toLink.indexOf(child) === -1) ||
                                        (relatedId !== undefined && !(relatedId in toLinkIds))) {
                                        // Update inverse relation
                                        // safeSetLink(child, inverseLocalField, undefined)
                                        const parents = utils.get(child, inverseLocalField) || [];
                                        // e.g. someUser.groups.remove(group)
                                        if (id === undefined) {
                                            utils.remove(parents, parent => parent === this);
                                        }
                                        else {
                                            utils.remove(parents, parent => parent === this || id === utils.get(parent, idAttribute));
                                        }
                                    }
                                });
                                toLink.forEach(child => {
                                    // Update (set) inverse relation
                                    const parents = utils.get(child, inverseLocalField);
                                    // e.g. someUser.groups.push(group)
                                    if (id === undefined) {
                                        utils.noDupeAdd(parents, this, parent => parent === this);
                                    }
                                    else {
                                        utils.noDupeAdd(parents, this, parent => parent === this || id === utils.get(parent, idAttribute));
                                    }
                                });
                            }
                        }
                        else if (foreignKeys) {
                            // e.g. user.groups = someGroups
                            // Update (unset) inverse relation
                            current.forEach(parent => {
                                const ids = utils.get(parent, foreignKeys) || [];
                                // e.g. someGroup.user_ids.remove(user.id)
                                utils.remove(ids, _key => id === _key);
                                const children = utils.get(parent, inverseLocalField);
                                // e.g. someGroup.users.remove(user)
                                if (id === undefined) {
                                    utils.remove(children, child => child === this);
                                }
                                else {
                                    utils.remove(children, child => child === this || id === utils.get(child, idAttribute));
                                }
                            });
                            // Update (set) inverse relation
                            toLink.forEach(parent => {
                                const ids = utils.get(parent, foreignKeys) || [];
                                utils.noDupeAdd(ids, id, _key => id === _key);
                                const children = utils.get(parent, inverseLocalField);
                                if (id === undefined) {
                                    utils.noDupeAdd(children, this, child => child === this);
                                }
                                else {
                                    utils.noDupeAdd(children, this, child => child === this || id === utils.get(child, idAttribute));
                                }
                            });
                        }
                        this._set(path, toLink);
                        return toLink;
                    }
                };
            }
            else if (type === hasOneType) {
                // TODO: Handle case when belongsTo relation isn't ever defined
                if (self._collections[relation] && foreignKey && !self.getCollection(relation).indexes[foreignKey]) {
                    self.getCollection(relation).createIndex(foreignKey);
                }
                descriptor = {
                    get: getter,
                    // e.g. user.profile = someProfile
                    set(record) {
                        const current = this._get(path);
                        if (record === current) {
                            return current;
                        }
                        const inverseLocalField = def.getInverse(mapper).localField;
                        // Update (unset) inverse relation
                        if (current) {
                            safeSetProp(current, foreignKey, undefined);
                            self.getCollection(relation).updateIndex(current, updateOpts);
                            safeSetLink(current, inverseLocalField, undefined);
                        }
                        if (record) {
                            const relatedId = utils.get(record, def.getRelation().idAttribute);
                            // Prefer store record
                            if (relatedId !== undefined) {
                                record = self.get(relation, relatedId) || record;
                            }
                            // Set locals
                            safeSetLink(this, localField, record);
                            // Update (set) inverse relation
                            safeSetProp(record, foreignKey, utils.get(this, idAttribute));
                            self.getCollection(relation).updateIndex(record, updateOpts);
                            safeSetLink(record, inverseLocalField, this);
                        }
                        else {
                            // Unset locals
                            safeSetLink(this, localField, undefined);
                        }
                        return record;
                    }
                };
            }
            if (descriptor) {
                descriptor.enumerable = def.enumerable === undefined ? false : def.enumerable;
                if (def.get) {
                    const origGet = descriptor.get;
                    descriptor.get = function () {
                        return def.get(def, this, (...args) => origGet.apply(this, args));
                    };
                }
                if (def.set) {
                    const origSet = descriptor.set;
                    descriptor.set = function (related) {
                        return def.set(def, this, related, value => origSet.call(this, value === undefined ? related : value));
                    };
                }
                Object.defineProperty(mapper.recordClass.prototype, localField, descriptor);
            }
        });
        return mapper;
    }
    destroy(name, id, opts = {}) {
        return super.destroy(name, id, opts).then(result => {
            let record;
            if (opts.raw) {
                record = result.data;
            }
            else {
                record = result;
            }
            if (record && this.unlinkOnDestroy) {
                const _opts = utils.plainCopy(opts);
                _opts.withAll = true;
                utils.forEachRelation(this.getMapper(name), _opts, def => {
                    utils.set(record, def.localField, undefined);
                });
            }
            return result;
        });
    }
    destroyAll(name, query, opts = {}) {
        return super.destroyAll(name, query, opts).then(result => {
            var _a;
            let records;
            if (opts.raw) {
                records = result.data;
            }
            else {
                records = result;
            }
            if (((_a = records) === null || _a === void 0 ? void 0 : _a.length) && this.unlinkOnDestroy) {
                const _opts = utils.plainCopy(opts);
                _opts.withAll = true;
                utils.forEachRelation(this.getMapper(name), _opts, def => {
                    records.forEach(record => {
                        utils.set(record, def.localField, undefined);
                    });
                });
            }
            return result;
        });
    }
}

/**
 * Registered as `js-data` in NPM.
 *
 * @example <caption>Install from NPM</caption>
 * npm i --save js-data
 * @example <caption>Install from NPM</caption>
 * yarn add js-data
 * @example <caption>Load into your app via CommonJS</caption>
 * var JSData = require('js-data');
 * @example <caption>Load into your app via ES2015 Modules</caption>
 * import * as JSData from 'js-data';
 */
/**
 * Describes the version of this `JSData` object.
 *
 * @example
 * console.log(JSData.version.full); // "3.0.0-beta.1"
 *
 * @name version
 * @memberof module:js-data
 * @property {string} full The full semver value.
 * @property {number} major The major version number.
 * @property {number} minor The minor version number.
 * @property {number} patch The patch version number.
 * @property {(string|boolean)} alpha The alpha version value, otherwise `false`
 * if the current version is not alpha.
 * @property {(string|boolean)} beta The beta version value, otherwise `false`
 * if the current version is not beta.
 * @since 2.0.0
 * @type {Object}
 */
const version = {
  beta: 4,
  full: '4.0.0-beta.4',
  major: 4,
  minor: 0,
  patch: 0
};

export { Collection, Component, Container, DataStore, Index, LinkedCollection, Mapper, Query, Record, Schema, Settable, SimpleStore, belongsTo, belongsToType, hasMany, hasManyType, hasOne, hasOneType, utils, version };
//# sourceMappingURL=js-data.es2015.js.map
