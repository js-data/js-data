import DSUtils from '../../utils'
import DSErrors from '../../errors'

/**
 * This is a beast of a file, but it's where a significant portion of the magic happens.
 *
 * DS#inject makes up the core of how data gets into the store.
 */

/**
 * This factory function produces an observer handler function tailor-made for the current item being injected.
 *
 * The observer handler is what allows computed properties and change tracking to function.
 *
 * @param definition Resource definition produced by DS#defineResource
 * @param resource Resource data as internally stored by the data store
 * @returns {Function} Observer handler function
 * @private
 */
function makeObserverHandler (definition, resource) {
  var DS = this

  // using "var" avoids a JSHint error
  var name = definition.name

  /**
   * This will be called by observe-js when a new change record is available for the observed object
   *
   * @param added Change record for added properties
   * @param removed Change record for removed properties
   * @param changed Change record for changed properties
   * @param oldValueFn Function that can be used to get the previous value of a changed property
   * @param firstTime Whether this is the first time this function is being called for the given item. Will only be true once.
   */
  return function _react (added, removed, changed, oldValueFn, firstTime) {
    let target = this
    let item

    // Get the previous primary key of the observed item, in-case some knucklehead changed it
    let innerId = (oldValueFn && oldValueFn(definition.idAttribute)) ? oldValueFn(definition.idAttribute) : target[definition.idAttribute]

    // Ignore changes to relation links
    DSUtils.forEach(definition.relationFields, function (field) {
      delete added[field]
      delete removed[field]
      delete changed[field]
    })

    // Detect whether there are actually any changes
    if (!DSUtils.isEmpty(added) || !DSUtils.isEmpty(removed) || !DSUtils.isEmpty(changed) || firstTime) {
      item = DS.get(name, innerId)

      // update item and collection "modified" timestamps
      resource.modified[innerId] = DSUtils.updateTimestamp(resource.modified[innerId])

      if (item && definition.instanceEvents) {
        setTimeout(function () {
          item.emit('DS.change', definition, item)
        }, 0)
      }

      definition.handleChange(item)

      // Save a change record for the item
      if (definition.keepChangeHistory) {
        let changeRecord = {
          resourceName: name,
          target: item,
          added,
          removed,
          changed,
          timestamp: resource.modified[innerId]
        }
        resource.changeHistories[innerId].push(changeRecord)
        resource.changeHistory.push(changeRecord)
      }
    }

    // Recompute computed properties if any computed properties depend on changed properties
    if (definition.computed) {
      item = item || DS.get(name, innerId)
      DSUtils.forOwn(definition.computed, function (fn, field) {
        if (DSUtils._o(fn)) {
          return
        }
        let compute = false
        // check if required fields changed
        DSUtils.forEach(fn.deps, function (dep) {
          if (dep in added || dep in removed || dep in changed || !(field in item)) {
            compute = true
          }
        })
        compute = compute || !fn.deps.length
        if (compute) {
          DSUtils.compute.call(item, fn, field)
        }
      })
    }

    if (definition.idAttribute in changed) {
      definition.errorFn(`Doh! You just changed the primary key of an object! Your data for the "${name}" resource is now in an undefined (probably broken) state.`)
    }
  }
}

/**
 * A recursive function for injecting data into the store.
 *
 * @param definition Resource definition produced by DS#defineResource
 * @param resource Resource data as internally stored by the data store
 * @param attrs The data to be injected. Will be an object or an array of objects.
 * @param options Optional configuration.
 * @returns The injected data
 * @private
 */
