var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function destroyAll(resourceName, params, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var ejected, toEject;

  params = params || {};

  return new DSUtils.Promise(function (resolve, reject) {
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isObject(params)) {
      reject(new DSErrors.IA('"params" must be an object!'));
    } else {
      options = DSUtils._(definition, options);
      resolve();
    }
  }).then(function () {
      toEject = _this.defaults.defaultFilter.call(_this, resourceName, params);
      return options.beforeDestroy(options, toEject);
    }).then(function () {
      if (options.notify) {
        _this.emit(options, 'beforeDestroy', DSUtils.copy(toEject));
      }
      if (options.eagerEject) {
        ejected = _this.ejectAll(resourceName, params);
      }
      return _this.getAdapter(options).destroyAll(definition, params, options);
    }).then(function () {
      return options.afterDestroy(options, toEject);
    }).then(function () {
      if (options.notify) {
        _this.emit(options, 'afterDestroy', DSUtils.copy(toEject));
      }
      return ejected || _this.ejectAll(resourceName, params);
    })['catch'](function (err) {
      if (options && options.eagerEject && ejected) {
        _this.inject(resourceName, ejected, { notify: false });
      }
      throw err;
    });
}

module.exports = destroyAll;
