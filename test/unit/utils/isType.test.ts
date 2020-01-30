/* tslint:disable:no-unused-expression */
import { assert, JSData } from '../../_setup'

const utils = JSData.utils

describe('utils.isArray', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.isArray, 'function', 'has the isArray method')
  })

  it('isArray returns true for arrays', () => {
    const arrays = [
      [1, 2],
      [{}, {}],
      [] // eslint-disable-line no-array-constructor
    ]
    arrays.forEach(arr => {
      assert.isArray(arr, arr + 'should be an array')
      assert.isTrue(utils.isArray(arr))
    })
  })

  it('isArray returns false for non arrays', () => {
    const nonArrays = [1, 'string', { 0: 0, 1: 1 }]
    nonArrays.forEach(obj => {
      assert.isNotArray(obj, obj + 'should not be an array')
      assert.isNotTrue(utils.isArray(obj))
    })
  })
})

describe('utils.isBoolean', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.isBoolean, 'function', 'has the isBoolean method')
  })

  it('isBoolean returns true for boolean values', () => {
    const trueVals = [true, false]
    trueVals.forEach(val => {
      assert.isBoolean(val, val + ' is a boolean')
      assert.isTrue(utils.isBoolean(val))
    })
  })

  it('isBoolean returns false for non boolean values', () => {
    const falseVals = ['123', 'true', 'false', 0, {}]
    falseVals.forEach(val => {
      assert.isNotBoolean(val, val + ' is not a boolean')
      assert.isNotTrue(utils.isBoolean(val))
    })
  })
})

describe('utils.isFunction', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.isFunction, 'function', 'has the isFunction method')
  })

  it('isFunction returns true for function values', () => {
    const trueVals = [() => {}, () => {}, console.log]
    trueVals.forEach(val => {
      assert.isFunction(val, val + ' is a function')
      assert.isTrue(utils.isFunction(val))
    })
  })

  it('isFunction returns false for non function values', () => {
    const falseVals = ['123', 'true', 'false', 0, {}]
    falseVals.forEach(val => {
      assert.isNotFunction(val, val + ' is not be a function')
      assert.isNotTrue(utils.isFunction(val))
    })
  })
})

describe('utils.isInteger', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.isInteger, 'function', 'has the isInteger method')
  })

  it('isInteger returns true for function values', () => {
    const trueVals = [1, 2, 5 / 1, -5, 0]
    trueVals.forEach(val => {
      assert.isTrue(utils.isInteger(val), val + ' is an integer')
    })
  })

  it('isInteger returns false for non function values', () => {
    const falseVals = ['1', 1.25, -1.3, 2 / 3, Infinity]
    falseVals.forEach(val => {
      assert.isNotTrue(utils.isInteger(val), val + ' is not an integer')
    })
  })
})

describe('utils.isNull', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.isNull, 'function', 'has the isNull method')
  })

  it('isNull returns true for null values', () => {
    const trueVals = [
      null,
      (() => {
        return null
      })()
    ]
    trueVals.forEach(val => {
      assert.isNull(val, val + ' is null')
      assert.isTrue(utils.isNull(val), val + ' return null')
    })
  })

  it('isNull returns false for non null values', () => {
    const falseVals = [0, 1, undefined, 'null', void (() => {})]
    falseVals.forEach(val => {
      assert.isNotNull(val, val + ' is not null')
      assert.isNotTrue(utils.isNull(val))
    })
  })
})

describe('utils.isNumber', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.isNumber, 'function', 'has the isNumber method')
  })

  it('isNumber returns true for number values', () => {
    const trueVals = [1, 1.45, -1.56, Infinity, Number(100)]; // eslint-disable-line
    trueVals.forEach(val => {
      assert.isNumber(val, val + ' is a number')
      assert.isTrue(utils.isNumber(val))
    })
  })

  it('isNumber returns false for non function values', () => {
    const falseVals = ['1', 'string', undefined, null, false]
    falseVals.forEach(val => {
      assert.isNotNumber(val, val + ' is not a number')
      assert.isNotTrue(utils.isNumber(val))
    })
  })
})

describe('utils.isObject', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.isObject, 'function', 'has the isObject method')
  })

  it('isObject returns true for object values', () => {
    const trueVals = [{}, {}]; // eslint-disable-line
    trueVals.forEach(val => {
      assert.isObject(val, val + ' is an object')
      assert.isTrue(utils.isObject(val))
    })
  })

  it('isObject returns false for non object values', () => {
    const falseVals = [() => {}, 'string', 1, String()]; // eslint-disable-line
    falseVals.forEach(val => {
      assert.isNotObject(val, val + ' is not an object')
      assert.isNotTrue(utils.isObject(val))
    })
  })
})

describe('utils.isRegExp', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.isRegExp, 'function', 'has the isFunction method')
  })

  it('isRegExp returns true for regex values', () => {
    const trueVals = [/^\$.+$/gi, new RegExp('^\\$.+$', 'ig')]
    trueVals.forEach(val => {
      assert.typeOf(val, 'regexp', val + ' is a regular expression')
      assert.isTrue(utils.isRegExp(val))
    })
  })

  it('isRegExp returns false for non regex values', () => {
    const falseVals = ['', 'not-a-regex', 12, {}, () => {}]
    falseVals.forEach(val => {
      assert.notTypeOf(val, 'regexp', val + ' is not a regular expression')
      assert.isNotTrue(utils.isRegExp(val))
    })
  })
})

describe('utils.isSorN', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.isSorN, 'function', 'has the isSorN method')
  })

  it('isSorN returns true for string or number values', () => {
    const trueVals = ['', 1.65, -1, 0, 'string', Infinity]
    trueVals.forEach(val => {
      assert(utils.isString(val) || utils.isNumber(val), val + ' is a string or number')
      assert.isTrue(utils.isSorN(val))
    })
  })

  it('isSorN returns false for non string nor number values', () => {
    const falseVals = [{}, () => {}, []]
    falseVals.forEach(val => {
      assert(!utils.isString(val) && !utils.isNumber(val), val + ' is not a string or number')
      assert.isNotTrue(utils.isSorN(val))
    })
  })
})

describe('utils.isString', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.isObject, 'function', 'has the isString method')
  })

  it('isString returns true for object values', () => {
    const trueVals = ['string', String(''), '']; // eslint-disable-line
    trueVals.forEach(val => {
      assert.isString(val, val + ' is an object')
      assert.isTrue(utils.isString(val))
    })
  })

  it('isString returns false for non string values', () => {
    const falseVals = [() => {}, 1, 1.2, /regex/, []]; // eslint-disable-line
    falseVals.forEach(val => {
      assert.isNotObject(val, val + ' is not a string')
      assert.isNotTrue(utils.isString(val))
    })
  })
})

describe('utils.isUndefined', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.isUndefined, 'function', 'has the isUndefined method')
  })

  it('isUndefined returns true for undefined values', () => {
    const trueVals = [undefined, void (() => {})]
    trueVals.forEach(val => {
      assert.isUndefined(val, val + ' is undefined')
      assert.isTrue(utils.isUndefined(val))
    })
  })

  it('isUndefined returns false for non undefined values', () => {
    const falseVals = ['', {}, () => {}, null]
    falseVals.forEach(val => {
      assert.isDefined(val, val + ' is not undefined')
      assert.isNotTrue(utils.isUndefined(val))
    })
  })
})
