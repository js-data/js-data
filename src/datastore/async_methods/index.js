import DSUtils from '../../utils';
import DSErrors from '../../errors';

import create from './create';
import destroy from './destroy';
import destroyAll from './destroyAll';
import find from './find';
import findAll from './findAll';
import loadRelations from './loadRelations';
import save from './save';
import update from './update';
import updateAll from './updateAll';

function reap(resourceName, options) {
  var _this = this;
  var definition = _this.defs[resourceName];
  var resource = _this.s[resourceName];

  return new DSUtils.Promise(function (resolve, reject) {

    if (!definition) {
      reject(new _this.errors.NER(resourceName));
    } else {
      options = DSUtils._(definition, options);
      if (!options.hasOwnProperty('notify')) {
        options.notify = false;
      }
      options.logFn('reap', options);
      var items = [];
      var now = new Date().getTime();
      var expiredItem;
      while ((expiredItem = resource.expiresHeap.peek()) && expiredItem.expires < now) {
        items.push(expiredItem.item);
        delete expiredItem.item;
        resource.expiresHeap.pop();
      }
      resolve(items);
    }
  }).then(function (items) {
      if (options.isInterval || options.notify) {
        definition.beforeReap(options, items);
        definition.emit('DS.beforeReap', definition, items);
      }
      if (options.reapAction === 'inject') {
        var timestamp = new Date().getTime();
        DSUtils.forEach(items, function (item) {
          var id = item[definition.idAttribute];
          resource.expiresHeap.push({
            item: item,
            timestamp: timestamp,
            expires: definition.maxAge ? timestamp + definition.maxAge : Number.MAX_VALUE
          });
        });
      } else if (options.reapAction === 'eject') {
        DSUtils.forEach(items, function (item) {
          _this.eject(resourceName, item[definition.idAttribute]);
        });
      } else if (options.reapAction === 'refresh') {
        var tasks = [];
        DSUtils.forEach(items, function (item) {
          tasks.push(_this.refresh(resourceName, item[definition.idAttribute]));
        });
        return DSUtils.Promise.all(tasks);
      }
      return items;
    }).then(function (items) {
      if (options.isInterval || options.notify) {
        definition.afterReap(options, items);
        definition.emit('DS.afterReap', definition, items);
      }
      return items;
    });
}

function refresh(resourceName, id, options) {
  var _this = this;

  return new DSUtils.Promise(function (resolve, reject) {
    var definition = _this.defs[resourceName];
    id = DSUtils.resolveId(_this.defs[resourceName], id);
    if (!definition) {
      reject(new _this.errors.NER(resourceName));
    } else if (!DSUtils._sn(id)) {
      reject(DSUtils._snErr('id'));
    } else {
      options = DSUtils._(definition, options);
      options.bypassCache = true;
      options.logFn('refresh', id, options);
      resolve(_this.get(resourceName, id));
    }
  }).then(function (item) {
      if (item) {
        return _this.find(resourceName, id, options);
      } else {
        return item;
      }
    });
}

var asyncMethods = {
  create,
  destroy,
  destroyAll,
  find,
  findAll,
  loadRelations,
  reap,
  refresh,
  save,
  update,
  updateAll
};

export default asyncMethods;
