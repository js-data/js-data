import { assert, JSData } from '../../_setup'
const utils = JSData.utils

describe('utils', function () {
  it('has the right exports', function () {
    assert(utils)
  })
})
describe('utils.get', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.get, 'function', 'has the [\'get\'] method')
  })

  it('returns a given property by name or path', function () {
    const john = { name: 'John', age: 20, friend: { name: 'Sara' } }
    assert.equal(john.name, utils.get(john, 'name'))
    assert.equal(john.friend.name, utils.get(john, 'friend.name'))
    assert.equal(undefined, utils.get(john, ''), 'null prop name returns undefined')
  })
})

describe('utils.findIndex', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.findIndex, 'function', 'has the findIndex method')
  })

  it('can find the last index based on given function', function () {
    const john = { name: 'John', age: 20, spy: true }
    const sara = { name: 'Sara', age: 25, spy: false }
    const dan = { name: 'Dan', age: 20, spy: false }
    const users = [john, sara, dan]

    assert.equal(1, utils.findIndex(users, (user) => user.age === 25))
    assert.equal(2, utils.findIndex(users, (user) => user.age > 19))
    assert.equal(2, utils.findIndex(users, (user) => !user.spy))
    assert.equal(0, utils.findIndex(users, (user) => user.name === 'John'))
    assert.equal(-1, utils.findIndex(users, (user) => user.name === 'Jimmy'))
    assert.equal(-1, utils.findIndex(null, (user) => user.name === 'Jimmy'))
  })
})

describe('utils.remove', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.remove, 'function', 'has the remove method')
  })

  it('can remove the last item found from an array based on a given function', function () {
    const colors = ['red', 'green', 'yellow', 'red']
    assert.lengthOf(colors, 4)
    utils.remove(null)
    utils.remove(colors, (color) => color === 'red')
    assert.lengthOf(colors, 3)
    assert.equal('yellow', colors[2])
    utils.remove(colors, (color) => color === 'green')
    utils.remove(colors, (color) => color === 'green')
    assert.lengthOf(colors, 2)
    assert.equal('yellow', colors[1])
  })
})

describe('utils.noDupeAdd', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.noDupeAdd, 'function', 'has the noDupeAdd method')
  })

  it('only adds distinct items to array based on given checker function', function () {
    const colors = ['red', 'green', 'yellow']
    assert.lengthOf(colors, 3)
    utils.noDupeAdd(null)
    utils.noDupeAdd(colors, 'red', (color) => color === 'red')
    assert.lengthOf(colors, 3, "didn't add red because it already exists")
    utils.noDupeAdd(colors, 'blue', (color) => color === 'blue')
    assert.equal('blue', colors[3], 'added blue to end of array')
    assert.lengthOf(colors, 4, 'added blue to array')
  })
})
describe('utils.get', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.get, 'function', 'has the [\'get\'] method')
  })

  it('returns a given property by name or path', function () {
    const john = { name: 'John', age: 20, friend: { name: 'Sara' } }
    assert.equal(john.name, utils.get(john, 'name'))
    assert.equal(john.friend.name, utils.get(john, 'friend.name'))
    assert.equal(undefined, utils.get(john, ''), 'null prop name returns undefined')
  })
})

describe('utils.findIndex', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.findIndex, 'function', 'has the findIndex method')
  })

  it('can find the last index based on given function', function () {
    const john = { name: 'John', age: 20, spy: true }
    const sara = { name: 'Sara', age: 25, spy: false }
    const dan = { name: 'Dan', age: 20, spy: false }
    const users = [john, sara, dan]

    assert.equal(1, utils.findIndex(users, (user) => user.age === 25))
    assert.equal(2, utils.findIndex(users, (user) => user.age > 19))
    assert.equal(2, utils.findIndex(users, (user) => !user.spy))
    assert.equal(0, utils.findIndex(users, (user) => user.name === 'John'))
    assert.equal(-1, utils.findIndex(users, (user) => user.name === 'Jimmy'))
    assert.equal(-1, utils.findIndex(null, (user) => user.name === 'Jimmy'))
  })
})

describe('utils.remove', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.remove, 'function', 'has the remove method')
  })

  it('can remove the last item found from an array based on a given function', function () {
    const colors = ['red', 'green', 'yellow', 'red']
    assert.lengthOf(colors, 4)
    utils.remove(null)
    utils.remove(colors, (color) => color === 'red')
    assert.lengthOf(colors, 3)
    assert.equal('yellow', colors[2])
    utils.remove(colors, (color) => color === 'green')
    utils.remove(colors, (color) => color === 'green')
    assert.lengthOf(colors, 2)
    assert.equal('yellow', colors[1])
  })
})

describe('utils.noDupeAdd', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.noDupeAdd, 'function', 'has the noDupeAdd method')
  })

  it('only adds distinct items to array based on given checker function', function () {
    const colors = ['red', 'green', 'yellow']
    assert.lengthOf(colors, 3)
    utils.noDupeAdd(null)
    utils.noDupeAdd(colors, 'red', (color) => color === 'red')
    assert.lengthOf(colors, 3, "didn't add red because it already exists")
    utils.noDupeAdd(colors, 'blue', (color) => color === 'blue')
    assert.equal('blue', colors[3], 'added blue to end of array')
    assert.lengthOf(colors, 4, 'added blue to array')
  })
})
