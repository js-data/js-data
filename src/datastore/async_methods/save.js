/**
 * Save a single item in its present state.
 *
 * @param resourceName The name of the type of resource of the item.
 * @param id The primary key of the item.
 * @param options Optional congifuration.
 * @returns The item, now saved.
 */
export default function save(resourceName, id, options) {
  let _this = this;
  let {utils: DSUtils, errors: DSErrors} = _this;
  let definition = _this.defs[resourceName];
  let resource = _this.s[resourceName];
  let item, noChanges, adapter;

  return new DSUtils.Promise((resolve, reject) => {
    id = DSUtils.resolveId(definition, id);
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils._sn(id)) {
      reject(DSUtils._snErr('id'));
    } else if (!definition.get(id)) {
      reject(new DSErrors.R(`id "${id}" not found in cache!`));
    } else {
      item = definition.get(id);
      options = DSUtils._(definition, options);
      options.logFn('save', id, options);
      resolve(item);
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
      // only send changed properties to the adapter
      if (options.changesOnly) {

        if (DSUtils.w) {
          resource.observers[id].deliver();
        }
        let toKeep = [];
        let changes = definition.changes(id);

        for (var key in changes.added) {
          toKeep.push(key);
        }
        for (key in changes.changed) {
          toKeep.push(key);
        }
        changes = DSUtils.pick(attrs, toKeep);
        // no changes? no save
        if (DSUtils.isEmpty(changes)) {
          // no changes, return
          options.logFn('save - no changes', id, options);
          noChanges = true;
          return attrs;
        } else {
          attrs = changes;
        }
      }
      adapter = definition.getAdapterName(options);
      return _this.adapters[adapter].update(definition, id, DSUtils.omit(attrs, options.omit), options);
    })
    .then(data => options.afterUpdate.call(data, options, data))
    .then(attrs => {
      if (options.notify) {
        definition.emit('DS.afterUpdate', definition, attrs);
      }
      if (noChanges) {
        // no changes, just return
        return attrs;
      } else if (options.cacheResponse) {
        // inject the reponse into the store, updating the item
        let injected = definition.inject(attrs, options.orig());
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
}
