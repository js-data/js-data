var observe = require('../../../lib/observe-js/observe-js');
var _compute = require('./compute')._compute;
var stack = 0;
var data = {
  injectedSoFar: {}
};

function errorPrefix(resourceName) {
  return 'DS.inject(' + resourceName + ', attrs[, options]): ';
}

function _inject(definition, resource, attrs) {
  var DS = this;

  function _react(added, removed, changed, oldValueFn, firstTime) {
    var target = this;
    var item;
    var innerId = (oldValueFn && oldValueFn(definition.idAttribute)) ? oldValueFn(definition.idAttribute) : target[definition.idAttribute];

    DS.utils.forEach(definition.relationFields, function (field) {
      delete added[field];
      delete removed[field];
      delete changed[field];
    });

    if (!DS.utils.isEmpty(added) || !DS.utils.isEmpty(removed) || !DS.utils.isEmpty(changed) || firstTime) {
      resource.modified[innerId] = DS.utils.updateTimestamp(resource.modified[innerId]);
      resource.collectionModified = DS.utils.updateTimestamp(resource.collectionModified);
    }

    if (definition.computed) {
      item = DS.get(definition.name, innerId);
      DS.utils.forOwn(definition.computed, function (fn, field) {
        var compute = false;
        // check if required fields changed
        DS.utils.forEach(fn.deps, function (dep) {
          if (dep in added || dep in removed || dep in changed || !(field in item)) {
            compute = true;
          }
        });
        compute = compute || !fn.deps.length;
        if (compute) {
          _compute.call(item, fn, field);
        }
      });
    }

    if (definition.relations) {
      item = DS.get(definition.name, innerId);
      DS.utils.forEach(definition.relationList, function (def) {
        if (item[def.localField] && (def.localKey in added || def.localKey in removed || def.localKey in changed)) {
          DS.link(definition.name, item[definition.idAttribute], [def.relation]);
        }
      });
    }

    if (definition.idAttribute in changed) {
      console.error('Doh! You just changed the primary key of an object! ' +
        'I don\'t know how to handle this yet, so your data for the "' + definition.name +
        '" resource is now in an undefined (probably broken) state.');
    }
  }

  var injected;
  if (DS.utils.isArray(attrs)) {
    injected = [];
    for (var i = 0; i < attrs.length; i++) {
      injected.push(_inject.call(DS, definition, resource, attrs[i]));
    }
  } else {
    // check if "idAttribute" is a computed property
    var c = definition.computed;
    var idA = definition.idAttribute;
    if (c && c[idA]) {
      var args = [];
      DS.utils.forEach(c[idA].deps, function (dep) {
        args.push(attrs[dep]);
      });
      attrs[idA] = c[idA][c[idA].length - 1].apply(attrs, args);
    }
    if (!(idA in attrs)) {
      var error = new DS.errors.R(errorPrefix(definition.name) + 'attrs: Must contain the property specified by `idAttribute`!');
      console.error(error);
      throw error;
    } else {
      try {
        definition.beforeInject(definition.name, attrs);
        var id = attrs[idA];
        var item = DS.get(definition.name, id);

        if (!item) {
          if (definition.methods || definition.useClass) {
            if (attrs instanceof definition[definition.class]) {
              item = attrs;
            } else {
              item = new definition[definition.class]();
            }
          } else {
            item = {};
          }
          resource.previousAttributes[id] = {};

          DS.utils.deepMixIn(item, attrs);
          DS.utils.deepMixIn(resource.previousAttributes[id], attrs);

          resource.collection.push(item);

          resource.observers[id] = new observe.ObjectObserver(item);
          resource.observers[id].open(_react, item);
          resource.index[id] = item;

          _react.call(item, {}, {}, {}, null, true);
        } else {
          DS.utils.deepMixIn(item, attrs);
          resource.observers[id].deliver();
        }
        resource.saved[id] = DS.utils.updateTimestamp(resource.saved[id]);
        definition.afterInject(definition.name, item);
        injected = item;
      } catch (err) {
        console.error(err);
        console.error('inject failed!', definition.name, attrs);
      }
    }
  }
  return injected;
}

