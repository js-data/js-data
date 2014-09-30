var DSUtils = require('../utils');
var DSErrors = require('../errors');
var syncMethods = require('./sync_methods');
var asyncMethods = require('./async_methods');

DSUtils.deepFreeze(syncMethods);
DSUtils.deepFreeze(asyncMethods);
DSUtils.deepFreeze(DSErrors);
DSUtils.deepFreeze(DSUtils);

function lifecycleNoopCb(resourceName, attrs, cb) {
  cb(null, attrs);
}

function lifecycleNoop(resourceName, attrs) {
  return attrs;
}

function Defaults() {
}

var defaultsPrototype = Defaults.prototype;

defaultsPrototype.idAttribute = 'id';
defaultsPrototype.defaultAdapter = 'DSHttpAdapter';
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
          DSUtils.forOwn(clause, function (val, op) {
            if (op === '==') {
              keep = first ? (attrs[field] == val) : keep && (attrs[field] == val);
            } else if (op === '===') {
              keep = first ? (attrs[field] === val) : keep && (attrs[field] === val);
            } else if (op === '!=') {
              keep = first ? (attrs[field] != val) : keep && (attrs[field] != val);
            } else if (op === '!==') {
              keep = first ? (attrs[field] !== val) : keep && (attrs[field] !== val);
            } else if (op === '>') {
              keep = first ? (attrs[field] > val) : keep && (attrs[field] > val);
            } else if (op === '>=') {
              keep = first ? (attrs[field] >= val) : keep && (attrs[field] >= val);
            } else if (op === '<') {
              keep = first ? (attrs[field] < val) : keep && (attrs[field] < val);
            } else if (op === '<=') {
              keep = first ? (attrs[field] <= val) : keep && (attrs[field] <= val);
            } else if (op === 'in') {
              keep = first ? DSUtils.contains(val, attrs[field]) : keep && DSUtils.contains(val, attrs[field]);
            } else if (op === 'notIn') {
              keep = first ? !DSUtils.contains(val, attrs[field]) : keep && !DSUtils.contains(val, attrs[field]);
            } else if (op === '|==') {
              keep = first ? (attrs[field] == val) : keep || (attrs[field] == val);
            } else if (op === '|===') {
              keep = first ? (attrs[field] === val) : keep || (attrs[field] === val);
            } else if (op === '|!=') {
              keep = first ? (attrs[field] != val) : keep || (attrs[field] != val);
            } else if (op === '|!==') {
              keep = first ? (attrs[field] !== val) : keep || (attrs[field] !== val);
            } else if (op === '|>') {
              keep = first ? (attrs[field] > val) : keep || (attrs[field] > val);
            } else if (op === '|>=') {
              keep = first ? (attrs[field] >= val) : keep || (attrs[field] >= val);
            } else if (op === '|<') {
              keep = first ? (attrs[field] < val) : keep || (attrs[field] < val);
            } else if (op === '|<=') {
              keep = first ? (attrs[field] <= val) : keep || (attrs[field] <= val);
            } else if (op === '|in') {
              keep = first ? DSUtils.contains(val, attrs[field]) : keep || DSUtils.contains(val, attrs[field]);
            } else if (op === '|notIn') {
              keep = first ? !DSUtils.contains(val, attrs[field]) : keep || !DSUtils.contains(val, attrs[field]);
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
    DSUtils.forEach(orderBy, function (def) {
      if (DSUtils.isString(def)) {
        def = [def, 'ASC'];
      } else if (!DSUtils.isArray(def)) {
        throw new _this.errors.IllegalArgumentError('DS.filter(resourceName[, params][, options]): ' + DSUtils.toJson(def) + ': Must be a string or an array!', { params: { 'orderBy[i]': { actual: typeof def, expected: 'string|array' } } });
      }
      filtered = DSUtils.sort(filtered, function (a, b) {
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
            return 0;
          }
        } else {
          if (cA < cB) {
            return -1;
          } else if (cA > cB) {
            return 1;
          } else {
            return 0;
          }
        }
      });
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
defaultsPrototype.basePath = '';
defaultsPrototype.endpoint = '';
defaultsPrototype.useClass = true;
defaultsPrototype.keepChangeHistory = false;
defaultsPrototype.resetHistoryOnInject = true;
defaultsPrototype.eagerEject = false;
// TODO: Implement eagerInject in DS#create
defaultsPrototype.eagerInject = false;
defaultsPrototype.allowSimpleWhere = true;
defaultsPrototype.loadFromServer = false;
defaultsPrototype.notify = true;
defaultsPrototype.upsert = true;
defaultsPrototype.cacheResponse = true;
defaultsPrototype.bypassCache = false;
defaultsPrototype.findInverseLinks = false;
defaultsPrototype.findBelongsTo = false;
defaultsPrototype.findHasOn = false;
defaultsPrototype.findHasMany = false;
defaultsPrototype.beforeValidate = lifecycleNoopCb;
defaultsPrototype.validate = lifecycleNoopCb;
defaultsPrototype.afterValidate = lifecycleNoopCb;
defaultsPrototype.beforeCreate = lifecycleNoopCb;
defaultsPrototype.afterCreate = lifecycleNoopCb;
defaultsPrototype.beforeUpdate = lifecycleNoopCb;
defaultsPrototype.afterUpdate = lifecycleNoopCb;
defaultsPrototype.beforeDestroy = lifecycleNoopCb;
defaultsPrototype.afterDestroy = lifecycleNoopCb;
defaultsPrototype.beforeInject = lifecycleNoop;
defaultsPrototype.afterInject = lifecycleNoop;
defaultsPrototype.beforeEject = lifecycleNoop;
defaultsPrototype.afterEject = lifecycleNoop;

function DS(options) {
  this.store = {};
  this.definitions = {};
  this.adapters = {};
  this.defaults = new Defaults();
  DSUtils.deepMixIn(this.defaults, options);
}

var dsPrototype = DS.prototype;

dsPrototype.getAdapter = function (def, options) {
  options = options || {};
  return this.adapters[options.adapter] || this.adapters[def.defaultAdapter];
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
