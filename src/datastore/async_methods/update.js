export default function update(resourceName, id, attrs, options) {
  let _this = this;
  let {utils: DSUtils, errors: DSErrors} = _this;
  let definition = _this.defs[resourceName];

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
  }).then(attrs => options.beforeValidate.call(attrs, options, attrs))
    .then(attrs => options.validate.call(attrs, options, attrs))
    .then(attrs => options.afterValidate.call(attrs, options, attrs))
    .then(attrs => options.beforeUpdate.call(attrs, options, attrs))
    .then(attrs => {
      if (options.notify) {
        definition.emit('DS.beforeUpdate', definition, attrs);
      }
      return _this.getAdapter(options).update(definition, id, attrs, options);
    })
    .then(data =>options.afterUpdate.call(data, options, data))
    .then(attrs => {
      if (options.notify) {
        definition.emit('DS.afterUpdate', definition, attrs);
      }
      if (options.cacheResponse) {
        let injected = _this.inject(definition.n, attrs, options.orig());
        let resource = _this.s[resourceName];
        let id = injected[definition.idAttribute];
        resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
        if (!definition.resetHistoryOnInject) {
          resource.previousAttributes[id] = DSUtils.copy(injected);
        }
        return injected;
      } else {
        return _this.createInstance(resourceName, attrs, options.orig());
      }
    });
}
