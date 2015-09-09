/**
 * Eject a collection of items from the store, if any items currently in the store match the given criteria.
 *
 * @param resourceName The name of the resource type of the items eject.
 * @param params The criteria by which to match items to eject. See http://www.js-data.io/docs/query-syntax
 * @param options Optional configuration.
 * @returns The collection of items that were ejected, if any.
 */
module.exports = function ejectAll (resourceName, params, options) {
  let _this = this
  let DSUtils = _this.utils
  let definition = _this.definitions[resourceName]
  params = params || {}

  if (!definition) {
    throw new _this.errors.NER(resourceName)
  } else if (!DSUtils._o(params)) {
    throw DSUtils._oErr('params')
  }

  definition.logFn('ejectAll', params, options)

  let resource = _this.store[resourceName]
  let queryHash = DSUtils.toJson(params)

  // get items that match the criteria
  let items = definition.filter(params)

  if (DSUtils.isEmpty(params)) {
    // remove all completed queries if ejecting all items
    resource.completedQueries = {}
  } else {
    // remove matching completed query, if any
    delete resource.completedQueries[queryHash]
  }
  // prepare to remove matching items
  DSUtils.forEach(items, function (item) {
    if (item && item[definition.idAttribute]) {
      definition.eject(item[definition.idAttribute], options)
    }
  })
  // collection has been modified
  definition.handleChange(items)
  return items
}
