var observe = require('../../../lib/observe-js/observe-js');

function digest() {
  observe.Platform.performMicrotaskCheckpoint();
}

module.exports = digest;
