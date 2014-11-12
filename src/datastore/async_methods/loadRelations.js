var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function loadRelations(resourceName, instance, relations, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var fields = [];

  return new DSUtils.Promise(function (resolve, reject) {
    if (DSUtils.isString(instance) || DSUtils.isNumber(instance)) {
      instance = _this.get(resourceName, instance);
    }

    if (DSUtils.isString(relations)) {
      relations = [relations];
    }

    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isObject(instance)) {
      reject(new DSErrors.IA('"instance(id)" must be a string, number or object!'));
    } else if (!DSUtils.isArray(relations)) {
      reject(new DSErrors.IA('"relations" must be a string or an array!'));
    } else {
      options = DSUtils._(definition, options);
      if (!options.hasOwnProperty('findBelongsTo')) {
        options.findBelongsTo = true;
      }
      if (!options.hasOwnProperty('findHasMany')) {
        options.findHasMany = true;
      }

      var tasks = [];

      DSUtils.forEach(definition.relationList, function (def) {
        var relationName = def.relation;
        if (DSUtils.contains(relations, relationName)) {
          var task;
          var params = {};
          if (options.allowSimpleWhere) {
            params[def.foreignKey] = instance[definition.idAttribute];
          } else {
            params.where = {};
            params.where[def.foreignKey] = {
              '==': instance[definition.idAttribute]
            };
          }

          if (def.type === 'hasMany' && params[def.foreignKey]) {
            task = _this.findAll(relationName, params, options);
          } else if (def.type === 'hasOne') {
            if (def.localKey && instance[def.localKey]) {
              task = _this.find(relationName, instance[def.localKey], options);
            } else if (def.foreignKey && params[def.foreignKey]) {
              task = _this.findAll(relationName, params, options).then(function (hasOnes) {
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

module.exports = loadRelations;
