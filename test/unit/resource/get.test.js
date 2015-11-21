/* global Resource:true */
import {assert} from 'chai'

export function init () {
  describe('get', function () {
    it('should a static function', function () {
      assert.isFunction(Resource.get)
      let User = Resource.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Resource {}
      class User3 extends User2 {}
      assert.isFunction(User.get)
      assert.isFunction(User2.get)
      assert.isTrue(Resource.get === User.get)
      assert.isTrue(Resource.get === User2.get)
      assert.isTrue(User.get === User2.get)
      assert.isTrue(User2.get === User3.get)
    })
    it('should get an item from the store', function () {
      class User extends Resource {}
      User.schema({ id: {} })

      const user = User.inject({ id: 1 })
      assert.isTrue(User.get(1) === user, 'should get the user from the store')
      assert.isUndefined(User.get(2), 'should return undefined if the item is not in the store')
    })
  })
}
