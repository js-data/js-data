var DSUtils = require('../utils');
var DSErrors = require('../errors');
var syncMethods = require('./sync_methods');
var asyncMethods = require('./async_methods');
var Schemator;

function lifecycleNoopCb(resource, attrs, cb) {
  cb(null, attrs);
}

function lifecycleNoop(resource, attrs) {
  return attrs;
}

function compare(orderBy, index, a, b) {
  var def = orderBy[index];
  var cA = a[def[0]], cB = b[def[0]];
  if (DSUtils.isString(cA)) {
    cA = DSUtils.upperCase(cA);
  }
  if (DSUtils.isString(cB)) {
    cB = DSUtils.upperCase(cB);
  }
  if (def[1] === 'DESC') {
    if (cB < cA) {
      return -1;
    } else if (cB > cA) {
      return 1;
    } else {
      if (index < orderBy.length - 1) {
        return compare(orderBy, index + 1, a, b);
      } else {
        return 0;
      }
    }
  } else {
    if (cA < cB) {
      return -1;
    } else if (cA > cB) {
      return 1;
    } else {
      if (index < orderBy.length - 1) {
        return compare(orderBy, index + 1, a, b);
      } else {
        return 0;
      }
    }
  }
}

function Defaults() {
}

var defaultsPrototype = Defaults.prototype;

defaultsPrototype.afterCreate = lifecycleNoopCb;
defaultsPrototype.afterCreateInstance = lifecycleNoop;
defaultsPrototype.afterDestroy = lifecycleNoopCb;
defaultsPrototype.afterEject = lifecycleNoop;
defaultsPrototype.afterInject = lifecycleNoop;
defaultsPrototype.afterReap = lifecycleNoop;
defaultsPrototype.afterUpdate = lifecycleNoopCb;
defaultsPrototype.afterValidate = lifecycleNoopCb;
defaultsPrototype.allowSimpleWhere = true;
defaultsPrototype.basePath = '';
defaultsPrototype.beforeCreate = lifecycleNoopCb;
defaultsPrototype.beforeCreateInstance = lifecycleNoop;
defaultsPrototype.beforeDestroy = lifecycleNoopCb;
defaultsPrototype.beforeEject = lifecycleNoop;
defaultsPrototype.beforeInject = lifecycleNoop;
defaultsPrototype.beforeReap = lifecycleNoop;
defaultsPrototype.beforeUpdate = lifecycleNoopCb;
defaultsPrototype.beforeValidate = lifecycleNoopCb;
defaultsPrototype.bypassCache = false;
defaultsPrototype.cacheResponse = !!DSUtils.w;
defaultsPrototype.defaultAdapter = 'http';
defaultsPrototype.eagerEject = false;
// TODO: Implement eagerInject in DS#create
defaultsPrototype.eagerInject = false;
defaultsPrototype.endpoint = '';
defaultsPrototype.fallbackAdapters = ['http'];
defaultsPrototype.findBelongsTo = true;
defaultsPrototype.findHasOne = true;
defaultsPrototype.findHasMany = true;
defaultsPrototype.findInverseLinks = true;
defaultsPrototype.idAttribute = 'id';
defaultsPrototype.ignoredChanges = [/\$/];
defaultsPrototype.ignoreMissing = false;
defaultsPrototype.keepChangeHistory = false;
defaultsPrototype.loadFromServer = false;
defaultsPrototype.maxAge = false;
defaultsPrototype.notify = !!DSUtils.w;
defaultsPrototype.reapAction = !!DSUtils.w ? 'inject' : 'none';
defaultsPrototype.reapInterval = !!DSUtils.w ? 30000 : false;
defaultsPrototype.resetHistoryOnInject = true;
defaultsPrototype.strategy = 'single';
defaultsPrototype.upsert = !!DSUtils.w;
defaultsPrototype.useClass = true;
defaultsPrototype.validate = lifecycleNoopCb;
defaultsPrototype.defaultFilter = function (collection, resourceName, params, options) {
  var _this = this;
  var filtered = collection;
  var where = null;
  var reserved = {
    skip: '',
    offset: '',
    where: '',
    limit: '',
    orderBy: '',
    sort: ''
  };

  params = params || {};
  options = options || {};

  if (DSUtils.isObject(params.where)) {
    where = params.where;
  } else {
    where = {};
  }

  if (options.allowSimpleWhere) {
    DSUtils.forOwn(params, function (value, key) {
      if (!(key in reserved) && !(key in where)) {
        where[key] = {
          '==': value
        };
      }
    });
  }

  if (DSUtils.isEmpty(where)) {
    where = null;
  }

  if (where) {
    filtered = DSUtils.filter(filtered, function (attrs) {
      var first = true;
      var keep = true;
      DSUtils.forOwn(where, function (clause, field) {
        if (DSUtils.isString(clause)) {
          clause = {
            '===': clause
          };
        } else if (DSUtils.isNumber(clause) || DSUtils.isBoolean(clause)) {
          clause = {
            '==': clause
          };
        }
        if (DSUtils.isObject(clause)) {
          DSUtils.forOwn(clause, function (term, op) {
            var expr;
            var isOr = op[0] === '|';
            var val = attrs[field];
            op = isOr ? op.substr(1) : op;
            if (op === '==') {
              expr = val == term;
            } else if (op === '===') {
              expr = val === term;
            } else if (op === '!=') {
              expr = val != term;
            } else if (op === '!==') {
              expr = val !== term;
            } else if (op === '>') {
              expr = val > term;
            } else if (op === '>=') {
              expr = val >= term;
            } else if (op === '<') {
              expr = val < term;
            } else if (op === '<=') {
              expr = val <= term;
            } else if (op === 'isectEmpty') {
              expr = !DSUtils.intersection((val || []), (term || [])).length;
            } else if (op === 'isectNotEmpty') {
              expr = DSUtils.intersection((val || []), (term || [])).length;
            } else if (op === 'in') {
              if (DSUtils.isString(term)) {
                expr = term.indexOf(val) !== -1;
              } else {
                expr = DSUtils.contains(term, val);
              }
            } else if (op === 'notIn') {
              if (DSUtils.isString(term)) {
                expr = term.indexOf(val) === -1;
              } else {
                expr = !DSUtils.contains(term, val);
              }
            }
            if (expr !== undefined) {
              keep = first ? expr : (isOr ? keep || expr : keep && expr);
            }
            first = false;
          });
        }
      });
      return keep;
    });
  }

  var orderBy = null;

  if (DSUtils.isString(params.orderBy)) {
    orderBy = [
      [params.orderBy, 'ASC']
    ];
  } else if (DSUtils.isArray(params.orderBy)) {
    orderBy = params.orderBy;
  }

  if (!orderBy && DSUtils.isString(params.sort)) {
    orderBy = [
      [params.sort, 'ASC']
    ];
  } else if (!orderBy && DSUtils.isArray(params.sort)) {
    orderBy = params.sort;
  }

  // Apply 'orderBy'
  if (orderBy) {
    var index = 0;
    DSUtils.forEach(orderBy, function (def, i) {
      if (DSUtils.isString(def)) {
        orderBy[i] = [def, 'ASC'];
      } else if (!DSUtils.isArray(def)) {
        throw new _this.errors.IllegalArgumentError('DS.filter(resourceName[, params][, options]): ' + DSUtils.toJson(def) + ': Must be a string or an array!', {
          params: {
            'orderBy[i]': {
              actual: typeof def,
              expected: 'string|array'
            }
          }
        });
      }
    });
    filtered = DSUtils.sort(filtered, function (a, b) {
      return compare(orderBy, index, a, b);
    });
  }

  var limit = DSUtils.isNumber(params.limit) ? params.limit : null;
  var skip = null;

  if (DSUtils.isNumber(params.skip)) {
    skip = params.skip;
  } else if (DSUtils.isNumber(params.offset)) {
    skip = params.offset;
  }

  // Apply 'limit' and 'skip'
  if (limit && skip) {
    filtered = DSUtils.slice(filtered, skip, Math.min(filtered.length, skip + limit));
  } else if (DSUtils.isNumber(limit)) {
    filtered = DSUtils.slice(filtered, 0, Math.min(filtered.length, limit));
  } else if (DSUtils.isNumber(skip)) {
    if (skip < filtered.length) {
      filtered = DSUtils.slice(filtered, skip);
    } else {
      filtered = [];
    }
  }

  return filtered;
};

