var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function update(resourceName, id, attrs, options) {
  var _this = this;
  var definition = _this.defs[resourceName];

  return new DSUtils.Promise(function (resolve, reject) {
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
  }).then(function (attrs) {
      return options.beforeValidate.call(attrs, options, attrs);
    })
    .then(function (attrs) {
      return options.validate.call(attrs, options, attrs);
    })
    .then(function (attrs) {
      return options.afterValidate.call(attrs, options, attrs);
    })
    .then(function (attrs) {
      return options.beforeUpdate.call(attrs, options, attrs);
    })
    .then(function (attrs) {
      if (options.notify) {
        definition.emit('DS.beforeUpdate', definition, attrs);
      }
      return _this.getAdapter(options).update(definition, id, attrs, options);
    })
    .then(function (data) {
      return options.afterUpdate.call(data, options, data);
    })
    .then(function (attrs) {
      if (options.notify) {
        definition.emit('DS.afterUpdate', definition, attrs);
      }
      if (options.cacheResponse) {
        var injected = _this.inject(definition.n, attrs, options.orig());
        var resource = _this.s[resourceName];
        var id = injected[definition.idAttribute];
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

module.exports = update;
