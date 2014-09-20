var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

/**
 * @doc method
 * @id DS.sync methods:lastSaved
 * @name lastSaved
 * @description
 * Return the timestamp of the last time either the collection for `resourceName` or the item of type `resourceName`
 * with the given primary key was saved via an async adapter.
 *
 * ## Signature:
 * ```js
 * DS.lastSaved(resourceName[, id])
 * ```
 *
 * ## Example:
 *
 * ```js
 * DS.lastModified('document', 5); // undefined
 * DS.lastSaved('document', 5); // undefined
 *
 * DS.find('document', 5).then(function (document) {
 *   DS.lastModified('document', 5); // 1234235825494
 *   DS.lastSaved('document', 5); // 1234235825494
 *
 *   document.author = 'Sally';
 *
 *   // You may have to call DS.digest() first
 *
 *   DS.lastModified('document', 5); // 1234304985344 - something different
 *   DS.lastSaved('document', 5); // 1234235825494 - still the same
 * });
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item for which to retrieve the lastSaved timestamp.
 * @returns {number} The timestamp of the last time the item of type `resourceName` with the given primary key was saved.
 */
function lastSaved(resourceName, id) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var resource = _this.store[resourceName];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new DSErrors.NER(resourceName);
  }
  if (!(id in resource.saved)) {
    resource.saved[id] = 0;
  }
  return resource.saved[id];
}

module.exports = lastSaved;
