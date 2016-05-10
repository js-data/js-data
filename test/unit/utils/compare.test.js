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

describe('utils.diffObjects', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.diffObjects, 'function', 'has the diffObjects method')
  })

  it('returns diff betwen two different objects', function () {
    const objA = { name: 'John', age: 30, friends: 7 }
    const objB = { name: 'John', age: 90, id: 20 }
    const expected = {
      added: { friends: 7 },
      changed: { age: 30 },
      removed: { id: undefined }
    }
    const result = utils.diffObjects(objA, objB)
    console.log(result)
    assert.deepEqual(result, expected)
  })

  it('returns diff betwen two equal objects', function () {
    const objA = { name: 'John', age: 90, friends: 7 }
    const objB = { name: 'John', age: 90, friends: 7 }
    const expected = {
      added: {},
      changed: {},
      removed: {}
    }
    const result = utils.diffObjects(objA, objB)
    assert.deepEqual(result, expected)
  })
})

describe('utils.equal', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.equal, 'function', 'has the equal method')
  })

  it('returns true for equal values', function () {
    const objA = { name: 'John', age: 90 }
    assert.isTrue(utils.equal(1, '1'), 'the two values are equal')
    assert.isTrue(utils.equal(2, 2), 'the two values are equal')
    assert.isTrue(utils.equal('test', 'test'), 'the two values are equal')
    assert.isTrue(utils.equal(objA, objA), 'the two values are equal')
  })

  it('returns false for two different values', function () {
    assert.isFalse(utils.equal(1, 2), 'the two values are not equal')
    assert.isFalse(utils.equal({}, {}), 'the two values are not equal')
    assert.isFalse(utils.equal('test', 'test2'), 'the two values are not equal')
  })
})

describe('utils.strictEqual', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.strictEqual, 'function', 'has the strictEqual method')
  })

  it('returns true for only strict equal values', function () {
    const objA = { name: 'John', age: 90 }
    assert.isTrue(utils.strictEqual(2, 2), '2 strict equals 2')
    assert.isTrue(utils.strictEqual('test', 'test'), '"test" strict equals "test"')
    assert.isTrue(utils.strictEqual(objA, objA), 'objA strict equals objA')
  })

  it('returns false for two different values', function () {
    assert.isFalse(utils.strictEqual(1, 2), '1 does not strict equal 2')
    assert.isFalse(utils.strictEqual({}, {}), '{} does not strict equal {}')
    assert.isFalse(utils.strictEqual(1, '1'), '1 does not strict equal "1"')
    assert.isFalse(utils.strictEqual('foo', 'bar'), '"foo" does not equal "bar')
  })

  it('compares identical objects', function () {
    var objA = {
      name: 'John',
      id: 27
    }
    var objB = {
      name: 'John',
      id: 27
    }
    assert.isFalse(utils.strictEqual(objA, objB))
  })

  it('compares arrays', function () {
    var objA = {
      name: 'John',
      id: 27
    }
    var objB = {
      name: 'John',
      id: 27
    }
    assert.isFalse(utils.strictEqual(objA, objB))
  })
})
