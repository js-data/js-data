import { assert, JSData } from '../../_setup'
const utils = JSData.utils

describe('utils.fillIn', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.fillIn, 'function', 'has the fillIn method')
  })

  it('Copy properties from `source` that are missing from `dest`', function () {
    const dest = { name: 'John', age: 90, friend: { name: 'Sara' } }
    const src = { name: 'John', age: 0, spy: true, friend: { name: 'Sara', age: 20 } }
    const expected = { name: 'John', age: 90, spy: true, friend: { name: 'Sara' } }
    utils.fillIn(dest, src)

    assert.equal(expected.age, dest.age, 'age already set on dest is not overriden')
    assert.isUndefined(expected.friend.age, 'missing nested property is not filled in')
    assert.deepEqual(expected, dest, 'sorce own properties shallow copied into dest only if missing')
  })
})

describe('utils.deepFillIn', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.deepFillIn, 'function', 'has the deepFillIn method')
  })

  it('Recursivly copies properties from `source` that are missing on `dest`', function () {
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

describe('utils.deepMixIn', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.deepMixIn, 'function', 'has the deepMixIn decorator')
  })

  it('Recursively shallow copies properties from `source` to `dest`', function () {
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

describe('utils.extend', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.extend, 'function', 'has the extend method')
  })

  it('extend can be used to make a subclass', function () {
    function Foo (name) {
      this.name = name
      this.whatsMyName = () => {
        return this.name
      }
    }
    Foo.extend = utils.extend
    const Bar = Foo.extend({ bar: 'bar' }, { onlyOnBar: true })
    const barInstance = new Bar('FooBar')
    const fooInstance = new Foo('Foo')
    assert.isFunction(Bar, 'Bar is a function')

    assert.instanceOf(fooInstance, Foo, 'fooInstance is instance of Foo')
    assert.notInstanceOf(fooInstance, Bar, 'fooInstance is not an instance of Bar')
    assert.equal(Foo, utils.getSuper(barInstance, false), 'barInstance inherits from Foo')

    assert.instanceOf(barInstance, Bar, 'barInstance is instance of Bar')
    assert.instanceOf(barInstance, Foo, 'barInstance is instance of Foo')

    assert.equal('FooBar', barInstance.name, 'Bar inherits properties from Foo')
    assert.equal('FooBar', barInstance.whatsMyName(), 'Bar inherits methods from Foo')

    assert(typeof Foo.onlyOnBar === 'undefined' && typeof Bar.onlyOnBar === 'boolean', 'Bar contains properties not on Super (Foo)')
  })
})

describe('utils.getSuper', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.getSuper, 'function', 'has the getSuper method')
  })

  it('getSuper returns base class with ES2015 classes', function () {
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

  it('getSuper returns base class with utils.extend', function () {
    function Foo () {}
    Foo.extend = utils.extend
    const Bar = Foo.extend()
    const barInstance = new Bar()
    assert.strictEqual(Foo, utils.getSuper(barInstance, false), 'barInstance inherited from Foo')
  })
})

describe('utils.classCallCheck', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.classCallCheck, 'function', 'has the classCallCheck method')
  })

  it('ensure instance is of a specified type', function () {
    class Foo { }

    class Bar extends Foo { }

    const barInstance = new Bar()

    utils.classCallCheck(barInstance, Foo)
    utils.classCallCheck(barInstance, Bar)
    assert.throws(() => utils.classCallCheck(barInstance, String), Error)
  })
})

describe('utils.addHiddenPropsToTarget', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.addHiddenPropsToTarget, 'function', 'has the addHiddenPropsToTarget method')
  })

  it('adds hidden properties to target', function () {
    const target = { name: 'John' }
    utils.addHiddenPropsToTarget(target, { age: 103 })
    assert.isFalse(Object.propertyIsEnumerable.call(target, 'age'), 'age on target is not enumerable.')
  })
})
