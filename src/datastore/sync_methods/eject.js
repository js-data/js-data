function errorPrefix(resourceName, id) {
  return 'DS.eject(' + resourceName + ', ' + id + '): ';
}

function _eject(definition, resource, id) {
  var DS = this;
  var item;
  var found = false;
  for (var i = 0; i < resource.collection.length; i++) {
    if (resource.collection[i][definition.idAttribute] == id) {
      item = resource.collection[i];
      found = true;
      break;
    }
  }
  if (found) {
    DS.unlinkInverse(definition.name, id);
    resource.collection.splice(i, 1);
    resource.observers[id].close();
    delete resource.observers[id];

    delete resource.index[id];
    delete resource.previousAttributes[id];
    delete resource.completedQueries[id];
    delete resource.pendingQueries[id];
    DS.utils.forEach(resource.changeHistories[id], function (changeRecord) {
      DS.utils.remove(resource.changeHistory, changeRecord);
    });
    delete resource.changeHistories[id];
    delete resource.modified[id];
    delete resource.saved[id];
    resource.collectionModified = DS.utils.updateTimestamp(resource.collectionModified);

    DS.notify(definition, 'eject', item);

    return item;
  }
}

/**
 * @doc method
 * @id DS.sync methods:eject
 * @name eject
 * @description
 * Eject the item of the specified type that has the given primary key from the data store. Ejection only removes items
 * from the data store and does not attempt to destroy items via an adapter.
 *
 * ## Signature:
 * ```js
 * DS.eject(resourceName[, id])
 * ```
 *
 * ## Example:
 *
 * ```js
 * DS.get('document', 45); // { title: 'How to Cook', id: 45 }
 *
 * DS.eject('document', 45);
 *
 * DS.get('document', 45); // undefined
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to eject.
 * @returns {object} A reference to the item that was ejected from the data store.
 */
function eject(resourceName, id) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new DSErrors.NER(errorPrefix(resourceName, id) + resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA(errorPrefix(resourceName, id) + 'id: Must be a string or a number!');
  }
  return _eject.call(DS, definition, DS.store[resourceName], id);
}

module.exports = eject;
