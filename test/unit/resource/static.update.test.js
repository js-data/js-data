/* global Resource:true */
import {assert} from 'chai'

export function init () {
  describe('static update', function () {
    it('should be a static function', function () {
      assert.isFunction(Resource.update)
      let User = Resource.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Resource {}
      class User3 extends User2 {}
      assert.isFunction(User.update)
      assert.isFunction(User2.update)
      assert.isTrue(Resource.update === User.update)
      assert.isTrue(Resource.update === User2.update)
      assert.isTrue(User.update === User2.update)
      assert.isTrue(User2.update === User3.update)
    })
    it('should be tested')
  })
}
