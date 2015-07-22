/**
 * Update a single item using the supplied properties hash.
 *
 * @param resourceName The name of the type of resource of the item to update.
 * @param id The primary key of the item to update.
 * @param attrs The attributes with which to update the item.
 * @param options Optional configuration.
 * @returns The item, now updated.
 */
module.exports = function update(resourceName, id, attrs, options) {
  let _this = this;
  let {utils: DSUtils, errors: DSErrors} = _this;
  let definition = _this.definitions[resourceName];
  let adapter;

  return new DSUtils.Promise((resolve, reject) => {
    id = DSUtils.resolveId(definition, id);
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils._sn(id)) {
      reject(DSUtils._snErr('id'));
    } else {
      options = DSUtils._(definition, options);
      options.logFn('update', id, attrs, options);
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
      return _this.adapters[adapter].update(definition, id, DSUtils.omit(attrs, options.omit), options);
    })
    .then(data =>options.afterUpdate.call(data, options, data))
    .then(attrs => {
      if (options.notify) {
        definition.emit('DS.afterUpdate', definition, attrs);
      }
      if (options.cacheResponse) {
        // inject the updated item into the store
        let injected = definition.inject(attrs, options.orig());
        let resource = _this.store[resourceName];
        let id = injected[definition.idAttribute];
        // mark the item as "saved"
        resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
        if (!definition.resetHistoryOnInject) {
          resource.previousAttributes[id] = DSUtils.copy(injected, null, null, null, definition.relationFields);
        }
        return injected;
      } else {
        // just return an instance
        return definition.createInstance(attrs, options.orig());
      }
    })
    .then(item => {
      return DSUtils.respond(item, {adapter}, options);
    });
};
