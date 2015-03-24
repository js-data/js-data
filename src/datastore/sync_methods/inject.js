import DSUtils from '../../utils';
import DSErrors from '../../errors';

function _getReactFunction(DS, definition, resource) {
  let name = definition.n;
  return function _react(added, removed, changed, oldValueFn, firstTime) {
    let target = this;
    let item;
    let innerId = (oldValueFn && oldValueFn(definition.idAttribute)) ? oldValueFn(definition.idAttribute) : target[definition.idAttribute];

    DSUtils.forEach(definition.relationFields, field => {
      delete added[field];
      delete removed[field];
      delete changed[field];
    });

    if (!DSUtils.isEmpty(added) || !DSUtils.isEmpty(removed) || !DSUtils.isEmpty(changed) || firstTime) {
      item = DS.get(name, innerId);
      resource.modified[innerId] = DSUtils.updateTimestamp(resource.modified[innerId]);
      resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);
      if (definition.keepChangeHistory) {
        let changeRecord = {
          resourceName: name,
          target: item,
          added,
          removed,
          changed,
          timestamp: resource.modified[innerId]
        };
        resource.changeHistories[innerId].push(changeRecord);
        resource.changeHistory.push(changeRecord);
      }
    }

    if (definition.computed) {
      item = item || DS.get(name, innerId);
      DSUtils.forOwn(definition.computed, (fn, field) => {
        let compute = false;
        // check if required fields changed
        DSUtils.forEach(fn.deps, dep => {
          if (dep in added || dep in removed || dep in changed || !(field in item)) {
            compute = true;
          }
        });
        compute = compute || !fn.deps.length;
        if (compute) {
          DSUtils.compute.call(item, fn, field);
        }
      });
    }

    if (definition.relations) {
      item = item || DS.get(name, innerId);
      DSUtils.forEach(definition.relationList, def => {
        if (item[def.localField] && (def.localKey in added || def.localKey in removed || def.localKey in changed)) {
          DS.link(name, item[definition.idAttribute], [def.relation]);
        }
      });
    }

    if (definition.idAttribute in changed) {
      definition.errorFn(`Doh! You just changed the primary key of an object! Your data for the "${name}" resource is now in an undefined (probably broken) state.`);
    }
  };
}

