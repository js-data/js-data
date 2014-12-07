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
      }
      if (queryHash in resource.completedQueries) {
        resolve(_this.filter(resourceName, params, options));
      } else {
        resolve();
      }
    }
  }).then(function (items) {
      if (!(queryHash in resource.completedQueries)) {
        if (!(queryHash in resource.pendingQueries)) {
          resource.pendingQueries[queryHash] = _this.getAdapter(options).findAll(definition, params, options)
            .then(function (data) {
              delete resource.pendingQueries[queryHash];
              if (options.cacheResponse) {
                return processResults.call(_this, data, resourceName, queryHash, options);
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
