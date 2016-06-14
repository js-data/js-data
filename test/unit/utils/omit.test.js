import { assert, JSData } from '../../_setup'
const utils = JSData.utils

describe('utils.omit', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.omit, 'function', 'has the omit method')
  })

  it('Clones an object and omits specific properties', function () {
    const src = { name: 'John', $hashKey: 1214910 }
    const actual = utils.omit(src, ['$hashKey'])
    const expected = { name: 'John' }
    assert.deepEqual(expected, actual)
  })
})

describe('utils.isBlacklisted', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.isBlacklisted, 'function', 'has the isBlacklisted method')
  })

  it('matches a value against an array of strings or regular expressions', function () {
    const valuesTocheck = ['$hashKey', 'id', '_hidden']
    const blackList = [/^\$hashKey/g, /^_/g, 'id']
    valuesTocheck.forEach((v) => {
      assert(utils.isBlacklisted(v, blackList), `value ${v} found in blacklist ${blackList}`)
    })

    valuesTocheck.forEach((v) => {
      assert.isFalse(utils.isBlacklisted(v, ['hashKey', 'my_id']), `value ${v} not found in blacklist ${blackList}`)
    })
  })
})

describe('utils.pick', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.pick, 'function', 'has the pick method')
  })

  it('Shallow copies an object, but only include the properties specified', function () {
    const src = { name: 'John', $hashKey: 1214910 }
    const actual = utils.pick(src, ['$hashKey'])
    const expected = { $hashKey: 1214910 }
    assert.deepEqual(expected, actual)
  })
})
