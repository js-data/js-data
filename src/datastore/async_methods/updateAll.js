/**
 * Update a collection of items using the supplied properties hash.
 *
 * @param resourceName The name of the type of resource of the items to update.
 * @param attrs  The attributes with which to update the item.
 * @param params The criteria by which to select items to update. See http://www.js-data.io/docs/query-syntax
 * @param options Optional configuration.
 * @returns The updated items.
 */
module.exports = function updateAll(resourceName, attrs, params, options) {
  let _this = this;
  let {utils: DSUtils, errors: DSErrors} = _this;
  let definition = _this.definitions[resourceName];
  let adapter;

  return new DSUtils.Promise((resolve, reject) => {
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else {
      options = DSUtils._(definition, options);
      options.logFn('updateAll', attrs, params, options);
      resolve(attrs);
    }
  })
    // start lifecycle
    .then(attrs => options.beforeValidate.call(attrs, options, attrs))
    .then(attrs => options.validate.call(attrs, options, attrs))
    .then(attrs => options.afterValidate.call(attrs, options, attrs))
    .then(attrs => options.beforeUpdate.call(attrs, options, attrs))
    .then(attrs => {
      if (options.notify) {
        definition.emit('DS.beforeUpdate', definition, attrs);
      }
      adapter = definition.getAdapterName(options);
      return _this.adapters[adapter].updateAll(definition, DSUtils.omit(attrs, options.omit), params, options);
    })
    .then(data => options.afterUpdate.call(data, options, data))
    .then(data => {
      if (options.notify) {
        definition.emit('DS.afterUpdate', definition, attrs);
      }
      let origOptions = options.orig();
      if (options.cacheResponse) {
        // inject the updated items into the store
        let injected = definition.inject(data, origOptions);
        let resource = _this.store[resourceName];
        // mark the items as "saved"
        DSUtils.forEach(injected, i => {
          let id = i[definition.idAttribute];
          resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
          if (!definition.resetHistoryOnInject) {
            resource.previousAttributes[id] = DSUtils.copy(i, null, null, null, definition.relationFields);
          }
        });
        return injected;
      } else {
        // just return instances
        let instances = [];
        DSUtils.forEach(data, item => {
          instances.push(definition.createInstance(item, origOptions));
        });
        return instances;
      }
    })
    .then(items => {
      return DSUtils.respond(items, {adapter}, options);
    });
};
