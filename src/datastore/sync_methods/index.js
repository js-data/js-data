import DSUtils from '../../utils'
import DSErrors from '../../errors'

let {NER, IA, R} = DSErrors
const fakeId = `DS_${new Date().getTime()}`

function diffIsEmpty (diff) {
  return !(DSUtils.isEmpty(diff.added) &&
  DSUtils.isEmpty(diff.removed) &&
  DSUtils.isEmpty(diff.changed))
}

function check (fnName, resourceName, id, options) {
  let _this = this
  let definition = _this.definitions[resourceName]
  options = options || {}

  id = DSUtils.resolveId(definition, id)
  if (!definition) {
    throw new NER(resourceName)
  } else if (!DSUtils._sn(id)) {
    throw DSUtils._snErr('id')
  }
  id = id === fakeId ? undefined : id

  options = DSUtils._(definition, options)

  options.logFn(fnName, id, options)

  return {_this, definition, _resourceName: resourceName, _id: id, _options: options}
}

export default {
  // Return the changes for the given item, if any.
  //
  // @param resourceName The name of the type of resource of the item whose changes are to be returned.
  // @param id The primary key of the item whose changes are to be returned.
  // @param options Optional configuration.
  // @param options.ignoredChanges Array of strings or regular expressions of fields, the changes of which are to be ignored.
  // @returns The changes of the given item, if any.
  changes (resourceName, id, options) {
    let {_this, definition, _resourceName, _id, _options} = check.call(this, 'changes', resourceName, id, options)

    let item = definition.get(_id)
    if (item) {
      let observer = _this.store[_resourceName].observers[_id]
      if (observer && typeof observer === 'function') {
        // force observation handler to be fired for item if there are changes and `Object.observe` is not available
        observer.deliver()
      }

      let ignoredChanges = _options.ignoredChanges || []
      // add linked relations to list of ignored changes
      DSUtils.forEach(definition.relationFields, function (field) {
        if (!DSUtils.contains(ignoredChanges, field)) {
          ignoredChanges.push(field)
        }
      })
      // calculate changes
      let diff = DSUtils.diffObjectFromOldObject(item, _this.store[_resourceName].previousAttributes[_id], DSUtils.equals, ignoredChanges)
      // remove functions from diff
      DSUtils.forOwn(diff, function (changeset, name) {
        let toKeep = []
        DSUtils.forOwn(changeset, function (value, field) {
          if (!DSUtils.isFunction(value)) {
            toKeep.push(field)
          }
        })
        diff[name] = DSUtils.pick(diff[name], toKeep)
      })
      // definitely ignore changes to linked relations
      DSUtils.forEach(definition.relationFields, function (field) {
        delete diff.added[field]
        delete diff.removed[field]
        delete diff.changed[field]
      })
      return diff
    }
  },

  // Return the change history of the given item, if any.
  //
  // @param resourceName The name of the type of resource of the item whose change history is to be returned.
  // @param id The primary key of the item whose change history is to be returned.
  // @returns The change history of the given item, if any.
  changeHistory (resourceName, id) {
    let {_this, definition, _resourceName, _id} = check.call(this, 'changeHistory', resourceName, id || fakeId)
    let resource = _this.store[_resourceName]

    if (!definition.keepChangeHistory) {
      definition.errorFn('changeHistory is disabled for this resource!')
    } else {
      if (_resourceName) {
        let item = definition.get(_id)
        if (item) {
          return resource.changeHistories[_id]
        }
      } else {
        return resource.changeHistory
      }
    }
  },

  commit (resourceName, id) {
    let {_this, definition, _resourceName, _id} = check.call(this, 'commit', resourceName, id)
    let resource = _this.store[_resourceName]
    let item = _this.store[_resourceName].index[_id]
    if (item) {
      resource.previousAttributes[_id] = DSUtils.copy(item, null, null, null, definition.relationFields)
    }

    if (resource.changeHistories[_id].length) {
      DSUtils.forEach(resource.changeHistories[_id], function (changeRecord) {
        DSUtils.remove(resource.changeHistory, changeRecord)
      })
      resource.changeHistories[_id].splice(0, resource.changeHistories[_id].length)
    }
    return item
  },

  // Re-compute the computed properties of the given item.
  //
  // @param resourceName The name of the type of resource of the item whose computed properties are to be re-computed.
  // @param instance The instance whose computed properties are to be re-computed.
  // @returns The item whose computed properties were re-computed.
  compute (resourceName, instance) {
    let _this = this
    let definition = _this.definitions[resourceName]

    instance = DSUtils.resolveItem(_this.store[resourceName], instance)
    if (!definition) {
      throw new NER(resourceName)
    } else if (!instance) {
      throw new R('Item not in the store!')
    } else if (!DSUtils._o(instance) && !DSUtils._sn(instance)) {
      throw new IA('"instance" must be an object, string or number!')
    }

    definition.logFn('compute', instance)

    // re-compute all computed properties
    DSUtils.forOwn(definition.computed, function (fn, field) {
      DSUtils.compute.call(instance, fn, field)
    })
    return instance
  },

  // Factory function to create an instance of the specified Resource.
  //
  // @param resourceName The name of the type of resource of which to create an instance.
  // @param attrs Hash of properties with which to initialize the instance.
  // @param options Optional configuration.
  // @param options.defaults Default values with which to initialize the instance.
  // @returns The new instance.
  createInstance (resourceName, attrs, options) {
    let definition = this.definitions[resourceName]
    let item

    attrs = attrs || {}

    if (!definition) {
      throw new NER(resourceName)
    } else if (attrs && !DSUtils.isObject(attrs)) {
      throw new IA('"attrs" must be an object!')
    }

    options = DSUtils._(definition, options)
    options.logFn('createInstance', attrs, options)

    // lifecycle
    options.beforeCreateInstance(options, attrs)

    // grab instance constructor function from Resource definition
    let Constructor = definition[definition.class]

    // create instance
    item = new Constructor()

    if (definition.instanceEvents) {
      DSUtils.Events(item)
    }

    // add default values
    if (options.defaultValues) {
      DSUtils.deepMixIn(item, options.defaultValues)
    }
    DSUtils.deepMixIn(item, attrs)

    // compute computed properties
    if (definition.computed) {
      definition.compute(item)
    }
    // lifecycle
    options.afterCreateInstance(options, item)
    return item
  },

  // Create a new collection of the specified Resource.
  //
  // @param resourceName The name of the type of resource of which to create a collection
  // @param arr Possibly empty array of data from which to create the collection.
  // @param params The criteria by which to filter items. Will be passed to `DS#findAll` if `fetch` is called. See http://www.js-data.io/docs/query-syntax
  // @param options Optional configuration.
  // @param options.notify Whether to call the beforeCreateCollection and afterCreateCollection lifecycle hooks..
  // @returns The new collection.
  createCollection (resourceName, arr, params, options) {
    let _this = this
    let definition = _this.definitions[resourceName]

    arr = arr || []
    params = params || {}

    if (!definition) {
      throw new NER(resourceName)
    } else if (arr && !DSUtils.isArray(arr)) {
      throw new IA('"arr" must be an array!')
    }

    options = DSUtils._(definition, options)

    options.logFn('createCollection', arr, options)

    // lifecycle
    options.beforeCreateCollection(options, arr)

    // define the API for this collection
    Object.defineProperties(arr, {
      //  Call DS#findAll with the params of this collection, filling the collection with the results.
      fetch: {
        value: function (params, options) {
          let __this = this
          __this.params = params || __this.params
          return definition.findAll(__this.params, options).then(function (data) {
            if (data === __this) {
              return __this
            }
            data.unshift(__this.length)
            data.unshift(0)
            __this.splice.apply(__this, data)
            data.shift()
            data.shift()
            if (data.$$injected) {
              _this.store[resourceName].queryData[DSUtils.toJson(__this.params)] = __this
              __this.$$injected = true
            }
            return __this
          })
        }
      },
      // params for this collection. See http://www.js-data.io/docs/query-syntax
      params: {
        value: params,
        writable: true
      },
      // name of the resource type of this collection
      resourceName: {
        value: resourceName
      }
    })

    // lifecycle
    options.afterCreateCollection(options, arr)
    return arr
  },
  defineResource: require('./defineResource'),
  digest () {
    this.observe.Platform.performMicrotaskCheckpoint()
  },
  eject: require('./eject'),
  ejectAll: require('./ejectAll'),
  filter: require('./filter'),

  // Return the item with the given primary key if its in the store.
  //
  // @param resourceName The name of the type of resource of the item to retrieve.
  // @param id The primary key of the item to retrieve.
  // @returns The item with the given primary key if it's in the store.
  // /
  get (resourceName, id) {
    let {_this, _resourceName, _id} = check.call(this, 'get', resourceName, id)

    // return the item if it exists
    return _this.store[_resourceName].index[_id]
  },

  // Return the items in the store that have the given primary keys.
  //
  // @param resourceName The name of the type of resource of the items to retrieve.
  // @param ids The primary keys of the items to retrieve.
  // @returns The items with the given primary keys if they're in the store.
  getAll (resourceName, ids) {
    let _this = this
    let definition = _this.definitions[resourceName]
    let resource = _this.store[resourceName]
    let collection = []

    if (!definition) {
      throw new NER(resourceName)
    } else if (ids && !DSUtils._a(ids)) {
      throw DSUtils._aErr('ids')
    }

    definition.logFn('getAll', ids)

    if (DSUtils._a(ids)) {
      // return just the items with the given primary keys
      let length = ids.length
      for (var i = 0; i < length; i++) {
        if (resource.index[ids[i]]) {
          collection.push(resource.index[ids[i]])
        }
      }
    } else {
      // most efficient of retrieving ALL items from the store
      collection = resource.collection.slice()
    }

    return collection
  },

  // Return the whether the item with the given primary key has any changes.
  //
  // @param resourceName The name of the type of resource of the item.
  // @param id The primary key of the item.
  // @returns Whether the item with the given primary key has any changes.
  hasChanges (resourceName, id) {
    let {definition, _id} = check.call(this, 'hasChanges', resourceName, id)

    return definition.get(_id) ? diffIsEmpty(definition.changes(_id)) : false
  },
  inject: require('./inject'),

  // Return the timestamp from the last time the item with the given primary key was changed.
  //
  // @param resourceName The name of the type of resource of the item.
  // @param id The primary key of the item.
  // @returns Timestamp from the last time the item was changed.
  lastModified (resourceName, id) {
    let {_this, _resourceName, _id} = check.call(this, 'lastModified', resourceName, id || fakeId)
    let resource = _this.store[_resourceName]

    if (_id) {
      if (!(_id in resource.modified)) {
        resource.modified[_id] = 0
      }
      return resource.modified[_id]
    }
    return resource.collectionModified
  },

  // Return the timestamp from the last time the item with the given primary key was saved via an adapter.
  //
  // @param resourceName The name of the type of resource of the item.
  // @param id The primary key of the item.
  // @returns Timestamp from the last time the item was saved.
  lastSaved (resourceName, id) {
    let {_this, _resourceName, _id} = check.call(this, 'lastSaved', resourceName, id || fakeId)
    let resource = _this.store[_resourceName]

    if (!(_id in resource.saved)) {
      resource.saved[_id] = 0
    }
    return resource.saved[_id]
  },

  // Return the previous attributes of the item with the given primary key before it was changed.
  //
  // @param resourceName The name of the type of resource of the item.
  // @param id The primary key of the item.
  // @returns The previous attributes of the item
  previous (resourceName, id) {
    let {_this, _resourceName, _id} = check.call(this, 'previous', resourceName, id)
    let resource = _this.store[_resourceName]

    // return resource from cache
    return resource.previousAttributes[_id] ? DSUtils.copy(resource.previousAttributes[_id]) : undefined
  },

  // Revert all attributes of the item with the given primary key to their previous values.
  //
  // @param resourceName The name of the type of resource of the item.
  // @param id The primary key of the item.
  // @returns The reverted item
  revert (resourceName, id) {
    let {_this, definition, _resourceName, _id} = check.call(this, 'revert', resourceName, id)

    return definition.inject(_this.previous(_resourceName, _id))
  }
}
