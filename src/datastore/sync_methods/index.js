import DSUtils from '../../utils';
import DSErrors from '../../errors';

import defineResource from './defineResource';
import eject from './eject';
import ejectAll from './ejectAll';
import filter from './filter';
import inject from './inject';
import link from './link';
import linkAll from './linkAll';
import linkInverse from './linkInverse';
import unlinkInverse from './unlinkInverse';

let NER = DSErrors.NER;
let IA = DSErrors.IA;
let R = DSErrors.R;

function diffIsEmpty(diff) {
  return !(DSUtils.isEmpty(diff.added) &&
  DSUtils.isEmpty(diff.removed) &&
  DSUtils.isEmpty(diff.changed));
}

export default {
  changes(resourceName, id, options) {
    let _this = this;
    let definition = _this.defs[resourceName];
    options = options || {};

    id = DSUtils.resolveId(definition, id);
    if (!definition) {
      throw new NER(resourceName);
    } else if (!DSUtils._sn(id)) {
      throw DSUtils._snErr('id');
    }
    options = DSUtils._(definition, options);

    options.logFn('changes', id, options);

    let item = _this.get(resourceName, id);
    if (item) {
      if (DSUtils.w) {
        _this.s[resourceName].observers[id].deliver();
      }
      let ignoredChanges = options.ignoredChanges || [];
      DSUtils.forEach(definition.relationFields, field => ignoredChanges.push(field));
      let diff = DSUtils.diffObjectFromOldObject(item, _this.s[resourceName].previousAttributes[id], DSUtils.equals, ignoredChanges);
      DSUtils.forOwn(diff, (changeset, name) => {
        let toKeep = [];
        DSUtils.forOwn(changeset, (value, field) => {
          if (!DSUtils.isFunction(value)) {
            toKeep.push(field);
          }
        });
        diff[name] = DSUtils.pick(diff[name], toKeep);
      });
      DSUtils.forEach(definition.relationFields, field => {
        delete diff.added[field];
        delete diff.removed[field];
        delete diff.changed[field];
      });
      return diff;
    }
  },
  changeHistory(resourceName, id) {
    let _this = this;
    let definition = _this.defs[resourceName];
    let resource = _this.s[resourceName];

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
        let item = _this.get(resourceName, id);
        if (item) {
          return resource.changeHistories[id];
        }
      } else {
        return resource.changeHistory;
      }
    }
  },
  compute(resourceName, instance) {
    let _this = this;
    let definition = _this.defs[resourceName];

    instance = DSUtils.resolveItem(_this.s[resourceName], instance);
    if (!definition) {
      throw new NER(resourceName);
    } else if (!instance) {
      throw new R('Item not in the store!');
    } else if (!DSUtils._o(instance) && !DSUtils._sn(instance)) {
      throw new IA('"instance" must be an object, string or number!');
    }

    definition.logFn('compute', instance);
    DSUtils.forOwn(definition.computed, (fn, field) => {
      DSUtils.compute.call(instance, fn, field);
    });
    return instance;
  },
  createInstance(resourceName, attrs, options) {
    let definition = this.defs[resourceName];
    let item;

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
      let Constructor = definition[definition.class];
      item = new Constructor();
    } else {
      item = {};
    }
    DSUtils.deepMixIn(item, attrs);
    if (options.notify) {
      options.afterCreateInstance(options, item);
    }
    return item;
  },
  defineResource,
  digest() {
    this.observe.Platform.performMicrotaskCheckpoint();
  },
  eject,
  ejectAll,
  filter,
  get(resourceName, id, options) {
    let _this = this;
    let definition = _this.defs[resourceName];

    if (!definition) {
      throw new NER(resourceName);
    } else if (!DSUtils._sn(id)) {
      throw DSUtils._snErr('id');
    }

    options = DSUtils._(definition, options);

    options.logFn('get', id, options);

    // cache miss, request resource from server
    let item = _this.s[resourceName].index[id];
    if (!item && options.loadFromServer) {
      _this.find(resourceName, id, options);
    }

    // return resource from cache
    return item;
  },
  getAll(resourceName, ids) {
    let _this = this;
    let definition = _this.defs[resourceName];
    let resource = _this.s[resourceName];
    let collection = [];

    if (!definition) {
      throw new NER(resourceName);
    } else if (ids && !DSUtils._a(ids)) {
      throw DSUtils._aErr('ids');
    }

    definition.logFn('getAll', ids);

    if (DSUtils._a(ids)) {
      let length = ids.length;
      for (var i = 0; i < length; i++) {
        if (resource.index[ids[i]]) {
          collection.push(resource.index[ids[i]]);
        }
      }
    } else {
      collection = resource.collection.slice();
    }

    return collection;
  },
  hasChanges(resourceName, id) {
    let _this = this;
    let definition = _this.defs[resourceName];

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
  },
  inject,
  lastModified(resourceName, id) {
    let definition = this.defs[resourceName];
    let resource = this.s[resourceName];

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
  },
  lastSaved(resourceName, id) {
    let definition = this.defs[resourceName];
    let resource = this.s[resourceName];

    id = DSUtils.resolveId(definition, id);
    if (!definition) {
      throw new NER(resourceName);
    }

    definition.logFn('lastSaved', id);

    if (!(id in resource.saved)) {
      resource.saved[id] = 0;
    }
    return resource.saved[id];
  },
  link,
  linkAll,
  linkInverse,
  previous(resourceName, id) {
    let _this = this;
    let definition = _this.defs[resourceName];
    let resource = _this.s[resourceName];

    id = DSUtils.resolveId(definition, id);
    if (!definition) {
      throw new NER(resourceName);
    } else if (!DSUtils._sn(id)) {
      throw DSUtils._snErr('id');
    }

    definition.logFn('previous', id);

    // return resource from cache
    return resource.previousAttributes[id] ? DSUtils.copy(resource.previousAttributes[id]) : undefined;
  },
  unlinkInverse
};
