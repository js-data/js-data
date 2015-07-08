/**
 * Find expired items of the specified resource type and perform the configured action.
 *
 * @param resourceName The name of the type of resource of the items to reap.
 * @param options Optional configuration.
 * @returns The reaped items.
 */
module.exports = function reap(resourceName, options) {
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

      // find the expired items
      while ((expiredItem = resource.expiresHeap.peek()) && expiredItem.expires < now) {
        items.push(expiredItem.item);
        delete expiredItem.item;
        resource.expiresHeap.pop();
      }
      resolve(items);
    }
  }).then(items => {
      // only hit lifecycle if there are items
      if (items.length) {
        definition.beforeReap(options, items);
        if (options.notify) {
          definition.emit('DS.beforeReap', definition, items);
        }
      }

      if (options.reapAction === 'inject') {
        let timestamp = new Date().getTime();
        DSUtils.forEach(items, item => {
          resource.expiresHeap.push({
            item: item,
            timestamp: timestamp,
            expires: definition.maxAge ? timestamp + definition.maxAge : Number.MAX_VALUE
          });
        });
      } else if (options.reapAction === 'eject') {
        DSUtils.forEach(items, item => {
          definition.eject(item[definition.idAttribute]);
        });
      } else if (options.reapAction === 'refresh') {
        let tasks = [];
        DSUtils.forEach(items, item => {
          tasks.push(definition.refresh(item[definition.idAttribute]));
        });
        return DSUtils.Promise.all(tasks);
      }
      return items;
    }).then(items => {
      // only hit lifecycle if there are items
      if (items.length) {
        definition.afterReap(options, items);
        if (options.notify) {
          definition.emit('DS.afterReap', definition, items);
        }
      }
      return items;
    });
};
