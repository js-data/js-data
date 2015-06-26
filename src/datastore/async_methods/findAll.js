/* jshint -W082 */
function processResults(data, resourceName, queryHash, options) {
  let _this = this;
  let DSUtils = _this.utils;
  let definition = _this.defs[resourceName];
  let resource = _this.s[resourceName];
  let idAttribute = _this.defs[resourceName].idAttribute;
  let date = new Date().getTime();

  data = data || [];

  // Query is no longer pending
  delete resource.pendingQueries[queryHash];
  resource.completedQueries[queryHash] = date;

  // Merge the new values into the cache
  let injected = definition.inject(data, options.orig());

  // Make sure each object is added to completedQueries
  if (DSUtils._a(injected)) {
    DSUtils.forEach(injected, item => {
      if (item) {
        let id = item[idAttribute];
        if (id) {
          resource.completedQueries[id] = date;
          resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
        }
      }
    });
  } else {
    options.errorFn('response is expected to be an array!');
    resource.completedQueries[injected[idAttribute]] = date;
  }

  return injected;
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
export default function findAll(resourceName, params, options) {
  let _this = this;
  let DSUtils = _this.utils;
  let definition = _this.defs[resourceName];
  let resource = _this.s[resourceName];
  let queryHash, adapter;

  return new DSUtils.Promise((resolve, reject) => {
    params = params || {};

    if (!_this.defs[resourceName]) {
      reject(new _this.errors.NER(resourceName));
    } else if (!DSUtils._o(params)) {
      reject(DSUtils._oErr('params'));
    } else {
      options = DSUtils._(definition, options);
      queryHash = DSUtils.toJson(params);
      options.logFn('findAll', params, options);

      if (options.params) {
        options.params = DSUtils.copy(options.params);
      }

      // force a new request
      if (options.bypassCache || !options.cacheResponse) {
        delete resource.completedQueries[queryHash];
        delete resource.queryData[queryHash];
      }
      if (queryHash in resource.completedQueries) {
        if (options.useFilter) {
          // resolve immediately by filtering data from the data store
          resolve(definition.filter(params, options.orig()));
        } else {
          // resolve immediately by returning the cached array from the previously made query
          resolve(resource.queryData[queryHash]);
        }
      } else {
        resolve();
      }
    }
  }).then(items => {
      if (!(queryHash in resource.completedQueries)) {
        if (!(queryHash in resource.pendingQueries)) {
          let promise;
          let strategy = options.findAllStrategy || options.strategy;

          // try subsequent adapters if the preceeding one fails
          if (strategy === 'fallback') {
            function makeFallbackCall(index) {
              adapter = definition.getAdapterName((options.findAllFallbackAdapters || options.fallbackAdapters)[index]);
              return _this.adapters[adapter].findAll(definition, params, options)['catch'](err => {
                index++;
                if (index < options.fallbackAdapters.length) {
                  return makeFallbackCall(index);
                } else {
                  return DSUtils.Promise.reject(err);
                }
              });
            }

            promise = makeFallbackCall(0);
          } else {
            adapter = definition.getAdapterName(options);
            // just make a single attempt
            promise = _this.adapters[adapter].findAll(definition, params, options);
          }

          resource.pendingQueries[queryHash] = promise.then(data => {
            // Query is no longer pending
            delete resource.pendingQueries[queryHash];
            if (options.cacheResponse) {
              // inject the items into the data store
              resource.queryData[queryHash] = processResults.call(_this, data, resourceName, queryHash, options);
              resource.queryData[queryHash].$$injected = true;
              return resource.queryData[queryHash];
            } else {
              DSUtils.forEach(data, (item, i) => {
                data[i] = definition.createInstance(item, options.orig());
              });
              return data;
            }
          });
        }

        return resource.pendingQueries[queryHash];
      } else {
        // resolve immediately with the items
        return items;
      }
    }).then(items => {
      return DSUtils.respond(items, {adapter}, options);
    })['catch'](err => {
    if (resource) {
      delete resource.pendingQueries[queryHash];
    }
    return DSUtils.Promise.reject(err);
  });
}
