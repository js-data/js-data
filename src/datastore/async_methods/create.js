/**
 * Using an adapter, create a new item.
 *
 * Generally a primary key will NOT be provided in the properties hash,
 * because the adapter's persistence layer should be generating one.
 *
 * @param resourceName The name of the type of resource of the new item.
 * @param attrs Hash of properties with which to create the new item.
 * @param options Optional configuration.
 * @param options.cacheResponse Whether the newly created item as returned by the adapter should be injected into the data store.
 * @param options.upsert If the properties hash contains a primary key, attempt to call DS#update instead.
 * @param options.notify Whether to emit the "DS.beforeCreate" and "DS.afterCreate" events.
 * @param options.beforeValidate Lifecycle hook.
 * @param options.validate Lifecycle hook.
 * @param options.afterValidate Lifecycle hook.
 * @param options.beforeCreate Lifecycle hook.
 * @param options.afterCreate Lifecycle hook.
 */
module.exports = function create(resourceName, attrs, options) {
  let _this = this;
  let DSUtils = _this.utils;
  let definition = _this.defs[resourceName];
  let adapter;

  options = options || {};
  attrs = attrs || {};

  let rejectionError;
  if (!definition) {
    rejectionError = new _this.errors.NER(resourceName);
  } else if (!DSUtils._o(attrs)) {
    rejectionError = DSUtils._oErr('attrs');
  } else {
    options = DSUtils._(definition, options);
    if (options.upsert && DSUtils._sn(attrs[definition.idAttribute])) {
      return _this.update(resourceName, attrs[definition.idAttribute], attrs, options);
    }
    options.logFn('create', attrs, options);
  }

  return new DSUtils.Promise((resolve, reject) => {
    if (rejectionError) {
      reject(rejectionError);
    } else {
      resolve(attrs);
    }

  })
    // start lifecycle
    .then(attrs => options.beforeValidate.call(attrs, options, attrs))
    .then(attrs => options.validate.call(attrs, options, attrs))
    .then(attrs => options.afterValidate.call(attrs, options, attrs))
    .then(attrs => options.beforeCreate.call(attrs, options, attrs))
    .then(attrs => {
      if (options.notify) {
        definition.emit('DS.beforeCreate', definition, attrs);
      }
      adapter = _this.getAdapterName(options);
      return _this.adapters[adapter].create(definition, DSUtils.omit(attrs, options.omit), options);
    })
    .then(attrs => options.afterCreate.call(attrs, options, attrs))
    .then(attrs => {
      if (options.notify) {
        definition.emit('DS.afterCreate', definition, attrs);
      }
      if (options.cacheResponse) {
        // injected created intem into the store
        let created = _this.inject(definition.name, attrs, options.orig());
        let id = created[definition.idAttribute];
        // mark item's `find` query as completed, so a subsequent `find` call for this item will resolve immediately
        let resource = _this.s[resourceName];
        resource.completedQueries[id] = new Date().getTime();
        resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
        return created;
      } else {
        // just return an un-injected instance
        return _this.createInstance(resourceName, attrs, options);
      }
    })
    .then(item => {
      return DSUtils.respond(item, {adapter}, options);
    });
};
