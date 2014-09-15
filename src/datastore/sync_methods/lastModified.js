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
