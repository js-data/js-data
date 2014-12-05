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

      if (options.params) {
        options.params = DSUtils.copy(options.params);
      }

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
          resource.pendingQueries[id] = _this.getAdapter(options).find(definition, id, options)
            .then(function (data) {
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
    if (resource) {
      delete resource.pendingQueries[id];
    }
    throw err;
  });
}

module.exports = find;
