/* jshint -W082 */
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function processResults(data, resourceName, queryHash, options) {
  var _this = this;
  var resource = _this.s[resourceName];
  var idAttribute = _this.defs[resourceName].idAttribute;
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
  if (DSUtils._a(injected)) {
    DSUtils.forEach(injected, function (item) {
      if (item) {
        var id = item[idAttribute];
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

function findAll(resourceName, params, options) {
  var _this = this;
  var definition = _this.defs[resourceName];
  var resource = _this.s[resourceName];
  var queryHash;

  return new DSUtils.Promise(function (resolve, reject) {
    params = params || {};

    if (!_this.defs[resourceName]) {
      reject(new DSErrors.NER(resourceName));
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
