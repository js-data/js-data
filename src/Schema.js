import utils from './utils'
import Component from './Component'

/**
 * TODO
 *
 * @name Schema.types
 * @type {Object}
 */
const types = {
  array: utils.isArray,
  boolean: utils.isBoolean,
  integer: utils.isInteger,
  'null': utils.isNull,
  number: utils.isNumber,
  object: utils.isObject,
  string: utils.isString
}

/**
 * @ignore
 */
const segmentToString = function (segment, prev) {
  let str = ''
  if (segment) {
    if (utils.isNumber(segment)) {
      str += `[${segment}]`
    } else if (prev) {
      str += `.${segment}`
    } else {
      str += `${segment}`
    }
  }
  return str
}

/**
 * @ignore
 */
const makePath = function (opts) {
  opts || (opts = {})
  let path = ''
  const segments = opts.path || []
  segments.forEach(function (segment) {
    path += segmentToString(segment, path)
  })
  path += segmentToString(opts.prop, path)
  return path
}

/**
 * @ignore
 */
const makeError = function (actual, expected, opts) {
  return {
    expected,
    actual: '' + actual,
    path: makePath(opts)
  }
}

/**
 * @ignore
 */
const addError = function (actual, expected, opts, errors) {
  errors.push(makeError(actual, expected, opts))
}

/**
 * @ignore
 */
const maxLengthCommon = function (keyword, value, schema, opts) {
  const max = schema[keyword]
  if (value.length > max) {
    return makeError(value.length, `length no more than ${max}`, opts)
  }
}

/**
 * @ignore
 */
const minLengthCommon = function (keyword, value, schema, opts) {
  const min = schema[keyword]
  if (value.length < min) {
    return makeError(value.length, `length no less than ${min}`, opts)
  }
}

/**
 * TODO
 *
 * @name Schema.validationKeywords
 * @type {Object}
 */
