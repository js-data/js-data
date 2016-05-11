import { assert, JSData } from '../../_setup'
const utils = JSData.utils

describe('utils.areDifferent', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.areDifferent, 'function', 'has the areDifferent method')
  })

  it('returns false for two different objects', function () {
    const objA = { name: 'John', age: 30 }
    const objB = { name: 'John', age: 90 }
    const result = utils.areDifferent(objA, objB)
    assert.isTrue(result, 'the two objects are different')
  })

  it('returns true for two equal objects', function () {
    const objA = { name: 'John', age: 90 }
    const objB = { name: 'John', age: 90 }
    const result = utils.areDifferent(objA, objB)
    assert.isFalse(result, 'the two objects are the same')
  })
})
