import {
  copy,
  fillIn,
  forOwn,
  get,
  isArray,
  isBoolean,
  isFunction,
  isInteger,
  isNumber,
  isNull,
  isObject,
  isString,
  isUndefined
} from './utils'

export const types = {
  array: isArray,
  boolean: isBoolean,
  integer: isInteger,
  'null': isNull,
  number: isNumber,
  object: isObject,
  string: isString
}

export const typeGroupValidators = {}
export const validationKeywords = {}

const segmentToString = function (segment, prev) {
  let str = ''
  if (segment) {
    if (isNumber(segment)) {
      str += `[${segment}]`
    } else if (prev) {
      str += `.${segment}`
    } else {
      str += `${segment}`
    }
  }
  return str
}

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

const makeError = function (actual, expected, opts) {
  return {
    expected,
    actual: '' + actual,
    path: makePath(opts)
  }
}

const addError = function (actual, expected, opts, errors) {
  errors.push(makeError(actual, expected, opts))
}

const maxLengthCommon = function (keyword, value, schema, opts) {
  const max = schema[keyword]
  if (value.length > max) {
    return makeError(value.length, `length no more than ${max}`, opts)
  }
}

const minLengthCommon = function (keyword, value, schema, opts) {
  const min = schema[keyword]
  if (value.length < min) {
    return makeError(value.length, `length no less than ${min}`, opts)
  }
}

const validateKeyword = function (op, value, schema, opts) {
  return !isUndefined(schema[op]) && validationKeywords[op](value, schema, opts)
}

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
 * @param {*} value
 * @param {Object} [schema]
 * @param {Object} [opts] Configuration options.
 */
const validateAny = function (value, schema, opts) {
  return runOps(ANY_OPS, value, schema, opts)
}

/**
 * @param {*} value
 * @param {Object} [schema]
 * @param {Object} [opts]
 */
