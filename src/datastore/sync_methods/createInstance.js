var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function createInstance(resourceName, attrs, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  attrs = attrs || {};
  options = options || {};

  if (!definition) {
    throw new DSErrors.NER(resourceName);
  } else if (attrs && !DSUtils.isObject(attrs)) {
    throw new DSErrors.IA('"attrs" must be an object!');
  } else if (!DSUtils.isObject(options)) {
    throw new DSErrors.IA('"options" must be an object!');
  }

  if (!('useClass' in options)) {
    options.useClass = definition.useClass;
  }

  var item;

  if (options.useClass) {
    var Constructor = definition[definition.class];
    item = new Constructor();
  } else {
    item = {};
  }
  return DSUtils.deepMixIn(item, attrs);
}

module.exports = createInstance;
