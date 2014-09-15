function errorPrefix(resourceName) {
  return 'DS.ejectAll(' + resourceName + '[, params]): ';
}

function _ejectAll(definition, resource, params) {
  var DS = this;
  var queryHash = DS.utils.toJson(params);
  var items = DS.filter(definition.name, params);
  var ids = DS.utils.toLookup(items, definition.idAttribute);

  DS.utils.forOwn(ids, function (item, id) {
    DS.eject(definition.name, id);
  });

  delete resource.completedQueries[queryHash];
  resource.collectionModified = DS.utils.updateTimestamp(resource.collectionModified);

  DS.notify(definition, 'eject', items);

  return items;
}

/**
 * @doc method
 * @id DS.sync methods:ejectAll
 * @name ejectAll
 * @description
 * Eject all matching items of the specified type from the data store. Ejection only removes items from the data store
 * and does not attempt to destroy items via an adapter.
 *
 * ## Signature:
 * ```javascript
 * DS.ejectAll(resourceName[, params])
 * ```
 *
 * ## Example:
 *
 * ```javascript
 * DS.get('document', 45); // { title: 'How to Cook', id: 45 }
 *
 * DS.eject('document', 45);
 *
 * DS.get('document', 45); // undefined
 * ```
 *
 * Eject all items of the specified type that match the criteria from the data store.
 *
 * ```javascript
 * DS.filter('document');   // [ { title: 'How to Cook', id: 45, author: 'John Anderson' },
 *                          //   { title: 'How to Eat', id: 46, author: 'Sally Jane' } ]
 *
 * DS.ejectAll('document', { where: { author: 'Sally Jane' } });
 *
 * DS.filter('document'); // [ { title: 'How to Cook', id: 45, author: 'John Anderson' } ]
 * ```
 *
 * Eject all items of the specified type from the data store.
 *
 * ```javascript
 * DS.filter('document');   // [ { title: 'How to Cook', id: 45, author: 'John Anderson' },
 *                          //   { title: 'How to Eat', id: 46, author: 'Sally Jane' } ]
 *
 * DS.ejectAll('document');
 *
 * DS.filter('document'); // [ ]
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object} params Parameter object that is used to filter items. Properties:
 *
 *  - `{object=}` - `where` - Where clause.
 *  - `{number=}` - `limit` - Limit clause.
 *  - `{number=}` - `skip` - Skip clause.
 *  - `{number=}` - `offset` - Same as skip.
 *  - `{string|array=}` - `orderBy` - OrderBy clause.
 *
 * @returns {array} The items that were ejected from the data store.
 */
function ejectAll(resourceName, params) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];
  params = params || {};

  if (!definition) {
    throw new DSErrors.NER(errorPrefix(resourceName) + resourceName);
  } else if (!DSUtils.isObject(params)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'params: Must be an object!');
  }
  var resource = DS.store[resourceName];
  if (DSUtils.isEmpty(params)) {
    resource.completedQueries = {};
  }
  return _ejectAll.call(DS, definition, resource, params);
}

module.exports = ejectAll;
