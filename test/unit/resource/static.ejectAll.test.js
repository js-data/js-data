/* global p1:true, p2:true, p3:true, p4:true, p5:true, Resource:true */
import {assert} from 'chai'

export function init () {
  describe('static ejectAll', function () {
    it('should be a static function', function () {
      assert.isFunction(Resource.ejectAll)
      let User = Resource.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Resource {}
      class User3 extends User2 {}
      assert.isFunction(User.ejectAll)
      assert.isFunction(User2.ejectAll)
      assert.isTrue(Resource.ejectAll === User.ejectAll)
      assert.isTrue(Resource.ejectAll === User2.ejectAll)
      assert.isTrue(User.ejectAll === User2.ejectAll)
      assert.isTrue(User2.ejectAll === User3.ejectAll)
    })
    it('should eject items that meet the criteria from the store', function () {
      class User extends Resource {}
      User.setSchema({
        id: {}
      })
      User.inject([p1, p2, p3, p4, p5])
      assert.isDefined(User.get(5))
      assert.isDefined(User.get(6))
      assert.isDefined(User.get(7))
      assert.isDefined(User.get(8))
      assert.isDefined(User.get(9))
      assert.doesNotThrow(function () {
        User.ejectAll({ where: { author: 'Adam' } })
      })
      assert.isDefined(User.get(5))
      assert.isDefined(User.get(6))
      assert.isDefined(User.get(7))
      assert.isUndefined(User.get(8))
      assert.isUndefined(User.get(9))
    })
    it('should eject all items from the store', function () {
      class User extends Resource {}
      User.setSchema({
        id: {}
      })
      User.inject([p1, p2, p3, p4])

      assert.objectsEqual(User.get(5), p1)
      assert.objectsEqual(User.get(6), p2)
      assert.objectsEqual(User.get(7), p3)
      assert.objectsEqual(User.get(8), p4)

      // TODO?
      // store.store.post.completedQueries.test = 'stuff'

      assert.doesNotThrow(function () {
        User.ejectAll()
      })

      // TODO?
      // assert.objectsEqual(store.store.post.completedQueries, {})
      assert.isUndefined(User.get(5))
      assert.isUndefined(User.get(6))
      assert.isUndefined(User.get(7))
      assert.isUndefined(User.get(8))
    })
  })
}
