/* jshint -W082 */
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function create(resourceName, attrs, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  options = options || {};
  attrs = attrs || {};

  var promise = new DSUtils.Promise(function (resolve, reject) {
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isObject(attrs)) {
      reject(new DSErrors.IA('"attrs" must be an object!'));
    } else {
      options = DSUtils._(definition, options);
      resolve(attrs);
    }
  });

  if (definition && options.upsert && attrs[definition.idAttribute]) {
    return _this.update(resourceName, attrs[definition.idAttribute], attrs, options);
  } else {
    return promise
      .then(function (attrs) {
        return options.beforeValidate.call(attrs, options, attrs);
      })
      .then(function (attrs) {
        return options.validate.call(attrs, options, attrs);
      })
      .then(function (attrs) {
        return options.afterValidate.call(attrs, options, attrs);
      })
      .then(function (attrs) {
        return options.beforeCreate.call(attrs, options, attrs);
      })
      .then(function (attrs) {
        if (options.notify) {
          _this.emit(options, 'beforeCreate', DSUtils.merge({}, attrs));
        }
        if (options.strategy === 'single') {
          return _this.getAdapter(options).create(definition, attrs, options);
        } else if (options.strategy === 'fallback') {
          function makeFallbackCall(index) {
            return _this.getAdapter(options.fallbackAdapters[index]).create(definition, attrs, options)['catch'](function (err) {
              index++;
              if (index < options.fallbackAdapters.length) {
                return makeFallbackCall(index);
              } else {
                return Promise.reject(err);
              }
            });
          }

          return makeFallbackCall(0);
        } else if (options.strategy === 'parallel') {
          var tasks = [];
          DSUtils.forEach(options.parallelAdapters, function (adapter) {
            tasks.push(_this.getAdapter(adapter).create(definition, attrs, options));
          });
          return DSUtils.Promise.all(tasks).then(function (results) {
            DSUtils.forEach(results, function (r, i) {
              if (DSUtils.isObject(r) && i) {
                DSUtils.deepMixIn(results[0], r);
              }
            });
            return results[0];
          });
        } else if (options.strategy === 'series') {
          function makeSeriesCall(index, a) {
            return _this.getAdapter(options.seriesAdapters[index]).create(definition, a, options).then(function (data) {
              index++;
              if (index < options.seriesAdapters.length) {
                return makeSeriesCall(index, data);
              } else {
                return data;
              }
            });
          }

          return makeSeriesCall(0, attrs);
        }
      })
      .then(function (attrs) {
        return options.afterCreate.call(attrs, options, attrs);
      })
      .then(function (attrs) {
        if (options.notify) {
          _this.emit(options, 'afterCreate', DSUtils.merge({}, attrs));
        }
        if (options.cacheResponse) {
          var created = _this.inject(definition.name, attrs, options);
          var id = created[definition.idAttribute];
          _this.store[resourceName].completedQueries[id] = new Date().getTime();
          return created;
        } else {
          return _this.createInstance(resourceName, attrs, options);
        }
      });
  }
}

module.exports = create;