function DS(options) {
  options = options || {};

  try {
    Schemator = require('js-data-schema');
  } catch (e) {
  }

  if (!Schemator) {
    try {
      Schemator = window.Schemator;
    } catch (e) {
    }
  }

  if (Schemator || options.schemator) {
    this.schemator = options.schemator || new Schemator();
  }

  this.store = {};
  this.definitions = {};
  this.adapters = {};
  this.defaults = new Defaults();
  this.observe = DSUtils.observe;
  DSUtils.deepMixIn(this.defaults, options);
}

var dsPrototype = DS.prototype;

dsPrototype.getAdapter = function (options) {
  var errorIfNotExist = false;
  options = options || {};
  if (DSUtils.isString(options)) {
    errorIfNotExist = true;
    options = {
      adapter: options
    };
  }
  var adapter = this.adapters[options.adapter];
  if (adapter) {
    return adapter;
  } else if (errorIfNotExist) {
    throw new Error(options.adapter + ' is not a registered adapter!');
  } else {
    return this.adapters[options.defaultAdapter];
  }
};

dsPrototype.registerAdapter = function (name, Adapter, options) {
  options = options || {};
  if (DSUtils.isFunction(Adapter)) {
    this.adapters[name] = new Adapter(options);
  } else {
    this.adapters[name] = Adapter;
  }
  if (options.default) {
    this.defaults.defaultAdapter = name;
  }
};

dsPrototype.emit = function (definition, event) {
  var args = Array.prototype.slice.call(arguments, 2);
  args.unshift(definition.name);
  args.unshift('DS.' + event);
  definition.emit.apply(definition, args);
};

dsPrototype.errors = require('../errors');
dsPrototype.utils = DSUtils;
DSUtils.deepMixIn(dsPrototype, syncMethods);
DSUtils.deepMixIn(dsPrototype, asyncMethods);

module.exports = DS;
