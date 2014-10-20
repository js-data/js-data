var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function update(resourceName, id, attrs, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  return new DSUtils.Promise(function (resolve, reject) {
    id = DSUtils.resolveId(definition, id);
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
      reject(new DSErrors.IA('"id" must be a string or a number!'));
    } else {
      options = DSUtils._(definition, options);
      resolve(attrs);
    }
  }).then(function (attrs) {
      return options.beforeValidate.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      return options.validate.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      return options.afterValidate.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      return options.beforeUpdate.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      if (options.notify) {
        _this.emit(definition, 'beforeUpdate', DSUtils.merge({}, attrs));
      }
      return _this.getAdapter(definition, options).update(definition, id, attrs, options);
    })
    .then(function (data) {
      return options.afterUpdate.call(data, resourceName, data);
    })
    .then(function (attrs) {
      if (options.notify) {
        _this.emit(definition, 'afterUpdate', DSUtils.merge({}, attrs));
      }
      if (options.cacheResponse) {
        return _this.inject(definition.name, attrs, options);
      } else {
        return attrs;
      }
    });
}

module.exports = update;
