/**
 * Return the subset of items currently in the store that match the given criteria.
 *
 * The actual filtering is delegated to DS#defaults.defaultFilter, which can be overridden by developers.
 *
 * @param resourceName The name of the resource type of the items to filter.
 * @param params The criteria by which to filter items. See http://www.js-data.io/docs/query-syntax
 * @param options Optional configuration.
 * @returns Matching items.
 */
module.exports = function filter (resourceName, params, options) {
  let _this = this
  let DSUtils = _this.utils
  let definition = _this.definitions[resourceName]

  if (!definition) {
    throw new _this.errors.NER(resourceName)
  } else if (params && !DSUtils._o(params)) {
    throw DSUtils._oErr('params')
  }

  // Protect against null
  params = params || {}
  options = DSUtils._(definition, options)
  options.logFn('filter', params, options)

  // delegate filtering to DS#defaults.defaultFilter, which can be overridden by developers.
  return definition.defaultFilter.call(_this, _this.store[resourceName].collection, resourceName, params, options)
}
