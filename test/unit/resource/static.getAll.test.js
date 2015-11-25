/* global Resource:true */
import {assert} from 'chai'

export function init () {
  describe('static getAll', function () {
    it('should be a static function', function () {
      assert.isFunction(Resource.getAll)
      let User = Resource.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Resource {}
      class User3 extends User2 {}
      assert.isFunction(User.getAll)
      assert.isFunction(User2.getAll)
      assert.isTrue(Resource.getAll === User.getAll)
      assert.isTrue(Resource.getAll === User2.getAll)
      assert.isTrue(User.getAll === User2.getAll)
      assert.isTrue(User2.getAll === User3.getAll)
    })
    it('should get multiple items from the store by primary key', function () {
      class User extends Resource {}
      User.schema({ id: {} })

      const user1 = User.inject({ id: 1 })
      const user4 = User.inject({ id: 4 })
      const user3 = User.inject({ id: 3 })
      const user5 = User.inject({ id: 5 })
      const user2 = User.inject({ id: 2 })
      assert.deepEqual(User.getAll([1]), [user1], 'should get the users by primary key')
      assert.deepEqual(User.getAll([1], [5]), [user1, user5], 'should get the users by primary key')
      assert.deepEqual(User.getAll([2], [4]), [user2, user4], 'should get the users by primary key')
      assert.deepEqual(User.getAll([3]), [user3], 'should get the users by primary key')
      assert.deepEqual(User.getAll([1], [2], [3], [4], [5]), [user1, user2, user3, user4, user5], 'should get the users by primary key')
      assert.deepEqual(User.getAll([5]), [user5], 'should get the users by primary key')
      assert.deepEqual(User.getAll([]), [], 'should get the users by primary key')
      assert.deepEqual(User.getAll(1), [user1], 'should get the users by primary key')
      assert.deepEqual(User.getAll(1, 5), [user1, user5], 'should get the users by primary key')
      assert.deepEqual(User.getAll(2, 4), [user2, user4], 'should get the users by primary key')
      assert.deepEqual(User.getAll(3), [user3], 'should get the users by primary key')
      assert.deepEqual(User.getAll(1, 2, 3, 4, 5), [user1, user2, user3, user4, user5], 'should get the users by primary key')
      assert.deepEqual(User.getAll(5), [user5], 'should get the users by primary key')
      assert.deepEqual(User.getAll(), [user1, user2, user3, user4, user5], 'should get the users by primary key')
    })
  })
}
