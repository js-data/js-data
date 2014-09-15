function errorPrefix(resourceName, id) {
  return 'DS.refresh(' + resourceName + ', ' + id + '[, options]): ';
}

/**
 * @doc method
 * @id DS.async methods:refresh
 * @name refresh
 * @description
 * Like `DS.find`, except the resource is only refreshed from the adapter if it already exists in the data store.
 *
 * ## Signature:
 * ```js
 * DS.refresh(resourceName, id[, options])
 * ```
 * ## Example:
 *
 * ```js
 * // Exists in the data store, but we want a fresh copy
 * DS.get('document', 5);
 *
 * DS.refresh('document', 5).then(function (document) {
 *   document; // The fresh copy
 * });
 *
 * // Does not exist in the data store
 * DS.get('document', 6); // undefined
 *
 * DS.refresh('document', 6).then(function (document) {
 *   document; // undefined
 * });
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to refresh from the adapter.
 * @param {object=} options Optional configuration. Also passed along to the adapter's `find` method.
 * @returns {Promise} Promise.
 *
 * ## Resolves with:
 *
 * - `{object|undefined}` - `item` - The item returned by the adapter or `undefined` if the item wasn't already in the
 * data store.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 */
function refresh(resourceName, id, options) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;

  return new DSUtils.Promise(function (resolve, reject) {
    options = options || {};

    id = DSUtils.resolveId(DS.definitions[resourceName], id);
    if (!DS.definitions[resourceName]) {
      reject(new DS.errors.NER(errorPrefix(resourceName, id) + resourceName));
    } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
      reject(new DSErrors.IA(errorPrefix(resourceName, id) + 'id: Must be a string or a number!'));
    } else if (!DSUtils.isObject(options)) {
      reject(new DSErrors.IA(errorPrefix(resourceName, id) + 'options: Must be an object!'));
    } else {
      options.bypassCache = true;
      resolve(DS.get(resourceName, id));
    }
  }).then(function (item) {
      if (item) {
        return DS.find(resourceName, id, options);
      } else {
        return item;
      }
    });
}

module.exports = refresh;
