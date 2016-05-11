import { assert, JSData } from '../../_setup'
const utils = JSData.utils

describe('utils.equal', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.equal, 'function', 'has the equal method')
  })

  it('returns true for equal values', function () {
    const objA = { name: 'John', age: 90 }
    assert.isTrue(utils.equal(1, '1'), '1 equals "1"')
    assert.isTrue(utils.equal(2, 2), '2 equals 2')
    assert.isTrue(utils.equal('test', 'test'), '"test" equals "test"')
    assert.isTrue(utils.equal(objA, objA), objA + ' equals ' + objA)
  })

  it('returns false for two different values', function () {
    assert.isFalse(utils.equal(1, 2), '1 does not equal 2')
    assert.isFalse(utils.equal({}, {}), '{} does not equal {}')
  })
})
