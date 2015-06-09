/**
 * Eject an item from the store, if it is currently in the store.
 *
 * @param resourceName The name of the resource type of the item eject.
 * @param id The primary key of the item to eject.
 * @param options Optional configuration.
 * @param options.notify Whether to emit the "DS.beforeEject" and "DS.afterEject" events
 * @param options.clearEmptyQueries Whether to remove cached findAll queries that become empty as a result of this method call.
 * @returns The ejected item if one was ejected.
 */
export default function eject(resourceName, id, options) {
  let _this = this;
  let DSUtils = _this.utils;
  let definition = _this.defs[resourceName];
  let resource = _this.s[resourceName];
  let item;
  let found = false;

  id = DSUtils.resolveId(definition, id);

  if (!definition) {
    throw new _this.errors.NER(resourceName);
  } else if (!DSUtils._sn(id)) {
    throw DSUtils._snErr('id');
  }

  options = DSUtils._(definition, options);

  options.logFn('eject', id, options);

  // find the item to eject
  for (var i = 0; i < resource.collection.length; i++) {
    if (resource.collection[i][definition.idAttribute] == id) { // jshint ignore:line
      item = resource.collection[i];
      // remove its expiration timestamp
      resource.expiresHeap.remove(item);
      found = true;
      break;
    }
  }
  if (found) {
    // lifecycle
    definition.beforeEject(options, item);
    if (options.notify) {
      definition.emit('DS.beforeEject', definition, item);
    }

    // find the item in any ($$injected) cached queries
    let toRemove = [];
    DSUtils.forOwn(resource.queryData, (items, queryHash) => {
      if (items.$$injected) {
        DSUtils.remove(items, item);
      }
      // optionally remove any empty queries
      if (!items.length && options.clearEmptyQueries) {
        toRemove.push(queryHash);
      }
    });

    // clean up
    DSUtils.forEach(resource.changeHistories[id], changeRecord => {
      DSUtils.remove(resource.changeHistory, changeRecord);
    });
    DSUtils.forEach(toRemove, queryHash => {
      delete resource.completedQueries[queryHash];
      delete resource.queryData[queryHash];
    });
    if (DSUtils.w) {
      // stop observation
      resource.observers[id].close();
    }
    delete resource.observers[id];
    delete resource.index[id];
    delete resource.previousAttributes[id];
    delete resource.completedQueries[id];
    delete resource.pendingQueries[id];
    delete resource.changeHistories[id];
    delete resource.modified[id];
    delete resource.saved[id];

    // remove it from the store
    resource.collection.splice(i, 1);
    // collection has been modified
    resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);

    // lifecycle
    definition.afterEject(options, item);
    if (options.notify) {
      definition.emit('DS.afterEject', definition, item);
    }

    return item;
  }
}
