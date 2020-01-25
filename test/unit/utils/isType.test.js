import { assert, JSData } from '../../_setup'
const utils = JSData.utils

describe('utils.isArray', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.isArray, 'function', 'has the isArray method')
  })

  it('isArray returns true for arrays', function () {
    const arrays = [
      [1, 2],
      [{}, {}],
      new Array() // eslint-disable-line no-array-constructor
    ]
    arrays.forEach((arr) => {
      assert.isArray(arr, arr + 'should be an array')
      assert.isTrue(utils.isArray(arr))
    })
  })

  it('isArray returns false for non arrays', function () {
    const nonArrays = [
      1,
      'string',
      { 0: 0, 1: 1 }
    ]
    nonArrays.forEach((obj) => {
      assert.isNotArray(obj, obj + 'should not be an array')
      assert.isNotTrue(utils.isArray(obj))
    })
  })
})

describe('utils.isBoolean', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.isBoolean, 'function', 'has the isBoolean method')
  })

  it('isBoolean returns true for boolean values', function () {
    const trueVals = [true, false]
    trueVals.forEach((val) => {
      assert.isBoolean(val, val + ' is a boolean')
      assert.isTrue(utils.isBoolean(val))
    })
  })

  it('isBoolean returns false for non boolean values', function () {
    const falseVals = ['123', 'true', 'false', 0, {}]
    falseVals.forEach((val) => {
      assert.isNotBoolean(val, val + ' is not a boolean')
      assert.isNotTrue(utils.isBoolean(val))
    })
  })
})

describe('utils.isFunction', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.isFunction, 'function', 'has the isFunction method')
  })

  it('isFunction returns true for function values', function () {
    const trueVals = [function () { }, () => { }, console.log]
    trueVals.forEach((val) => {
      assert.isFunction(val, val + ' is a function')
      assert.isTrue(utils.isFunction(val))
    })
  })

  it('isFunction returns false for non function values', function () {
    const falseVals = ['123', 'true', 'false', 0, {}]
    falseVals.forEach((val) => {
      assert.isNotFunction(val, val + ' is not be a function')
      assert.isNotTrue(utils.isFunction(val))
    })
  })
})

describe('utils.isInteger', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.isInteger, 'function', 'has the isInteger method')
  })

  it('isInteger returns true for function values', function () {
    const trueVals = [1, 2, 5 / 1, -5, 0]
    trueVals.forEach((val) => {
      assert.isTrue(utils.isInteger(val), val + ' is an integer')
    })
  })

  it('isInteger returns false for non function values', function () {
    const falseVals = ['1', 1.25, -1.3, 2 / 3, Infinity]
    falseVals.forEach((val) => {
      assert.isNotTrue(utils.isInteger(val), val + ' is not an integer')
    })
  })
})

describe('utils.isNull', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.isNull, 'function', 'has the isNull method')
  })

  it('isNull returns true for null values', function () {
    const trueVals = [null, (() => { return null })()]
    trueVals.forEach((val) => {
      assert.isNull(val, val + ' is null')
      assert.isTrue(utils.isNull(val), val + ' return null')
    })
  })

  it('isNull returns false for non null values', function () {
    const falseVals = [0, 1, undefined, 'null', () => { }]
    falseVals.forEach((val) => {
      assert.isNotNull(val, val + ' is not null')
      assert.isNotTrue(utils.isNull(val))
    })
  })
})

describe('utils.isNumber', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.isNumber, 'function', 'has the isNumber method')
  })

  it('isNumber returns true for number values', function () {
    const trueVals = [1, 1.45, -1.56, Infinity, new Number(100)] // eslint-disable-line
    trueVals.forEach((val) => {
      assert.isNumber(val, val + ' is a number')
      assert.isTrue(utils.isNumber(val))
    })
  })

  it('isNumber returns false for non function values', function () {
    const falseVals = ['1', 'string', undefined, null, false]
    falseVals.forEach((val) => {
      assert.isNotNumber(val, val + ' is not a number')
      assert.isNotTrue(utils.isNumber(val))
    })
  })
})

describe('utils.isObject', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.isObject, 'function', 'has the isObject method')
  })

  it('isObject returns true for object values', function () {
    const trueVals = [new Object(), {}] // eslint-disable-line
    trueVals.forEach((val) => {
      assert.isObject(val, val + ' is an object')
      assert.isTrue(utils.isObject(val))
    })
  })

  it('isObject returns false for non object values', function () {
    const falseVals = [() => { }, 'string', 1, new String()] // eslint-disable-line
    falseVals.forEach((val) => {
      assert.isNotObject(val, val + ' is not an object')
      assert.isNotTrue(utils.isObject(val))
    })
  })
})

describe('utils.isRegExp', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.isRegExp, 'function', 'has the isFunction method')
  })

  it('isRegExp returns true for regex values', function () {
    const trueVals = [/^\$.+$/ig, new RegExp('^\\$.+$', 'ig')]
    trueVals.forEach((val) => {
      assert.typeOf(val, 'regexp', val + ' is a regular expression')
      assert.isTrue(utils.isRegExp(val))
    })
  })

  it('isRegExp returns false for non regex values', function () {
    const falseVals = ['', 'not-a-regex', 12, {}, () => { }]
    falseVals.forEach((val) => {
      assert.notTypeOf(val, 'regexp', val + ' is not a regular expression')
      assert.isNotTrue(utils.isRegExp(val))
    })
  })
})

describe('utils.isSorN', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.isSorN, 'function', 'has the isSorN method')
  })

  it('isSorN returns true for string or number values', function () {
    const trueVals = ['', 1.65, -1, 0, 'string', Infinity]
    trueVals.forEach((val) => {
      assert(utils.isString(val) || utils.isNumber(val), val + ' is a string or number')
      assert.isTrue(utils.isSorN(val))
    })
  })

  it('isSorN returns false for non string nor number values', function () {
    const falseVals = [{}, () => { }, []]
    falseVals.forEach((val) => {
      assert(!utils.isString(val) && !utils.isNumber(val), val + ' is not a string or number')
      assert.isNotTrue(utils.isSorN(val))
    })
  })
})

describe('utils.isString', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.isObject, 'function', 'has the isString method')
  })

  it('isString returns true for object values', function () {
    const trueVals = ['string', new String(''), ''] // eslint-disable-line
    trueVals.forEach((val) => {
      assert.isString(val, val + ' is an object')
      assert.isTrue(utils.isString(val))
    })
  })

  it('isString returns false for non string values', function () {
    const falseVals = [() => { }, 1, 1.2, /regex/, []] // eslint-disable-line
    falseVals.forEach((val) => {
      assert.isNotObject(val, val + ' is not a string')
      assert.isNotTrue(utils.isString(val))
    })
  })
})

describe('utils.isUndefined', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.isUndefined, 'function', 'has the isUndefined method')
  })

  it('isUndefined returns true for undefined values', function () {
    const trueVals = [undefined, (() => { })()]
    trueVals.forEach((val) => {
      assert.isUndefined(val, val + ' is undefined')
      assert.isTrue(utils.isUndefined(val))
    })
  })

  it('isUndefined returns false for non undefined values', function () {
    const falseVals = ['', {}, () => { }, null]
    falseVals.forEach((val) => {
      assert.isDefined(val, val + ' is not undefined')
      assert.isNotTrue(utils.isUndefined(val))
    })
  })
})
