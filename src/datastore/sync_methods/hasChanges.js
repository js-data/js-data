var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function diffIsEmpty(utils, diff) {
  return !(utils.isEmpty(diff.added) &&
    utils.isEmpty(diff.removed) &&
    utils.isEmpty(diff.changed));
}

function hasChanges(resourceName, id) {
  var _this = this;

  id = DSUtils.resolveId(_this.definitions[resourceName], id);
  if (!_this.definitions[resourceName]) {
    throw new DSErrors.NER(resourceName);
  }

  // return resource from cache
  if (_this.get(resourceName, id)) {
    return diffIsEmpty(DSUtils, _this.changes(resourceName, id));
  } else {
    return false;
  }
}

module.exports = hasChanges;
