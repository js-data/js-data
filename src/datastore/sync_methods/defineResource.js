/*jshint evil:true, loopfunc:true*/
import DSUtils from '../../utils';
import DSErrors from '../../errors';

class Resource {
  constructor(options) {
    DSUtils.deepMixIn(this, options);
    if ('endpoint' in options) {
      this.endpoint = options.endpoint;
    } else {
      this.endpoint = this.name;
    }
  }
}

let instanceMethods = [
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
  'previous'
];

export default function defineResource(definition) {
  let _this = this;
  let definitions = _this.defs;

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
    throw new DSErrors.R(`${definition.name} is already registered!`);
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
      DSUtils.forOwn(def.relations, (relatedModels, type) => {
        DSUtils.forOwn(relatedModels, (defs, relationName) => {
          if (!DSUtils._a(defs)) {
            relatedModels[relationName] = [defs];
          }
          DSUtils.forEach(relatedModels[relationName], d => {
            d.type = type;
            d.relation = relationName;
            d.name = def.n;
            def.relationList.push(d);
            if (d.localField) {
              def.relationFields.push(d.localField);
            }
          });
        });
      });
      if (def.relations.belongsTo) {
        DSUtils.forOwn(def.relations.belongsTo, (relatedModel, modelName) => {
          DSUtils.forEach(relatedModel, relation => {
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

    def.getResource = resourceName => {
      return _this.defs[resourceName];
    };

    def.getEndpoint = (id, options) => {
      options.params = options.params || {};

      let item;
      let parentKey = def.parentKey;
      let endpoint = options.hasOwnProperty('endpoint') ? options.endpoint : def.endpoint;
      let parentField = def.parentField;
      let parentDef = definitions[def.parent];
      let parentId = options.params[parentKey];

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
          let _options = {};
          DSUtils.forOwn(options, (value, key) => {
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
    var _class = def['class'] = DSUtils.pascalCase(def.name);
    try {
      if (typeof def.useClass === 'function') {
        eval(`function ${_class}() { def.useClass.call(this); }`);
        def[_class] = eval(_class);
        def[_class].prototype = (function (proto) {
          function Ctor() {
          }

          Ctor.prototype = proto;
          return new Ctor();
        })(def.useClass.prototype);
      } else {
        eval(`function ${_class}() {}`);
        def[_class] = eval(_class);
      }
    } catch (e) {
      def[_class] = function () {
      };
    }

    // Apply developer-defined methods
    if (def.methods) {
      DSUtils.deepMixIn(def[_class].prototype, def.methods);
    }

    def[_class].prototype.set = function (key, value) {
      DSUtils.set(this, key, value);
      var observer = _this.s[def.n].observers[this[def.idAttribute]];
      if (observer && !DSUtils.observe.hasObjectObserve) {
        observer.deliver();
      } else {
        _this.compute(def.n, this);
      }
      return this;
    };

    def[_class].prototype.get = function (key) {
      return DSUtils.get(this, key);
    };

    // Prepare for computed properties
    if (def.computed) {
      DSUtils.forOwn(def.computed, (fn, field) => {
        if (DSUtils.isFunction(fn)) {
          def.computed[field] = [fn];
          fn = def.computed[field];
        }
        if (def.methods && field in def.methods) {
          def.errorFn(`Computed property "${field}" conflicts with previously defined prototype method!`);
        }
        var deps;
        if (fn.length === 1) {
          let match = fn[0].toString().match(/function.*?\(([\s\S]*?)\)/);
          deps = match[1].split(',');
          def.computed[field] = deps.concat(fn);
          fn = def.computed[field];
          if (deps.length) {
            def.errorFn('Use the computed property array syntax for compatibility with minified code!');
          }
        }
        deps = fn.slice(0, fn.length - 1);
        DSUtils.forEach(deps, (val, index) => {
          deps[index] = val.trim();
        });
        fn.deps = DSUtils.filter(deps, dep => {
          return !!dep;
        });
      });
    }

    if (definition.schema && _this.schemator) {
      def.schema = _this.schemator.defineSchema(def.n, definition.schema);

      if (!definition.hasOwnProperty('validate')) {
        def.validate = (resourceName, attrs, cb) => {
          def.schema.validate(attrs, {
            ignoreMissing: def.ignoreMissing
          }, err => {
            if (err) {
              return cb(err);
            } else {
              return cb(null, attrs);
            }
          });
        };
      }
    }

    DSUtils.forEach(instanceMethods, name => {
      def[_class].prototype[`DS${DSUtils.pascalCase(name)}`] = function (...args) {
        args.unshift(this[def.idAttribute] || this);
        args.unshift(def.n);
        return _this[name].apply(_this, args);
      };
    });

    def[_class].prototype.DSCreate = function (...args) {
      args.unshift(this);
      args.unshift(def.n);
      return _this.create.apply(_this, args);
    };

    // Initialize store data for the new resource
    _this.s[def.n] = {
      collection: [],
      expiresHeap: new DSUtils.BinaryHeap(x => x.expires, (x, y) => x.item === y),
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
      setInterval(() => _this.reap(def.n, { isInterval: true }), def.reapInterval);
    }

    // Proxy DS methods with shorthand ones
    let fns = ['registerAdapter', 'getAdapter', 'is'];
    for (var key in _this) {
      if (typeof _this[key] === 'function') {
        fns.push(key);
      }
    }

    DSUtils.forEach(fns, key => {
      let k = key;
      if (_this[k].shorthand !== false) {
        def[k] = (...args) => {
          args.unshift(def.n);
          return _this[k].apply(_this, args);
        };
      } else {
        def[k] = (...args) => _this[k].apply(_this, args);
      }
    });

    def.beforeValidate = DSUtils.promisify(def.beforeValidate);
    def.validate = DSUtils.promisify(def.validate);
    def.afterValidate = DSUtils.promisify(def.afterValidate);
    def.beforeCreate = DSUtils.promisify(def.beforeCreate);
    def.afterCreate = DSUtils.promisify(def.afterCreate);
    def.beforeUpdate = DSUtils.promisify(def.beforeUpdate);
    def.afterUpdate = DSUtils.promisify(def.afterUpdate);
    def.beforeDestroy = DSUtils.promisify(def.beforeDestroy);
    def.afterDestroy = DSUtils.promisify(def.afterDestroy);

    let defaultAdapter;
    if (def.hasOwnProperty('defaultAdapter')) {
      defaultAdapter = def.defaultAdapter;
    }
    DSUtils.forOwn(def.actions, (action, name) => {
      if (def[name] && !def.actions[name]) {
        throw new Error(`Cannot override existing method "${name}"!`);
      }
      def[name] = function (options) {
        options = options || {};
        let adapter = _this.getAdapter(action.adapter || defaultAdapter || 'http');
        let config = DSUtils.deepMixIn({}, action);
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
