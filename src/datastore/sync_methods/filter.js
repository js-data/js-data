function errorPrefix(resourceName) {
  return 'DS.filter(' + resourceName + '[, params][, options]): ';
}

/**
 * @doc method
 * @id DS.sync methods:filter
 * @name filter
 * @description
 * Synchronously filter items in the data store of the type specified by `resourceName`.
 *
 * ## Signature:
 * ```js
 * DS.filter(resourceName[, params][, options])
 * ```
 *
 * ## Example:
 *
 * For many examples see the [tests for DS.filter](https://github.com/js-data/js-data/blob/master/test/integration/datastore/sync methods/filter.test.js).
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
 * @param {object=} options Optional configuration. Properties:
 *
 * - `{boolean=}` - `loadFromServer` - Send the query to server if it has not been sent yet. Default: `false`.
 * - `{boolean=}` - `allowSimpleWhere` - Treat top-level fields on the `params` argument as simple "where" equality clauses. Default: `true`.
 *
 * @returns {array} The filtered collection of items of the type specified by `resourceName`.
 */
function filter(resourceName, params, options) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];

  options = options || {};

  if (!definition) {
    throw new DSErrors.NER(errorPrefix(resourceName) + resourceName);
  } else if (params && !DSUtils.isObject(params)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'params: Must be an object!');
  } else if (!DSUtils.isObject(options)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'options: Must be an object!');
  }
  var resource = DS.store[resourceName];

  // Protect against null
  params = params || {};

  if ('allowSimpleWhere' in options) {
    options.allowSimpleWhere = !!options.allowSimpleWhere;
  } else {
    options.allowSimpleWhere = true;
  }

  var queryHash = DSUtils.toJson(params);

  if (!(queryHash in resource.completedQueries) && options.loadFromServer) {
    // This particular query has never been completed

    if (!resource.pendingQueries[queryHash]) {
      // This particular query has never even been started
      DS.findAll(resourceName, params, options);
    }
  }

  return definition.defaultFilter.call(DS, resource.collection, resourceName, params, options);
}

module.exports = filter;
