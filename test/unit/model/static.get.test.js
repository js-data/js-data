/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('static get', function () {
    it('should be a static function', function () {
      assert.isFunction(Model.get)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.get)
      assert.isFunction(User2.get)
      assert.isTrue(Model.get === User.get)
      assert.isTrue(Model.get === User2.get)
      assert.isTrue(User.get === User2.get)
      assert.isTrue(User2.get === User3.get)
    })
    it('should get an item from the store', function () {
      class User extends Model {}
      User.setSchema({ id: {} })

      const user = User.inject({ id: 1 })
      assert.isTrue(User.get(1) === user, 'should get the user from the store')
      assert.isUndefined(User.get(2), 'should return undefined if the item is not in the store')
    })
  })
}
