
import { assert, JSData } from '../../_setup'
const utils = JSData.utils

describe('utils.toJson', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.toJson, 'function', 'has the toJson method')
  })

  it('can serialize an object', function () {
    const user = this.store.add('user', this.data.user10)
    this.store.add('organization', this.data.organization15)
    this.store.add('comment', this.data.comment19)
    this.store.add('profile', this.data.profile21)
    // todo, add option to serialize entire graph
    const expected = JSON.stringify(user)
    const actual = utils.toJson(user)
    assert.equal(expected, actual)
  })
})

describe('utils.fromJson', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.fromJson, 'function', 'has the fromJson method')
  })
  it('can deserialize an object', function () {
    const user = this.data.user10
    const expected = user
    const actual = utils.fromJson(utils.toJson(user))
    assert.deepEqual(expected, actual)
  })
})
