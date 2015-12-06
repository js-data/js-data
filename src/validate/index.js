import {
  forOwn,
  isArray,
  isBoolean,
  isNumber,
  isObject,
  isString
} from '../utils'

const types = {
  array: isArray,
  boolean: isBoolean,
  integer: isNumber,
  number: isNumber,
  'null': function (value) {
    return value === null
  },
  object: isObject,
  string: isString
}

export const rules = {
  type (predicate, value) {
    if (value === undefined) {
      return
    }
    if (isString(predicate)) {
      predicate = [predicate]
    }
    const errors = predicate.map(function (type) {
      const validator = types[type]
      if (!validator) {
        return `type: Unknown type ${predicate}`
      }
      return validator(value) ? undefined : 1
    })
    return errors.indexOf(undefined) !== -1 ? undefined : `type: Expected: ${predicate.join(' or ')}. Actual: ${typeof value}`
  },

  anyOf (schemas, value) {
    let validated = false
    let allErrors = []
    schemas.forEach(function (schema) {
      const errors = validate(schema, value)
      if (errors) {
        allErrors = allErrors.concat(errors)
      } else {
        validated = true
      }
    })
    return validated ? undefined : allErrors
  },

  allOf (schemas, value) {
    let allErrors = []
    schemas.forEach(function (schema) {
      allErrors = allErrors.concat(validate(schema, value) || [])
    })
    return allErrors.length ? undefined : allErrors
  },

  oneOf (schemas, value) {
    let validated = false
    let allErrors = []
    schemas.forEach(function (schema) {
      const errors = validate(schema, value)
      if (errors) {
        allErrors = allErrors.concat(errors)
      } else if (validated) {
        allErrors = ['more than one schema validated']
        validated = false
        return false
      } else {
        validated = true
      }
    })
    return validated ? undefined : allErrors
  }
}

export function validate (schema, value) {
  const errors = []
  forOwn(schema, function (predicate, rule) {
    const validator = rules[rule]
    if (validator) {
      const err = validator(predicate, value)
      if (err) {
        errors.push(err)
      }
    }
  })
  return errors.length ? errors : undefined
}
