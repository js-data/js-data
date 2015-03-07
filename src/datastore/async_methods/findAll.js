/* jshint -W082 */
function processResults(data, resourceName, queryHash, options) {
  let _this = this;
  let DSUtils = _this.utils;
  let resource = _this.s[resourceName];
  let idAttribute = _this.defs[resourceName].idAttribute;
  let date = new Date().getTime();

  data = data || [];

  // Query is no longer pending
  delete resource.pendingQueries[queryHash];
  resource.completedQueries[queryHash] = date;

  // Update modified timestamp of collection
  resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);

  // Merge the new values into the cache
  let injected = _this.inject(resourceName, data, options.orig());

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

export default function findAll(resourceName, params, options) {
  let _this = this;
  let DSUtils = _this.utils;
  let definition = _this.defs[resourceName];
  let resource = _this.s[resourceName];
  let queryHash;

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

      if (options.bypassCache || !options.cacheResponse) {
        delete resource.completedQueries[queryHash];
        delete resource.queryData[queryHash];
      }
      if (queryHash in resource.completedQueries) {
        if (options.useFilter) {
          resolve(_this.filter(resourceName, params, options.orig()));
        } else {
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
          if (strategy === 'fallback') {
            function makeFallbackCall(index) {
              return _this.getAdapter((options.findAllFallbackAdapters || options.fallbackAdapters)[index]).findAll(definition, params, options)['catch'](err => {
                index++;
                if (index < options.fallbackAdapters.length) {
                  return makeFallbackCall(index);
                } else {
                  return Promise.reject(err);
                }
              });
            }

            promise = makeFallbackCall(0);
          } else {
            promise = _this.getAdapter(options).findAll(definition, params, options);
          }

          resource.pendingQueries[queryHash] = promise.then(data => {
            delete resource.pendingQueries[queryHash];
            if (options.cacheResponse) {
              resource.queryData[queryHash] = processResults.call(_this, data, resourceName, queryHash, options);
              resource.queryData[queryHash].$$injected = true;
              return resource.queryData[queryHash];
            } else {
              DSUtils.forEach(data, (item, i) => data[i] = _this.createInstance(resourceName, item, options.orig()));
              return data;
            }
          });
        }

        return resource.pendingQueries[queryHash];
      } else {
        return items;
      }
    })['catch'](err => {
    if (resource) {
      delete resource.pendingQueries[queryHash];
    }
    throw err;
  });
}
