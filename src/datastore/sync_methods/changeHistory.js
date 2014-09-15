function errorPrefix(resourceName) {
  return 'DS.changeHistory(' + resourceName + ', id): ';
}

/**
 * @doc method
 * @id DS.sync methods:changeHistory
 * @name changeHistory
 * @description
 * Synchronously return the changeHistory of the item of the type specified by `resourceName` that has the primary key
 * specified by `id`. This object represents the history of changes in the item since the item was last injected or
 * re-injected (on save, update, etc.) into the data store.
 *
 * ## Signature:
 * ```js
 * DS.changeHistory(resourceName, id)
 * ```
 *
 * ## Example:
 *
 * ```js
 * var d = DS.get('document', 5); // { author: 'John Anderson', id: 5 }
 *
 * d.author = 'Sally';
 *
 * // You might have to do $scope.$apply() first
 *
 * DS.changeHistory('document', 5); // [{...}] Array of changes
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number=} id The primary key of the item for which to retrieve the changeHistory.
 * @returns {object} The changeHistory of the item of the type specified by `resourceName` with the primary key specified by `id`.
 */
function changeHistory(resourceName, id) {
  var DS = this;
  var DSUtils = DS.utils;
  var definition = DS.definitions[resourceName];
  var resource = DS.store[resourceName];
  if (resourceName && !DS.definitions[resourceName]) {
    throw new DS.errors.NER(errorPrefix(resourceName) + resourceName);
  } else if (id && !DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DS.errors.IA(errorPrefix(resourceName) + 'id: Must be a string or a number!');
  }

  if (!definition.keepChangeHistory) {
    console.warn(errorPrefix(resourceName) + 'changeHistory is disabled for this resource!');
  } else {
    if (resourceName) {
      var item = DS.get(resourceName, id);
      if (item) {
        return resource.changeHistories[id];
      }
    } else {
      return resource.changeHistory;
    }
  }
}

module.exports = changeHistory;
