var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function changeHistory(resourceName, id) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var resource = _this.store[resourceName];

  id = DSUtils.resolveId(definition, id);
  if (resourceName && !_this.definitions[resourceName]) {
    throw new DSErrors.NER(resourceName);
  } else if (id && !DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA('"id" must be a string or a number!');
  }

  if (!definition.keepChangeHistory) {
    console.warn('changeHistory is disabled for this resource!');
  } else {
    if (resourceName) {
      var item = _this.get(resourceName, id);
      if (item) {
        return resource.changeHistories[id];
      }
    } else {
      return resource.changeHistory;
    }
  }
}

module.exports = changeHistory;
