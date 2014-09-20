var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function lastModified(resourceName, id) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var resource = _this.store[resourceName];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new DSErrors.NER(resourceName);
  }
  if (id) {
    if (!(id in resource.modified)) {
      resource.modified[id] = 0;
    }
    return resource.modified[id];
  }
  return resource.collectionModified;
}

module.exports = lastModified;
