export default function reap(resourceName, options) {
  let _this = this;
  var DSUtils = _this.utils;
  let definition = _this.defs[resourceName];
  let resource = _this.s[resourceName];

  return new DSUtils.Promise((resolve, reject) => {

    if (!definition) {
      reject(new _this.errors.NER(resourceName));
    } else {
      options = DSUtils._(definition, options);
      if (!options.hasOwnProperty('notify')) {
        options.notify = false;
      }
      options.logFn('reap', options);
      let items = [];
      let now = new Date().getTime();
      let expiredItem;
      while ((expiredItem = resource.expiresHeap.peek()) && expiredItem.expires < now) {
        items.push(expiredItem.item);
        delete expiredItem.item;
        resource.expiresHeap.pop();
      }
      resolve(items);
    }
  }).then(items => {
      if (options.isInterval || options.notify) {
        definition.beforeReap(options, items);
        definition.emit('DS.beforeReap', definition, items);
      }
      if (options.reapAction === 'inject') {
        let timestamp = new Date().getTime();
        DSUtils.forEach(items, item => resource.expiresHeap.push({
          item: item,
          timestamp: timestamp,
          expires: definition.maxAge ? timestamp + definition.maxAge : Number.MAX_VALUE
        }));
      } else if (options.reapAction === 'eject') {
        DSUtils.forEach(items, item => _this.eject(resourceName, item[definition.idAttribute]));
      } else if (options.reapAction === 'refresh') {
        let tasks = [];
        DSUtils.forEach(items, item => tasks.push(_this.refresh(resourceName, item[definition.idAttribute])));
        return DSUtils.Promise.all(tasks);
      }
      return items;
    }).then(items => {
      if (options.isInterval || options.notify) {
        definition.afterReap(options, items);
        definition.emit('DS.afterReap', definition, items);
      }
      return items;
    });
}
