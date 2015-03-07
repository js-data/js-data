export default function filter(resourceName, params, options) {
  let _this = this;
  let DSUtils = _this.utils;
  let definition = _this.defs[resourceName];
  let resource = _this.s[resourceName];

  if (!definition) {
    throw new _this.errors.NER(resourceName);
  } else if (params && !DSUtils._o(params)) {
    throw DSUtils._oErr('params');
  }

  // Protect against null
  params = params || {};

  options = DSUtils._(definition, options);

  options.logFn('filter', params, options);

  let queryHash = DSUtils.toJson(params);

  if (!(queryHash in resource.completedQueries) && options.loadFromServer) {
    // This particular query has never been completed

    if (!resource.pendingQueries[queryHash]) {
      // This particular query has never even been started
      _this.findAll(resourceName, params, options);
    }
  }

  return definition.defaultFilter.call(_this, resource.collection, resourceName, params, options);
}
