/* jshint eqeqeq:false */
import {configure} from '../decorators'
import {forOwn, isFunction} from '../utils'
import {Model} from '../model'

// function lifecycleNoopCb (resource, attrs, cb) {
//   cb(null, attrs)
// }

// function lifecycleNoop (resource, attrs) {
//   return attrs
// }

// class Defaults {
//   errorFn (a, b) {
//     if (this.error && typeof this.error === 'function') {
//       try {
//         if (typeof a === 'string') {
//           throw new Error(a)
//         } else {
//           throw a
//         }
//       } catch (err) {
//         a = err
//       }
//       this.error(this.name || null, a || null, b || null)
//     }
//   }
// }

// var defaultsPrototype = Defaults.prototype

// defaultsPrototype.actions = {}
// defaultsPrototype.afterCreate = lifecycleNoopCb
// defaultsPrototype.afterCreateCollection = lifecycleNoop
// defaultsPrototype.afterCreateInstance = lifecycleNoop
// defaultsPrototype.afterDestroy = lifecycleNoopCb
// defaultsPrototype.afterEject = lifecycleNoop
// defaultsPrototype.afterFind = lifecycleNoopCb
// defaultsPrototype.afterFindAll = lifecycleNoopCb
// defaultsPrototype.afterInject = lifecycleNoop
// defaultsPrototype.afterLoadRelations = lifecycleNoopCb
// defaultsPrototype.afterReap = lifecycleNoop
// defaultsPrototype.afterUpdate = lifecycleNoopCb
// defaultsPrototype.afterValidate = lifecycleNoopCb
// defaultsPrototype.allowSimpleWhere = true
// defaultsPrototype.basePath = ''
// defaultsPrototype.beforeCreate = lifecycleNoopCb
// defaultsPrototype.beforeCreateCollection = lifecycleNoop
// defaultsPrototype.beforeCreateInstance = lifecycleNoop
// defaultsPrototype.beforeDestroy = lifecycleNoopCb
// defaultsPrototype.beforeEject = lifecycleNoop
// defaultsPrototype.beforeInject = lifecycleNoop
// defaultsPrototype.beforeReap = lifecycleNoop
// defaultsPrototype.beforeUpdate = lifecycleNoopCb
// defaultsPrototype.beforeValidate = lifecycleNoopCb
// defaultsPrototype.bypassCache = false
// defaultsPrototype.cacheResponse = !!DSUtils.w
// defaultsPrototype.csp = false
// defaultsPrototype.clearEmptyQueries = true
// defaultsPrototype.computed = {}
// defaultsPrototype.defaultAdapter = 'http'
// defaultsPrototype.debug = false
// defaultsPrototype.defaultValues = {}
// defaultsPrototype.eagerEject = false
// // TODO: Implement eagerInject in DS#create
// defaultsPrototype.eagerInject = false
// defaultsPrototype.endpoint = ''
// defaultsPrototype.error = console ? (a, b, c) => console[typeof console.error === 'function' ? 'error' : 'log'](a, b, c) : false
// defaultsPrototype.errorHandler = function (...args) {
//   return DSUtils.Promise.reject(args[0])
// }
// defaultsPrototype.fallbackAdapters = ['http']
// defaultsPrototype.findStrictCache = false
// defaultsPrototype.idAttribute = 'id'
// defaultsPrototype.ignoredChanges = [/\$/]
// defaultsPrototype.instanceEvents = !!DSUtils.w
// defaultsPrototype.keepChangeHistory = false
// defaultsPrototype.linkRelations = !!DSUtils.w
// defaultsPrototype.log = console ? (a, b, c, d, e) => console[typeof console.info === 'function' ? 'info' : 'log'](a, b, c, d, e) : false

// defaultsPrototype.logFn = function (a, b, c, d) {
//   let _this = this
//   if (_this.debug && _this.log && typeof _this.log === 'function') {
//     _this.log(_this.name || null, a || null, b || null, c || null, d || null)
//   }
// }

