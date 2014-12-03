var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function _getReactFunction(DS, definition, resource) {
  var name = definition.name;
  return function _react(added, removed, changed, oldValueFn, firstTime) {
    var target = this;
    var item;
    var innerId = (oldValueFn && oldValueFn(definition.idAttribute)) ? oldValueFn(definition.idAttribute) : target[definition.idAttribute];

    DSUtils.forEach(definition.relationFields, function (field) {
      delete added[field];
      delete removed[field];
      delete changed[field];
    });

    if (!DSUtils.isEmpty(added) || !DSUtils.isEmpty(removed) || !DSUtils.isEmpty(changed) || firstTime) {
      item = DS.get(name, innerId);
      resource.modified[innerId] = DSUtils.updateTimestamp(resource.modified[innerId]);
      resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);
      if (definition.keepChangeHistory) {
        var changeRecord = {
          resourceName: name,
          target: item,
          added: added,
          removed: removed,
          changed: changed,
          timestamp: resource.modified[innerId]
        };
        resource.changeHistories[innerId].push(changeRecord);
        resource.changeHistory.push(changeRecord);
      }
    }

    if (definition.computed) {
      item = item || DS.get(name, innerId);
      DSUtils.forOwn(definition.computed, function (fn, field) {
        var compute = false;
        // check if required fields changed
        DSUtils.forEach(fn.deps, function (dep) {
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
      DSUtils.forEach(definition.relationList, function (def) {
        if (item[def.localField] && (def.localKey in added || def.localKey in removed || def.localKey in changed)) {
          DS.link(name, item[definition.idAttribute], [def.relation]);
        }
      });
    }

    if (definition.idAttribute in changed) {
      console.error('Doh! You just changed the primary key of an object! Your data for the' + name +
      '" resource is now in an undefined (probably broken) state.');
    }
  };
}

function _inject(definition, resource, attrs, options) {
  var _this = this;
  var _react = _getReactFunction(_this, definition, resource, attrs, options);

  var injected;
  if (DSUtils.isArray(attrs)) {
    injected = [];
    for (var i = 0; i < attrs.length; i++) {
      injected.push(_inject.call(_this, definition, resource, attrs[i], options));
    }
  } else {
    // check if "idAttribute" is a computed property
    var c = definition.computed;
    var idA = definition.idAttribute;
    if (c && c[idA]) {
      var args = [];
      DSUtils.forEach(c[idA].deps, function (dep) {
        args.push(attrs[dep]);
      });
      attrs[idA] = c[idA][c[idA].length - 1].apply(attrs, args);
    }
    if (!(idA in attrs)) {
      var error = new DSErrors.R(definition.name + '.inject: "attrs" must contain the property specified by `idAttribute`!');
      console.error(error);
      throw error;
    } else {
      try {
        DSUtils.forEach(definition.relationList, function (def) {
          var relationName = def.relation;
          var relationDef = _this.definitions[relationName];
          var toInject = attrs[def.localField];
          if (toInject) {
            if (!relationDef) {
              throw new DSErrors.R(definition.name + ' relation is defined but the resource is not!');
            }
            if (DSUtils.isArray(toInject)) {
              var items = [];
              DSUtils.forEach(toInject, function (toInjectItem) {
                if (toInjectItem !== _this.store[relationName][toInjectItem[relationDef.idAttribute]]) {
                  try {
                    var injectedItem = _this.inject(relationName, toInjectItem, options);
                    if (def.foreignKey) {
                      injectedItem[def.foreignKey] = attrs[definition.idAttribute];
                    }
                    items.push(injectedItem);
                  } catch (err) {
                    console.error(definition.name + ': Failed to inject ' + def.type + ' relation: "' + relationName + '"!', err);
                  }
                }
              });
              attrs[def.localField] = items;
            } else {
              if (toInject !== _this.store[relationName][toInject[relationDef.idAttribute]]) {
                try {
                  attrs[def.localField] = _this.inject(relationName, attrs[def.localField], options);
                  if (def.foreignKey) {
                    attrs[def.localField][def.foreignKey] = attrs[definition.idAttribute];
                  }
                } catch (err) {
                  console.error(definition.name + ': Failed to inject ' + def.type + ' relation: "' + relationName + '"!', err);
                }
              }
            }
          }
        });

        var id = attrs[idA];
        var item = _this.get(definition.name, id);
        var initialLastModified = item ? resource.modified[id] : 0;

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
          resource.previousAttributes[id] = DSUtils.copy(attrs);

          DSUtils.deepMixIn(item, attrs);

          resource.collection.push(item);
          resource.changeHistories[id] = [];

          if (DSUtils.w) {
            resource.observers[id] = new _this.observe.ObjectObserver(item);
            resource.observers[id].open(_react, item);
          }

          resource.index[id] = item;
          _react.call(item, {}, {}, {}, null, true);
        } else {
          DSUtils.deepMixIn(item, attrs);
          if (definition.resetHistoryOnInject) {
            resource.previousAttributes[id] = {};
            DSUtils.deepMixIn(resource.previousAttributes[id], attrs);
            if (resource.changeHistories[id].length) {
              DSUtils.forEach(resource.changeHistories[id], function (changeRecord) {
                DSUtils.remove(resource.changeHistory, changeRecord);
              });
              resource.changeHistories[id].splice(0, resource.changeHistories[id].length);
            }
          }
          if (DSUtils.w) {
            resource.observers[id].deliver();
          }
        }
        resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
        resource.modified[id] = initialLastModified && resource.modified[id] === initialLastModified ? DSUtils.updateTimestamp(resource.modified[id]) : resource.modified[id];
        resource.expiresHeap.remove(item);
        resource.expiresHeap.push({
          item: item,
          timestamp: resource.saved[id],
          expires: definition.maxAge ? resource.saved[id] + definition.maxAge : Number.MAX_VALUE
        });
        injected = item;
      } catch (err) {
        console.error(err.stack);
        console.error('inject failed!', definition.name, attrs);
      }
    }
  }
  return injected;
}

function _link(definition, injected, options) {
  var _this = this;

  DSUtils.forEach(definition.relationList, function (def) {
    if (options.findBelongsTo && def.type === 'belongsTo' && injected[definition.idAttribute]) {
      _this.link(definition.name, injected[definition.idAttribute], [def.relation]);
    } else if ((options.findHasMany && def.type === 'hasMany') || (options.findHasOne && def.type === 'hasOne')) {
      _this.link(definition.name, injected[definition.idAttribute], [def.relation]);
    }
  });
}

function inject(resourceName, attrs, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var resource = _this.store[resourceName];
  var injected;

  if (!definition) {
    throw new DSErrors.NER(resourceName);
  } else if (!DSUtils.isObject(attrs) && !DSUtils.isArray(attrs)) {
    throw new DSErrors.IA(resourceName + '.inject: "attrs" must be an object or an array!');
  }

  var name = definition.name;
  options = DSUtils._(definition, options);

  if (options.notify) {
    options.beforeInject(options, attrs);
    _this.emit(options, 'beforeInject', DSUtils.copy(attrs));
  }

  injected = _inject.call(_this, definition, resource, attrs, options);
  resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);

  if (options.findInverseLinks) {
    if (DSUtils.isArray(injected)) {
      if (injected.length) {
        _this.linkInverse(name, injected[0][definition.idAttribute]);
      }
    } else {
      _this.linkInverse(name, injected[definition.idAttribute]);
    }
  }

  if (DSUtils.isArray(injected)) {
    DSUtils.forEach(injected, function (injectedI) {
      _link.call(_this, definition, injectedI, options);
    });
  } else {
    _link.call(_this, definition, injected, options);
  }

  if (options.notify) {
    options.afterInject(options, injected);
    _this.emit(options, 'afterInject', DSUtils.copy(injected));
  }

  return injected;
}

module.exports = inject;
