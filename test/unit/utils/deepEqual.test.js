import { assert, JSData } from '../../_setup'
const utils = JSData.utils

describe('utils.deepEqual', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.deepEqual, 'function', 'has the deepEqual method')
  })

  it('does deep equal comparison', function () {
    const objA = { name: 'John', age: 90 }
    const arrA = ['a', 'b', 'c']
    const arrB = ['a', 'b', 'c', 'd', 'e']

    assert.isTrue(utils.deepEqual(2, 2), '2 deep equals 2')
    assert.isTrue(utils.deepEqual('test', 'test'), '"test" deep equals "test"')
    assert.isTrue(utils.deepEqual({}, {}), '{} deep equals {}')
    assert.isTrue(utils.deepEqual(objA, objA), objA + ' deep equals ' + objA)
    assert.isTrue(utils.deepEqual(arrA, arrA), 'arrA deep equals arrA')

    assert.isFalse(utils.deepEqual(1, 2), '1 does not strict equal 2')
    assert.isFalse(utils.deepEqual(1, '1'), '1 does not strict equal "1"')
    assert.isFalse(utils.deepEqual('foo', 'bar'), '"foo" does not equal "bar')
    assert.isFalse(utils.deepEqual(arrA, arrB), 'arrA does not deep equal arrB')
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
    assert.isTrue(utils.deepEqual(objA, objB))
    assert.isTrue(utils.deepEqual([objA, objB], [objA, objB]))

    objA.nested.colors[0] = 'yellow'
    assert.isFalse(utils.deepEqual(objA, objB))
  })
})
