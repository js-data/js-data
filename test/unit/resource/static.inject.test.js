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
  })
}
