var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function updateAll(resourceName, attrs, params, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  return new DSUtils.Promise(function (resolve, reject) {
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else {
      options = DSUtils._(definition, options);
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
        _this.emit(options, 'beforeUpdate', DSUtils.copy(attrs));
      }
      return _this.getAdapter(options).updateAll(definition, attrs, params, options);
    })
    .then(function (data) {
      return options.afterUpdate.call(data, options, data);
    })
    .then(function (data) {
      if (options.notify) {
        _this.emit(options, 'afterUpdate', DSUtils.copy(attrs));
      }
      if (options.cacheResponse) {
        return _this.inject(definition.name, data, options);
      } else {
        return data;
      }
    });
}

module.exports = updateAll;
