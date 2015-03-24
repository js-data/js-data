export default function save(resourceName, id, options) {
  let _this = this;
  let {utils: DSUtils, errors: DSErrors} = _this;
  let definition = _this.defs[resourceName];
  let item;
  let noChanges;

  return new DSUtils.Promise((resolve, reject) => {
    id = DSUtils.resolveId(definition, id);
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils._sn(id)) {
      reject(DSUtils._snErr('id'));
    } else if (!_this.get(resourceName, id)) {
      reject(new DSErrors.R(`id "${id}" not found in cache!`));
    } else {
      item = _this.get(resourceName, id);
      options = DSUtils._(definition, options);
      options.logFn('save', id, options);
      resolve(item);
    }
  }).then(attrs => options.beforeValidate.call(attrs, options, attrs))
    .then(attrs => options.validate.call(attrs, options, attrs))
    .then(attrs => options.afterValidate.call(attrs, options, attrs))
    .then(attrs => options.beforeUpdate.call(attrs, options, attrs))
    .then(attrs => {
      if (options.notify) {
        definition.emit('DS.beforeUpdate', definition, attrs);
      }
      if (options.changesOnly) {
        let resource = _this.s[resourceName];
        if (DSUtils.w) {
          resource.observers[id].deliver();
        }
        let toKeep = [];
        let changes = _this.changes(resourceName, id);

        for (var key in changes.added) {
          toKeep.push(key);
        }
        for (key in changes.changed) {
          toKeep.push(key);
        }
        changes = DSUtils.pick(attrs, toKeep);
        if (DSUtils.isEmpty(changes)) {
          // no changes, return
          options.logFn('save - no changes', id, options);
          noChanges = true;
          return attrs;
        } else {
          attrs = changes;
        }
      }
      return _this.getAdapter(options).update(definition, id, attrs, options);
    })
    .then(data => options.afterUpdate.call(data, options, data))
    .then(attrs => {
      if (options.notify) {
        definition.emit('DS.afterUpdate', definition, attrs);
      }
      if (noChanges) {
        return attrs;
      } else if (options.cacheResponse) {
        let injected = _this.inject(definition.n, attrs, options.orig());
        let resource = _this.s[resourceName];
        let id = injected[definition.idAttribute];
        resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
        if (!definition.resetHistoryOnInject) {
          resource.previousAttributes[id] = DSUtils.copy(injected, null, null, null, definition.relationFields);
        }
        return injected;
      } else {
        return _this.createInstance(resourceName, attrs, options.orig());
      }
    });
}
