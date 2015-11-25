/* global Resource:true */
import {assert} from 'chai'

export function init () {
  describe('static find', function () {
    it('should be a static function', function () {
      assert.isFunction(Resource.find)
      let User = Resource.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Resource {}
      class User3 extends User2 {}
      assert.isFunction(User.find)
      assert.isFunction(User2.find)
      assert.isTrue(Resource.find === User.find)
      assert.isTrue(Resource.find === User2.find)
      assert.isTrue(User.find === User2.find)
      assert.isTrue(User2.find === User3.find)
    })
    it('should be tested')
  })
}
