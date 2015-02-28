var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function ejectAll(resourceName, params, options) {
  var _this = this;
  var definition = _this.defs[resourceName];
  params = params || {};

  if (!definition) {
    throw new DSErrors.NER(resourceName);
  } else if (!DSUtils._o(params)) {
    throw DSUtils._oErr('params');
  }

  definition.logFn('ejectAll', params, options);

  var resource = _this.s[resourceName];
  if (DSUtils.isEmpty(params)) {
    resource.completedQueries = {};
  }
  var queryHash = DSUtils.toJson(params);
  var items = _this.filter(definition.n, params);
  var ids = [];
  DSUtils.forEach(items, function (item) {
    if (item && item[definition.idAttribute]) {
      ids.push(item[definition.idAttribute]);
    }
  });

  DSUtils.forEach(ids, function (id) {
    _this.eject(definition.n, id, options);
  });

  delete resource.completedQueries[queryHash];
  resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);

  return items;
}

module.exports = ejectAll;
