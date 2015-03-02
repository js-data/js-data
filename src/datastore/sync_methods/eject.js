var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function eject(resourceName, id, options) {
  var _this = this;
  var definition = _this.defs[resourceName];
  var resource = _this.s[resourceName];
  var item;
  var found = false;

  id = DSUtils.resolveId(definition, id);

  if (!definition) {
    throw new DSErrors.NER(resourceName);
  } else if (!DSUtils._sn(id)) {
    throw DSUtils._snErr('id');
  }

  options = DSUtils._(definition, options);

  options.logFn('eject', id, options);

  for (var i = 0; i < resource.collection.length; i++) {
    if (resource.collection[i][definition.idAttribute] == id) {
      item = resource.collection[i];
      resource.expiresHeap.remove(item);
      found = true;
      break;
    }
  }
  if (found) {
    if (options.notify) {
      definition.beforeEject(options, item);
      definition.emit('DS.beforeEject', definition, item);
    }
    _this.unlinkInverse(definition.n, id);
    resource.collection.splice(i, 1);
    if (DSUtils.w) {
      resource.observers[id].close();
    }
    delete resource.observers[id];

    delete resource.index[id];
    delete resource.previousAttributes[id];
    delete resource.completedQueries[id];
    delete resource.pendingQueries[id];
    DSUtils.forEach(resource.changeHistories[id], function (changeRecord) {
      DSUtils.remove(resource.changeHistory, changeRecord);
    });
    var toRemove = [];
    DSUtils.forOwn(resource.queryData, function (items, queryHash) {
      if (items.$$injected) {
        DSUtils.remove(items, item);
      }
      if (!items.length) {
        toRemove.push(queryHash);
      }
    });
    DSUtils.forEach(toRemove, function (queryHash) {
      delete resource.completedQueries[queryHash];
      delete resource.queryData[queryHash];
    });
    delete resource.changeHistories[id];
    delete resource.modified[id];
    delete resource.saved[id];
    resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);

    if (options.notify) {
      definition.afterEject(options, item);
      definition.emit('DS.afterEject', definition, item);
    }

    return item;
  }
}

module.exports = eject;
