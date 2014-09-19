var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function eject(resourceName, id) {
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

  for (var i = 0; i < resource.collection.length; i++) {
    if (resource.collection[i][definition.idAttribute] == id) {
      item = resource.collection[i];
      found = true;
      break;
    }
  }
  if (found) {
    _this.unlinkInverse(definition.name, id);
    resource.collection.splice(i, 1);
    resource.observers[id].close();
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

    _this.notify(definition, 'eject', item);

    return item;
  }
}

module.exports = eject;
