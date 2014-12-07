var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function reap(resourceName, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var resource = _this.store[resourceName];

  return new DSUtils.Promise(function (resolve, reject) {

    if (!definition) {
      reject(new _this.errors.NER(resourceName));
    } else {
      options = DSUtils._(definition, options);
      if (!options.hasOwnProperty('notify')) {
        options.notify = false;
      }
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
        _this.emit(options, 'beforeReap', DSUtils.copy(items));
      }
      if (options.reapAction === 'inject') {
        DSUtils.forEach(items, function (item) {
          var id = item[definition.idAttribute];
          resource.expiresHeap.push({
            item: item,
            timestamp: resource.saved[id],
            expires: definition.maxAge ? resource.saved[id] + definition.maxAge : Number.MAX_VALUE
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
        _this.emit(options, 'afterReap', DSUtils.copy(items));
      }
      return items;
    });
}

function refresh(resourceName, id, options) {
  var _this = this;

  return new DSUtils.Promise(function (resolve, reject) {
    var definition = _this.definitions[resourceName];
    id = DSUtils.resolveId(_this.definitions[resourceName], id);
    if (!definition) {
      reject(new _this.errors.NER(resourceName));
    } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
      reject(new DSErrors.IA('"id" must be a string or a number!'));
    } else {
      options = DSUtils._(definition, options);
      options.bypassCache = true;
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

module.exports = {
  create: require('./create'),
  destroy: require('./destroy'),
  destroyAll: require('./destroyAll'),
  find: require('./find'),
  findAll: require('./findAll'),
  loadRelations: require('./loadRelations'),
  reap: reap,
  refresh: refresh,
  save: require('./save'),
  update: require('./update'),
  updateAll: require('./updateAll')
};
