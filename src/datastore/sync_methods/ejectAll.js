var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function ejectAll(resourceName, params) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  params = params || {};

  if (!definition) {
    throw new DSErrors.NER(resourceName);
  } else if (!DSUtils.isObject(params)) {
    throw new DSErrors.IA('"params" must be an object!');
  }
  var resource = _this.store[resourceName];
  if (DSUtils.isEmpty(params)) {
    resource.completedQueries = {};
  }
  var queryHash = DSUtils.toJson(params);
  var items = _this.filter(definition.name, params);
  var ids = DSUtils.toLookup(items, definition.idAttribute);

  DSUtils.forOwn(ids, function (item, id) {
    _this.eject(definition.name, id);
  });

  delete resource.completedQueries[queryHash];
  resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);

  _this.notify(definition, 'eject', items);

  return items;
}

module.exports = ejectAll;