export const validate = function (value, schema, opts) {
  let errors = []
  opts || (opts = {})
  let shouldPop
  let prevProp = opts.prop
  if (isUndefined(schema)) {
    return
  }
  if (!isObject(schema)) {
    throw new Error(`Invalid schema at path: "${opts.path}"`)
  }
  if (isUndefined(opts.path)) {
    opts.path = []
  }
  // Track our location as we recurse
  if (!isUndefined(opts.prop)) {
    shouldPop = true
    opts.path.push(opts.prop)
    opts.prop = undefined
  }
  // Validate against parent schema
  if (schema['extends']) {
    // opts.path = path
    // opts.prop = prop
    if (isFunction(schema['extends'].validate)) {
      errors = errors.concat(schema['extends'].validate(value, opts) || [])
    } else {
      errors = errors.concat(validate(value, schema['extends'], opts) || [])
    }
  }
  if (isUndefined(value)) {
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

fillIn(validationKeywords, {
  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor82
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
   */
  dependencies (value, schema, opts) {
    // TODO
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor76
   */
  enum (value, schema, opts) {
    const possibleValues = schema['enum']
    if (possibleValues.indexOf(value) === -1) {
      return makeError(value, `one of (${possibleValues.join(', ')})`, opts)
    }
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor37
   */
  items (value, schema, opts) {
    opts || (opts = {})
    // TODO: additionalItems
    let items = schema.items
    let errors = []
    const checkingTuple = isArray(items)
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
   */
  maxItems (value, schema, opts) {
    return maxLengthCommon('maxItems', value, schema, opts)
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor26
   */
  maxLength (value, schema, opts) {
    return maxLengthCommon('maxLength', value, schema, opts)
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor54
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
   */
  minItems (value, schema, opts) {
    return minLengthCommon('minItems', value, schema, opts)
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor29
   */
  minLength (value, schema, opts) {
    return minLengthCommon('minLength', value, schema, opts)
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor57
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
   */
  multipleOf (value, schema, opts) {
    // TODO
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor91
   */
  not (value, schema, opts) {
    if (!validate(value, schema.not, opts)) {
      // TODO: better messaging
      return makeError('succeeded', 'should have failed', opts)
    }
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor88
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
   */
  pattern (value, schema, opts) {
    const pattern = schema.pattern
    if (isString(value) && !value.match(pattern)) {
      return makeError(value, pattern, opts)
    }
  },

  /**
   * http://json-schema.org/latest/json-schema-validation.html#anchor64
   */
  properties (value, schema, opts) {
    opts || (opts = {})
    // Can be a boolean or an object
    // Technically the default is an "empty schema", but here "true" is
    // functionally the same
    const additionalProperties = isUndefined(schema.additionalProperties) ? true : schema.additionalProperties
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
    forOwn(value, function (_value, prop) {
      toValidate[prop] = undefined
    })
    // Remove from "s" all elements of "p", if any.
    forOwn(properties || {}, function (_schema, prop) {
      if (isUndefined(value[prop]) && !isUndefined(_schema['default'])) {
        value[prop] = copy(_schema['default'])
      }
      opts.prop = prop
      errors = errors.concat(validate(value[prop], _schema, opts) || [])
      delete toValidate[prop]
    })
    // For each regex in "pp", remove all elements of "s" which this regex
    // matches.
    forOwn(patternProperties, function (_schema, pattern) {
      forOwn(toValidate, function (undef, prop) {
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
    } else if (isObject(additionalProperties)) {
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
   */
  required (value, schema, opts) {
    const required = schema.required
    let errors = []
    if (!opts.existingOnly) {
      required.forEach(function (prop) {
        if (isUndefined(get(value, prop))) {
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
   */
  type (value, schema, opts) {
    let type = schema.type
    let validType
    // Can be one of several types
    if (isString(type)) {
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
})

fillIn(typeGroupValidators, {
  array: function (value, schema, opts) {
    return runOps(ARRAY_OPS, value, schema, opts)
  },

  integer: function (value, schema, opts) {
    // Additional validations for numerics are the same
    return typeGroupValidators.numeric(value, schema, opts)
  },

  number: function (value, schema, opts) {
    // Additional validations for numerics are the same
    return typeGroupValidators.numeric(value, schema, opts)
  },

  /**
   * See http://json-schema.org/latest/json-schema-validation.html#anchor13
   * @param {*} value
   * @param {Object} [schema]
   * @param {Object} [opts] Configuration options.
   */
  numeric: function (value, schema, opts) {
    return runOps(NUMERIC_OPS, value, schema, opts)
  },

  /**
   * See http://json-schema.org/latest/json-schema-validation.html#anchor53
   * @param {*} value
   * @param {Object} [schema]
   * @param {Object} [opts] Configuration options.
   */
  object: function (value, schema, opts) {
    return runOps(OBJECT_OPS, value, schema, opts)
  },

  /**
   * See http://json-schema.org/latest/json-schema-validation.html#anchor25
   * @param {*} value
   * @param {Object} [schema]
   * @param {Object} [opts] Configuration options.
   */
  string: function (value, schema, opts) {
    return runOps(STRING_OPS, value, schema, opts)
  }
})

/**
 * js-data's Schema class.
 * @class Schema
 *
 * @param {Object} definition Schema definition according to json-schema.org
 */
export function Schema (definition) {
  // const self = this
  definition || (definition = {})
  // TODO: schema validation
  fillIn(this, definition)

  // TODO: rework this to make sure all possible keywords are converted
  // if (definition.properties) {
  //   forOwn(definition.properties, function (_definition, prop) {
  //     definition.properties[prop] = new Schema(_definition)
  //   })
  // }
}

/**
 * Validate the provided value against this schema.
 *
 * @param {*} value Value to validate.
 * @param {Object} [opts] Configuration options.
 * @return {(array|undefined)} Array of errors or `undefined` if valid.
 */
Schema.prototype.validate = function (value, opts) {
  return validate(value, this, opts)
}
