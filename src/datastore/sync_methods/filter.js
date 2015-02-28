var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function filter(resourceName, params, options) {
  var _this = this;
  var definition = _this.defs[resourceName];
  var resource = _this.s[resourceName];

  if (!definition) {
    throw new DSErrors.NER(resourceName);
  } else if (params && !DSUtils._o(params)) {
    throw DSUtils._oErr('params');
  }

  options = DSUtils._(definition, options);

  options.logFn('filter', params, options);

  // Protect against null
  params = params || {};

  var queryHash = DSUtils.toJson(params);

  if (!(queryHash in resource.completedQueries) && options.loadFromServer) {
    // This particular query has never been completed

    if (!resource.pendingQueries[queryHash]) {
      // This particular query has never even been started
      _this.findAll(resourceName, params, options);
    }
  }

  return definition.defaultFilter.call(_this, resource.collection, resourceName, params, options);
}

module.exports = filter;
