/**
 * Using an adapter, destroy an item.
 *
 * @param resourceName The name of the type of resource of the item to destroy.
 * @param params The criteria by which to filter items to destroy. See http://www.js-data.io/docs/query-syntax
 * @param options Optional configuration.
 * @param options.eagerEject Whether to eject the items from the store before the adapter operation completes, re-injecting if the adapter operation fails.
 * @param options.notify Whether to emit the "DS.beforeDestroy" and "DS.afterDestroy" events.
 * @param options.beforeDestroy Lifecycle hook.
 * @param options.afterDestroy Lifecycle hook.
 * @returns The ejected items, if any.
 */
export default function destroyAll(resourceName, params, options) {
  let _this = this;
  let DSUtils = _this.utils;
  let definition = _this.defs[resourceName];
  let ejected, toEject, adapter;

  params = params || {};

  return new DSUtils.Promise((resolve, reject) => {
    if (!definition) {
      reject(new _this.errors.NER(resourceName));
    } else if (!DSUtils._o(params)) {
      reject(DSUtils._oErr('attrs'));
    } else {
      options = DSUtils._(definition, options);
      options.logFn('destroyAll', params, options);
      resolve();
    }
  }).then(() => {
      // find items that are to be ejected from the store
      toEject = definition.defaultFilter.call(_this, resourceName, params);
      return options.beforeDestroy(options, toEject);
    }).then(() => {
      if (options.notify) {
        definition.emit('DS.beforeDestroy', definition, toEject);
      }
      // don't wait for the adapter, remove the items from the store
      if (options.eagerEject) {
        ejected = definition.ejectAll(params);
      }
      adapter = definition.getAdapterName(options);
      return _this.adapters[adapter].destroyAll(definition, params, options);
    }).then(() => {
      return options.afterDestroy(options, toEject);
    }).then(() => {
      if (options.notify) {
        definition.emit('DS.afterDestroy', definition, toEject);
      }
      // make sure items are removed from the store
      return ejected || definition.ejectAll(params);
    }).then(items => {
      return DSUtils.respond(items, {adapter}, options);
    })['catch'](err => {
    // rollback by re-injecting the items into the store
    if (options && options.eagerEject && ejected) {
      definition.inject(ejected, {notify: false});
    }
    return DSUtils.Promise.reject(err);
  });
}