function _injectRelations(definition, injected, options) {
  var DS = this;

  function _process(def, relationName, injected) {
    var relationDef = DS.definitions[relationName];
    if (relationDef && injected[def.localField] && !data.injectedSoFar[relationName + injected[def.localField][relationDef.idAttribute]]) {
      try {
        data.injectedSoFar[relationName + injected[def.localField][relationDef.idAttribute]] = 1;
        injected[def.localField] = DS.inject(relationName, injected[def.localField], options);
      } catch (err) {
        DS.console.error(errorPrefix(definition.name) + 'Failed to inject ' + def.type + ' relation: "' + relationName + '"!', err);
      }
    } else if (options.findBelongsTo && def.type === 'belongsTo') {
      if (DS.utils.isArray(injected)) {
        DS.utils.forEach(injected, function (injectedItem) {
          DS.link(definition.name, injectedItem[definition.idAttribute], [relationName]);
        });
      } else {
        DS.link(definition.name, injected[definition.idAttribute], [relationName]);
      }
    } else if ((options.findHasMany && def.type === 'hasMany') || (options.findHasOne && def.type === 'hasOne')) {
      if (DS.utils.isArray(injected)) {
        DS.utils.forEach(injected, function (injectedItem) {
          DS.link(definition.name, injectedItem[definition.idAttribute], [relationName]);
        });
      } else {
        DS.link(definition.name, injected[definition.idAttribute], [relationName]);
      }
    }
  }

  DS.utils.forEach(definition.relationList, function (def) {
    if (DS.utils.isArray(injected)) {
      DS.utils.forEach(injected, function (injectedI) {
        _process(def, def.relation, injectedI);
      });
    } else {
      _process(def, def.relation, injected);
    }
  });
}

/**
 * @doc method
 * @id DS.sync methods:inject
 * @name inject
 * @description
 * Inject the given item into the data store as the specified type. If `attrs` is an array, inject each item into the
 * data store. Injecting an item into the data store does not save it to the server. Emits a `"DS.inject"` event.
 *
 * ## Signature:
 * ```js
 * DS.inject(resourceName, attrs[, options])
 * ```
 *
 * ## Examples:
 *
 * ```js
 * DS.get('document', 45); // undefined
 *
 * DS.inject('document', { title: 'How to Cook', id: 45 });
 *
 * DS.get('document', 45); // { title: 'How to Cook', id: 45 }
 * ```
 *
 * Inject a collection into the data store:
 *
 * ```js
 * DS.filter('document'); // [ ]
 *
 * DS.inject('document', [ { title: 'How to Cook', id: 45 }, { title: 'How to Eat', id: 46 } ]);
 *
 * DS.filter('document'); // [ { title: 'How to Cook', id: 45 }, { title: 'How to Eat', id: 46 } ]
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object|array} attrs The item or collection of items to inject into the data store.
 * @param {object=} options The item or collection of items to inject into the data store. Properties:
 *
 * - `{boolean=}` - `findBelongsTo` - Find and attach any existing "belongsTo" relationships to the newly injected item. Potentially expensive if enabled. Default: `false`.
 * - `{boolean=}` - `findHasMany` - Find and attach any existing "hasMany" relationships to the newly injected item. Potentially expensive if enabled. Default: `false`.
 * - `{boolean=}` - `findHasOne` - Find and attach any existing "hasOne" relationships to the newly injected item. Potentially expensive if enabled. Default: `false`.
 * - `{boolean=}` - `linkInverse` - Look in the data store for relations of the injected item(s) and update their links to the injected. Potentially expensive if enabled. Default: `false`.
 *
 * @returns {object|array} A reference to the item that was injected into the data store or an array of references to
 * the items that were injected into the data store.
 */
function inject(resourceName, attrs, options) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];

  options = options || {};

  if (!definition) {
    throw new DSErrors.NER(errorPrefix(resourceName) + resourceName);
  } else if (!DSUtils.isObject(attrs) && !DSUtils.isArray(attrs)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'attrs: Must be an object or an array!');
  } else if (!DSUtils.isObject(options)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'options: Must be an object!');
  }
  var resource = DS.store[resourceName];
  var injected;

  stack++;

  try {
    injected = _inject.call(DS, definition, resource, attrs);
    if (definition.relations) {
      _injectRelations.call(DS, definition, injected, options);
    }

    if (options.linkInverse) {
      if (DSUtils.isArray(injected) && injected.length) {
        DS.linkInverse(definition.name, injected[0][definition.idAttribute]);
      } else {
        DS.linkInverse(definition.name, injected[definition.idAttribute]);
      }
    }

    stack--;
  } catch (err) {
    stack--;
    throw err;
  }

  if (!stack) {
    data.injectedSoFar = {};
  }

  return injected;
}

module.exports = inject;
