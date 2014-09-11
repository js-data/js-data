function errorPrefix(resourceName, id) {
  return 'DS.find(' + resourceName + ', ' + id + '[, options]): ';
}

/**
 * @doc method
 * @id DS.async methods:find
 * @name find
 * @description
 * The "R" in "CRUD". Delegate to the `find` method of whichever adapter is being used (http by default) and inject the
 * resulting item into the data store.
 *
 * ## Signature:
 * ```js
 * DS.find(resourceName, id[, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 * DS.get('document', 5); // undefined
 * DS.find('document', 5).then(function (document) {
 *   document; // { id: 5, author: 'John Anderson' }
 *
 *   // the document is now in the data store
 *   DS.get('document', 5); // { id: 5, author: 'John Anderson' }
 * });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to retrieve.
 * @param {object=} options Optional configuration. Also passed along to the adapter's `find` method. Properties:
 *
 * - `{boolean=}` - `bypassCache` - Bypass the cache. Default: `false`.
 * - `{boolean=}` - `cacheResponse` - Inject the data returned by the adapter into the data store. Default: `true`.
 *
 * @returns {Promise} Promise.
 *
 * ## Resolves with:
 *
 * - `{object}` - `item` - The item returned by the adapter.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 */
function find(resourceName, id, options) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];
  var resource = DS.store[resourceName];

  return new DSUtils.Promise(function (resolve, reject) {
    options = options || {};

    if (!definition) {
      reject(new DSErrors.NER(errorPrefix(resourceName, id) + resourceName));
    } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
      reject(new DSErrors.IA(errorPrefix(resourceName, id) + 'id: Must be a string or a number!'));
    } else if (!DSUtils.isObject(options)) {
      reject(new DSErrors.IA(errorPrefix(resourceName, id) + 'options: Must be an object!'));
    } else {
      if (!('cacheResponse' in options)) {
        options.cacheResponse = true;
      }
      if (options.bypassCache || !options.cacheResponse) {
        delete resource.completedQueries[id];
      }
      if (id in resource.completedQueries) {
        resolve(DS.get(resourceName, id));
      } else {
        resolve();
      }
    }
  }).then(function (item) {
      if (!(id in resource.completedQueries)) {
        if (!(id in resource.pendingQueries)) {
          resource.pendingQueries[id] = DS.adapters[options.adapter || definition.defaultAdapter].find(definition, id, options)
            .then(function (res) {
              var data = definition.deserialize(resourceName, res);
              if (options.cacheResponse) {
                // Query is no longer pending
                delete resource.pendingQueries[id];
                resource.completedQueries[id] = new Date().getTime();
                return DS.inject(resourceName, data, options);
              } else {
                return data;
              }
            }).catch(function (err) {
              delete resource.pendingQueries[id];
              throw err;
            });
        }
        return resource.pendingQueries[id];
      } else {
        return item;
      }
    });
}

module.exports = find;
