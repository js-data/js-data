/**
 * Thrown during a method call when an argument passed into the method is invalid.
 */
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

/**
 * Thrown when an invariant is violated or unrecoverable error is encountered during execution.
 */
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

/**
 * Thrown when attempting to access or work with a non-existent resource.
 */
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
