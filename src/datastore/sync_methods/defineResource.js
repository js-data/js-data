/* jshint evil:true, loopfunc:true */
import DSUtils from '../../utils'
import DSErrors from '../../errors'

/**
 * These are DS methods that will be proxied by instances. e.g.
 *
 * var store = new JSData.DS()
 * var User = store.defineResource('user')
 * var user = User.createInstance({ id: 1 })
 *
 * store.update(resourceName, id, attrs[, options]) // DS method
 * User.update(id, attrs[, options]) // DS method proxied on a Resource
 * user.DSUpdate(attrs[, options]) // DS method proxied on an Instance
 */
let instanceMethods = [
  'compute',
  'eject',
  'refresh',
  'save',
  'update',
  'destroy',
  'loadRelations',
  'changeHistory',
  'changes',
  'hasChanges',
  'lastModified',
  'lastSaved',
  'previous',
  'revert'
]

module.exports = function defineResource (definition) {
  let _this = this
  let definitions = _this.definitions

  /**
   * This allows the name-only definition shorthand.
   * store.defineResource('user') is the same as store.defineResource({ name: 'user'})
   */
  if (DSUtils._s(definition)) {
    definition = {
      name: definition.replace(/\s/gi, '')
    }
  }
  if (!DSUtils._o(definition)) {
    throw DSUtils._oErr('definition')
  } else if (!DSUtils._s(definition.name)) {
    throw new DSErrors.IA('"name" must be a string!')
  } else if (definitions[definition.name]) {
    throw new DSErrors.R(`${definition.name} is already registered!`)
  }

  /**
   * Dynamic Resource constructor function.
   *
   * A Resource inherits from the defaults of the data store that created it.
   */
  function Resource (options) {
    this.defaultValues = {}
    this.methods = {}
    this.computed = {}
    DSUtils.deepMixIn(this, options)
    let parent = _this.defaults
    if (definition.extends && definitions[definition.extends]) {
      parent = definitions[definition.extends]
    }
    DSUtils.fillIn(this.defaultValues, parent.defaultValues)
    DSUtils.fillIn(this.methods, parent.methods)
    DSUtils.fillIn(this.computed, parent.computed)
    this.endpoint = ('endpoint' in options) ? options.endpoint : this.name
  }

  try {
    // Resources can inherit from another resource instead of inheriting directly from the data store defaults.
    if (definition.extends && definitions[definition.extends]) {
      // Inherit from another resource
      Resource.prototype = definitions[definition.extends]
    } else {
      // Inherit from global defaults
      Resource.prototype = _this.defaults
    }
    definitions[definition.name] = new Resource(definition)

    var def = definitions[definition.name]

    def.getResource = function (resourceName) { return _this.definitions[resourceName] }

    def.logFn('Preparing resource.')

    if (!DSUtils._s(def.idAttribute)) {
      throw new DSErrors.IA('"idAttribute" must be a string!')
    }

    // Setup nested parent configuration
    if (def.relations) {
      def.relationList = []
      def.relationFields = []
      DSUtils.forOwn(def.relations, function (relatedModels, type) {
        DSUtils.forOwn(relatedModels, function (defs, relationName) {
          if (!DSUtils._a(defs)) {
            relatedModels[relationName] = [defs]
          }
          DSUtils.forEach(relatedModels[relationName], function (d) {
            d.type = type
            d.relation = relationName
            d.name = def.name
            def.relationList.push(d)
            if (d.localField) {
              def.relationFields.push(d.localField)
            }
          })
        })
      })
      if (def.relations.belongsTo) {
        DSUtils.forOwn(def.relations.belongsTo, function (relatedModel, modelName) {
          DSUtils.forEach(relatedModel, function (relation) {
            if (relation.parent) {
              def.parent = modelName
              def.parentKey = relation.localKey
              def.parentField = relation.localField
            }
          })
        })
      }
      if (typeof Object.freeze === 'function') {
        Object.freeze(def.relations)
        Object.freeze(def.relationList)
      }
    }

    // Create the wrapper class for the new resource
    var _class = def['class'] = DSUtils.pascalCase(def.name)
    try {
      if (typeof def.useClass === 'function') {
        eval(`function ${_class}() { def.useClass.call(this); }`) // eslint-disable-line
        def[_class] = eval(_class) // eslint-disable-line
        def[_class].prototype = (function (proto) {
          function Ctor () {
          }

          Ctor.prototype = proto
          return new Ctor()
        })(def.useClass.prototype)
      } else {
        eval(`function ${_class}() {}`) // eslint-disable-line
        def[_class] = eval(_class) // eslint-disable-line
      }
    } catch (e) {
      def[_class] = function () {}
    }

    // Apply developer-defined instance methods
    DSUtils.forOwn(def.methods, function (fn, m) {
      def[_class].prototype[m] = fn
    })

    /**
     * var user = User.createInstance({ id: 1 })
     * user.set('foo', 'bar')
     */
    def[_class].prototype.set = function (key, value) {
      DSUtils.set(this, key, value)
      def.compute(this)
      if (def.instanceEvents) {
        setTimeout(() => {
          this.emit('DS.change', def, this)
        }, 0)
      }
      def.handleChange(this)
      return this
    }

    /**
     * var user = User.createInstance({ id: 1 })
     * user.get('id') // 1
     */
    def[_class].prototype.get = function (key) {
      return DSUtils.get(this, key)
    }

    if (def.instanceEvents) {
      DSUtils.Events(def[_class].prototype)
    }

    // Setup the relation links
    DSUtils.applyRelationGettersToTarget(_this, def, def[_class].prototype)

    let parentOmit = null
    if (!def.hasOwnProperty('omit')) {
      parentOmit = def.omit
      def.omit = []
    } else {
      parentOmit = _this.defaults.omit
    }
    def.omit = def.omit.concat(parentOmit || [])

    // Prepare for computed properties
    DSUtils.forOwn(def.computed, function (fn, field) {
      if (DSUtils.isFunction(fn)) {
        def.computed[field] = [fn]
        fn = def.computed[field]
      }
      if (def.methods && field in def.methods) {
        def.errorFn(`Computed property "${field}" conflicts with previously defined prototype method!`)
      }
      def.omit.push(field)
      if (DSUtils.isArray(fn)) {
        var deps
        if (fn.length === 1) {
          let match = fn[0].toString().match(/function.*?\(([\s\S]*?)\)/)
          deps = match[1].split(',')
          deps = DSUtils.filter(deps, function (x) { return x })
          def.computed[field] = deps.concat(fn)
          fn = def.computed[field]
          if (deps.length) {
            def.errorFn('Use the computed property array syntax for compatibility with minified code!')
          }
        }
        deps = fn.slice(0, fn.length - 1)
        DSUtils.forEach(deps, function (val, index) {
          deps[index] = val.trim()
        })
        fn.deps = DSUtils.filter(deps, function (dep) {
          return !!dep
        })
      } else if (DSUtils.isObject(fn)) {
        Object.defineProperty(def[_class].prototype, field, fn)
      }
    })

    // add instance proxies of DS methods
    DSUtils.forEach(instanceMethods, function (name) {
      def[_class].prototype[`DS${DSUtils.pascalCase(name)}`] = function (...args) {
        args.unshift(this[def.idAttribute] || this)
        args.unshift(def.name)
        return _this[name].apply(_this, args)
      }
    })

    // manually add instance proxy for DS#create
    def[_class].prototype.DSCreate = function (...args) {
      args.unshift(this)
      args.unshift(def.name)
      return _this.create.apply(_this, args)
    }

    // Initialize store data for the new resource
    _this.store[def.name] = {
      collection: [],
      expiresHeap: new DSUtils.BinaryHeap(function (x) { return x.expires }, function (x, y) { return x.item === y }),
      completedQueries: {},
      queryData: {},
      pendingQueries: {},
      index: {},
      modified: {},
      saved: {},
      previousAttributes: {},
      observers: {},
      changeHistories: {},
      changeHistory: [],
      collectionModified: 0
    }

    let resource = _this.store[def.name]

    // start the reaping
    if (def.reapInterval) {
      setInterval(() => def.reap(), def.reapInterval)
    }

    // proxy DS methods with shorthand ones
    let fns = ['registerAdapter', 'getAdapterName', 'getAdapter', 'is', '!clear']
    for (let key in _this) {
      if (typeof _this[key] === 'function') {
        fns.push(key)
      }
    }

    /**
     * Create the Resource shorthands that proxy DS methods. e.g.
     *
     * var store = new JSData.DS()
     * var User = store.defineResource('user')
     *
     * store.update(resourceName, id, attrs[, options]) // DS method
     * User.update(id, attrs[, options]) // DS method proxied on a Resource
     */
    DSUtils.forEach(fns, function (key) {
      let k = key
      if (k[0] === '!') {
        return
      }
      if (_this[k].shorthand !== false) {
        def[k] = function (...args) {
          args.unshift(def.name)
          return _this[k].apply(_this, args)
        }
        def[k].before = function (fn) {
          let orig = def[k]
          def[k] = function (...args) {
            return orig.apply(def, fn.apply(def, args) || args)
          }
        }
      } else {
        def[k] = function (...args) { return _this[k].apply(_this, args) }
      }
    })

    def.beforeValidate = DSUtils.promisify(def.beforeValidate)
    def.validate = DSUtils.promisify(def.validate)
    def.afterValidate = DSUtils.promisify(def.afterValidate)
    def.beforeCreate = DSUtils.promisify(def.beforeCreate)
    def.afterCreate = DSUtils.promisify(def.afterCreate)
    def.beforeUpdate = DSUtils.promisify(def.beforeUpdate)
    def.afterUpdate = DSUtils.promisify(def.afterUpdate)
    def.beforeDestroy = DSUtils.promisify(def.beforeDestroy)
    def.afterDestroy = DSUtils.promisify(def.afterDestroy)

    let defaultAdapter
    if (def.hasOwnProperty('defaultAdapter')) {
      defaultAdapter = def.defaultAdapter
    }

    // setup "actions"
    DSUtils.forOwn(def.actions, function (action, name) {
      if (def[name] && !def.actions[name]) {
        throw new Error(`Cannot override existing method "${name}"!`)
      }
      action.request = action.request || function (config) { return config }
      action.response = action.response || function (response) { return response }
      action.responseError = action.responseError || function (err) { return DSUtils.Promise.reject(err) }
      def[name] = function (id, options) {
        if (DSUtils._o(id)) {
          options = id
        }
        options = options || {}
        let adapter = def.getAdapter(action.adapter || defaultAdapter || 'http')
        let config = DSUtils.deepMixIn({}, action)
        if (!options.hasOwnProperty('endpoint') && config.endpoint) {
          options.endpoint = config.endpoint
        }
        if (typeof options.getEndpoint === 'function') {
          config.url = options.getEndpoint(def, options)
        } else {
          let args = [options.basePath || adapter.defaults.basePath || def.basePath, adapter.getEndpoint(def, DSUtils._sn(id) ? id : null, options)]
          if (DSUtils._sn(id)) {
            args.push(id)
          }
          args.push(action.pathname || name)
          config.url = DSUtils.makePath.apply(null, args)
        }
        config.method = config.method || 'GET'
        DSUtils.deepMixIn(config, options)
        return new DSUtils.Promise(function (resolve) { return resolve(config) })
          .then(options.request || action.request)
          .then(function (config) { return adapter.HTTP(config) })
          .then(options.response || action.response, options.responseError || action.responseError)
      }
    })

    // mix in events
    DSUtils.Events(def)

    def.handleChange = function (data) {
      resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified)
      if (def.notify) {
        setTimeout(() => {
          def.emit('DS.change', def, data)
        }, 0)
      }
    }

    def.logFn('Done preparing resource.')

    return def
  } catch (err) {
    _this.defaults.errorFn(err)
    delete definitions[definition.name]
    delete _this.store[definition.name]
    throw err
  }
}
