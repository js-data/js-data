var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function destroyAll(resourceName, params, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var ejected, toEject;

  return new DSUtils.Promise(function (resolve, reject) {
    options = options || {};

    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isObject(options)) {
      reject(new DSErrors.IA('"options" must be an object!'));
    } else {
      if (!('notify' in options)) {
        options.notify = true;
      }
      if (!('eagerEject' in options)) {
        options.eagerEject = definition.eagerEject;
      }
      resolve();
    }
  }).then(function () {
      var func = options.beforeDestroy ? promisify(options.beforeDestroy) : definition.beforeDestroy;
      toEject = _this.defaults.defaultFilter.call(_this, resourceName, params);
      return func(resourceName, toEject);
    }).then(function () {
      if (options.notify) {
        _this.notify(definition, 'beforeDestroy', toEject);
      }
      if (options.eagerEject) {
        ejected = _this.ejectAll(resourceName, params);
      }
      return _this.getAdapter(definition, options).destroyAll(definition, params, options);
    }).then(function () {
      var func = options.afterDestroy ? promisify(options.afterDestroy) : definition.afterDestroy;
      return func(resourceName, toEject);
    }).then(function () {
      if (options.notify) {
        _this.notify(definition, 'afterDestroy', toEject);
      }
      return ejected || _this.ejectAll(resourceName, params);
    }).catch(function (err) {
      if (options.eagerEject && ejected) {
        _this.inject(resourceName, ejected, { notify: false });
      }
      throw err;
    });
}

module.exports = destroyAll;
