export default function ejectAll(resourceName, params, options) {
  let _this = this;
  let DSUtils = _this.utils;
  let definition = _this.defs[resourceName];
  params = params || {};

  if (!definition) {
    throw new _this.errors.NER(resourceName);
  } else if (!DSUtils._o(params)) {
    throw DSUtils._oErr('params');
  }

  definition.logFn('ejectAll', params, options);

  let resource = _this.s[resourceName];
  let queryHash = DSUtils.toJson(params);
  let items = _this.filter(definition.n, params);
  let ids = [];
  if (DSUtils.isEmpty(params)) {
    resource.completedQueries = {};
  } else {
    delete resource.completedQueries[queryHash];
  }
  DSUtils.forEach(items, item => {
    if (item && item[definition.idAttribute]) {
      ids.push(item[definition.idAttribute]);
    }
  });
  DSUtils.forEach(ids, id => {
    _this.eject(definition.n, id, options);
  });
  resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);
  return items;
}
