var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function eject(resourceName, id, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var resource = _this.store[resourceName];
  var item;
  var found = false;

  id = DSUtils.resolveId(definition, id);

  if (!definition) {
    throw new DSErrors.NER(resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA('"id" must be a string or a number!');
  }

  options = DSUtils._(definition, options);

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
      _this.emit(options, 'beforeEject', DSUtils.copy(item));
    }
    _this.unlinkInverse(definition.name, id);
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
    delete resource.changeHistories[id];
    delete resource.modified[id];
    delete resource.saved[id];
    resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);

    if (options.notify) {
      definition.afterEject(options, item);
      _this.emit(options, 'afterEject', DSUtils.copy(item));
    }

    return item;
  }
}

module.exports = eject;
