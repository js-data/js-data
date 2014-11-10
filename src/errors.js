function IllegalArgumentError(message) {
  Error.call(this);
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  }
  this.type = this.constructor.name;
  this.message = message || 'Illegal Argument!';
}

IllegalArgumentError.prototype = new Error();
IllegalArgumentError.prototype.constructor = IllegalArgumentError;

function RuntimeError(message) {
  Error.call(this);
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  }
  this.type = this.constructor.name;
  this.message = message || 'RuntimeError Error!';
}

RuntimeError.prototype = new Error();
RuntimeError.prototype.constructor = RuntimeError;

function NonexistentResourceError(resourceName) {
  Error.call(this);
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  }
  this.type = this.constructor.name;
  this.message = (resourceName || '') + ' is not a registered resource!';
}

NonexistentResourceError.prototype = new Error();
NonexistentResourceError.prototype.constructor = NonexistentResourceError;

module.exports = {
  IllegalArgumentError: IllegalArgumentError,
  IA: IllegalArgumentError,
  RuntimeError: RuntimeError,
  R: RuntimeError,
  NonexistentResourceError: NonexistentResourceError,
  NER: NonexistentResourceError
};
