/*jshint evil:true, loopfunc:true*/
var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function Resource(options) {

  DSUtils.deepMixIn(this, options);

  if ('endpoint' in options) {
    this.endpoint = options.endpoint;
  } else {
    this.endpoint = this.name;
  }
}

var instanceMethods = [
  'compute',
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
  'link',
  'linkInverse',
  'previous',
  'unlinkInverse'
];

function defineResource(definition) {
  var _this = this;
  var definitions = _this.definitions;

  if (DSUtils.isString(definition)) {
    definition = {
      name: definition.replace(/\s/gi, '')
    };
  }
  if (!DSUtils.isObject(definition)) {
    throw new DSErrors.IA('"definition" must be an object!');
  } else if (!DSUtils.isString(definition.name)) {
    throw new DSErrors.IA('"name" must be a string!');
  } else if (_this.store[definition.name]) {
    throw new DSErrors.R(definition.name + ' is already registered!');
  }

  try {
    // Inherit from global defaults
    Resource.prototype = _this.defaults;
    definitions[definition.name] = new Resource(definition);

    var def = definitions[definition.name];

    if (!DSUtils.isString(def.idAttribute)) {
      throw new DSErrors.IA('"idAttribute" must be a string!');
    }

    // Setup nested parent configuration
    if (def.relations) {
      def.relationList = [];
      def.relationFields = [];
      DSUtils.forOwn(def.relations, function (relatedModels, type) {
        DSUtils.forOwn(relatedModels, function (defs, relationName) {
          if (!DSUtils.isArray(defs)) {
            relatedModels[relationName] = [defs];
          }
          DSUtils.forEach(relatedModels[relationName], function (d) {
            d.type = type;
            d.relation = relationName;
            d.name = def.name;
            def.relationList.push(d);
            def.relationFields.push(d.localField);
          });
        });
      });
      if (def.relations.belongsTo) {
        DSUtils.forOwn(def.relations.belongsTo, function (relatedModel, modelName) {
          DSUtils.forEach(relatedModel, function (relation) {
            if (relation.parent) {
              def.parent = modelName;
              def.parentKey = relation.localKey;
              def.parentField = relation.localField;
            }
          });
        });
      }
      if (typeof Object.freeze === 'function') {
        Object.freeze(def.relations);
        Object.freeze(def.relationList);
      }
    }

    def.getEndpoint = function (id, options) {
      options.params = options.params || {};

      var item;
      var parentKey = def.parentKey;
      var endpoint = options.hasOwnProperty('endpoint') ? options.endpoint : def.endpoint;
      var parentField = def.parentField;
      var parentDef = definitions[def.parent];
      var parentId = options.params[parentKey];

      if (parentId === false || !parentKey || !parentDef) {
        if (parentId === false) {
          delete options.params[parentKey];
        }
        return endpoint;
      } else {
        delete options.params[parentKey];

        if (DSUtils.isNumber(id) || DSUtils.isString(id)) {
          item = def.get(id);
        } else if (DSUtils.isObject(id)) {
          item = id;
        }

        if (item) {
          parentId = parentId || item[parentKey] || (item[parentField] ? item[parentField][parentDef.idAttribute] : null);
        }

        if (parentId) {
          delete options.endpoint;
          var _options = {};
          DSUtils.forOwn(options, function (value, key) {
            _options[key] = value;
          });
          var e = DSUtils.makePath(parentDef.getEndpoint(parentId, DSUtils._(parentDef, _options)), parentId, endpoint);
          return e;
        } else {
          return endpoint;
        }
      }
    };

    // Remove this in v0.11.0 and make a breaking change notice
    // the the `filter` option has been renamed to `defaultFilter`
    if (def.filter) {
      def.defaultFilter = def.filter;
      delete def.filter;
    }

    // Create the wrapper class for the new resource
    def['class'] = DSUtils.pascalCase(definition.name);
    try {
      eval('function ' + def['class'] + '() {}');
      def[def['class']] = eval(def['class']);
    } catch (e) {
      def[def['class']] = function () {
      };
    }

    // Apply developer-defined methods
    if (def.methods) {
      DSUtils.deepMixIn(def[def['class']].prototype, def.methods);
    }

    // Prepare for computed properties
    if (def.computed) {
      DSUtils.forOwn(def.computed, function (fn, field) {
        if (DSUtils.isFunction(fn)) {
          def.computed[field] = [fn];
          fn = def.computed[field];
        }
        if (def.methods && field in def.methods) {
          console.warn('Computed property "' + field + '" conflicts with previously defined prototype method!');
        }
        var deps;
        if (fn.length === 1) {
          var match = fn[0].toString().match(/function.*?\(([\s\S]*?)\)/);
          deps = match[1].split(',');
          def.computed[field] = deps.concat(fn);
          fn = def.computed[field];
          if (deps.length) {
            console.warn('Use the computed property array syntax for compatibility with minified code!');
          }
        }
        deps = fn.slice(0, fn.length - 1);
        DSUtils.forEach(deps, function (val, index) {
          deps[index] = val.trim();
        });
        fn.deps = DSUtils.filter(deps, function (dep) {
          return !!dep;
        });
      });
    }

    if (definition.schema && _this.schemator) {
      def.schema = _this.schemator.defineSchema(def.name, definition.schema);

      if (!definition.hasOwnProperty('validate')) {
        def.validate = function (resourceName, attrs, cb) {
          def.schema.validate(attrs, {
            ignoreMissing: def.ignoreMissing
          }, function (err) {
            if (err) {
              return cb(err);
            } else {
              return cb(null, attrs);
            }
          });
        };
      }
    }

    DSUtils.forEach(instanceMethods, function (name) {
      def[def['class']].prototype['DS' + DSUtils.pascalCase(name)] = function () {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(this[def.idAttribute] || this);
        args.unshift(def.name);
        return _this[name].apply(_this, args);
      };
    });

    def[def['class']].prototype.DSCreate = function () {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(this);
      args.unshift(def.name);
      return _this.create.apply(_this, args);
    };

    // Initialize store data for the new resource
    _this.store[def.name] = {
      collection: [],
      expiresHeap: new DSUtils.DSBinaryHeap(function (x) {
        return x.expires;
      }, function (x, y) {
        return x.item === y;
      }),
      completedQueries: {},
      pendingQueries: {},
      index: {},
      modified: {},
      saved: {},
      previousAttributes: {},
      observers: {},
      changeHistories: {},
      changeHistory: [],
      collectionModified: 0
    };

    if (def.reapInterval) {
      setInterval(function () {
        _this.reap(def.name, { isInterval: true });
      }, def.reapInterval);
    }

    // Proxy DS methods with shorthand ones
    for (var key in _this) {
      if (typeof _this[key] === 'function' && key !== 'defineResource') {
        (function (k) {
          def[k] = function () {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(def.name);
            return _this[k].apply(_this, args);
          };
        })(key);
      }
    }

    def.beforeValidate = DSUtils.promisify(def.beforeValidate);
    def.validate = DSUtils.promisify(def.validate);
    def.afterValidate = DSUtils.promisify(def.afterValidate);
    def.beforeCreate = DSUtils.promisify(def.beforeCreate);
    def.afterCreate = DSUtils.promisify(def.afterCreate);
    def.beforeUpdate = DSUtils.promisify(def.beforeUpdate);
    def.afterUpdate = DSUtils.promisify(def.afterUpdate);
    def.beforeDestroy = DSUtils.promisify(def.beforeDestroy);
    def.afterDestroy = DSUtils.promisify(def.afterDestroy);

    // Mix-in events
    DSUtils.Events(def);

    return def;
  } catch (err) {
    delete definitions[definition.name];
    delete _this.store[definition.name];
    throw err;
  }
}

module.exports = defineResource;
