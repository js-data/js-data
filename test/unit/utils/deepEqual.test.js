import { assert, JSData } from '../../_setup'
const utils = JSData.utils

describe('utils.strictEqual', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.strictEqual, 'function', 'has the strictEqual method')
  })

  it('does deep equal comparison', function () {
    const objA = { name: 'John', age: 90 }
    assert.isTrue(utils.strictEqual(2, 2), '2 deep equals 2')
    assert.isTrue(utils.strictEqual('test', 'test'), '"test" deep equals "test"')
    assert.isTrue(utils.strictEqual({}, {}), '{} deep equals {}')
    assert.isTrue(utils.strictEqual(objA, objA), objA + ' deep equals ' + objA)
    assert.isFalse(utils.strictEqual(1, 2), '1 does not strict equal 2')
    assert.isFalse(utils.strictEqual(1, '1'), '1 does not strict equal "1"')
    assert.isFalse(utils.strictEqual('foo', 'bar'), '"foo" does not equal "bar')
  })

  it('compares identical objects', function () {
    const objA = {
      name: 'John',
      id: 27,
      nested: {
        item: 'item 1',
        colors: ['red', 'green', 'blue']
      }
    }
    const objB = {
      name: 'John',
      id: 27,
      nested: {
        item: 'item 1',
        colors: ['red', 'green', 'blue']
      }
    }
    assert.isTrue(utils.strictEqual(objA, objB))
    assert.isTrue(utils.strictEqual([objA, objB], [objA, objB]))

    objA.nested.colors[0] = 'yellow'
    assert.isFalse(utils.strictEqual(objA, objB))
  })
})
