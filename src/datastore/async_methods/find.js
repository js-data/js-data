/* jshint -W082 */
export default function find(resourceName, id, options) {
  let _this = this;
  let DSUtils = _this.utils;
  let definition = _this.defs[resourceName];
  let resource = _this.s[resourceName];

  return new DSUtils.Promise((resolve, reject) => {
    if (!definition) {
      reject(new _this.errors.NER(resourceName));
    } else if (!DSUtils._sn(id)) {
      reject(DSUtils._snErr('id'));
    } else {
      options = DSUtils._(definition, options);
      options.logFn('find', id, options);

      if (options.params) {
        options.params = DSUtils.copy(options.params);
      }

      if (options.bypassCache || !options.cacheResponse) {
        delete resource.completedQueries[id];
      }
      if ((!options.findStrictCache || id in resource.completedQueries) && _this.get(resourceName, id) && !options.bypassCache) {
        resolve(_this.get(resourceName, id));
      } else {
        delete resource.completedQueries[id];
        resolve();
      }
    }
  }).then(item => {
      if (!item) {
        if (!(id in resource.pendingQueries)) {
          let promise;
          let strategy = options.findStrategy || options.strategy;
          if (strategy === 'fallback') {
            function makeFallbackCall(index) {
              return _this.getAdapter((options.findFallbackAdapters || options.fallbackAdapters)[index]).find(definition, id, options)['catch'](err => {
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
            promise = _this.getAdapter(options).find(definition, id, options);
          }

          resource.pendingQueries[id] = promise.then(data => {
            // Query is no longer pending
            delete resource.pendingQueries[id];
            if (options.cacheResponse) {
              let injected = _this.inject(resourceName, data, options.orig());
              resource.completedQueries[id] = new Date().getTime();
              resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
              return injected;
            } else {
              return _this.createInstance(resourceName, data, options.orig());
            }
          });
        }
        return resource.pendingQueries[id];
      } else {
        return item;
      }
    })['catch'](err => {
    if (resource) {
      delete resource.pendingQueries[id];
    }
    return DSUtils.Promise.reject(err);
  });
}
