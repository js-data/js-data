export default function unlinkInverse(resourceName, id, relations) {
  let _this = this;
  let DSUtils = _this.utils;
  let definition = _this.defs[resourceName];

  relations = relations || [];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new _this.errors.NER(resourceName);
  } else if (!DSUtils._sn(id)) {
    throw DSUtils._snErr('id');
  } else if (!DSUtils._a(relations)) {
    throw DSUtils._aErr('relations');
  }

  definition.logFn('unlinkInverse', id, relations);

  let linked = _this.get(resourceName, id);

  if (linked) {
    DSUtils.forOwn(_this.defs, d => {
      DSUtils.forOwn(d.relations, relatedModels => {
        DSUtils.forOwn(relatedModels, (defs, relationName) => {
          if (definition.n === relationName) {
            DSUtils.forEach(defs, def => {
              DSUtils.forEach(_this.s[def.name].collection, item => {
                if (def.type === 'hasMany' && item[def.localField]) {
                  let index;
                  DSUtils.forEach(item[def.localField], (subItem, i) => {
                    if (subItem === linked) {
                      index = i;
                    }
                  });
                  if (index !== undefined) {
                    item[def.localField].splice(index, 1);
                  }
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
