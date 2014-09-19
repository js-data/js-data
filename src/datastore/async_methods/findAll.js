var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function processResults(data, resourceName, queryHash, options) {
  var DS = this;
  var resource = DS.store[resourceName];
  var idAttribute = DS.definitions[resourceName].idAttribute;
  var date = new Date().getTime();

  data = data || [];

  // Query is no longer pending
  delete resource.pendingQueries[queryHash];
  resource.completedQueries[queryHash] = date;

  // Update modified timestamp of collection
  resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);

  // Merge the new values into the cache
  var injected = DS.inject(resourceName, data, options);

  // Make sure each object is added to completedQueries
  if (DSUtils.isArray(injected)) {
    DSUtils.forEach(injected, function (item) {
      if (item && item[idAttribute]) {
        resource.completedQueries[item[idAttribute]] = date;
      }
    });
  } else {
    console.warn(errorPrefix(resourceName) + 'response is expected to be an array!');
    resource.completedQueries[injected[idAttribute]] = date;
  }

  return injected;
}

function findAll(resourceName, params, options) {
  var DS = this;
  var definition = DS.definitions[resourceName];
  var resource = DS.store[resourceName];
  var queryHash;

  return new DSUtils.Promise(function (resolve, reject) {
    options = options || {};
    params = params || {};

    if (!DS.definitions[resourceName]) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isObject(params)) {
      reject(new DSErrors.IA('"params" must be an object!'));
    } else if (!DSUtils.isObject(options)) {
      reject(new DSErrors.IA('"options" must be an object!'));
    } else {
      if (!('cacheResponse' in options)) {
        options.cacheResponse = true;
      }

      queryHash = DSUtils.toJson(params);

      if (options.bypassCache || !options.cacheResponse) {
        delete resource.completedQueries[queryHash];
      }
      if (queryHash in resource.completedQueries) {
        resolve(DS.filter(resourceName, params, options));
      } else {
        resolve();
      }
    }
  }).then(function (items) {
      if (!(queryHash in resource.completedQueries)) {
        if (!(queryHash in resource.pendingQueries)) {
          resource.pendingQueries[queryHash] = DS.adapters[options.adapter || definition.defaultAdapter].findAll(definition, params, options)
            .then(function (res) {
              delete resource.pendingQueries[queryHash];
              var data = options.deserialize ? options.deserialize(resourceName, res) : definition.deserialize(resourceName, res);
              if (options.cacheResponse) {
                return processResults.call(DS, data, resourceName, queryHash, options);
              } else {
                DSUtils.forEach(data, function (item, i) {
                  data[i] = DS.createInstance(resourceName, item, options);
                });
                return data;
              }
            });
        }

        return resource.pendingQueries[queryHash];
      } else {
        return items;
      }
    }).catch(function (err) {
      delete resource.pendingQueries[queryHash];
      throw err;
    });
}

module.exports = findAll;
