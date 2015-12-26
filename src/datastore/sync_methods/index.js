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

  // Return whether the item with the given primary key is a temporary item.
  //
  // @param resourceName The name of the type of resource of the item.
  // @param id The primary key of the item.
  // @returns Whether the item with the given primary key is a temporary item.
  isNew (resourceName, id) {
    let {_this, _resourceName, _id} = check.call(this, 'isNew', resourceName, id || fakeId)
    let resource = _this.store[_resourceName]

    return !!resource.temporaryItems[_id]
  },

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
  }
}
