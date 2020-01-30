import { assert, JSData } from '../../_setup'

const utils = JSData.utils

describe('utils.fillIn', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.fillIn, 'function', 'has the fillIn method')
  })

  it('Copy properties from `source` that are missing from `dest`', () => {
    const dest = { name: 'John', age: 90, friend: { name: 'Sara' } as any }
    const src = { name: 'John', age: 0, spy: true, friend: { name: 'Sara', age: 20 } }
    const expected = { name: 'John', age: 90, spy: true, friend: { name: 'Sara' } as any }
    utils.fillIn(dest, src)

    assert.equal(expected.age, dest.age, 'age already set on dest is not overridden')
    assert.isUndefined(expected.friend.age, 'missing nested property is not filled in')
    assert.deepEqual(expected, dest, 'sorce own properties shallow copied into dest only if missing')
  })
})

describe('utils.deepFillIn', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.deepFillIn, 'function', 'has the deepFillIn method')
  })

  it('Recursivly copies properties from `source` that are missing on `dest`', () => {
    const dest = { name: 'John', age: 90, friend: { name: 'Sara' } }
    const src = { name: 'John', age: 0, spy: true, friend: { name: 'Sara', age: 20 } }
    const expected = { name: 'John', age: 90, spy: true, friend: { name: 'Sara', age: 20 } }
    const actual = utils.deepFillIn(dest, src)

    assert.equal(dest, actual, 'dest and return value are equal')
    assert.equal(expected.age, actual.age, 'age already set on dest is not overriden')
    assert.equal(expected.friend.age, actual.friend.age, 'missing nested property is not filled in')
    assert.deepEqual(expected, actual, 'sorce own properties recursivly copied into dest only if missing')
    assert.equal(dest, utils.deepFillIn(dest), 'empty source argument returns dest')
  })
})

describe('utils.deepMixIn', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.deepMixIn, 'function', 'has the deepMixIn decorator')
  })

  it('Recursively shallow copies properties from `source` to `dest`', () => {
    const dest = { name: 'John', age: 90, friend: { name: 'Sara' } }
    const src = { name: 'John', age: 0, spy: true, friend: { name: 'Sara', age: 20 } }
    const expected = { name: 'John', age: 0, spy: true, friend: { name: 'Sara', age: 20 } }
    const actual = utils.deepMixIn(dest, src)

    assert.equal(dest, actual, 'dest and return value are equal')
    assert.equal(expected.age, actual.age, 'age already set on dest is overriden')
    assert.equal(expected.friend.age, actual.friend.age, 'missing nested property is not filled in')
    assert.deepEqual(expected, actual, 'sorce own properties recursivly copied and overriden into dest')
    assert.equal(dest, utils.deepMixIn(dest), 'empty source argument returns dest')
  })
})

describe('utils.getSuper', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.getSuper, 'function', 'has the getSuper method')
  })

  it('getSuper returns base class with ES2015 classes', () => {
    class Foo {}

    class Bar extends Foo {}

    const barInstance = new Bar()

    if (Object.getPrototypeOf(Bar) === Foo) {
      assert.strictEqual(Foo, utils.getSuper(barInstance, false), 'barInstance inherited from Foo')
    } else {
      // Assert nothing in IE9, because this doesn't work in IE9.
      // You have to use utils.extend if you want it to work in IE9.
    }
  })

  it('getSuper returns base class with utils.extend', () => {
    class Foo {}

    class Bar extends Foo {}

    const barInstance = new Bar()
    assert.strictEqual(Foo, utils.getSuper(barInstance, false), 'barInstance inherited from Foo')
  })
})

describe('utils.addHiddenPropsToTarget', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.addHiddenPropsToTarget, 'function', 'has the addHiddenPropsToTarget method')
  })

  it('adds hidden properties to target', () => {
    const target = { name: 'John' }
    utils.addHiddenPropsToTarget(target, { age: 103 })
    assert.isFalse(target.propertyIsEnumerable('age'), 'age on target is not enumerable.')
  })
})
