function loadRelations(resourceName, instance, relations, options) {
  var _this = this;
  var DSUtils = _this.utils;
  var DSErrors = _this.errors;
  var definition = _this.defs[resourceName];
  var fields = [];

  return new DSUtils.Promise(function (resolve, reject) {
    if (DSUtils._sn(instance)) {
      instance = _this.get(resourceName, instance);
    }

    if (DSUtils._s(relations)) {
      relations = [relations];
    }

    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils._o(instance)) {
      reject(new DSErrors.IA('"instance(id)" must be a string, number or object!'));
    } else if (!DSUtils._a(relations)) {
      reject(new DSErrors.IA('"relations" must be a string or an array!'));
    } else {
      var _options = DSUtils._(definition, options);
      if (!_options.hasOwnProperty('findBelongsTo')) {
        _options.findBelongsTo = true;
      }
      if (!_options.hasOwnProperty('findHasMany')) {
        _options.findHasMany = true;
      }
      _options.logFn('loadRelations', instance, relations, _options);

      var tasks = [];

      DSUtils.forEach(definition.relationList, function (def) {
        var relationName = def.relation;
        var relationDef = definition.getResource(relationName);
        var __options = DSUtils._(relationDef, options);
        if (DSUtils.contains(relations, relationName) || DSUtils.contains(relations, def.localField)) {
          var task;
          var params = {};
          if (__options.allowSimpleWhere) {
            params[def.foreignKey] = instance[definition.idAttribute];
          } else {
            params.where = {};
            params.where[def.foreignKey] = {
              '==': instance[definition.idAttribute]
            };
          }

          if (def.type === 'hasMany' && params[def.foreignKey]) {
            task = _this.findAll(relationName, params, __options.orig());
          } else if (def.type === 'hasOne') {
            if (def.localKey && instance[def.localKey]) {
              task = _this.find(relationName, instance[def.localKey], __options.orig());
            } else if (def.foreignKey && params[def.foreignKey]) {
              task = _this.findAll(relationName, params, __options.orig()).then(function (hasOnes) {
                return hasOnes.length ? hasOnes[0] : null;
              });
            }
          } else if (instance[def.localKey]) {
            task = _this.find(relationName, instance[def.localKey], options);
          }

          if (task) {
            tasks.push(task);
            fields.push(def.localField);
          }
        }
      });

      resolve(tasks);
    }
  })
    .then(function (tasks) {
      return DSUtils.Promise.all(tasks);
    })
    .then(function (loadedRelations) {
      DSUtils.forEach(fields, function (field, index) {
        instance[field] = loadedRelations[index];
      });
      return instance;
    });
}

export default loadRelations;