function _inject (definition, resource, attrs, options) {
  let _this = this
  let injected

  if (DSUtils._a(attrs)) {
    // have an array of objects, go ahead and inject each one individually and return the resulting array
    injected = []
    for (var i = 0; i < attrs.length; i++) {
      injected.push(_inject.call(_this, definition, resource, attrs[i], options))
    }
  } else {
    // check if "idAttribute" is a computed property
    let c = definition.computed
    let idA = definition.idAttribute
    // compute the primary key if necessary
    if (c && c[idA]) {
      let args = []
      DSUtils.forEach(c[idA].deps, function (dep) {
        args.push(attrs[dep])
      })
      attrs[idA] = c[idA][c[idA].length - 1].apply(attrs, args)
    } else if(options.temporary) {
      attrs[idA] = DSUtils.guid()
    }

    if (!(idA in attrs)) {
      let error = new DSErrors.R(`${definition.name}.inject: "attrs" must contain the property specified by "idAttribute"!`)
      options.errorFn(error)
      throw error
    } else {
      try {
        // when injecting object that contain their nested relations, this code
        // will recursively inject them into their proper places in the data store.
        // Magic!
        DSUtils.forEach(definition.relationList, function (def) {
          let relationName = def.relation
          let relationDef = _this.definitions[relationName]
          let toInject = attrs[def.localField]
          if (typeof def.inject === 'function') {
            def.inject(definition, def, attrs)
          } else if (toInject && def.inject !== false) {
            if (!relationDef) {
              throw new DSErrors.R(`${definition.name} relation is defined but the resource is not!`)
            }
            // handle injecting hasMany relations
            if (DSUtils._a(toInject)) {
              let items = []
              DSUtils.forEach(toInject, function (toInjectItem) {
                if (toInjectItem !== _this.store[relationName].index[toInjectItem[relationDef.idAttribute]]) {
                  try {
                    let injectedItem = relationDef.inject(toInjectItem, options.orig())
                    if (def.foreignKey) {
                      DSUtils.set(injectedItem, def.foreignKey, attrs[definition.idAttribute])
                    }
                    items.push(injectedItem)
                  } catch (err) {
                    options.errorFn(err, `Failed to inject ${def.type} relation: "${relationName}"!`)
                  }
                }
              })
            } else {
              // handle injecting belongsTo and hasOne relations
              if (toInject !== _this.store[relationName].index[toInject[relationDef.idAttribute]]) {
                try {
                  let injected = relationDef.inject(attrs[def.localField], options.orig())
                  if (def.foreignKey) {
                    DSUtils.set(injected, def.foreignKey, attrs[definition.idAttribute])
                  }
                } catch (err) {
                  options.errorFn(err, `Failed to inject ${def.type} relation: "${relationName}"!`)
                }
              }
            }
          }
        })

        // primary key of item being injected
        let id = attrs[idA]
        // item being injected
        let item = definition.get(id)
        // 0 if the item is new, otherwise the previous last modified timestamp of the item
        let initialLastModified = item ? resource.modified[id] : 0

        // item is new
        if (!item) {
          if (attrs instanceof definition[definition['class']]) {
            item = attrs
          } else {
            item = new definition[definition['class']]()
          }

          if (definition.instanceEvents && typeof item.emit !== 'function') {
            DSUtils.Events(item)
          }
          // remove relation properties from the item, since those relations have been injected by now
          DSUtils.forEach(definition.relationList, function (def) {
            if (typeof def.link === 'boolean' ? def.link : !!definition.linkRelations) {
              delete attrs[def.localField]
            }
          })

          // copy remaining properties to the injected item
          DSUtils.deepMixIn(item, attrs)

          // add item to collection
          resource.collection.push(item)
          resource.changeHistories[id] = []

          // create the observer handler for the data to be injected
          let _react = makeObserverHandler.call(_this, definition, resource)

          // If we're in the browser, start observation
          if (definition.watchChanges) {
            resource.observers[id] = new _this.observe.ObjectObserver(item)
            resource.observers[id].open(_react, item)
          }

          // index item
          resource.index[id] = item
          // fire observation handler for the first time
          _react.call(item, {}, {}, {}, null, true)
          // save "previous" attributes of the injected item, for change diffs later
          resource.previousAttributes[id] = DSUtils.copy(item, null, null, null, definition.relationFields)
          // mark item as temporary if guid has been generated
          if(options.temporary) {
            resource.temporaryItems.push(id);
          }
        } else {
          // item is being re-injected
          // new properties take precedence
          if (options.onConflict === 'merge') {
            DSUtils.deepMixIn(item, attrs)
          } else if (options.onConflict === 'replace') {
            DSUtils.forOwn(item, function (v, k) {
              if (k !== definition.idAttribute) {
                if (!attrs.hasOwnProperty(k)) {
                  delete item[k]
                }
              }
            })
            DSUtils.forOwn(attrs, function (v, k) {
              if (k !== definition.idAttribute) {
                item[k] = v
              }
            })
          }

          if (definition.resetHistoryOnInject) {
            // clear change history for item
            _this.commit(definition.name, id)
          }
          if (resource.observers[id] && typeof resource.observers[id] === 'function') {
            // force observation callback to be fired if there are any changes to the item and `Object.observe` is not available
            resource.observers[id].deliver()
          }
        }
        // update modified timestamp of item
        resource.modified[id] = initialLastModified && resource.modified[id] === initialLastModified ? DSUtils.updateTimestamp(resource.modified[id]) : resource.modified[id]

        // reset expiry tracking for item
        resource.expiresHeap.remove(item)
        let timestamp = new Date().getTime()
        resource.expiresHeap.push({
          item: item,
          timestamp: timestamp,
          expires: definition.maxAge ? timestamp + definition.maxAge : Number.MAX_VALUE
        })

        // final injected item
        injected = item
      } catch (err) {
        options.errorFn(err, attrs)
      }
    }
  }
  return injected
}

/**
 * Inject the given object or array of objects into the data store.
 *
 * @param resourceName The name of the type of resource of the data to be injected.
 * @param attrs Object or array of objects. Objects must contain a primary key.
 * @param options Optional configuration.
 * @param options.notify Whether to emit the "DS.beforeInject" and "DS.afterInject" events.
 * @returns The injected data.
 */
module.exports = function inject (resourceName, attrs, options) {
  let _this = this
  let definition = _this.definitions[resourceName]
  let resource = _this.store[resourceName]
  let injected

  if (!definition) {
    throw new DSErrors.NER(resourceName)
  } else if (!DSUtils._o(attrs) && !DSUtils._a(attrs)) {
    throw new DSErrors.IA(`${resourceName}.inject: "attrs" must be an object or an array!`)
  }

  options = DSUtils._(definition, options)
  options.logFn('inject', attrs, options)

  // lifecycle
  options.beforeInject(options, attrs)
  if (options.notify) {
    definition.emit('DS.beforeInject', definition, attrs)
  }

  // start the recursive injection of data
  injected = _inject.call(_this, definition, resource, attrs, options)

  // collection was modified
  definition.handleChange(injected)

  // lifecycle
  options.afterInject(options, injected)
  if (options.notify) {
    definition.emit('DS.afterInject', definition, injected)
  }

  return injected
}
