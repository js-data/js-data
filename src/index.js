import DS from './datastore/index';
import DSUtils from './utils';
import DSErrors from './errors';

module.exports = {
  DS,
  DSUtils,
  DSErrors,
  createStore(options) {
    return new DS(options);
  },
  version: {
    full: '<%= pkg.version %>',
    major: parseInt('<%= major %>', 10),
    minor: parseInt('<%= minor %>', 10),
    patch: parseInt('<%= patch %>', 10),
    alpha: '<%= alpha %>' !== 'false' ? '<%= alpha %>' : false,
    beta: '<%= beta %>' !== 'false' ? '<%= beta %>' : false
  }
};
