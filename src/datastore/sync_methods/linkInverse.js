var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function linkInverse(resourceName, id, relations) {
  var _this = this;
  var definition = _this.defs[resourceName];

  relations = relations || [];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new DSErrors.NER(resourceName);
  } else if (!DSUtils._sn(id)) {
    throw DSUtils._snErr('id');
  } else if (!DSUtils._a(relations)) {
    throw DSUtils._aErr('relations');
  }

  definition.logFn('linkInverse', id, relations);

  var linked = _this.get(resourceName, id);

  if (linked) {
    DSUtils.forOwn(_this.defs, function (d) {
      DSUtils.forOwn(d.relations, function (relatedModels) {
        DSUtils.forOwn(relatedModels, function (defs, relationName) {
          if (relations.length && !DSUtils.contains(relations, d.n)) {
            return;
          }
          if (definition.n === relationName) {
            _this.linkAll(d.n, {}, [definition.n]);
          }
        });
      });
    });
  }

  return linked;
}

module.exports = linkInverse;
