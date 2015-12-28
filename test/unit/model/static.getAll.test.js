/* global Model */
import {assert} from 'chai'

export function init () {
  describe('static getAll', function () {
    it('should be a static function', function () {
      assert.isFunction(Model.getAll)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.getAll)
      assert.isFunction(User2.getAll)
      assert.isTrue(Model.getAll === User.getAll)
      assert.isTrue(Model.getAll === User2.getAll)
      assert.isTrue(User.getAll === User2.getAll)
      assert.isTrue(User2.getAll === User3.getAll)
    })
    it('should get multiple items from the store by primary key', function () {
      class User extends Model {}
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
    it('should return an array of all items in the store', function () {
      assert.isArray(this.Post.getAll(), 'should be an array')
      assert.equal(this.Post.getAll().length, 0, 'should be an empty array')
      this.Post.inject(this.data.p1)
      this.Post.inject(this.data.p2)
      this.Post.inject(this.data.p3)
      assert.isArray(this.Post.getAll(), 'should be an array')
      assert.equal(this.Post.getAll().length, 3, 'should be an array of length 3')
      assert.deepEqual(this.Post.getAll(), this.Post.filter())
    })
    it('should return results that match a set of ids', function () {
      this.Post.inject([this.data.p1, this.data.p2, this.data.p3])
      const posts = this.Post.getAll(5, 7)
      assert.objectsEqual(posts, [this.data.p1, this.data.p3])
    })
  })
}
