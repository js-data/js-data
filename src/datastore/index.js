/* jshint eqeqeq:false */
import DSUtils from '../utils'
import DSErrors from '../errors'
import syncMethods from './sync_methods/index'
import asyncMethods from './async_methods/index'

function lifecycleNoopCb (resource, attrs, cb) {
  cb(null, attrs)
}

function lifecycleNoop (resource, attrs) {
  return attrs
}

function compare (orderBy, index, a, b) {
  let def = orderBy[index]
  let cA = DSUtils.get(a, def[0])
  let cB = DSUtils.get(b, def[0])
  if (DSUtils._s(cA)) {
    cA = DSUtils.upperCase(cA)
  }
  if (DSUtils._s(cB)) {
    cB = DSUtils.upperCase(cB)
  }
  if (def[1] === 'DESC') {
    if (cB < cA) {
      return -1
    } else if (cB > cA) {
      return 1
    } else {
      if (index < orderBy.length - 1) {
        return compare(orderBy, index + 1, a, b)
      } else {
        return 0
      }
    }
  } else {
    if (cA < cB) {
      return -1
    } else if (cA > cB) {
      return 1
    } else {
      if (index < orderBy.length - 1) {
        return compare(orderBy, index + 1, a, b)
      } else {
        return 0
      }
    }
  }
}

class Defaults {
  errorFn (a, b) {
    if (this.error && typeof this.error === 'function') {
      try {
        if (typeof a === 'string') {
          throw new Error(a)
        } else {
          throw a
        }
      } catch (err) {
        a = err
      }
      this.error(this.name || null, a || null, b || null)
    }
  }
}

var defaultsPrototype = Defaults.prototype

defaultsPrototype.actions = {}
defaultsPrototype.afterCreate = lifecycleNoopCb
defaultsPrototype.afterCreateCollection = lifecycleNoop
defaultsPrototype.afterCreateInstance = lifecycleNoop
defaultsPrototype.afterDestroy = lifecycleNoopCb
defaultsPrototype.afterEject = lifecycleNoop
defaultsPrototype.afterFind = lifecycleNoopCb
defaultsPrototype.afterFindAll = lifecycleNoopCb
defaultsPrototype.afterInject = lifecycleNoop
defaultsPrototype.afterLoadRelations = lifecycleNoopCb
defaultsPrototype.afterReap = lifecycleNoop
defaultsPrototype.afterUpdate = lifecycleNoopCb
defaultsPrototype.afterValidate = lifecycleNoopCb
defaultsPrototype.allowSimpleWhere = true
defaultsPrototype.basePath = ''
defaultsPrototype.beforeCreate = lifecycleNoopCb
defaultsPrototype.beforeCreateCollection = lifecycleNoop
defaultsPrototype.beforeCreateInstance = lifecycleNoop
defaultsPrototype.beforeDestroy = lifecycleNoopCb
defaultsPrototype.beforeEject = lifecycleNoop
defaultsPrototype.beforeInject = lifecycleNoop
defaultsPrototype.beforeReap = lifecycleNoop
defaultsPrototype.beforeUpdate = lifecycleNoopCb
defaultsPrototype.beforeValidate = lifecycleNoopCb
defaultsPrototype.bypassCache = false
defaultsPrototype.cacheResponse = !!DSUtils.w
defaultsPrototype.csp = false
defaultsPrototype.clearEmptyQueries = true
defaultsPrototype.computed = {}
defaultsPrototype.defaultAdapter = 'http'
defaultsPrototype.debug = false
defaultsPrototype.defaultValues = {}
defaultsPrototype.eagerEject = false
// TODO: Implement eagerInject in DS#create
defaultsPrototype.eagerInject = false
defaultsPrototype.endpoint = ''
defaultsPrototype.error = console ? (a, b, c) => console[typeof console.error === 'function' ? 'error' : 'log'](a, b, c) : false
defaultsPrototype.errorHandler = function (...args) {
  return DSUtils.Promise.reject(args[0])
}
defaultsPrototype.fallbackAdapters = ['http']
defaultsPrototype.findStrictCache = false
defaultsPrototype.idAttribute = 'id'
defaultsPrototype.ignoredChanges = [/\$/]
defaultsPrototype.instanceEvents = !!DSUtils.w
defaultsPrototype.keepChangeHistory = false
defaultsPrototype.linkRelations = !!DSUtils.w
defaultsPrototype.log = console ? (a, b, c, d, e) => console[typeof console.info === 'function' ? 'info' : 'log'](a, b, c, d, e) : false

defaultsPrototype.logFn = function (a, b, c, d) {
  let _this = this
  if (_this.debug && _this.log && typeof _this.log === 'function') {
    _this.log(_this.name || null, a || null, b || null, c || null, d || null)
  }
}

