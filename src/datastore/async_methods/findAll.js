/* jshint -W082 */
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function processResults(data, resourceName, queryHash, options) {
  var _this = this;
  var resource = _this.store[resourceName];
  var idAttribute = _this.definitions[resourceName].idAttribute;
  var date = new Date().getTime();

  data = data || [];

  // Query is no longer pending
  delete resource.pendingQueries[queryHash];
  resource.completedQueries[queryHash] = date;

  // Update modified timestamp of collection
  resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);

  // Merge the new values into the cache
  var injected = _this.inject(resourceName, data, options);

  // Make sure each object is added to completedQueries
  if (DSUtils.isArray(injected)) {
    DSUtils.forEach(injected, function (item) {
      if (item && item[idAttribute]) {
        resource.completedQueries[item[idAttribute]] = date;
      }
    });
  } else {
    console.warn('response is expected to be an array!');
    resource.completedQueries[injected[idAttribute]] = date;
  }

  return injected;
}

function findAll(resourceName, params, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var resource = _this.store[resourceName];
  var queryHash;

  return new DSUtils.Promise(function (resolve, reject) {
    params = params || {};

    if (!_this.definitions[resourceName]) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isObject(params)) {
      reject(new DSErrors.IA('"params" must be an object!'));
    } else {
      options = DSUtils._(definition, options);
      queryHash = DSUtils.toJson(params);

      if (options.params) {
        options.params = DSUtils.copy(options.params);
      }

      if (options.bypassCache || !options.cacheResponse) {
        delete resource.completedQueries[queryHash];
        delete resource.queryData[queryHash];
      }
      if (queryHash in resource.completedQueries) {
        if (options.useFilter) {
          resolve(_this.filter(resourceName, params, options));
        } else {
          resolve(resource.queryData[queryHash]);
        }
      } else {
        resolve();
      }
    }
  }).then(function (items) {
      if (!(queryHash in resource.completedQueries)) {
        if (!(queryHash in resource.pendingQueries)) {
          var promise;
          var strategy = options.findAllStrategy || options.strategy;
          if (strategy === 'fallback') {
            function makeFallbackCall(index) {
              console.log('calling findAll', (options.findAllFallbackAdapters || options.fallbackAdapters)[index]);
              return _this.getAdapter((options.findAllFallbackAdapters || options.fallbackAdapters)[index]).findAll(definition, params, options)['catch'](function (err) {
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

          resource.pendingQueries[queryHash] = promise.then(function (data) {
            delete resource.pendingQueries[queryHash];
            if (options.cacheResponse) {
              resource.queryData[queryHash] = processResults.call(_this, data, resourceName, queryHash, options);
              resource.queryData[queryHash].$$injected = true;
              return resource.queryData[queryHash];
            } else {
              DSUtils.forEach(data, function (item, i) {
                data[i] = _this.createInstance(resourceName, item, options);
              });
              return data;
            }
          });
        }

        return resource.pendingQueries[queryHash];
      } else {
        return items;
      }
    })['catch'](function (err) {
    if (resource) {
      delete resource.pendingQueries[queryHash];
    }
    throw err;
  });
}

module.exports = findAll;
