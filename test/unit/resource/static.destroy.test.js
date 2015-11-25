/* global Resource:true */
import {assert} from 'chai'

export function init () {
  describe('static destroy', function () {
    it('should be a static function', function () {
      assert.isFunction(Resource.destroy)
      let User = Resource.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Resource {}
      class User3 extends User2 {}
      assert.isFunction(User.destroy)
      assert.isFunction(User2.destroy)
      assert.isTrue(Resource.destroy === User.destroy)
      assert.isTrue(Resource.destroy === User2.destroy)
      assert.isTrue(User.destroy === User2.destroy)
      assert.isTrue(User2.destroy === User3.destroy)
    })
    it('should be tested')
  })
}