defaultsPrototype.maxAge = false
defaultsPrototype.methods = {}
defaultsPrototype.notify = !!DSUtils.w
defaultsPrototype.omit = []
defaultsPrototype.onConflict = 'merge'
defaultsPrototype.reapAction = DSUtils.w ? 'inject' : 'none'
defaultsPrototype.reapInterval = DSUtils.w ? 30000 : false
defaultsPrototype.relationsEnumerable = false
defaultsPrototype.resetHistoryOnInject = true
defaultsPrototype.returnMeta = false
defaultsPrototype.scopes = {}
defaultsPrototype.strategy = 'single'
defaultsPrototype.upsert = !!DSUtils.w
defaultsPrototype.useClass = true
defaultsPrototype.useFilter = false
defaultsPrototype.validate = lifecycleNoopCb
defaultsPrototype.watchChanges = !!DSUtils.w

let escapeRegExp = /([.*+?^=!:${}()|[\]\/\\])/g
let percentRegExp = /%/g
let underscoreRegExp = /_/g

function escape (pattern) {
  return pattern.replace(escapeRegExp, '\\$1')
}

function like (pattern, flags) {
  return new RegExp(`^${(escape(pattern).replace(percentRegExp, '.*').replace(underscoreRegExp, '.'))}$`, flags)
}

defaultsPrototype.defaultFilter = function (collection, resourceName, params, options) {
  let definition = this.definitions[resourceName]
  let idA = 'id'
  let resource
  if (definition) {
    idA = definition.idAttribute
    resource = this.store[resourceName]
  }
  let filtered = collection
  let where = null
  let reserved = {
    skip: '',
    offset: '',
    where: '',
    limit: '',
    orderBy: '',
    sort: ''
  }

  params = params || {}
  options = options || {}

  if (DSUtils._o(params.where)) {
    where = params.where
  } else {
    where = {}
  }

  if (options.allowSimpleWhere) {
    DSUtils.forOwn(params, function (value, key) {
      if (!(key in reserved) && !(key in where)) {
        where[key] = {
          '==': value
        }
      }
    })
  }

  if (DSUtils.isEmpty(where)) {
    where = null
  }

  if (where) {
    filtered = DSUtils.filter(filtered, function (attrs) {
      let first = true
      let keep = true

      if (options.excludeTemporary && resource && resource.temporaryItems[attrs[idA]]) {
        return false
      }

      DSUtils.forOwn(where, function (clause, field) {
        if (!DSUtils._o(clause)) {
          clause = {
            '==': clause
          }
        }
        DSUtils.forOwn(clause, function (term, op) {
          let expr
          let isOr = op[0] === '|'
          let val = DSUtils.get(attrs, field)
          op = isOr ? op.substr(1) : op
          if (op === '==') {
            expr = val == term // eslint-disable-line
          } else if (op === '===') {
            expr = val === term
          } else if (op === '!=') {
            expr = val != term // eslint-disable-line
          } else if (op === '!==') {
            expr = val !== term
          } else if (op === '>') {
            expr = val > term
          } else if (op === '>=') {
            expr = val >= term
          } else if (op === '<') {
            expr = val < term
          } else if (op === '<=') {
            expr = val <= term
          } else if (op === 'isectEmpty') {
            expr = !DSUtils.intersection((val || []), (term || [])).length
          } else if (op === 'isectNotEmpty') {
            expr = DSUtils.intersection((val || []), (term || [])).length
          } else if (op === 'in') {
            if (DSUtils._s(term)) {
              expr = term.indexOf(val) !== -1
            } else {
              expr = DSUtils.contains(term, val)
            }
          } else if (op === 'notIn') {
            if (DSUtils._s(term)) {
              expr = term.indexOf(val) === -1
            } else {
              expr = !DSUtils.contains(term, val)
            }
          } else if (op.indexOf('like') === 0) {
            expr = like(term, op.substr(4)).exec(val) !== null
          } else if (op.indexOf('notLike') === 0) {
            expr = like(term, op.substr(7)).exec(val) === null
          } else if (op === 'contains') {
            if (DSUtils._s(val)) {
              expr = val.indexOf(term) !== -1
            } else {
              expr = DSUtils.contains(val, term)
            }
          } else if (op === 'notContains') {
            if (DSUtils._s(val)) {
              expr = val.indexOf(term) === -1
            } else {
              expr = !DSUtils.contains(val, term)
            }
          }
          if (expr !== undefined) {
            keep = first ? expr : (isOr ? keep || expr : keep && expr)
          }
          first = false
        })
      })

      return keep
    })
  } else if (options.excludeTemporary && resource) {
    filtered = DSUtils.filter(filtered, function (attrs) {
      return resource.temporaryItems[attrs[idA]]
    })
  }

  let orderBy = null

  if (DSUtils._s(params.orderBy)) {
    orderBy = [
      [params.orderBy, 'ASC']
    ]
  } else if (DSUtils._a(params.orderBy)) {
    orderBy = params.orderBy
  }

  if (!orderBy && DSUtils._s(params.sort)) {
    orderBy = [
      [params.sort, 'ASC']
    ]
  } else if (!orderBy && DSUtils._a(params.sort)) {
    orderBy = params.sort
  }

  // Apply 'orderBy'
  if (orderBy) {
    let index = 0
    DSUtils.forEach(orderBy, function (def, i) {
      if (DSUtils._s(def)) {
        orderBy[i] = [def, 'ASC']
      } else if (!DSUtils._a(def)) {
        throw new DSErrors.IA(`DS.filter("${resourceName}"[, params][, options]): ${DSUtils.toJson(def)}: Must be a string or an array!`, {
          params: {
            'orderBy[i]': {
              actual: typeof def,
              expected: 'string|array'
            }
          }
        })
      }
    })
    filtered = DSUtils.sort(filtered, function (a, b) {
      return compare(orderBy, index, a, b)
    })
  }

  let limit = DSUtils._n(params.limit) ? params.limit : null
  let skip = null

  if (DSUtils._n(params.skip)) {
    skip = params.skip
  } else if (DSUtils._n(params.offset)) {
    skip = params.offset
  }

  // Apply 'limit' and 'skip'
  if (limit && skip) {
    filtered = DSUtils.slice(filtered, skip, Math.min(filtered.length, skip + limit))
  } else if (DSUtils._n(limit)) {
    filtered = DSUtils.slice(filtered, 0, Math.min(filtered.length, limit))
  } else if (DSUtils._n(skip)) {
    if (skip < filtered.length) {
      filtered = DSUtils.slice(filtered, skip)
    } else {
      filtered = []
    }
  }

  return filtered === collection ? filtered.slice() : filtered
}