function _inject(definition, resource, attrs, options) {
  let _this = this;
  let _react = _getReactFunction(_this, definition, resource, attrs, options);

  let injected;
  if (DSUtils._a(attrs)) {
    injected = [];
    for (var i = 0; i < attrs.length; i++) {
      injected.push(_inject.call(_this, definition, resource, attrs[i], options));
    }
  } else {
    // check if "idAttribute" is a computed property
    let c = definition.computed;
    let idA = definition.idAttribute;
    if (c && c[idA]) {
      let args = [];
      DSUtils.forEach(c[idA].deps, dep => {
        args.push(attrs[dep]);
      });
      attrs[idA] = c[idA][c[idA].length - 1].apply(attrs, args);
    }
    if (!(idA in attrs)) {
      let error = new DSErrors.R(`${definition.n}.inject: "attrs" must contain the property specified by "idAttribute"!`);
      options.errorFn(error);
      throw error;
    } else {
      try {
        DSUtils.forEach(definition.relationList, def => {
          let relationName = def.relation;
          let relationDef = _this.defs[relationName];
          let toInject = attrs[def.localField];
          if (toInject) {
            if (!relationDef) {
              throw new DSErrors.R(`${definition.n} relation is defined but the resource is not!`);
            }
            if (DSUtils._a(toInject)) {
              let items = [];
              DSUtils.forEach(toInject, toInjectItem => {
                if (toInjectItem !== _this.s[relationName].index[toInjectItem[relationDef.idAttribute]]) {
                  try {
                    let injectedItem = _this.inject(relationName, toInjectItem, options.orig());
                    if (def.foreignKey) {
                      injectedItem[def.foreignKey] = attrs[definition.idAttribute];
                    }
                    items.push(injectedItem);
                  } catch (err) {
                    options.errorFn(err, `Failed to inject ${def.type} relation: "${relationName}"!`);
                  }
                }
              });
              attrs[def.localField] = items;
            } else {
              if (toInject !== _this.s[relationName].index[toInject[relationDef.idAttribute]]) {
                try {
                  attrs[def.localField] = _this.inject(relationName, attrs[def.localField], options.orig());
                  if (def.foreignKey) {
                    attrs[def.localField][def.foreignKey] = attrs[definition.idAttribute];
                  }
                } catch (err) {
                  options.errorFn(err, `Failed to inject ${def.type} relation: "${relationName}"!`);
                }
              }
            }
          }
        });

        let id = attrs[idA];
        let item = _this.get(definition.n, id);
        let initialLastModified = item ? resource.modified[id] : 0;

        if (!item) {
          if (options.useClass) {
            if (attrs instanceof definition[definition['class']]) {
              item = attrs;
            } else {
              item = new definition[definition['class']]();
            }
          } else {
            item = {};
          }
          DSUtils.deepMixIn(item, attrs);

          resource.collection.push(item);
          resource.changeHistories[id] = [];

          if (DSUtils.w) {
            resource.observers[id] = new _this.observe.ObjectObserver(item);
            resource.observers[id].open(_react, item);
          }

          resource.index[id] = item;
          _react.call(item, {}, {}, {}, null, true);
          resource.previousAttributes[id] = DSUtils.copy(item, null, null, null, definition.relationFields);
        } else {
          DSUtils.deepMixIn(item, attrs);
          if (definition.resetHistoryOnInject) {
            resource.previousAttributes[id] = DSUtils.copy(item, null, null, null, definition.relationFields);
            if (resource.changeHistories[id].length) {
              DSUtils.forEach(resource.changeHistories[id], changeRecord => {
                DSUtils.remove(resource.changeHistory, changeRecord);
              });
              resource.changeHistories[id].splice(0, resource.changeHistories[id].length);
            }
          }
          if (DSUtils.w) {
            resource.observers[id].deliver();
          }
        }
        resource.modified[id] = initialLastModified && resource.modified[id] === initialLastModified ? DSUtils.updateTimestamp(resource.modified[id]) : resource.modified[id];
        resource.expiresHeap.remove(item);
        let timestamp = new Date().getTime();
        resource.expiresHeap.push({
          item: item,
          timestamp: timestamp,
          expires: definition.maxAge ? timestamp + definition.maxAge : Number.MAX_VALUE
        });
        injected = item;
      } catch (err) {
        options.errorFn(err, attrs);
      }
    }
  }
  return injected;
}

function _link(definition, injected, options) {
  var _this = this;

  DSUtils.forEach(definition.relationList, def => {
    if (options.findBelongsTo && def.type === 'belongsTo' && injected[definition.idAttribute]) {
      _this.link(definition.n, injected[definition.idAttribute], [def.relation]);
    } else if ((options.findHasMany && def.type === 'hasMany') || (options.findHasOne && def.type === 'hasOne')) {
      _this.link(definition.n, injected[definition.idAttribute], [def.relation]);
    }
  });
}

export default function inject(resourceName, attrs, options) {
  let _this = this;
  let definition = _this.defs[resourceName];
  let resource = _this.s[resourceName];
  let injected;

  if (!definition) {
    throw new DSErrors.NER(resourceName);
  } else if (!DSUtils._o(attrs) && !DSUtils._a(attrs)) {
    throw new DSErrors.IA(`${resourceName}.inject: "attrs" must be an object or an array!`);
  }

  let name = definition.n;
  options = DSUtils._(definition, options);

  options.logFn('inject', attrs, options);
  if (options.notify) {
    options.beforeInject(options, attrs);
    definition.emit('DS.beforeInject', definition, attrs);
  }

  injected = _inject.call(_this, definition, resource, attrs, options);
  resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);

  if (options.findInverseLinks) {
    if (DSUtils._a(injected)) {
      if (injected.length) {
        _this.linkInverse(name, injected[0][definition.idAttribute]);
      }
    } else {
      _this.linkInverse(name, injected[definition.idAttribute]);
    }
  }

  if (DSUtils._a(injected)) {
    DSUtils.forEach(injected, injectedI => {
      _link.call(_this, definition, injectedI, options);
    });
  } else {
    _link.call(_this, definition, injected, options);
  }

  if (options.notify) {
    options.afterInject(options, injected);
    definition.emit('DS.afterInject', definition, injected);
  }

  return injected;
}
