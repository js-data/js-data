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
      User.setSchema({ age: { indexed: true } })

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
    it('should unlink upon ejection', function () {
      const user = this.User.inject(this.data.user10)
      this.Organization.inject(this.data.organization15)
      this.Comment.inject(this.data.comment19)
      this.Profile.inject(this.data.profile21)

      // user10 relations
      assert.isArray(this.User.get(10).comments)
      this.Comment.eject(11)
      assert.isUndefined(this.Comment.get(11))
      assert.equal(this.User.get(10).comments.length, 2)
      this.Comment.eject(12)
      assert.isUndefined(this.Comment.get(12))
      assert.equal(this.User.get(10).comments.length, 1)
      this.Comment.eject(13)
      assert.isUndefined(this.Comment.get(13))
      assert.equal(this.User.get(10).comments.length, 0)
      this.Organization.eject(14)
      assert.isUndefined(this.Organization.get(14))
      assert.isUndefined(this.User.get(10).organization)

      // organization15 relations
      assert.isArray(this.Organization.get(15).users)
      this.User.eject(16)
      assert.isUndefined(this.User.get(16))
      assert.equal(this.Organization.get(15).users.length, 2)
      this.User.eject(17)
      assert.isUndefined(this.User.get(17))
      assert.equal(this.Organization.get(15).users.length, 1)
      this.User.eject(18)
      assert.isUndefined(this.User.get(18))
      assert.equal(this.Organization.get(15).users.length, 0)

      // comment19 relations
      assert.deepEqual(this.User.get(20), this.Comment.get(19).user)
      assert.deepEqual(this.User.get(19), this.Comment.get(19).approvedByUser)
      this.User.eject(20)
      assert.isUndefined(this.Comment.get(19).user)
      this.User.eject(19)
      assert.isUndefined(this.Comment.get(19).approvedByUser)

      // profile21 relations
      assert.deepEqual(this.User.get(22), this.Profile.get(21).user)
      this.User.eject(22)
      assert.isUndefined(this.Profile.get(21).user)
    })
  })
}
