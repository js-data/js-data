function errorPrefix(resourceName) {
  return 'DS.destroyAll(' + resourceName + ', params[, options]): ';
}

/**
 * @doc method
 * @id DS.async methods:destroyAll
 * @name destroyAll
 * @description
 * The "D" in "CRUD". Delegate to the `destroyAll` method of whichever adapter is being used (http by default) and eject
 * the appropriate items from the data store.
 *
 * ## Signature:
 * ```js
 * DS.destroyAll(resourceName, params[, options])
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
 * DS.destroyAll('document', params).then(function (documents) {
 *   // The documents are gone from the data store
 *   DS.filter('document', params); // []
 * });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object} params Parameter object that is serialized into the query string. Properties:
 *
 *  - `{object=}` - `where` - Where clause.
 *  - `{number=}` - `limit` - Limit clause.
 *  - `{number=}` - `skip` - Skip clause.
 *  - `{number=}` - `offset` - Same as skip.
 *  - `{string|array=}` - `orderBy` - OrderBy clause.
 *
 * @param {object=} options Optional configuration. Also passed along to the adapter's `destroyAll` method. Properties:
 *
 * - `{boolean=}` - `bypassCache` - Bypass the cache. Default: `false`.
 *
 * @returns {Promise} Promise.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 */
function destroyAll(resourceName, params, options) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];

  return new DSUtils.Promise(function (resolve, reject) {
    options = options || {};

    if (!definition) {
      reject(new DSErrors.NER(errorPrefix(resourceName) + resourceName));
    } else if (!DSUtils.isObject(params)) {
      reject(new DSErrors.IA(errorPrefix(resourceName) + 'params: Must be an object!'));
    } else if (!DSUtils.isObject(options)) {
      reject(new DSErrors.IA(errorPrefix(resourceName) + 'options: Must be an object!'));
    } else {
      resolve();
    }
  })
    .then(function () {
      return DS.adapters[options.adapter || definition.defaultAdapter].destroyAll(definition, params, options);
    })
    .then(function () {
      return DS.ejectAll(resourceName, params);
    });
}

module.exports = destroyAll;
