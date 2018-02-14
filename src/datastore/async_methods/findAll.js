/* jshint -W082 */
function processResults (data, resourceName, queryHash, options) {
  let _this = this
  let DSUtils = _this.utils
  let definition = _this.definitions[resourceName]
  let resource = _this.store[resourceName]
  let idAttribute = definition.idAttribute
  let date = new Date().getTime()

  data = data || []

  // Query is no longer pending
  delete resource.pendingQueries[queryHash]
  resource.completedQueries[queryHash] = date

  // Merge the new values into the cache
  let injected = definition.inject(data, options.orig())

  // Make sure each object is added to completedQueries
  if (DSUtils._a(injected)) {
    DSUtils.forEach(injected, function (item) {
      if (item) {
        let id = item[idAttribute]
        if (id) {
          resource.completedQueries[id] = date
          resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id])
        }
      }
    })
  } else {
    options.errorFn('response is expected to be an array!')
    resource.completedQueries[injected[idAttribute]] = date
  }

  return injected
}

/**
 * Using an adapter, retrieve a collection of items.
 *
 * @param resourceName The name of the type of resource of the items to retrieve.
 * @param params The criteria by which to filter items to retrieve. See http://www.js-data.io/docs/query-syntax
 * @param options Optional configuration.
 * @param options.bypassCache Whether to ignore any cached query for these items and force the retrieval through the adapter.
 * @param options.cacheResponse Whether to inject the found items into the data store.
 * @returns The items.
 */
module.exports = function findAll (resourceName, params, options) {
  let _this = this
  let DSUtils = _this.utils
  let definition = _this.definitions[resourceName]
  let resource = _this.store[resourceName]
  let queryHash, adapter

  return new DSUtils.Promise(function (resolve, reject) {
    params = params || {}

    if (!_this.definitions[resourceName]) {
      reject(new _this.errors.NER(resourceName))
    } else if (!DSUtils._o(params)) {
      reject(DSUtils._oErr('params'))
    } else {
      options = DSUtils._(definition, options)
      queryHash = DSUtils.toJson(params)
      options.logFn('findAll', params, options)

      if (options.params) {
        options.params = DSUtils.copy(options.params)
      }

      DSUtils.applyScope(definition, params, options)

      // force a new request
      if (options.bypassCache || !options.cacheResponse) {
        delete resource.completedQueries[queryHash]
        delete resource.queryData[queryHash]
      }

      let expired = options.maxAge && queryHash in resource.completedQueries &&
            resource.completedQueries[queryHash] + options.maxAge < new Date().getTime()

      if (queryHash in resource.completedQueries && !expired) {
        if (options.useFilter) {
          if (options.localKeys) {
            resolve(definition.getAll(options.localKeys, options.orig()))
          } else {
            // resolve immediately by filtering data from the data store
            resolve(definition.filter(params, options.orig()))
          }
        } else {
          // resolve immediately by returning the cached array from the previously made query
          resolve(resource.queryData[queryHash])
        }
      } else {
        resolve()
      }
    }
  }).then(function (items) {
    if (!items) {
      let query
      const usePendingFindAll = DSUtils.isFunction(options.usePendingFindAll) ? options.usePendingFindAll.call(this, resourceName, params, options) : options.usePendingFindAll
      if (!(queryHash in resource.pendingQueries) || !usePendingFindAll) {
        let promise
        let strategy = options.findAllStrategy || options.strategy

        // try subsequent adapters if the preceeding one fails
        if (strategy === 'fallback') {
          var makeFallbackCall = function (index) {
            adapter = definition.getAdapterName((options.findAllFallbackAdapters || options.fallbackAdapters)[index])
            return _this.adapters[adapter].findAll(definition, params, options)['catch'](function (err) {
              index++
              if (index < options.fallbackAdapters.length) {
                return makeFallbackCall(index)
              } else {
                return DSUtils.Promise.reject(err)
              }
            })
          }

          promise = makeFallbackCall(0)
        } else {
          adapter = definition.getAdapterName(options)
          // just make a single attempt
          promise = _this.adapters[adapter].findAll(definition, params, options)
        }

        query = promise
          .then(function (data) { return options.afterFindAll.call(data, options, data) })
          .then(function (data) {
            // Query is no longer pending
            delete resource.pendingQueries[queryHash]
            if (options.cacheResponse) {
              // inject the items into the data store
              resource.queryData[queryHash] = processResults.call(_this, data, resourceName, queryHash, options)
              resource.queryData[queryHash].$$injected = true
              return resource.queryData[queryHash]
            } else {
              DSUtils.forEach(data, function (item, i) {
                data[i] = definition.createInstance(item, options.orig())
              })
              return data
            }
          })

        if (usePendingFindAll) {
          resource.pendingQueries[queryHash] = query
        }
      } else {
        query = resource.pendingQueries[queryHash]
      }

      return query
    } else {
      // resolve immediately with the items
      return items
    }
  }).then(function (items) {
    return DSUtils.respond(items, {adapter}, options)
  })['catch'](function (err) {
    if (resource) {
      delete resource.pendingQueries[queryHash]
    }
    return _this.errorFn('findAll', resourceName, params, options)(err)
  })
}
