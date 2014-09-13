function errorPrefix(resourceName) {
  return 'DS.updateAll(' + resourceName + ', attrs, params[, options]): ';
}

/**
 * @doc method
 * @id DS.async methods:updateAll
 * @name updateAll
 * @description
 * The "U" in "CRUD". Update items of type `resourceName` with `attrs` according to the criteria specified by `params`.
 * This is useful when you want to update multiple items with the same attributes or you don't want to update the items
 * in the data store until the adapter operation succeeds. The resulting items (by default) will be injected into the
 * data store.
 *
 * ## Signature:
 * ```js
 * DS.updateAll(resourceName, attrs, params[, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 * var params = {
 *   where: {
 *     author: {
 *       '==': 'John Anderson'
 *     }
 *   }
 * };
 *
 * DS.filter('document', params); // []
 *
 * DS.updateAll('document', 5, {
 *   author: 'Sally'
 * }, params).then(function (documents) {
 *   documents; // The documents that were updated via an adapter
 *              // and now reside in the data store
 *
 *   documents[0].author; // "Sally"
 * });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object} attrs The attributes with which to update the items.
 * @param {object} params Parameter object that is serialized into the query string. Default properties:
 *
 *  - `{object=}` - `where` - Where clause.
 *  - `{number=}` - `limit` - Limit clause.
 *  - `{number=}` - `skip` - Skip clause.
 *  - `{number=}` - `offset` - Same as skip.
 *  - `{string|array=}` - `orderBy` - OrderBy clause.
 *
 * @param {object=} options Optional configuration. Also passed along to the adapter's `updateAll` method. Properties:
 *
 * - `{boolean=}` - `cacheResponse` - Inject the items returned by the adapter into the data store. Default: `true`.
 *
 * @returns {Promise} Promise.
 *
 * ## Resolves with:
 *
 * - `{array}` - `items` - The items returned by the adapter.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 */
function updateAll(resourceName, attrs, params, options) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];

  return new DSUtils.Promise(function (resolve, reject) {
    options = options || {};

    if (!definition) {
      reject(new DSErrors.NER(errorPrefix(resourceName) + resourceName));
    } else if (!DSUtils.isObject(attrs)) {
      reject(new DSErrors.IA(errorPrefix(resourceName) + 'attrs: Must be an object!'));
    } else if (!DSUtils.isObject(params)) {
      reject(new DSErrors.IA(errorPrefix(resourceName) + 'params: Must be an object!'));
    } else if (!DSUtils.isObject(options)) {
      reject(new DSErrors.IA(errorPrefix(resourceName) + 'options: Must be an object!'));
    } else {
      if (!('cacheResponse' in options)) {
        options.cacheResponse = true;
      }
      resolve(attrs);
    }
  }).then(function (attrs) {
      var func = options.beforeValidate ? DSUtils.promisify(options.beforeValidate) : definition.beforeValidate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      var func = options.validate ? DSUtils.promisify(options.validate) : definition.validate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      var func = options.afterValidate ? DSUtils.promisify(options.afterValidate) : definition.afterValidate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      var func = options.beforeUpdate ? DSUtils.promisify(options.beforeUpdate) : definition.beforeUpdate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      return DS.adapters[options.adapter || definition.defaultAdapter].updateAll(definition, options.serialize ? options.serialize(resourceName, attrs) : definition.serialize(resourceName, attrs), params, options);
    })
    .then(function (res) {
      var func = options.afterUpdate ? DSUtils.promisify(options.afterUpdate) : definition.afterUpdate;
      var attrs = options.deserialize ? options.deserialize(resourceName, res) : definition.deserialize(resourceName, res);
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (data) {
      if (options.cacheResponse) {
        return DS.inject(definition.name, data, options);
      } else {
        return data;
      }
    });
}

module.exports = updateAll;
