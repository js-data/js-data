/* jshint -W082 */
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function find(resourceName, id, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var resource = _this.store[resourceName];

  return new DSUtils.Promise(function (resolve, reject) {
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
      reject(new DSErrors.IA('"id" must be a string or a number!'));
    } else {
      options = DSUtils._(definition, options);
      if (options.bypassCache || !options.cacheResponse) {
        delete resource.completedQueries[id];
      }
      if (id in resource.completedQueries) {
        resolve(_this.get(resourceName, id));
      } else {
        resolve();
      }
    }
  }).then(function (item) {
      if (!(id in resource.completedQueries)) {
        if (!(id in resource.pendingQueries)) {
          var promise;
          if (options.strategy === 'single') {
            promise = _this.getAdapter(options).find(definition, id, options);
          } else if (options.strategy === 'fallback') {
            function makeFallbackCall(index) {
              return _this.getAdapter(options.fallbackAdapters[index]).find(definition, id, options)['catch'](function (err) {
                index++;
                if (index < options.fallbackAdapters.length) {
                  return makeFallbackCall(index);
                } else {
                  return Promise.reject(err);
                }
              });
            }

            promise = makeFallbackCall(0);
          } else if (options.strategy === 'parallel') {
            var tasks = [];
            DSUtils.forEach(options.parallelAdapters, function (adapter) {
              tasks.push(_this.getAdapter(adapter).find(definition, id, options));
            });
            promise = DSUtils.Promise.all(tasks).then(function (results) {
              DSUtils.forEach(results, function (r, i) {
                if (DSUtils.isObject(r) && i) {
                  DSUtils.deepMixIn(results[0], r);
                }
              });
              return results[0];
            });
          } else if (options.strategy === 'series') {
            function makeSeriesCall(index, d) {
              return _this.getAdapter(options.seriesAdapters[index]).find(definition, id, options).then(function (data) {
                DSUtils.deepMixIn(data, d);
                index++;
                if (index < options.seriesAdapters.length) {
                  return makeSeriesCall(index, data);
                } else {
                  return data;
                }
              });
            }

            promise = makeSeriesCall(0, {});
          }

          resource.pendingQueries[id] = promise.then(function (data) {
            // Query is no longer pending
            delete resource.pendingQueries[id];
            if (options.cacheResponse) {
              resource.completedQueries[id] = new Date().getTime();
              return _this.inject(resourceName, data, options);
            } else {
              return _this.createInstance(resourceName, data, options);
            }
          });
        }
        return resource.pendingQueries[id];
      } else {
        return item;
      }
    })['catch'](function (err) {
    delete resource.pendingQueries[id];
    throw err;
  });
}

module.exports = find;
