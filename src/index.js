var DS = require('./datastore');

module.exports = {
  DS: DS,
  createStore: function (options) {
    return new DS(options);
  },
  DSUtils: require('./utils'),
  DSErrors: require('./errors')
};
