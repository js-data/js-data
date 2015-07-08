/* jshint -W082 */

/**
 * Using an adapter, retrieve a single item.
 *
 * @param resourceName The of the type of resource of the item to retrieve.
 * @param id The primary key of the item to retrieve.
 * @param options Optional configuration.
 * @param options.bypassCache Whether to ignore any cached item and force the retrieval through the adapter.
 * @param options.cacheResponse Whether to inject the found item into the data store.
 * @param options.strictCache Whether to only consider items to be "cached" if they were injected into the store as the result of `find` or `findAll`.
 * @param options.strategy The retrieval strategy to use.
 * @param options.findStrategy The retrieval strategy to use. Overrides "strategy".
 * @param options.fallbackAdapters Array of names of adapters to use if using "fallback" strategy.
 * @param options.findFallbackAdapters Array of names of adapters to use if using "fallback" strategy. Overrides "fallbackAdapters".
 * @returns The item.
 */
module.exports = function find(resourceName, id, options) {
  let _this = this;
  let DSUtils = _this.utils;
  let definition = _this.defs[resourceName];
  let resource = _this.s[resourceName];
  let adapter;

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
      if ((!options.findStrictCache || id in resource.completedQueries) && definition.get(id) && !options.bypassCache) {
        // resolve immediately with the cached item
        resolve(definition.get(id));
      } else {
        // we're going to delegate to the adapter next
        delete resource.completedQueries[id];
        resolve();
      }
    }
  }).then(item => {
      if (!item) {
        if (!(id in resource.pendingQueries)) {
          let promise;
          let strategy = options.findStrategy || options.strategy;

          // try subsequent adapters if the preceeding one fails
          if (strategy === 'fallback') {
            function makeFallbackCall(index) {
              adapter = definition.getAdapterName((options.findFallbackAdapters || options.fallbackAdapters)[index]);
              return _this.adapters[adapter].find(definition, id, options)['catch'](err => {
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
            promise = _this.adapters[adapter].find(definition, id, options);
          }

          resource.pendingQueries[id] = promise.then(data => {
            // Query is no longer pending
            delete resource.pendingQueries[id];
            if (options.cacheResponse) {
              // inject the item into the data store
              let injected = definition.inject(data, options.orig());
              // mark the item as "cached"
              resource.completedQueries[id] = new Date().getTime();
              resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
              return injected;
            } else {
              // just return an un-injected instance
              return definition.createInstance(data, options.orig());
            }
          });
        }
        return resource.pendingQueries[id];
      } else {
        // resolve immediately with the item
        return item;
      }
    }).then(item => {
      return DSUtils.respond(item, {adapter}, options);
    })['catch'](err => {
    if (resource) {
      delete resource.pendingQueries[id];
    }
    return DSUtils.Promise.reject(err);
  });
};
