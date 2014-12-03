var DSUtils = require('../../utils');
var DSErrors = require('../../errors');
var NER = DSErrors.NER;
var IA = DSErrors.IA;

function changes(resourceName, id, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  options = options || {};

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new NER(resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new IA('"id" must be a string or a number!');
  }
  options = DSUtils._(definition, options);

  var item = _this.get(resourceName, id);
  if (item) {
    if (DSUtils.w) {
      _this.store[resourceName].observers[id].deliver();
    }
    var diff = DSUtils.diffObjectFromOldObject(item, _this.store[resourceName].previousAttributes[id], DSUtils.equals, options.ignoredChanges);
    DSUtils.forOwn(diff, function (changeset, name) {
      var toKeep = [];
      DSUtils.forOwn(changeset, function (value, field) {
        if (!DSUtils.isFunction(value)) {
          toKeep.push(field);
        }
      });
      diff[name] = DSUtils.pick(diff[name], toKeep);
    });
    DSUtils.forEach(definition.relationFields, function (field) {
      delete diff.added[field];
      delete diff.removed[field];
      delete diff.changed[field];
    });
    return diff;
  }
}

function changeHistory(resourceName, id) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var resource = _this.store[resourceName];

  id = DSUtils.resolveId(definition, id);
  if (resourceName && !_this.definitions[resourceName]) {
    throw new NER(resourceName);
  } else if (id && !DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new IA('"id" must be a string or a number!');
  }

  if (!definition.keepChangeHistory) {
    console.warn('changeHistory is disabled for this resource!');
  } else {
    if (resourceName) {
      var item = _this.get(resourceName, id);
      if (item) {
        return resource.changeHistories[id];
      }
    } else {
      return resource.changeHistory;
    }
  }
}

function compute(resourceName, instance) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  instance = DSUtils.resolveItem(_this.store[resourceName], instance);
  if (!definition) {
    throw new NER(resourceName);
  } else if (!DSUtils.isObject(instance) && !DSUtils.isString(instance) && !DSUtils.isNumber(instance)) {
    throw new IA('"instance" must be an object, string or number!');
  }

  if (DSUtils.isString(instance) || DSUtils.isNumber(instance)) {
    instance = _this.get(resourceName, instance);
  }

  DSUtils.forOwn(definition.computed, function (fn, field) {
    DSUtils.compute.call(instance, fn, field);
  });

  return instance;
}

function createInstance(resourceName, attrs, options) {
  var definition = this.definitions[resourceName];
  var item;

  attrs = attrs || {};

  if (!definition) {
    throw new NER(resourceName);
  } else if (attrs && !DSUtils.isObject(attrs)) {
    throw new IA('"attrs" must be an object!');
  }

  options = DSUtils._(definition, options);

  if (options.notify) {
    options.beforeCreateInstance(options, attrs);
  }

  if (options.useClass) {
    var Constructor = definition[definition.class];
    item = new Constructor();
  } else {
    item = {};
  }
  DSUtils.deepMixIn(item, attrs);
  if (options.notify) {
    options.afterCreateInstance(options, attrs);
  }
  return item;
}

function diffIsEmpty(diff) {
  return !(DSUtils.isEmpty(diff.added) &&
  DSUtils.isEmpty(diff.removed) &&
  DSUtils.isEmpty(diff.changed));
}

function digest() {
  this.observe.Platform.performMicrotaskCheckpoint();
}

function get(resourceName, id, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  if (!definition) {
    throw new NER(resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new IA('"id" must be a string or a number!');
  }

  options = DSUtils._(definition, options);

  // cache miss, request resource from server
  var item = _this.store[resourceName].index[id];
  if (!item && options.loadFromServer) {
    _this.find(resourceName, id, options);
  }

  // return resource from cache
  return item;
}

function getAll(resourceName, ids) {
  var _this = this;
  var resource = _this.store[resourceName];
  var collection = [];

  if (!_this.definitions[resourceName]) {
    throw new NER(resourceName);
  } else if (ids && !DSUtils.isArray(ids)) {
    throw new IA('"ids" must be an array!');
  }

  if (DSUtils.isArray(ids)) {
    var length = ids.length;
    for (var i = 0; i < length; i++) {
      if (resource.index[ids[i]]) {
        collection.push(resource.index[ids[i]]);
      }
    }
  } else {
    collection = resource.collection.slice();
  }

  return collection;
}

function hasChanges(resourceName, id) {
  var _this = this;

  id = DSUtils.resolveId(_this.definitions[resourceName], id);

  if (!_this.definitions[resourceName]) {
    throw new NER(resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new IA('"id" must be a string or a number!');
  }

  // return resource from cache
  if (_this.get(resourceName, id)) {
    return diffIsEmpty(_this.changes(resourceName, id));
  } else {
    return false;
  }
}

function lastModified(resourceName, id) {
  var definition = this.definitions[resourceName];
  var resource = this.store[resourceName];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new NER(resourceName);
  }
  if (id) {
    if (!(id in resource.modified)) {
      resource.modified[id] = 0;
    }
    return resource.modified[id];
  }
  return resource.collectionModified;
}

function lastSaved(resourceName, id) {
  var definition = this.definitions[resourceName];
  var resource = this.store[resourceName];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new NER(resourceName);
  }
  if (!(id in resource.saved)) {
    resource.saved[id] = 0;
  }
  return resource.saved[id];
}

function previous(resourceName, id) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var resource = _this.store[resourceName];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new NER(resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new IA('"id" must be a string or a number!');
  }

  // return resource from cache
  return resource.previousAttributes[id] ? DSUtils.copy(resource.previousAttributes[id]) : undefined;
}

module.exports = {
  changes: changes,
  changeHistory: changeHistory,
  compute: compute,
  createInstance: createInstance,
  defineResource: require('./defineResource'),
  digest: digest,
  eject: require('./eject'),
  ejectAll: require('./ejectAll'),
  filter: require('./filter'),
  get: get,
  getAll: getAll,
  hasChanges: hasChanges,
  inject: require('./inject'),
  lastModified: lastModified,
  lastSaved: lastSaved,
  link: require('./link'),
  linkAll: require('./linkAll'),
  linkInverse: require('./linkInverse'),
  previous: previous,
  unlinkInverse: require('./unlinkInverse')
};