class DS {
  constructor (options) {
    let _this = this
    options = options || {}

    _this.store = {}
    _this.definitions = {}
    _this.adapters = {}
    _this.defaults = new Defaults()
    _this.observe = DSUtils.observe
    DSUtils.forOwn(options, function (v, k) {
      if (k === 'omit') {
        _this.defaults.omit = v.concat(Defaults.prototype.omit)
      } else {
        _this.defaults[k] = v
      }
    })
    _this.defaults.logFn('new data store created', _this.defaults)

    let P = DSUtils.Promise

    if (P && !P.prototype.spread) {
      P.prototype.spread = function (cb) {
        return this.then(function (arr) {
          return cb.apply(this, arr)
        })
      }
    }

    DSUtils.Events(_this)
  }

  getAdapterName (options) {
    let errorIfNotExist = false
    options = options || {}
    this.defaults.logFn('getAdapterName', options)
    if (DSUtils._s(options)) {
      errorIfNotExist = true
      options = {
        adapter: options
      }
    }
    if (this.adapters[options.adapter]) {
      return options.adapter
    } else if (errorIfNotExist) {
      throw new Error(`${options.adapter} is not a registered adapter!`)
    } else {
      return options.defaultAdapter
    }
  }

  getAdapter (options) {
    options = options || {}
    this.defaults.logFn('getAdapter', options)
    return this.adapters[this.getAdapterName(options)]
  }

  registerAdapter (name, Adapter, options) {
    let _this = this
    options = options || {}
    _this.defaults.logFn('registerAdapter', name, Adapter, options)
    if (DSUtils.isFunction(Adapter)) {
      _this.adapters[name] = new Adapter(options)
    } else {
      _this.adapters[name] = Adapter
    }
    if (options.default) {
      _this.defaults.defaultAdapter = name
    }
    _this.defaults.logFn(`default adapter is ${_this.defaults.defaultAdapter}`)
  }

  is (resourceName, instance) {
    let definition = this.definitions[resourceName]
    if (!definition) {
      throw new DSErrors.NER(resourceName)
    }
    return instance instanceof definition[definition.class]
  }

  clear () {
    let ejected = {}
    DSUtils.forOwn(this.definitions, (definition) => {
      let name = definition.name
      ejected[name] = definition.ejectAll()
      this.store[name].completedQueries = {}
      this.store[name].queryData = {}
    })
    return ejected
  }

  errorFn (...args) {
    let options = args[args.length - 1]
    let defaultHandler = this.defaults.errorHandler
    let errorHandler = options ? options.errorHandler : defaultHandler
    errorHandler = errorHandler || defaultHandler
    return function (err) {
      return errorHandler(err, ...args)
    }
  }
}

var dsPrototype = DS.prototype

dsPrototype.getAdapterName.shorthand = false
dsPrototype.getAdapter.shorthand = false
dsPrototype.registerAdapter.shorthand = false
dsPrototype.errors = DSErrors
dsPrototype.utils = DSUtils

function addMethods (target, obj) {
  DSUtils.forOwn(obj, function (v, k) {
    target[k] = v
    target[k].before = function (fn) {
      let orig = target[k]
      target[k] = function (...args) {
        return orig.apply(this, fn.apply(this, args) || args)
      }
    }
  })
}

addMethods(dsPrototype, syncMethods)
addMethods(dsPrototype, asyncMethods)

export default DS
