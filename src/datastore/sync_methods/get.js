var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function get(resourceName, id, options) {
  var _this = this;

  options = options || {};

  if (!_this.definitions[resourceName]) {
    throw new DSErrors.NER(resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA('"id" must be a string or a number!');
  } else if (!DSUtils.isObject(options)) {
    throw new DSErrors.IA('"options" must be an object!');
  }
  // cache miss, request resource from server
  var item = _this.store[resourceName].index[id];
  if (!item && options.loadFromServer) {
    _this.find(resourceName, id, options);
  }

  // return resource from cache
  return item;
}

module.exports = get;