// defaultsPrototype.maxAge = false
// defaultsPrototype.methods = {}
// defaultsPrototype.notify = !!DSUtils.w
// defaultsPrototype.omit = []
// defaultsPrototype.onConflict = 'merge'
// defaultsPrototype.reapAction = DSUtils.w ? 'inject' : 'none'
// defaultsPrototype.reapInterval = DSUtils.w ? 30000 : false
// defaultsPrototype.relationsEnumerable = false
// defaultsPrototype.resetHistoryOnInject = true
// defaultsPrototype.returnMeta = false
// defaultsPrototype.scopes = {}
// defaultsPrototype.strategy = 'single'
// defaultsPrototype.upsert = !!DSUtils.w
// defaultsPrototype.useClass = true
// defaultsPrototype.useFilter = false
// defaultsPrototype.validate = lifecycleNoopCb
// defaultsPrototype.watchChanges = !!DSUtils.w

// class _DS {
//   constructor (options) {
//     let _this = this
//     options = options || {}

//     _this.store = {}
//     _this.definitions = {}
//     _this.adapters = {}
//     _this.defaults = new Defaults()
//     _this.observe = DSUtils.observe
//     DSUtils.forOwn(options, function (v, k) {
//       if (k === 'omit') {
//         _this.defaults.omit = v.concat(Defaults.prototype.omit)
//       } else {
//         _this.defaults[k] = v
//       }
//     })
//     _this.defaults.logFn('new data store created', _this.defaults)

//     DSUtils.Events(_this)
//   }

//   getAdapterName (options) {
//     let errorIfNotExist = false
//     options = options || {}
//     this.defaults.logFn('getAdapterName', options)
//     if (DSUtils._s(options)) {
//       errorIfNotExist = true
//       options = {
//         adapter: options
//       }
//     }
//     if (this.adapters[options.adapter]) {
//       return options.adapter
//     } else if (errorIfNotExist) {
//       throw new Error(`${options.adapter} is not a registered adapter!`)
//     } else {
//       return options.defaultAdapter
//     }
//   }

//   getAdapter (options) {
//     options = options || {}
//     this.defaults.logFn('getAdapter', options)
//     return this.adapters[this.getAdapterName(options)]
//   }

//   registerAdapter (name, Adapter, options) {
//     let _this = this
//     options = options || {}
//     _this.defaults.logFn('registerAdapter', name, Adapter, options)
//     if (DSUtils.isFunction(Adapter)) {
//       _this.adapters[name] = new Adapter(options)
//     } else {
//       _this.adapters[name] = Adapter
//     }
//     if (options.default) {
//       _this.defaults.defaultAdapter = name
//     }
//     _this.defaults.logFn(`default adapter is ${_this.defaults.defaultAdapter}`)
//   }

//   errorFn (...args) {
//     let options = args[args.length - 1]
//     let defaultHandler = this.defaults.errorHandler
//     let errorHandler = options ? options.errorHandler : defaultHandler
//     errorHandler = errorHandler || defaultHandler
//     return function (err) {
//       return errorHandler(err, ...args)
//     }
//   }
// }

// var dsPrototype = _DS.prototype

// dsPrototype.getAdapterName.shorthand = false
// dsPrototype.getAdapter.shorthand = false
// dsPrototype.registerAdapter.shorthand = false
// dsPrototype.errors = DSErrors
// dsPrototype.utils = DSUtils

export function DS (opts) {
  opts || (opts = {})
  this.definitions = {}
}

configure({
  clear () {
    const ejected = {}
    forOwn(this.definitions, definition => {
      const name = definition.name
      ejected[name] = definition.ejectAll()
    })
    return ejected
  },

  defineModel (opts) {
    const Child = Model.extend(opts.methods || {}, opts)
    this.definitions[Child.name] = Child
    return Child
  }
})(DS.prototype)

DS.prototype.defineResource = DS.prototype.defineModel

forOwn(Model, function (value, key) {
  if (isFunction(value)) {
    DS.prototype[key] = function (name, ...args) {
      if (!this.definitions[name]) {
        throw new Error(`${name} is not a registered Model!`)
      }
      return this.definitions[name][key](...args)
    }
  }
})
