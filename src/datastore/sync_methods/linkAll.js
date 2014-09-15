function errorPrefix(resourceName) {
  return 'DS.linkAll(' + resourceName + '[, params][, relations]): ';
}

function _linkAll(definition, linked, relations) {
  var DS = this;
  DS.utils.forEach(definition.relationList, function (def) {
    var relationName = def.relation;
    if (relations.length && !DS.utils.contains(relations, relationName)) {
      return;
    }
    if (def.type === 'belongsTo') {
      DS.utils.forEach(linked, function (injectedItem) {
        var parent = injectedItem[def.localKey] ? DS.get(relationName, injectedItem[def.localKey]) : null;
        if (parent) {
          injectedItem[def.localField] = parent;
        }
      });
    } else if (def.type === 'hasMany') {
      DS.utils.forEach(linked, function (injectedItem) {
        var params = {};
        params[def.foreignKey] = injectedItem[definition.idAttribute];
        injectedItem[def.localField] = DS.defaults.constructor.prototype.defaultFilter.call(DS, DS.store[relationName].collection, relationName, params, { allowSimpleWhere: true });
      });
    } else if (def.type === 'hasOne') {
      DS.utils.forEach(linked, function (injectedItem) {
        var params = {};
        params[def.foreignKey] = injectedItem[definition.idAttribute];
        var children = DS.defaults.constructor.prototype.defaultFilter.call(DS, DS.store[relationName].collection, relationName, params, { allowSimpleWhere: true });
        if (children.length) {
          injectedItem[def.localField] = children[0];
        }
      });
    }
  });
}

/**
 * @doc method
 * @id DS.sync methods:linkAll
 * @name linkAll
 * @description
 * Find relations of a collection of items that are already in the data store and link them to the items.
 *
 * ## Signature:
 * ```js
 * DS.linkAll(resourceName[, params][, relations])
 * ```
 *
 * ## Examples:
 *
 * Assume `user` has `hasMany` relationships to `post` and `comment`.
 * ```js
 * DS.filter('user'); // [{ name: 'John', id: 1 }, { name: 'Sally', id: 2 }]
 *
 * // link posts
 * DS.linkAll('user', {
 *   name: : 'John'
 * }, ['post']);
 *
 * DS.filter('user'); // [{ name: 'John', id: 1, posts: [...] }, { name: 'Sally', id: 2 }]
 *
 * // link all relations
 * DS.linkAll('user', { name: : 'John' });
 *
 * DS.filter('user'); // [{ name: 'John', id: 1, posts: [...], comments: [...] }, { name: 'Sally', id: 2 }]
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object=} params Parameter object that is used to filter items. Properties:
 *
 *  - `{object=}` - `where` - Where clause.
 *  - `{number=}` - `limit` - Limit clause.
 *  - `{number=}` - `skip` - Skip clause.
 *  - `{number=}` - `offset` - Same as skip.
 *  - `{string|array=}` - `orderBy` - OrderBy clause.
 *
 * @param {array=} relations The relations to be linked. If not provided then all relations will be linked. Default: `[]`.
 * @returns {object|array} A reference to the item with its linked relations.
 */
function linkAll(resourceName, params, relations) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];

  relations = relations || [];

  if (!definition) {
    throw new DSErrors.NER(errorPrefix(resourceName) + resourceName);
  } else if (params && !DSUtils.isObject(params)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'params: Must be an object!');
  } else if (!DSUtils.isArray(relations)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'relations: Must be an array!');
  }
  var linked = DS.filter(resourceName, params);

  if (linked) {
    _linkAll.call(DS, definition, linked, relations);
  }

  return linked;
}

module.exports = linkAll;
