var DSUtils = require('../../utils');
var DSErrors = require('../../errors');
var NER = DSErrors.NER;
var IA = DSErrors.IA;
var R = DSErrors.R;

function changes(resourceName, id, options) {
  var _this = this;
  var definition = _this.defs[resourceName];
  options = options || {};

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new NER(resourceName);
  } else if (!DSUtils._sn(id)) {
    throw DSUtils._snErr('id');
  }
  options = DSUtils._(definition, options);

  options.logFn('changes', id, options);

  var item = _this.get(resourceName, id);
  if (item) {
    if (DSUtils.w) {
      _this.s[resourceName].observers[id].deliver();
    }
    var diff = DSUtils.diffObjectFromOldObject(item, _this.s[resourceName].previousAttributes[id], DSUtils.equals, options.ignoredChanges);
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
  var definition = _this.defs[resourceName];
  var resource = _this.s[resourceName];

  id = DSUtils.resolveId(definition, id);
  if (resourceName && !_this.defs[resourceName]) {
    throw new NER(resourceName);
  } else if (id && !DSUtils._sn(id)) {
    throw DSUtils._snErr('id');
  }

  definition.logFn('changeHistory', id);

  if (!definition.keepChangeHistory) {
    definition.errorFn('changeHistory is disabled for this resource!');
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
  var definition = _this.defs[resourceName];

  instance = DSUtils.resolveItem(_this.s[resourceName], instance);
  if (!definition) {
    throw new NER(resourceName);
  } else if (!instance) {
    throw new R('Item not in the store!');
  } else if (!DSUtils._o(instance) && !DSUtils._sn(instance)) {
    throw new IA('"instance" must be an object, string or number!');
  }

  definition.logFn('compute', instance);

  DSUtils.forOwn(definition.computed, function (fn, field) {
    DSUtils.compute.call(instance, fn, field);
  });

  return instance;
}

function createInstance(resourceName, attrs, options) {
  var definition = this.defs[resourceName];
  var item;

  attrs = attrs || {};

  if (!definition) {
    throw new NER(resourceName);
  } else if (attrs && !DSUtils.isObject(attrs)) {
    throw new IA('"attrs" must be an object!');
  }

  options = DSUtils._(definition, options);

  options.logFn('createInstance', attrs, options);

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
  var definition = _this.defs[resourceName];

  if (!definition) {
    throw new NER(resourceName);
  } else if (!DSUtils._sn(id)) {
    throw DSUtils._snErr('id');
  }

  options = DSUtils._(definition, options);

  options.logFn('get', id, options);

  // cache miss, request resource from server
  var item = _this.s[resourceName].index[id];
  if (!item && options.loadFromServer) {
    _this.find(resourceName, id, options);
  }

  // return resource from cache
  return item;
}

function getAll(resourceName, ids) {
  var _this = this;
  var definition = _this.defs[resourceName];
  var resource = _this.s[resourceName];
  var collection = [];

  if (!definition) {
    throw new NER(resourceName);
  } else if (ids && !DSUtils._a(ids)) {
    throw DSUtils._aErr('ids');
  }

  definition.logFn('getAll', ids);

  if (DSUtils._a(ids)) {
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
  var definition = _this.defs[resourceName];

  id = DSUtils.resolveId(definition, id);

  if (!definition) {
    throw new NER(resourceName);
  } else if (!DSUtils._sn(id)) {
    throw DSUtils._snErr('id');
  }

  definition.logFn('hasChanges', id);

  // return resource from cache
  if (_this.get(resourceName, id)) {
    return diffIsEmpty(_this.changes(resourceName, id));
  } else {
    return false;
  }
}

function lastModified(resourceName, id) {
  var definition = this.defs[resourceName];
  var resource = this.s[resourceName];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new NER(resourceName);
  }

  definition.logFn('lastModified', id);

  if (id) {
    if (!(id in resource.modified)) {
      resource.modified[id] = 0;
    }
    return resource.modified[id];
  }
  return resource.collectionModified;
}

function lastSaved(resourceName, id) {
  var definition = this.defs[resourceName];
  var resource = this.s[resourceName];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new NER(resourceName);
  }

  definition.logFn('lastSaved', id);

  if (!(id in resource.saved)) {
    resource.saved[id] = 0;
  }
  return resource.saved[id];
}

function previous(resourceName, id) {
  var _this = this;
  var definition = _this.defs[resourceName];
  var resource = _this.s[resourceName];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new NER(resourceName);
  } else if (!DSUtils._sn(id)) {
    throw DSUtils._snErr('id');
  }

  definition.logFn('previous', id);

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
