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
  var definitions = _this.defs;

  if (DSUtils._s(definition)) {
    definition = {
      name: definition.replace(/\s/gi, '')
    };
  }
  if (!DSUtils._o(definition)) {
    throw DSUtils._oErr('definition');
  } else if (!DSUtils._s(definition.name)) {
    throw new DSErrors.IA('"name" must be a string!');
  } else if (_this.s[definition.name]) {
    throw new DSErrors.R(definition.name + ' is already registered!');
  }

  try {
    // Inherit from global defaults
    Resource.prototype = _this.defaults;
    definitions[definition.name] = new Resource(definition);

    var def = definitions[definition.name];

    // alias name, shaves 0.08 kb off the minified build
    def.n = def.name;

    def.logFn('Preparing resource.');

    if (!DSUtils._s(def.idAttribute)) {
      throw new DSErrors.IA('"idAttribute" must be a string!');
    }

    // Setup nested parent configuration
    if (def.relations) {
      def.relationList = [];
      def.relationFields = [];
      DSUtils.forOwn(def.relations, function (relatedModels, type) {
        DSUtils.forOwn(relatedModels, function (defs, relationName) {
          if (!DSUtils._a(defs)) {
            relatedModels[relationName] = [defs];
          }
          DSUtils.forEach(relatedModels[relationName], function (d) {
            d.type = type;
            d.relation = relationName;
            d.name = def.n;
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

    def.getResource = function (resourceName) {
      return _this.defs[resourceName];
    };

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

        if (DSUtils._sn(id)) {
          item = def.get(id);
        } else if (DSUtils._o(id)) {
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
          return DSUtils.makePath(parentDef.getEndpoint(parentId, DSUtils._(parentDef, _options)), parentId, endpoint);
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
    def['class'] = DSUtils.pascalCase(def.name);
    try {
      if (typeof def.useClass === 'function') {
        eval('function ' + def['class'] + '() { def.useClass.call(this); }');
        def[def['class']] = eval(def['class']);
        def[def['class']].prototype = (function (proto) {
          function Ctor() {
          }

          Ctor.prototype = proto;
          return new Ctor();
        })(def.useClass.prototype);
      } else {
        eval('function ' + def['class'] + '() {}');
        def[def['class']] = eval(def['class']);
      }
    } catch (e) {
      def[def['class']] = function () {
      };
    }

    // Apply developer-defined methods
    if (def.methods) {
      DSUtils.deepMixIn(def[def['class']].prototype, def.methods);
    }

    def[def['class']].prototype.set = function (key, value) {
      DSUtils.set(this, key, value);
      var observer = _this.s[def.n].observers[this[def.idAttribute]];
      if (observer && !DSUtils.observe.hasObjectObserve) {
        observer.deliver();
      } else {
        _this.compute(def.n, this);
      }
      return this;
    };

    def[def['class']].prototype.get = function (key) {
      return DSUtils.get(this, key);
    };

    // Prepare for computed properties
    if (def.computed) {
      DSUtils.forOwn(def.computed, function (fn, field) {
        if (DSUtils.isFunction(fn)) {
          def.computed[field] = [fn];
          fn = def.computed[field];
        }
        if (def.methods && field in def.methods) {
          def.errorFn('Computed property "' + field + '" conflicts with previously defined prototype method!');
        }
        var deps;
        if (fn.length === 1) {
          var match = fn[0].toString().match(/function.*?\(([\s\S]*?)\)/);
          deps = match[1].split(',');
          def.computed[field] = deps.concat(fn);
          fn = def.computed[field];
          if (deps.length) {
            def.errorFn('Use the computed property array syntax for compatibility with minified code!');
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
      def.schema = _this.schemator.defineSchema(def.n, definition.schema);

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
        args.unshift(def.n);
        return _this[name].apply(_this, args);
      };
    });

    def[def['class']].prototype.DSCreate = function () {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(this);
      args.unshift(def.n);
      return _this.create.apply(_this, args);
    };

    // Initialize store data for the new resource
    _this.s[def.n] = {
      collection: [],
      expiresHeap: new DSUtils.DSBinaryHeap(function (x) {
        return x.expires;
      }, function (x, y) {
        return x.item === y;
      }),
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
    };

    if (def.reapInterval) {
      setInterval(function () {
        _this.reap(def.n, { isInterval: true });
      }, def.reapInterval);
    }

    // Proxy DS methods with shorthand ones
    for (var key in _this) {
      if (typeof _this[key] === 'function') {
        if (_this[key].shorthand !== false) {
          (function (k) {
            def[k] = function () {
              var args = Array.prototype.slice.call(arguments);
              args.unshift(def.n);
              return _this[k].apply(_this, args);
            };
          })(key);
        } else {
          (function (k) {
            def[k] = function () {
              return _this[k].apply(_this, Array.prototype.slice.call(arguments));
            };
          })(key);
        }
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

    DSUtils.forOwn(def.actions, function addAction(action, name) {
      if (def[name]) {
        throw new Error('Cannot override existing method "' + name + '"!');
      }
      def[name] = function (options) {
        options = options || {};
        var adapter = _this.getAdapter(action.adapter || 'http');
        var config = DSUtils.deepMixIn({}, action);
        if (!options.hasOwnProperty('endpoint') && config.endpoint) {
          options.endpoint = config.endpoint;
        }
        if (typeof options.getEndpoint === 'function') {
          config.url = options.getEndpoint(def, options);
        } else {
          config.url = DSUtils.makePath(options.basePath || adapter.defaults.basePath || def.basePath, def.getEndpoint(null, options), name);
        }
        config.method = config.method || 'GET';
        DSUtils.deepMixIn(config, options);
        return adapter.HTTP(config);
      };
    });

    // Mix-in events
    DSUtils.Events(def);

    def.logFn('Done preparing resource.');

    return def;
  } catch (err) {
    delete definitions[definition.name];
    delete _this.s[definition.name];
    throw err;
  }
}

module.exports = defineResource;
