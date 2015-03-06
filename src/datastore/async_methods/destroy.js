function destroy(resourceName, id, options) {
  var _this = this;
  var DSUtils = _this.utils;
  var definition = _this.defs[resourceName];
  var item;

  return new DSUtils.Promise(function (resolve, reject) {
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
    .then(function (attrs) {
      return options.beforeDestroy.call(attrs, options, attrs);
    })
    .then(function (attrs) {
      if (options.notify) {
        definition.emit('DS.beforeDestroy', definition, attrs);
      }
      if (options.eagerEject) {
        _this.eject(resourceName, id);
      }
      return _this.getAdapter(options).destroy(definition, id, options);
    })
    .then(function () {
      return options.afterDestroy.call(item, options, item);
    })
    .then(function (item) {
      if (options.notify) {
        definition.emit('DS.afterDestroy', definition, item);
      }
      _this.eject(resourceName, id);
      return id;
    })['catch'](function (err) {
    if (options && options.eagerEject && item) {
      _this.inject(resourceName, item, { notify: false });
    }
    throw err;
  });
}

module.exports = destroy;
