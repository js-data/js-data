export default function destroy(resourceName, id, options) {
  let _this = this;
  let DSUtils = _this.utils;
  let definition = _this.defs[resourceName];
  let item;

  return new DSUtils.Promise((resolve, reject) => {
    id = DSUtils.resolveId(definition, id);
    if (!definition) {
      reject(new _this.errors.NER(resourceName));
    } else if (!DSUtils._sn(id)) {
      reject(DSUtils._snErr('id'));
    } else {
      item = _this.get(resourceName, id) || { id: id };
      options = DSUtils._(definition, options);
      options.logFn('destroy', id, options);
      resolve(item);
    }
  })
    .then(attrs => options.beforeDestroy.call(attrs, options, attrs))
    .then(attrs => {
      if (options.notify) {
        definition.emit('DS.beforeDestroy', definition, attrs);
      }
      if (options.eagerEject) {
        _this.eject(resourceName, id);
      }
      return _this.getAdapter(options).destroy(definition, id, options);
    })
    .then(() => options.afterDestroy.call(item, options, item))
    .then(item => {
      if (options.notify) {
        definition.emit('DS.afterDestroy', definition, item);
      }
      _this.eject(resourceName, id);
      return id;
    })['catch'](err => {
    if (options && options.eagerEject && item) {
      _this.inject(resourceName, item, { notify: false });
    }
    throw err;
  });
}
