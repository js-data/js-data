class IllegalArgumentError extends Error {
  constructor(message) {
    super();
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
    this.type = this.constructor.name;
    this.message = message || 'Illegal Argument!';
  }
}

class RuntimeError extends Error {
  constructor(message) {
    super();
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
    this.type = this.constructor.name;
    this.message = message || 'RuntimeError Error!';
  }
}

class NonexistentResourceError extends Error {
  constructor(resourceName) {
    super();
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
    this.type = this.constructor.name;
    this.message = `${resourceName} is not a registered resource!`;
  }
}

export default {
  IllegalArgumentError,
  IA: IllegalArgumentError,
  RuntimeError,
  R: RuntimeError,
  NonexistentResourceError,
  NER: NonexistentResourceError
};
