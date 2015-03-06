import DSUtils from './utils';
import DSErrors from './errors';
import DS from './datastore/index';

var JSData = {
  DS,
  createStore(options) {
    return new DS(options);
  },
  DSUtils,
  DSErrors,
  version: {
    full: '<%= pkg.version %>',
    major: parseInt('<%= major %>', 10),
    minor: parseInt('<%= minor %>', 10),
    patch: parseInt('<%= patch %>', 10),
    alpha: '<%= alpha %>' !== 'false' ? '<%= alpha %>' : false,
    beta: '<%= beta %>' !== 'false' ? '<%= beta %>' : false
  }
};

export default JSData;
