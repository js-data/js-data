function errorPrefix(resourceName) {
  return 'DS.link(' + resourceName + ', id[, relations]): ';
}

function _link(definition, linked, relations) {
  var DS = this;
  DS.utils.forEach(definition.relationList, function (def) {
    var relationName = def.relation;
    if (relations.length && !DS.utils.contains(relations, relationName)) {
      return;
    }
    var params = {};
    if (def.type === 'belongsTo') {
      var parent = linked[def.localKey] ? DS.get(relationName, linked[def.localKey]) : null;
      if (parent) {
        linked[def.localField] = parent;
      }
    } else if (def.type === 'hasMany') {
      params[def.foreignKey] = linked[definition.idAttribute];
      linked[def.localField] = DS.defaults.constructor.prototype.defaultFilter.call(DS, DS.store[relationName].collection, relationName, params, { allowSimpleWhere: true });
    } else if (def.type === 'hasOne') {
      params[def.foreignKey] = linked[definition.idAttribute];
      var children = DS.defaults.constructor.prototype.defaultFilter.call(DS, DS.store[relationName].collection, relationName, params, { allowSimpleWhere: true });
      if (children.length) {
        linked[def.localField] = children[0];
      }
    }
  });
}

/**
 * @doc method
 * @id DS.sync methods:link
 * @name link
 * @description
 * Find relations of the item with the given primary key that are already in the data store and link them to the item.
 *
 * ## Signature:
 * ```js
 * DS.link(resourceName, id[, relations])
 * ```
 *
 * ## Examples:
 *
 * Assume `user` has `hasMany` relationships to `post` and `comment`.
 * ```js
 * DS.get('user', 1); // { name: 'John', id: 1 }
 *
 * // link posts
 * DS.link('user', 1, ['post']);
 *
 * DS.get('user', 1); // { name: 'John', id: 1, posts: [...] }
 *
 * // link all relations
 * DS.link('user', 1);
 *
 * DS.get('user', 1); // { name: 'John', id: 1, posts: [...], comments: [...] }
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item for to link relations.
 * @param {array=} relations The relations to be linked. If not provided then all relations will be linked. Default: `[]`.
 * @returns {object|array} A reference to the item with its linked relations.
 */
function link(resourceName, id, relations) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];

  relations = relations || [];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new DSErrors.NER(errorPrefix(resourceName) + resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'id: Must be a string or a number!');
  } else if (!DSUtils.isArray(relations)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'relations: Must be an array!');
  }
  var linked = DS.get(resourceName, id);

  if (linked) {
    _link.call(DS, definition, linked, relations);
  }

  return linked;
}

module.exports = link;
