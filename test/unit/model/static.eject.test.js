/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('static eject', function () {
    it('should be a static function', function () {
      assert.isFunction(Model.eject)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.eject)
      assert.isFunction(User2.eject)
      assert.isTrue(Model.eject === User.eject)
      assert.isTrue(Model.eject === User2.eject)
      assert.isTrue(User.eject === User2.eject)
      assert.isTrue(User2.eject === User3.eject)
    })
    it('should eject an item from the store', function () {
      class User extends Model {}
      User.setSchema({ id: {}, age: { indexed: true } })

      const user = User.inject({ id: 1, age: 30 })
      const user2 = User.inject({ id: 2, age: 31 })
      const user3 = User.inject({ id: 3, age: 32 })
      const users = [user, user2, user3]
      assert.isTrue(User.get(1) === user, 'user 1 is in the store')
      assert.isTrue(User.get(2) === user2, 'user 2 is in the store')
      assert.isTrue(User.get(3) === user3, 'user 3 is in the store')
      assert.deepEqual(User.between([30], [32], {
        rightInclusive: true,
        index: 'age'
      }), users, 'users can be selected by age index')
      User.eject(1)
      assert.isUndefined(User.get(1), 'user 1 is no longer in the store')
      users.shift()
      assert.deepEqual(User.between([30], [32], {
        rightInclusive: true,
        index: 'age'
      }), users, 'user 1 cannot be retrieved by index')
    })
  })
}
