import utils from './utils'
import Component from './Component'
import { TsDataError } from './TsDataError'

const DOMAIN = 'Schema'

/**
 * A function map for each of the seven primitive JSON types defined by the core specification.
 * Each function will check a given value and return true or false if the value is an instance of that type.
 * ```
 *   types.integer(1) // returns true
 *   types.string({}) // returns false
 * ```
 * http://json-schema.org/latest/json-schema-core.html#anchor8
 * @name Schema.types
 * @type {object}
 */
const types = {
  array: utils.isArray,
  boolean: utils.isBoolean,
  integer: utils.isInteger,
  null: utils.isNull,
  number: utils.isNumber,
  object: utils.isObject,
  string: utils.isString
}

/**
 * @ignore
 */
function segmentToString (segment, prev) {
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
function makePath (opts: any = {}) {
  let path = ''
  const segments = opts.path || []
  segments.forEach(segment => {
    path += segmentToString(segment, path)
  })
  path += segmentToString(opts.prop, path)
  return path
}

/**
 * @ignore
 */
function makeError (actual, expected, opts) {
  return {
    expected,
    actual: '' + actual,
    path: makePath(opts)
  }
}

/**
 * @ignore
 */
function addError (actual, expected, opts, errors) {
  errors.push(makeError(actual, expected, opts))
}

/**
 * @ignore
 */
function maxLengthCommon (keyword, value, schema, opts) {
  const max = schema[keyword]
  if (value.length > max) {
    return makeError(value.length, `length no more than ${max}`, opts)
  }
}

/**
 * @ignore
 */
function minLengthCommon (keyword, value, schema, opts) {
  const min = schema[keyword]
  if (value.length < min) {
    return makeError(value.length, `length no less than ${min}`, opts)
  }
}

/**
 * A map of all object member validation functions for each keyword defined in the JSON Schema.
 * @name Schema.validationKeywords
 * @type {object}
 */
const validationKeywords = {
  /**
   * Validates the provided value against all schemas defined in the Schemas `allOf` keyword.
   * The instance is valid against if and only if it is valid against all the schemas declared in the Schema's value.
   *
   * The value of this keyword MUST be an array. This array MUST have at least one element.
   * Each element of this array MUST be a valid JSON Schema.
   *
   * see http://json-schema.org/latest/json-schema-validation.html#anchor82
   *
   * @name Schema.validationKeywords.allOf
   * @method
   * @param {*} value Value to be validated.
   * @param {object} schema Schema containing the `allOf` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  allOf (value, schema, opts) {
    let allErrors = []
    schema.allOf.forEach(_schema => {
      allErrors = allErrors.concat(validate(value, _schema, opts) || [])
    })
    return allErrors.length ? allErrors : undefined
  },

  /**
   * Validates the provided value against all schemas defined in the Schemas `anyOf` keyword.
   * The instance is valid against this keyword if and only if it is valid against
   * at least one of the schemas in this keyword's value.
   *
   * The value of this keyword MUST be an array. This array MUST have at least one element.
   * Each element of this array MUST be an object, and each object MUST be a valid JSON Schema.
   * see http://json-schema.org/latest/json-schema-validation.html#anchor85
   *
   * @name Schema.validationKeywords.anyOf
   * @method
   * @param {*} value Value to be validated.
   * @param {object} schema Schema containing the `anyOf` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  anyOf (value, schema, opts) {
    let validated = false
    let allErrors = []
    schema.anyOf.forEach(_schema => {
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
   * @param {object} schema TODO
   * @param {object} opts TODO
   */
  dependencies (value, schema, opts) {
    // TODO
  },

  /**
   * Validates the provided value against an array of possible values defined by the Schema's `enum` keyword
   * Validation succeeds if the value is deeply equal to one of the values in the array.
   * see http://json-schema.org/latest/json-schema-validation.html#anchor76
   *
   * @name Schema.validationKeywords.enum
   * @method
   * @param {*} value Value to validate
   * @param {object} schema Schema containing the `enum` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  enum (value, schema, opts) {
    const possibleValues = schema.enum
    if (utils.findIndex(possibleValues, item => utils.deepEqual(item, value)) === -1) {
      return makeError(value, `one of (${possibleValues.join(', ')})`, opts)
    }
  },

  /**
   * Validates each of the provided array values against a schema or an array of schemas defined by the Schema's
   * `items` keyword
   * see http://json-schema.org/latest/json-schema-validation.html#anchor37 for validation rules.
   *
   * @name Schema.validationKeywords.items
   * @method
   * @param {*} value Array to be validated.
   * @param {object} schema Schema containing the items keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  items (value, schema, opts: any = {}) {
    // TODO: additionalItems
    let items = schema.items
    let errors = []
    const checkingTuple = utils.isArray(items)
    const length = value.length
    for (let prop = 0; prop < length; prop++) {
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
   * Validates the provided number against a maximum value defined by the Schema's `maximum` keyword
   * Validation succeeds if the value is a number, and is less than, or equal to, the value of this keyword.
   * http://json-schema.org/latest/json-schema-validation.html#anchor17
   *
   * @name Schema.validationKeywords.maximum
   * @method
   * @param {*} value Number to validate against the keyword.
   * @param {object} schema Schema containing the `maximum` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  maximum (value, schema, opts) {
    // Must be a number
    const maximum = schema.maximum
    // Must be a boolean
    // Depends on maximum
    // default: false
    const exclusiveMaximum = schema.exclusiveMaximum
    if (typeof value === typeof maximum && !(exclusiveMaximum ? maximum > value : maximum >= value)) {
      return exclusiveMaximum
        ? makeError(value, `no more than nor equal to ${maximum}`, opts)
        : makeError(value, `no more than ${maximum}`, opts)
    }
  },

  /**
   * Validates the length of the provided array against a maximum value defined by the Schema's `maxItems` keyword.
   * Validation succeeds if the length of the array is less than, or equal to the value of this keyword.
   * see http://json-schema.org/latest/json-schema-validation.html#anchor42
   *
   * @name Schema.validationKeywords.maxItems
   * @method
   * @param {*} value Array to be validated.
   * @param {object} schema Schema containing the `maxItems` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  maxItems (value, schema, opts) {
    if (utils.isArray(value)) {
      return maxLengthCommon('maxItems', value, schema, opts)
    }
  },

  /**
   * Validates the length of the provided string against a maximum value defined in the Schema's `maxLength` keyword.
   * Validation succeeds if the length of the string is less than, or equal to the value of this keyword.
   * see http://json-schema.org/latest/json-schema-validation.html#anchor26
   *
   * @name Schema.validationKeywords.maxLength
   * @method
   * @param {*} value String to be validated.
   * @param {object} schema Schema containing the `maxLength` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  maxLength (value, schema, opts) {
    return maxLengthCommon('maxLength', value, schema, opts)
  },

  /**
   * Validates the count of the provided object's properties against a maximum value defined in the Schema's
   * `maxProperties` keyword.
   * Validation succeeds if the object's property count is less than, or equal to the value of this keyword.
   * see http://json-schema.org/latest/json-schema-validation.html#anchor54
   *
   * @name Schema.validationKeywords.maxProperties
   * @method
   * @param {*} value Object to be validated.
   * @param {object} schema Schema containing the `maxProperties` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  maxProperties (value, schema, opts) {
    // validate only objects
    if (!utils.isObject(value)) return
    const maxProperties = schema.maxProperties
    const length = Object.keys(value).length
    if (length > maxProperties) {
      return makeError(length, `no more than ${maxProperties} properties`, opts)
    }
  },

  /**
   * Validates the provided value against a minimum value defined by the Schema's `minimum` keyword
   * Validation succeeds if the value is a number and is greater than, or equal to, the value of this keyword.
   * http://json-schema.org/latest/json-schema-validation.html#anchor21
   *
   * @name Schema.validationKeywords.minimum
   * @method
   * @param {*} value Number to validate against the keyword.
   * @param {object} schema Schema containing the `minimum` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  minimum (value, schema, opts) {
    // Must be a number
    const minimum = schema.minimum
    // Must be a boolean
    // Depends on minimum
    // default: false
    const exclusiveMinimum = schema.exclusiveMinimum
    if (typeof value === typeof minimum && !(exclusiveMinimum ? value > minimum : value >= minimum)) {
      return exclusiveMinimum
        ? makeError(value, `no less than nor equal to ${minimum}`, opts)
        : makeError(value, `no less than ${minimum}`, opts)
    }
  },

  /**
   * Validates the length of the provided array against a minimum value defined by the Schema's `minItems` keyword.
   * Validation succeeds if the length of the array is greater than, or equal to the value of this keyword.
   * see http://json-schema.org/latest/json-schema-validation.html#anchor45
   *
   * @name Schema.validationKeywords.minItems
   * @method
   * @param {*} value Array to be validated.
   * @param {object} schema Schema containing the `minItems` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  minItems (value, schema, opts) {
    if (utils.isArray(value)) {
      return minLengthCommon('minItems', value, schema, opts)
    }
  },

  /**
   * Validates the length of the provided string against a minimum value defined in the Schema's `minLength` keyword.
   * Validation succeeds if the length of the string is greater than, or equal to the value of this keyword.
   * see http://json-schema.org/latest/json-schema-validation.html#anchor29
   *
   * @name Schema.validationKeywords.minLength
   * @method
   * @param {*} value String to be validated.
   * @param {object} schema Schema containing the `minLength` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  minLength (value, schema, opts) {
    return minLengthCommon('minLength', value, schema, opts)
  },

  /**
   * Validates the count of the provided object's properties against a minimum value defined in the Schema's
   * `minProperties` keyword.
   * Validation succeeds if the object's property count is greater than, or equal to the value of this keyword.
   * see http://json-schema.org/latest/json-schema-validation.html#anchor57
   *
   * @name Schema.validationKeywords.minProperties
   * @method
   * @param {*} value Object to be validated.
   * @param {object} schema Schema containing the `minProperties` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  minProperties (value, schema, opts) {
    // validate only objects
    if (!utils.isObject(value)) return
    const minProperties = schema.minProperties
    const length = Object.keys(value).length
    if (length < minProperties) {
      return makeError(length, `no more than ${minProperties} properties`, opts)
    }
  },

  /**
   * Validates the provided number is a multiple of the number defined in the Schema's `multipleOf` keyword.
   * Validation succeeds if the number can be divided equally into the value of this keyword.
   * see http://json-schema.org/latest/json-schema-validation.html#anchor14
   *
   * @name Schema.validationKeywords.multipleOf
   * @method
   * @param {*} value Number to be validated.
   * @param {object} schema Schema containing the `multipleOf` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  multipleOf (value, schema, opts) {
    const multipleOf = schema.multipleOf
    if (utils.isNumber(value)) {
      if ((value / multipleOf) % 1 !== 0) {
        return makeError(value, `multipleOf ${multipleOf}`, opts)
      }
    }
  },

  /**
   * Validates the provided value is not valid with any of the schemas defined in the Schema's `not` keyword.
   * An instance is valid against this keyword if and only if it is NOT valid against the schemas in this keyword's
   * value.
   *
   * see http://json-schema.org/latest/json-schema-validation.html#anchor91
   * @name Schema.validationKeywords.not
   * @method
   * @param {*} value to be checked.
   * @param {object} schema Schema containing the not keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  not (value, schema, opts) {
    if (!validate(value, schema.not, opts)) {
      // TODO: better messaging
      return makeError('succeeded', 'should have failed', opts)
    }
  },

  /**
   * Validates the provided value is valid with one and only one of the schemas defined in the Schema's `oneOf` keyword.
   * An instance is valid against this keyword if and only if it is valid against a single schemas in this keyword's
   * value.
   *
   * see http://json-schema.org/latest/json-schema-validation.html#anchor88
   * @name Schema.validationKeywords.oneOf
   * @method
   * @param {*} value to be checked.
   * @param {object} schema Schema containing the `oneOf` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  oneOf (value, schema, opts) {
    let validated = false
    let allErrors = []
    schema.oneOf.forEach(_schema => {
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
   * Validates the provided string matches a pattern defined in the Schema's `pattern` keyword.
   * Validation succeeds if the string is a match of the regex value of this keyword.
   *
   * see http://json-schema.org/latest/json-schema-validation.html#anchor33
   * @name Schema.validationKeywords.pattern
   * @method
   * @param {*} value String to be validated.
   * @param {object} schema Schema containing the `pattern` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  pattern (value, schema, opts) {
    const pattern = schema.pattern
    if (utils.isString(value) && !value.match(pattern)) {
      return makeError(value, pattern, opts)
    }
  },

  /**
   * Validates the provided object's properties against a map of values defined in the Schema's `properties` keyword.
   * Validation succeeds if the object's property are valid with each of the schema's in the provided map.
   * Validation also depends on the additionalProperties and or patternProperties.
   *
   * see http://json-schema.org/latest/json-schema-validation.html#anchor64 for more info.
   *
   * @name Schema.validationKeywords.properties
   * @method
   * @param {*} value Object to be validated.
   * @param {object} schema Schema containing the `properties` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  properties (value, schema, opts: any = {}) {
    if (utils.isArray(value)) {
      return
    }

    // Can be a boolean or an object
    // Technically the default is an "empty schema", but here "true" is
    // functionally the same
    const additionalProperties = schema.additionalProperties === undefined ? true : schema.additionalProperties
    const validated = []
    // "p": The property set from "properties".
    // Default is an object
    const properties = schema.properties || {}
    // "pp": The property set from "patternProperties".
    // Default is an object
    const patternProperties = schema.patternProperties || {}
    let errors = []

    utils.forOwn(properties, (_schema, prop) => {
      opts.prop = prop
      errors = errors.concat(validate(value[prop], _schema, opts) || [])
      validated.push(prop)
    })

    const toValidate = utils.omit(value, validated)
    utils.forOwn(patternProperties, (_schema, pattern) => {
      utils.forOwn(toValidate, (undef, prop) => {
        if (prop.match(pattern)) {
          opts.prop = prop
          errors = errors.concat(validate(value[prop], _schema, opts) || [])
          validated.push(prop)
        }
      })
    })
    const keys = Object.keys(utils.omit(value, validated))
    // If "s" is not empty, validation fails
    if (additionalProperties === false) {
      if (keys.length) {
        const origProp = opts.prop
        opts.prop = ''
        addError(`extra fields: ${keys.join(', ')}`, 'no extra fields', opts, errors)
        opts.prop = origProp
      }
    } else if (utils.isObject(additionalProperties)) {
      // Otherwise, validate according to provided schema
      keys.forEach(prop => {
        opts.prop = prop
        errors = errors.concat(validate(value[prop], additionalProperties, opts) || [])
      })
    }
    return errors.length ? errors : undefined
  },

  /**
   * Validates the provided object's has all properties listed in the Schema's `properties` keyword array.
   * Validation succeeds if the object contains all properties provided in the array value of this keyword.
   * see http://json-schema.org/latest/json-schema-validation.html#anchor61
   *
   * @name Schema.validationKeywords.required
   * @method
   * @param {*} value Object to be validated.
   * @param {object} schema Schema containing the `required` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  required (value, schema, opts: any = {}) {
    const required = schema.required
    const errors = []
    if (!opts.existingOnly) {
      required.forEach(prop => {
        if (utils.get(value, prop) === undefined) {
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
   * Validates the provided value's type is equal to the type, or array of types, defined in the Schema's `type`
   * keyword.
   * see http://json-schema.org/latest/json-schema-validation.html#anchor79
   *
   * @name Schema.validationKeywords.type
   * @method
   * @param {*} value Value to be validated.
   * @param {object} schema Schema containing the `type` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  type (value, schema, opts) {
    let type = schema.type
    let validType
    // Can be one of several types
    if (utils.isString(type)) {
      type = [type]
    }
    // Try to match the value against an expected type
    type.forEach(_type => {
      // TODO: throw an error if type is not defined
      if (types[_type](value, schema, opts)) {
        // Matched a type
        validType = _type
        return false
      }
    })
    // Value did not match any expected type
    if (!validType) {
      return makeError(
        value !== undefined && value !== null ? typeof value : '' + value,
        `one of (${type.join(', ')})`,
        opts
      )
    }
    // Run keyword validators for matched type
    // http://json-schema.org/latest/json-schema-validation.html#anchor12
    const validator = typeGroupValidators[validType]
    if (validator) {
      return validator(value, schema, opts)
    }
  },

  /**
   * Validates the provided array values are unique.
   * Validation succeeds if the items in the array are unique, but only if the value of this keyword is true
   * see http://json-schema.org/latest/json-schema-validation.html#anchor49
   *
   * @name Schema.validationKeywords.uniqueItems
   * @method
   * @param {*} value Array to be validated.
   * @param {object} schema Schema containing the `uniqueItems` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  uniqueItems (value, schema, opts) {
    if (value?.length && schema.uniqueItems) {
      const length = value.length
      let item, i, j
      // Check n - 1 items
      for (i = length - 1; i > 0; i--) {
        item = value[i]
        // Only compare against unchecked items
        for (j = i - 1; j >= 0; j--) {
          // Found a duplicate
          if (utils.deepEqual(item, value[j])) {
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
function runOps (ops, value, schema, opts) {
  let errors = []
  ops.forEach(op => {
    if (schema[op] !== undefined) {
      errors = errors.concat(validationKeywords[op](value, schema, opts) || [])
    }
  })
  return errors.length ? errors : undefined
}

/**
 * Validation keywords validated for any type:
 *
 * - `enum`
 * - `type`
 * - `allOf`
 * - `anyOf`
 * - `oneOf`
 * - `not`
 *
 * @name Schema.ANY_OPS
 * @type {string[]}
 */
const ANY_OPS = ['enum', 'type', 'allOf', 'anyOf', 'oneOf', 'not']

/**
 * Validation keywords validated for array types:
 *
 * - `items`
 * - `maxItems`
 * - `minItems`
 * - `uniqueItems`
 *
 * @name Schema.ARRAY_OPS
 * @type {string[]}
 */
const ARRAY_OPS = ['items', 'maxItems', 'minItems', 'uniqueItems']

/**
 * Validation keywords validated for numeric (number and integer) types:
 *
 * - `multipleOf`
 * - `maximum`
 * - `minimum`
 *
 * @name Schema.NUMERIC_OPS
 * @type {string[]}
 */
const NUMERIC_OPS = ['multipleOf', 'maximum', 'minimum']

/**
 * Validation keywords validated for object types:
 *
 * - `maxProperties`
 * - `minProperties`
 * - `required`
 * - `properties`
 * - `dependencies`
 *
 * @name Schema.OBJECT_OPS
 * @type {string[]}
 */
const OBJECT_OPS = ['maxProperties', 'minProperties', 'required', 'properties', 'dependencies']

/**
 * Validation keywords validated for string types:
 *
 * - `maxLength`
 * - `minLength`
 * - `pattern`
 *
 * @name Schema.STRING_OPS
 * @type {string[]}
 */
const STRING_OPS = ['maxLength', 'minLength', 'pattern']

/**
 * http://json-schema.org/latest/json-schema-validation.html#anchor75
 * @ignore
 */
const validateAny = (value, schema, opts) => runOps(ANY_OPS, value, schema, opts)

/**
 * Validates the provided value against a given Schema according to the http://json-schema.org/ v4 specification.
 *
 * @name Schema.validate
 * @method
 * @param {*} value Value to be validated.
 * @param {object} schema Valid Schema according to the http://json-schema.org/ v4 specification.
 * @param {object} [opts] Configuration options.
 * @returns {(array|undefined)} Array of errors or `undefined` if valid.
 */
const validate = (value, schema, opts: any = {}) => {
  let errors = []
  opts.ctx = opts.ctx || { value, schema }
  let shouldPop
  const prevProp = opts.prop
  if (schema === undefined) {
    return
  }
  if (!utils.isObject(schema)) {
    throw utils.err(`${DOMAIN}#validate`)(500, `Invalid schema at path: "${opts.path}"`)
  }
  if (opts.path === undefined) {
    opts.path = []
  }
  // Track our location as we recurse
  if (opts.prop !== undefined) {
    shouldPop = true
    opts.path.push(opts.prop)
    opts.prop = undefined
  }
  // Validate against parent schema
  if (schema.extends) {
    // opts.path = path
    // opts.prop = prop
    if (utils.isFunction(schema.extends.validate)) {
      errors = errors.concat(schema.extends.validate(value, opts) || [])
    } else {
      errors = errors.concat(validate(value, schema.extends, opts) || [])
    }
  }
  if (value === undefined) {
    // Check if property is required
    if (schema.required === true && !opts.existingOnly) {
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
// Object[] - History of change records
const changeHistoryPath = 'history'
// boolean - Whether a Record is currently being instantiated
const creatingPath = 'creating'
// number - The setTimeout change event id of a Record, if any
const eventIdPath = 'eventId'
// boolean - Whether to skip validation for a Record's currently changing property
const noValidatePath = 'noValidate'
// boolean - Whether to preserve Change History for a Record
const keepChangeHistoryPath = 'keepChangeHistory'
// boolean - Whether to skip change notification for a Record's currently
// changing property
const silentPath = 'silent'
const validationFailureMsg = 'validation failed'

/**
 * A map of validation functions grouped by type.
 *
 * @name Schema.typeGroupValidators
 * @type {object}
 */
const typeGroupValidators = {
  /**
   * Validates the provided value against the schema using all of the validation keywords specific to instances of an
   * array.
   * The validation keywords for the type `array` are:
   * ```
   * ['items', 'maxItems', 'minItems', 'uniqueItems']
   * ```
   * see http://json-schema.org/latest/json-schema-validation.html#anchor25
   *
   * @name Schema.typeGroupValidators.array
   * @method
   * @param {*} value Array to be validated.
   * @param {object} schema Schema containing at least one array keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  array: (value, schema, opts?) => runOps(ARRAY_OPS, value, schema, opts),

  /**
   * Validates the provided value against the schema using all of the validation keywords specific to instances of an
   * integer.
   * The validation keywords for the type `integer` are:
   * ```
   * ['multipleOf', 'maximum', 'minimum']
   * ```
   * @name Schema.typeGroupValidators.integer
   * @method
   * @param {*} value Number to be validated.
   * @param {object} schema Schema containing at least one `integer` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  integer: (value, schema, opts) =>
    // Additional validations for numerics are the same
    typeGroupValidators.numeric(value, schema, opts),

  /**
   * Validates the provided value against the schema using all of the validation keywords specific to instances of an
   * number.
   * The validation keywords for the type `number` are:
   * ```
   * ['multipleOf', 'maximum', 'minimum']
   * ```
   * @name Schema.typeGroupValidators.number
   * @method
   * @param {*} value Number to be validated.
   * @param {object} schema Schema containing at least one `number` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  number: (value, schema, opts) =>
    // Additional validations for numerics are the same
    typeGroupValidators.numeric(value, schema, opts),

  /**
   * Validates the provided value against the schema using all of the validation keywords specific to instances of a
   * number or integer.
   * The validation keywords for the type `numeric` are:
   * ```
   * ['multipleOf', 'maximum', 'minimum']
   * ```
   * See http://json-schema.org/latest/json-schema-validation.html#anchor13.
   *
   * @name Schema.typeGroupValidators.numeric
   * @method
   * @param {*} value Number to be validated.
   * @param {object} schema Schema containing at least one `numeric` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  numeric: (value, schema, opts) => runOps(NUMERIC_OPS, value, schema, opts),

  /**
   * Validates the provided value against the schema using all of the validation keywords specific to instances of an
   * object.
   * The validation keywords for the type `object` are:
   * ```
   * ['maxProperties', 'minProperties', 'required', 'properties', 'dependencies']
   * ```
   * See http://json-schema.org/latest/json-schema-validation.html#anchor53.
   *
   * @name Schema.typeGroupValidators.object
   * @method
   * @param {*} value Object to be validated.
   * @param {object} schema Schema containing at least one `object` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  object: (value, schema, opts) => runOps(OBJECT_OPS, value, schema, opts),

  /**
   * Validates the provided value against the schema using all of the validation keywords specific to instances of an
   * string.
   * The validation keywords for the type `string` are:
   * ```
   * ['maxLength', 'minLength', 'pattern']
   * ```
   * See http://json-schema.org/latest/json-schema-validation.html#anchor25.
   *
   * @name Schema.typeGroupValidators.string
   * @method
   * @param {*} value String to be validated.
   * @param {object} schema Schema containing at least one `string` keyword.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  string: (value, schema, opts?) => runOps(STRING_OPS, value, schema, opts)
}

export interface PropertyDefinition {
  type: string | string[]
  track?: boolean
  description?: string
  indexed?: boolean
  items?: PropertyDefinition
  minItems?: number
  uniqueItems?: boolean
  extends?: Schema
  get?: Function
  properties?: { [name: string]: PropertyDefinition }
  required?: string[] | boolean
  maximum?: number
  exclusiveMaximum?: boolean
  minimum?: number
  exclusiveMinimum?: boolean
  additionalProperties?: boolean
}

export interface SchemaDefinition {
  type?: string
  description?: string
  $schema?: string
  title?: string
  properties?: { [name: string]: PropertyDefinition | any }
  extends?: SchemaDefinition | Schema
  items?: SchemaDefinition | Schema
  track?: boolean
  additionalProperties?
  required?: string[]
}

/**
 * js-data's Schema class.
 *
 * @example <caption>Schema#constructor</caption>
 * const JSData = require('js-data');
 * const { Schema } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * const PostSchema = new Schema({
 *   type: 'object',
 *   properties: {
 *     title: { type: 'string' }
 *   }
 * });
 * PostSchema.validate({ title: 1234 });
 *
 * @example
 * const JSData = require('js-data');
 * const { Schema } = JSData;
 * console.log('Using JSData v' + JSData.version.full);
 *
 * class CustomSchemaClass extends Schema {
 *   foo () { return 'bar'; }
 *   static beep () { return 'boop'; }
 * }
 * const customSchema = new CustomSchemaClass();
 * console.log(customSchema.foo());
 * console.log(CustomSchemaClass.beep());
 *
 * @class Schema
 * @extends Component
 * @param {object} definition Schema definition according to json-schema.org
 */
export default class Schema extends Component {
  type: string;
  properties: any;
  private readonly extends: Schema;
  private readonly items: Schema;
  private readonly track: any;
  private readonly additionalProperties: any;

  constructor (definition: SchemaDefinition = {}) {
    super()
    // TODO: schema validation
    utils.fillIn(this, definition)

    if (this.type === 'object') {
      this.properties = this.properties || {}
      utils.forOwn(this.properties, (_definition, prop) => {
        if (!(_definition instanceof Schema)) {
          this.properties[prop] = new Schema(_definition)
        }
      })
    } else if (this.type === 'array' && this.items && !(this.items instanceof Schema)) {
      this.items = new Schema(this.items)
    }
    if (this.extends && !(this.extends instanceof Schema)) {
      this.extends = new Schema(this.extends)
    }
    ['allOf', 'anyOf', 'oneOf'].forEach(validationKeyword => {
      if (this[validationKeyword]) {
        this[validationKeyword].forEach((_definition, i) => {
          if (!(_definition instanceof Schema)) {
            this[validationKeyword][i] = new Schema(_definition)
          }
        })
      }
    })
  }

  /**
   * This adds ES5 getters/setters to the target based on the "properties" in
   * this Schema, which makes possible change tracking and validation on
   * property assignment.
   *
   * @name Schema#apply
   * @method
   * @param {object} target The prototype to which to apply this schema.
   * @param opts
   */
  apply (target, opts: any = {}) {
    opts.getter = opts.getter || '_get'
    opts.setter = opts.setter || '_set'
    opts.unsetter = opts.unsetter || '_unset'
    opts.track = opts.track || this.track
    const properties = this.properties || {}
    utils.forOwn(properties, (schema, prop) => {
      Object.defineProperty(target, prop, this.makeDescriptor(prop, schema, opts))
    })
  }

  /**
   * Apply default values to the target object for missing values.
   *
   * @name Schema#applyDefaults
   * @method
   * @param {object} target The target to which to apply values for missing values.
   */
  applyDefaults (target) {
    if (!target) {
      return
    }
    const properties = this.properties || {}
    const hasSet = utils.isFunction(target.set) || utils.isFunction(target._set)
    utils.forOwn(properties, (schema, prop) => {
      if (schema.hasOwnProperty('default') && utils.get(target, prop) === undefined) {
        if (hasSet) {
          target.set(prop, utils.plainCopy(schema.default), { silent: true })
        } else {
          utils.set(target, prop, utils.plainCopy(schema.default))
        }
      }
      if (schema.type === 'object' && schema.properties) {
        if (hasSet) {
          const orig = target._get('noValidate')
          target._set('noValidate', true)
          utils.set(target, prop, utils.get(target, prop) || {}, { silent: true })
          target._set('noValidate', orig)
        } else {
          utils.set(target, prop, utils.get(target, prop) || {})
        }
        schema.applyDefaults(utils.get(target, prop))
      }
    })
  }

  /**
   * Assemble a property descriptor for tracking and validating changes to
   * a property according to the given schema. This method is called when
   * {@link Mapper#applySchema} is set to `true`.
   *
   * @name Schema#makeDescriptor
   * @method
   * @param {string} prop The property name.
   * @param {(Schema|object)} schema The schema for the property.
   * @param {object} [opts] Optional configuration.
   * @param {function} [opts.getter] Custom getter function.
   * @param {function} [opts.setter] Custom setter function.
   * @param {function} [opts.track] Whether to track changes.
   * @returns {object} A property descriptor for the given schema.
   */
  makeDescriptor (prop, schema, opts) {
    const descriptor: any = {
      // Better to allow configurability, but at the user's own risk
      configurable: true,
      // These properties are enumerable by default, but regardless of their
      // enumerability, they won't be "own" properties of individual records
      enumerable: schema.enumerable === undefined ? true : !!schema.enumerable,
      get () {
        return this._get(keyPath)
      },
      set (value) {
        // These are accessed a lot
        const _get = this[getter]
        const _set = this[setter]
        const _unset = this[unsetter]
        // Optionally check that the new value passes validation
        if (!_get(noValidatePath)) {
          const errors = schema.validate(value, { path: [prop] })
          if (errors) {
            // Immediately throw an error, preventing the record from getting into
            // an invalid state
            const error = new TsDataError(validationFailureMsg)
            error.errors = errors
            throw error
          }
        }
        // TODO: Make it so tracking can be turned on for all properties instead of
        // only per-property
        if (track && !_get(creatingPath)) {
          // previous is versioned on database commit
          // props are versioned on set()
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
            _set(
              eventIdPath,
              setTimeout(() => {
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
                    this.emit('change:' + changed[i], this, utils.get(this, changed[i]))
                  }

                  const changes = utils.diffObjects({ [prop]: value }, { [prop]: current })

                  if (_get(keepChangeHistoryPath)) {
                    const changeRecord = utils.plainCopy(changes)
                    changeRecord.timestamp = new Date().getTime()
                    let changeHistory = _get(changeHistoryPath)
                    if (!changeHistory) _set(changeHistoryPath, (changeHistory = []))
                    changeHistory.push(changeRecord)
                  }
                  this.emit('change', this, changes)
                }
                _unset(silentPath)
              }, 0)
            )
          }
        }
        _set(keyPath, value)
        return value
      }
    }
    // Cache a few strings for optimal performance
    const keyPath = `props.${prop}`
    const previousPath = `previous.${prop}`
    const getter = opts.getter
    const setter = opts.setter
    const unsetter = opts.unsetter
    const track = utils.isBoolean(opts.track) ? opts.track : schema.track

    if (utils.isFunction(schema.get)) {
      const originalGet = descriptor.get
      descriptor.get = function () {
        return schema.get.call(this, originalGet)
      }
    }

    if (utils.isFunction(schema.set)) {
      const originalSet = descriptor.set
      descriptor.set = function (value) {
        return schema.set.call(this, value, originalSet)
      }
    }

    return descriptor
  }

  /**
   * Create a copy of the given value that contains only the properties defined
   * in this schema.
   *
   * @name Schema#pick
   * @method
   * @param {*} value The value to copy.
   * @returns {*} The copy.
   */
  pick (value, opts?) {
    if (value === undefined) {
      return
    }
    if (this.type === 'object') {
      const copy = {}
      const properties = this.properties
      if (properties) {
        utils.forOwn(properties, (_definition, prop) => {
          copy[prop] = _definition.pick(value[prop])
        })
      }
      if (this.extends) {
        utils.fillIn(copy, this.extends.pick(value))
      }
      // Conditionally copy properties not defined in "properties"
      if (this.additionalProperties) {
        for (const key in value) {
          if (!properties[key]) {
            copy[key] = utils.plainCopy(value[key])
          }
        }
      }
      return copy
    } else if (this.type === 'array') {
      return value.map(item => {
        const _copy = this.items ? this.items.pick(item) : {}
        if (this.extends) {
          utils.fillIn(_copy, this.extends.pick(item))
        }
        return _copy
      })
    }
    return utils.plainCopy(value)
  }

  /**
   * Validate the provided value against this schema.
   *
   * @name Schema#validate
   * @method
   * @param {*} value Value to validate.
   * @param {object} [opts] Configuration options.
   * @returns {(array|undefined)} Array of errors or `undefined` if valid.
   */
  validate (value, opts?) {
    return validate(value, this, opts)
  }

  static ANY_OPS = ANY_OPS;
  static ARRAY_OPS = ARRAY_OPS;
  static NUMERIC_OPS = NUMERIC_OPS;
  static OBJECT_OPS = OBJECT_OPS;
  static STRING_OPS = STRING_OPS;
  static typeGroupValidators = typeGroupValidators;
  static types = types;
  static validate = validate;
  static validationKeywords: any = validationKeywords;
}
