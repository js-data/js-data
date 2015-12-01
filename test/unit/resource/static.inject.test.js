/* global Resource:true */
import {assert} from 'chai'

export function init () {
  describe('static inject', function () {
    it('should be a static function', function () {
      assert.isFunction(Resource.inject)
      let User = Resource.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Resource {}
      class User3 extends User2 {}
      assert.isFunction(User.inject)
      assert.isFunction(User2.inject)
      assert.isTrue(Resource.inject === User.inject)
      assert.isTrue(Resource.inject === User2.inject)
      assert.isTrue(User.inject === User2.inject)
      assert.isTrue(User2.inject === User3.inject)
    })
    it('should inject new items into the store', function () {
      class User extends Resource {}
      User.schema({ id: {} })

      const user = User.inject({ id: 1 })
      const users = User.inject([{ id: 2 }, { id: 3 }])
      assert.isTrue(User.get(1) === user)
      assert.deepEqual(User.between([2], [3], {
        rightInclusive: true
      }), users)
    })
    it('should inject existing items into the store', function () {
      class User extends Resource {}
      User.schema({ id: {} })

      const user = User.inject({ id: 1 })
      const users = User.inject([{ id: 2 }, { id: 3 }])
      const userAgain = User.inject({ id: 1 })
      const usersAgain = User.inject([{ id: 2 }, { id: 3 }])
      assert.isTrue(User.get(1) === user, 'original reference should still be valid')
      assert.isTrue(User.get(1) === userAgain, 'new reference should be valid')
      assert.isTrue(user === userAgain, 'both references should point to the same object')
      assert.deepEqual(User.between([2], [3], {
        rightInclusive: true
      }), users, 'injection of array should work')
      assert.deepEqual(User.between([2], [3], {
        rightInclusive: true
      }), usersAgain, 're-inject of array should work')
      assert.deepEqual(users, usersAgain, 'inject arrays should be equal')
    })
    it('should replace existing items', function () {
      class User extends Resource {}
      User.schema({ id: {} })
      const user = User.inject({ id: 1, foo: 'bar', beep: 'boop' })
      assert.equal(user.id, 1)
      assert.equal(user.foo, 'bar')
      assert.equal(user.beep, 'boop')
      assert.isUndefined(user.biz)
      const existing = User.inject({ id: 1, biz: 'baz', foo: 'BAR' }, { onConflict: 'replace' })
      assert.isTrue(user === existing)
      assert.equal(user.id, 1)
      assert.equal(user.biz, 'baz')
      assert.equal(user.foo, 'BAR')
      assert.isUndefined(user.beep)
    })
    it.only('should inject relations', function () {
      // can inject items without relations
      this.User.inject(this.data.user1)
      this.Organization.inject(this.data.organization2)
      this.Comment.inject(this.data.comment3)
      this.Profile.inject(this.data.profile4)

      assert.deepEqual(this.User.get(1).id, this.data.user1.id)
      assert.deepEqual(this.Organization.get(2).id, this.data.organization2.id)
      assert.deepEqual(this.Comment.get(3).id, this.data.comment3.id)
      assert.deepEqual(this.Profile.get(4).id, this.data.profile4.id)

      // can inject items with relations
      this.User.inject(this.data.user10)
      this.Organization.inject(this.data.organization15)
      this.Comment.inject(this.data.comment19)
      this.Profile.inject(this.data.profile21)
      this.Group.inject(this.data.group1)

      // originals
      assert.equal(this.User.get(10).name, this.data.user10.name)
      assert.equal(this.User.get(10).id, this.data.user10.id)
      assert.equal(this.User.get(10).organizationId, this.data.user10.organizationId)
      assert.isArray(this.User.get(10).comments)
      assert.deepEqual(this.Organization.get(15).name, this.data.organization15.name)
      assert.deepEqual(this.Organization.get(15).id, this.data.organization15.id)
      assert.isArray(this.Organization.get(15).users)
      assert.deepEqual(this.Comment.get(19).id, this.data.comment19.id)
      assert.deepEqual(this.Comment.get(19).content, this.data.comment19.content)
      assert.deepEqual(this.Profile.get(21).id, this.data.profile21.id)
      assert.deepEqual(this.Profile.get(21).content, this.data.profile21.content)
      assert.deepEqual(this.Group.get(1).id, this.data.group1.id)
      assert.deepEqual(this.Group.get(1).name, this.data.group1.name)
      assert.isArray(this.Group.get(1).userIds)

      return

      // user10 relations
      assert.deepEqual(this.Comment.get(11), this.User.get(10).comments[0])
      assert.deepEqual(this.Comment.get(12), this.User.get(10).comments[1])
      assert.deepEqual(this.Comment.get(13), this.User.get(10).comments[2])
      assert.deepEqual(this.Organization.get(14), this.User.get(10).organization)
      assert.deepEqual(this.Profile.get(15), this.User.get(10).profile)
      assert.isArray(this.User.get(10).groups)
      assert.deepEqual(this.User.get(10).groups[0], this.Group.get(1))

      // group1 relations
      assert.isArray(this.Group.get(1).users)
      assert.deepEqual(this.Group.get(1).users[0], this.User.get(10))

      // organization15 relations
      assert.deepEqual(this.User.get(16), this.Organization.get(15).users[0])
      assert.deepEqual(this.User.get(17), this.Organization.get(15).users[1])
      assert.deepEqual(this.User.get(18), this.Organization.get(15).users[2])

      // comment19 relations
      assert.deepEqual(this.User.get(20), this.Comment.get(19).user)
      assert.deepEqual(this.User.get(19), this.Comment.get(19).approvedByUser)

      // profile21 relations
      assert.deepEqual(this.User.get(22), this.Profile.get(21).user)
    })
  })
}
