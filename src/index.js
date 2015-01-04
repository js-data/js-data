var DS = require('./datastore');

module.exports = {
  DS: DS,
  createStore: function (options) {
    return new DS(options);
  },
  DSUtils: require('./utils'),
  DSErrors: require('./errors'),
  version: {
    full: '<%= pkg.version %>',
    major: parseInt('<%= major %>', 10),
    minor: parseInt('<%= minor %>', 10),
    patch: parseInt('<%= patch %>', 10),
    alpha: '<%= alpha %>' !== 'false' ? '<%= alpha %>' : false,
    beta: '<%= beta %>' !== 'false' ? '<%= beta %>' : false
  }
};
