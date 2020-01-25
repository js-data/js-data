import { assert, JSData } from '../../_setup'
const utils = JSData.utils

describe('utils.set', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.set, 'function', 'has the set method')
  })

  it('can set a value of an object at the provided key or path', function () {
    const john = { name: 'John', age: 25, parent: { name: 'Mom', age: 50 } }
    utils.set(john, 'spy', true)
    utils.set(john, 'parent.age', 55)
    assert.equal(true, john.spy)
    assert.equal(55, john.parent.age)
  })

  it('can set a values of an object with a path/value map', function () {
    const john = { name: 'John', age: 25, parent: { name: 'Mom', age: 50 } }
    utils.set(john, {
      spy: true,
      parent: { age: 55 },
      'parent.name': 'Grandma'
    })
    assert.equal(true, john.spy)
    assert.equal(55, john.parent.age)
    assert.equal('Grandma', john.parent.name)
  })
})

describe('utils.unset', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.unset, 'function', 'has the unset method')
  })

  it('can unSet a value of an object at the provided key or path', function () {
    const john = { name: 'John', age: 25, spy: true, parent: { name: 'Mom', age: 50 } }
    utils.unset(john, 'spy', true)
    utils.unset(john, 'parent.age')
    utils.unset(john, 'parent.notExist')
    assert.equal(null, john.spy)
    assert.equal(null, john.parent.age)
  })
})
