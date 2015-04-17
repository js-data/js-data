export default function filter(resourceName, params, options) {
  let _this = this;
  let DSUtils = _this.utils;
  let definition = _this.defs[resourceName];

  if (!definition) {
    throw new _this.errors.NER(resourceName);
  } else if (params && !DSUtils._o(params)) {
    throw DSUtils._oErr('params');
  }

  // Protect against null
  params = params || {};
  options = DSUtils._(definition, options);
  options.logFn('filter', params, options);
  return definition.defaultFilter.call(_this, _this.s[resourceName].collection, resourceName, params, options);
}