const validationKeywords = {
  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor82
   *
   * @name Schema.validationKeywords.allOf
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  allOf (value, schema, opts) {
    let allErrors = []
    schema.allOf.forEach(function (_schema) {
      allErrors = allErrors.concat(validate(value, _schema, opts) || [])
    })
    return allErrors.length ? undefined : allErrors
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor85
   *
   * @name Schema.validationKeywords.anyOf
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  anyOf (value, schema, opts) {
    let validated = false
    let allErrors = []
    schema.anyOf.forEach(function (_schema) {
      const errors = validate(value, _schema, opts)
      if (errors) {
        allErrors = allErrors.concat(errors)
      } else {
        validated = true
      }
    })
    return validated ? undefined : allErrors
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor70
   *
   * @name Schema.validationKeywords.dependencies
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  dependencies (value, schema, opts) {
    // TODO
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor76
   *
   * @name Schema.validationKeywords.enum
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  enum (value, schema, opts) {
    const possibleValues = schema['enum']
    if (possibleValues.indexOf(value) === -1) {
      return makeError(value, `one of (${possibleValues.join(', ')})`, opts)
    }
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor37
   *
   * @name Schema.validationKeywords.items
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  items (value, schema, opts) {
    opts || (opts = {})
    // TODO: additionalItems
    let items = schema.items
    let errors = []
    const checkingTuple = utils.isArray(items)
    const length = value.length
    for (var prop = 0; prop < length; prop++) {
      if (checkingTuple) {
        // Validating a tuple, instead of just checking each item against the
        // same schema
        items = schema.items[prop]
      }
      opts.prop = prop
      errors = errors.concat(validate(value[prop], items, opts) || [])
    }
    return errors.length ? errors : undefined
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor17
   *
   * @name Schema.validationKeywords.maximum
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  maximum (value, schema, opts) {
    // Must be a number
    const maximum = schema.maximum
    // Must be a boolean
    // Depends on maximum
    // default: false
    const exclusiveMaximum = schema.exclusiveMaximum
    if (typeof value === typeof maximum && (exclusiveMaximum ? maximum < value : maximum <= value)) {
      // TODO: Account for value of exclusiveMaximum in messaging
      return makeError(value, `no more than ${maximum}`, opts)
    }
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor42
   *
   * @name Schema.validationKeywords.maxItems
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  maxItems (value, schema, opts) {
    return maxLengthCommon('maxItems', value, schema, opts)
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor26
   *
   * @name Schema.validationKeywords.maxLength
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  maxLength (value, schema, opts) {
    return maxLengthCommon('maxLength', value, schema, opts)
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor54
   *
   * @name Schema.validationKeywords.maxProperties
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  maxProperties (value, schema, opts) {
    const maxProperties = schema.maxProperties
    const length = Object.keys(value).length
    if (length > maxProperties) {
      return makeError(length, `no more than ${maxProperties} properties`, opts)
    }
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor21
   *
   * @name Schema.validationKeywords.minimum
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  minimum (value, schema, opts) {
    // Must be a number
    const minimum = schema.minimum
    // Must be a boolean
    // Depends on minimum
    // default: false
    const exclusiveMinimum = schema.exclusiveMinimum
    if (typeof value === typeof minimum && (exclusiveMinimum ? minimum > value : minimum >= value)) {
      // TODO: Account for value of exclusiveMinimum in messaging
      return makeError(value, `no less than ${minimum}`, opts)
    }
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor42
   *
   * @name Schema.validationKeywords.minItems
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  minItems (value, schema, opts) {
    return minLengthCommon('minItems', value, schema, opts)
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor29
   *
   * @name Schema.validationKeywords.minLength
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  minLength (value, schema, opts) {
    return minLengthCommon('minLength', value, schema, opts)
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor57
   *
   * @name Schema.validationKeywords.minProperties
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  minProperties (value, schema, opts) {
    const minProperties = schema.minProperties
    const length = Object.keys(value).length
    if (length < minProperties) {
      return makeError(length, `no more than ${minProperties} properties`, opts)
    }
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor14
   *
   * @name Schema.validationKeywords.multipleOf
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  multipleOf (value, schema, opts) {
    // TODO
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor91
   *
   * @name Schema.validationKeywords.not
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  not (value, schema, opts) {
    if (!validate(value, schema.not, opts)) {
      // TODO: better messaging
      return makeError('succeeded', 'should have failed', opts)
    }
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor88
   *
   * @name Schema.validationKeywords.oneOf
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  oneOf (value, schema, opts) {
    let validated = false
    let allErrors = []
    schema.oneOf.forEach(function (_schema) {
      const errors = validate(value, _schema, opts)
      if (errors) {
        allErrors = allErrors.concat(errors)
      } else if (validated) {
        allErrors = [makeError('valid against more than one', 'valid against only one', opts)]
        validated = false
        return false
      } else {
        validated = true
      }
    })
    return validated ? undefined : allErrors
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor33
   *
   * @name Schema.validationKeywords.pattern
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  pattern (value, schema, opts) {
    const pattern = schema.pattern
    if (utils.isString(value) && !value.match(pattern)) {
      return makeError(value, pattern, opts)
    }
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor64
   *
   * @name Schema.validationKeywords.properties
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  properties (value, schema, opts) {
    opts || (opts = {})
    // Can be a boolean or an object
    // Technically the default is an "empty schema", but here "true" is
    // functionally the same
    const additionalProperties = utils.isUndefined(schema.additionalProperties) ? true : schema.additionalProperties
    // "s": The property set of the instance to validate.
    const toValidate = {}
    // "p": The property set from "properties".
    // Default is an object
    const properties = schema.properties || {}
    // "pp": The property set from "patternProperties".
    // Default is an object
    const patternProperties = schema.patternProperties || {}
    let errors = []

    // Collect set "s"
    utils.forOwn(value, function (_value, prop) {
      toValidate[prop] = undefined
    })
    // Remove from "s" all elements of "p", if any.
    utils.forOwn(properties || {}, function (_schema, prop) {
      if (utils.isUndefined(value[prop]) && !utils.isUndefined(_schema['default'])) {
        value[prop] = utils.copy(_schema['default'])
      }
      opts.prop = prop
      errors = errors.concat(validate(value[prop], _schema, opts) || [])
      delete toValidate[prop]
    })
    // For each regex in "pp", remove all elements of "s" which this regex
    // matches.
    utils.forOwn(patternProperties, function (_schema, pattern) {
      utils.forOwn(toValidate, function (undef, prop) {
        if (prop.match(pattern)) {
          opts.prop = prop
          errors = errors.concat(validate(value[prop], _schema, opts) || [])
          delete toValidate[prop]
        }
      })
    })
    const keys = Object.keys(toValidate)
    // If "s" is not empty, validation fails
    if (additionalProperties === false) {
      if (keys.length) {
        addError(`extra fields: ${keys.join(', ')}`, 'no extra fields', opts, errors)
      }
    } else if (utils.isObject(additionalProperties)) {
      // Otherwise, validate according to provided schema
      keys.forEach(function (prop) {
        opts.prop = prop
        errors = errors.concat(validate(value[prop], additionalProperties, opts) || [])
      })
    }
    return errors.length ? errors : undefined
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor61
   *
   * @name Schema.validationKeywords.required
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  required (value, schema, opts) {
    const required = schema.required
    let errors = []
    if (!opts.existingOnly) {
      required.forEach(function (prop) {
        if (utils.isUndefined(utils.get(value, prop))) {
          const prevProp = opts.prop
          opts.prop = prop
          addError(undefined, 'a value', opts, errors)
          opts.prop = prevProp
        }
      })
    }
    return errors.length ? errors : undefined
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor79
   *
   * @name Schema.validationKeywords.type
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  type (value, schema, opts) {
    let type = schema.type
    let validType
    // Can be one of several types
    if (utils.isString(type)) {
      type = [type]
    }
    // Try to match the value against an expected type
    type.forEach(function (_type) {
      // TODO: throw an error if type is not defined
      if (types[_type](value, schema, opts)) {
        // Matched a type
        validType = _type
        return false
      }
    })
    // Value did not match any expected type
    if (!validType) {
      return makeError(value ? typeof value : '' + value, `one of (${type.join(', ')})`, opts)
    }
    // Run keyword validators for matched type
    // http://json-schema.org/latest/json-schema-validation.html#anchor12
    const validator = typeGroupValidators[validType]
    if (validator) {
      return validator(value, schema, opts)
    }
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor49
   *
   * @name Schema.validationKeywords.uniqueItems
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  uniqueItems (value, schema, opts) {
    if (value && value.length && schema.uniqueItems) {
      const length = value.length
      let item, i, j
      // Check n - 1 items
      for (i = length - 1; i > 0; i--) {
        item = value[i]
        // Only compare against unchecked items
        for (j = i - 1; j >= 0; j--) {
          // Found a duplicate
          if (item === value[j]) {
            return makeError(item, 'no duplicates', opts)
          }
        }
      }
    }
  }
}

/**
 * @ignore
 */
const validateKeyword = function (op, value, schema, opts) {
  return !utils.isUndefined(schema[op]) && validationKeywords[op](value, schema, opts)
}

/**
 * @ignore
 */
const runOps = function (ops, value, schema, opts) {
  let errors = []
  ops.forEach(function (op) {
    errors = errors.concat(validateKeyword(op, value, schema, opts) || [])
  })
  return errors.length ? errors : undefined
}

const ANY_OPS = ['enum', 'type', 'allOf', 'anyOf', 'oneOf', 'not']
const ARRAY_OPS = ['items', 'maxItems', 'minItems', 'uniqueItems']
const NUMERIC_OPS = ['multipleOf', 'maximum', 'minimum']
const OBJECT_OPS = ['maxProperties', 'minProperties', 'required', 'properties', 'dependencies']
const STRING_OPS = ['maxLength', 'minLength', 'pattern']

/**
 * http://json-schema.org/latest/json-schema-validation.html#anchor75
 * @ignore
 */
const validateAny = function (value, schema, opts) {
  return runOps(ANY_OPS, value, schema, opts)
}

/**
 * TODO
 *
 * @name Schema.validate
 * @method
 * @param {*} value TODO
 * @param {Object} [schema] TODO
 * @param {Object} [opts] Configuration options.
 */
const validate = function (value, schema, opts) {
  let errors = []
  opts || (opts = {})
  let shouldPop
  let prevProp = opts.prop
  if (utils.isUndefined(schema)) {
    return
  }
  if (!utils.isObject(schema)) {
    throw new Error(`Invalid schema at path: "${opts.path}"`)
  }
  if (utils.isUndefined(opts.path)) {
    opts.path = []
  }
  // Track our location as we recurse
  if (!utils.isUndefined(opts.prop)) {
    shouldPop = true
    opts.path.push(opts.prop)
    opts.prop = undefined
  }
  // Validate against parent schema
  if (schema['extends']) {
    // opts.path = path
    // opts.prop = prop
    if (utils.isFunction(schema['extends'].validate)) {
      errors = errors.concat(schema['extends'].validate(value, opts) || [])
    } else {
      errors = errors.concat(validate(value, schema['extends'], opts) || [])
    }
  }
  if (utils.isUndefined(value)) {
    // Check if property is required
    if (schema.required === true) {
      addError(value, 'a value', opts, errors)
    }
    if (shouldPop) {
      opts.path.pop()
      opts.prop = prevProp
    }
    return errors.length ? errors : undefined
  }
  errors = errors.concat(validateAny(value, schema, opts) || [])
  if (shouldPop) {
    opts.path.pop()
    opts.prop = prevProp
  }
  return errors.length ? errors : undefined
}

// These strings are cached for optimal performance of the change detection
// boolean - Whether a Record is changing in the current execution frame
const changingPath = 'changing'
// string[] - Properties that have changed in the current execution frame
const changedPath = 'changed'
// boolean - Whether a Record is currently being instantiated
const creatingPath = 'creating'
// number - The setTimeout change event id of a Record, if any
const eventIdPath = 'eventId'
// boolean - Whether to skip validation for a Record's currently changing property
const noValidatePath = 'noValidate'
// boolean - Whether to skip change notification for a Record's currently
// changing property
const silentPath = 'silent'
const validationFailureMsg = 'validation failed'

/**
 * Assemble a property descriptor which will be added to the prototype of
 * {@link Mapper#recordClass}. This method is called when
 * {@link Mapper#applySchema} is set to `true`.
 *
 * TODO: Make this more configurable, i.e. not so tied to the Record class.
 *
 * @ignore
 */
const makeDescriptor = function (prop, schema, opts) {
  const descriptor = {
    // These properties are enumerable by default, but regardless of their
    // enumerability, they won't be "own" properties of individual records
    enumerable: utils.isUndefined(schema.enumerable) ? true : !!schema.enumerable
  }
  // Cache a few strings for optimal performance
  const keyPath = `props.${prop}`
  const previousPath = `previous.${prop}`
  const getter = opts.getter
  const setter = opts.setter
  const unsetter = opts.unsetter

  descriptor.get = function () { return this._get(keyPath) }
  descriptor.set = function (value) {
    const self = this
    // These are accessed a lot
    const _get = self[getter]
    const _set = self[setter]
    const _unset = self[unsetter]

    // Optionally check that the new value passes validation
    if (!_get(noValidatePath)) {
      const errors = schema.validate(value)
      if (errors) {
        // Immediately throw an error, preventing the record from getting into
        // an invalid state
        const error = new Error(validationFailureMsg)
        error.errors = errors
        throw error
      }
    }
    // TODO: Make it so tracking can be turned on for all properties instead of
    // only per-property
    if (schema.track && !_get(creatingPath)) {
      const previous = _get(previousPath)
      const current = _get(keyPath)
      let changing = _get(changingPath)
      let changed = _get(changedPath)

      if (!changing) {
        // Track properties that are changing in the current event loop
        changed = []
      }

      // Add changing properties to this array once at most
      const index = changed.indexOf(prop)
      if (current !== value && index === -1) {
        changed.push(prop)
      }
      if (previous === value) {
        if (index >= 0) {
          changed.splice(index, 1)
        }
      }
      // No changes in current event loop
      if (!changed.length) {
        changing = false
        _unset(changingPath)
        _unset(changedPath)
        // Cancel pending change event
        if (_get(eventIdPath)) {
          clearTimeout(_get(eventIdPath))
          _unset(eventIdPath)
        }
      }
      // Changes detected in current event loop
      if (!changing && changed.length) {
        _set(changedPath, changed)
        _set(changingPath, true)
        // Saving the timeout id allows us to batch all changes in the same
        // event loop into a single "change"
        // TODO: Optimize
        _set(eventIdPath, setTimeout(() => {
          // Previous event loop where changes were gathered has ended, so
          // notify any listeners of those changes and prepare for any new
          // changes
          _unset(changedPath)
          _unset(eventIdPath)
          _unset(changingPath)
          // TODO: Optimize
          if (!_get(silentPath)) {
            let i
            for (i = 0; i < changed.length; i++) {
              self.emit('change:' + changed[i], self, utils.get(self, changed[i]))
            }
            self.emit('change', self, self.changes())
          }
          _unset(silentPath)
        }, 0))
      }
    }
    _set(keyPath, value)
    return value
  }

  return descriptor
}

/**
 * TODO
 *
 * @name Schema.typeGroupValidators
 * @type {Object}
 */
const typeGroupValidators = {
  /**
   * TODO
   *
   * @name Schema.typeGroupValidators.array
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  array: function (value, schema, opts) {
    return runOps(ARRAY_OPS, value, schema, opts)
  },

  /**
   * TODO
   *
   * @name Schema.typeGroupValidators.integer
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  integer: function (value, schema, opts) {
    // Additional validations for numerics are the same
    return typeGroupValidators.numeric(value, schema, opts)
  },

  /**
   * TODO
   *
   * @name Schema.typeGroupValidators.number
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  number: function (value, schema, opts) {
    // Additional validations for numerics are the same
    return typeGroupValidators.numeric(value, schema, opts)
  },

  /**
   * TODO
   *
   * See http://json-schema.org/latest/json-schema-validation.html#anchor13.
   *
   * @name Schema.typeGroupValidators.numeric
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  numeric: function (value, schema, opts) {
    return runOps(NUMERIC_OPS, value, schema, opts)
  },

  /**
   * TODO
   *
   * See http://json-schema.org/latest/json-schema-validation.html#anchor53.
   *
   * @name Schema.typeGroupValidators.object
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  object: function (value, schema, opts) {
    return runOps(OBJECT_OPS, value, schema, opts)
  },

  /**
   * TODO
   *
   * See http://json-schema.org/latest/json-schema-validation.html#anchor25.
   *
   * @name Schema.typeGroupValidators.string
   * @method
   * @param {*} value TODO
   * @param {Object} schema TODO
   * @param {Object} opts TODO
   */
  string: function (value, schema, opts) {
    return runOps(STRING_OPS, value, schema, opts)
  }
}

/**
 * js-data's Schema class.
 *
 * ```javascript
 * import {Schema} from 'js-data'
 * ```
 *
 * @class Schema
 * @extends Component
 * @param {Object} definition Schema definition according to json-schema.org
 */
export default Component.extend({
  constructor: function Schema (definition) {
    // const self = this
    definition || (definition = {})
    // TODO: schema validation
    utils.fillIn(this, definition)

    // TODO: rework this to make sure all possible keywords are converted
    if (definition.properties) {
      utils.forOwn(definition.properties, function (_definition, prop) {
        if (!(_definition instanceof Schema)) {
          definition.properties[prop] = new Schema(_definition)
        }
      })
    }
  },

  /**
   * This adds ES5 getters/setters to the target based on the "properties" in
   * this Schema, which makes possible change tracking and validation on
   * property assignment.
   *
   * @name Schema#validate
   * @method
   * @param {Object} target The prototype to which to apply this schema.
   */
  apply (target, opts) {
    opts || (opts = {})
    opts.getter = opts.getter || '_get'
    opts.setter = opts.setter || '_set'
    opts.unsetter = opts.unsetter || '_unset'
    const properties = this.properties || {}
    utils.forOwn(properties, function (schema, prop) {
      Object.defineProperty(
        target,
        prop,
        makeDescriptor(prop, schema, opts)
      )
    })
  },

  /**
   * Validate the provided value against this schema.
   *
   * @name Schema#validate
   * @method
   * @param {*} value Value to validate.
   * @param {Object} [opts] Configuration options.
   * @return {(array|undefined)} Array of errors or `undefined` if valid.
   */
  validate (value, opts) {
    return validate(value, this, opts)
  }
}, {
  typeGroupValidators,
  types,
  validate,
  validationKeywords
})
