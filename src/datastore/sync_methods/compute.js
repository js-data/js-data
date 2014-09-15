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
