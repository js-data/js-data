var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function unlinkInverse(resourceName, id, relations) {
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

  definition.logFn('unlinkInverse', id, relations);

  var linked = _this.get(resourceName, id);

  if (linked) {
    DSUtils.forOwn(_this.defs, function (d) {
      DSUtils.forOwn(d.relations, function (relatedModels) {
        DSUtils.forOwn(relatedModels, function (defs, relationName) {
          if (definition.n === relationName) {
            DSUtils.forEach(defs, function (def) {
              DSUtils.forEach(_this.s[def.name].collection, function (item) {
                if (def.type === 'hasMany' && item[def.localField]) {
                  var index;
                  DSUtils.forEach(item[def.localField], function (subItem, i) {
                    if (subItem === linked) {
                      index = i;
                    }
                  });
                  item[def.localField].splice(index, 1);
                } else if (item[def.localField] === linked) {
                  delete item[def.localField];
                }
              });
            });
          }
        });
      });
    });
  }

  return linked;
}

module.exports = unlinkInverse;
