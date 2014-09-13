function errorPrefix(resourceName, id) {
  return 'DS.save(' + resourceName + ', ' + id + '[, options]): ';
}

/**
 * @doc method
 * @id DS.async methods:save
 * @name save
 * @description
 * The "U" in "CRUD". Persist a single item already in the store and in it's current form to whichever adapter is being
 * used (http by default) and inject the resulting item into the data store.
 *
 * ## Signature:
 * ```js
 * DS.save(resourceName, id[, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 * var document = DS.get('document', 5);
 *
 * document.title = 'How to cook in style';
 *
 * DS.save('document', 5).then(function (document) {
 *   document; // A reference to the document that's been persisted via an adapter
 * });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to save.
 * @param {object=} options Optional configuration. Also passed along to the adapter's `update` method. Properties:
 *
 * - `{boolean=}` - `cacheResponse` - Inject the data returned by the adapter into the data store. Default: `true`.
 * - `{boolean=}` - `changesOnly` - Only send changed and added values to the adapter. Default: `false`.
 * - `{function=}` - `beforeValidate` - Override the resource or global lifecycle hook.
 * - `{function=}` - `validate` - Override the resource or global lifecycle hook.
 * - `{function=}` - `afterValidate` - Override the resource or global lifecycle hook.
 * - `{function=}` - `beforeUpdate` - Override the resource or global lifecycle hook.
 * - `{function=}` - `afterUpdate` - Override the resource or global lifecycle hook.
 *
 * @returns {Promise} Promise.
 *
 * ## Resolves with:
 *
 * - `{object}` - `item` - The item returned by the adapter.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{NonexistentResourceError}`
 */
function save(resourceName, id, options) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];
  var item;

  return new DSUtils.Promise(function (resolve, reject) {
    options = options || {};

    if (!definition) {
      reject(new DSErrors.NER(errorPrefix(resourceName, id) + resourceName));
    } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
      reject(new DSErrors.IA(errorPrefix(resourceName, id) + 'id: Must be a string or a number!'));
    } else if (!DSUtils.isObject(options)) {
      reject(new DSErrors.IA(errorPrefix(resourceName, id) + 'options: Must be an object!'));
    } else if (!DS.get(resourceName, id)) {
      reject(new DSErrors.R(errorPrefix(resourceName, id) + 'id: "' + id + '" not found!'));
    } else {
      item = DS.get(resourceName, id);
      if (!('cacheResponse' in options)) {
        options.cacheResponse = true;
      }
      resolve(item);
    }
  }).then(function (attrs) {
      var func = options.beforeValidate ? DSUtils.promisify(options.beforeValidate) : definition.beforeValidate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      var func = options.validate ? DSUtils.promisify(options.validate) : definition.validate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      var func = options.afterValidate ? DSUtils.promisify(options.afterValidate) : definition.afterValidate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      var func = options.beforeUpdate ? DSUtils.promisify(options.beforeUpdate) : definition.beforeUpdate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      if (options.changesOnly) {
        var resource = DS.store[resourceName];
        resource.observers[id].deliver();
        var toKeep = [];
        var changes = DS.changes(resourceName, id);

        for (var key in changes.added) {
          toKeep.push(key);
        }
        for (key in changes.changed) {
          toKeep.push(key);
        }
        changes = DSUtils.pick(attrs, toKeep);
        if (DSUtils.isEmpty(changes)) {
          // no changes, return
          return attrs;
        } else {
          attrs = changes;
        }
      }
      return DS.adapters[options.adapter || definition.defaultAdapter].update(definition, id, options.serialize ? options.serialize(resourceName, attrs) : definition.serialize(resourceName, attrs), options);
    })
    .then(function (res) {
      var func = options.afterUpdate ? DSUtils.promisify(options.afterUpdate) : definition.afterUpdate;
      var attrs = options.deserialize ? options.deserialize(resourceName, res) : definition.deserialize(resourceName, res);
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (data) {
      if (options.cacheResponse) {
        var resource = DS.store[resourceName];
        var saved = DS.inject(definition.name, data, options);
        resource.previousAttributes[id] = DSUtils.deepMixIn({}, saved);
        resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
        resource.observers[id].discardChanges();
        return DS.get(resourceName, id);
      } else {
        return data;
      }
    });
}

module.exports = save;
