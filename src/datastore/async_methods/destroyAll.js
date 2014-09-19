var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function destroyAll(resourceName, params, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  return new DSUtils.Promise(function (resolve, reject) {
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else {
      resolve();
    }
  }).then(function () {
      return _this.getAdapter(definition, options).destroyAll(definition, params, options);
    }).then(function () {
      return _this.ejectAll(resourceName, params);
    });
}

module.exports = destroyAll;
