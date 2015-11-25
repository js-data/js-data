/* global Resource:true */
import {assert} from 'chai'

export function init () {
  describe('static createMany', function () {
    it('should be a static function', function () {
      assert.isFunction(Resource.createMany)
      let User = Resource.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Resource {}
      class User3 extends User2 {}
      assert.isFunction(User.createMany)
      assert.isFunction(User2.createMany)
      assert.isTrue(Resource.createMany === User.createMany)
      assert.isTrue(Resource.createMany === User2.createMany)
      assert.isTrue(User.createMany === User2.createMany)
      assert.isTrue(User2.createMany === User3.createMany)
    })
    it('should be tested')
  })
}
