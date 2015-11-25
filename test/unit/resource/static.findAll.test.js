/* global Resource:true */
import {assert} from 'chai'

export function init () {
  describe('static findAll', function () {
    it('should be a static function', function () {
      assert.isFunction(Resource.findAll)
      let User = Resource.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Resource {}
      class User3 extends User2 {}
      assert.isFunction(User.findAll)
      assert.isFunction(User2.findAll)
      assert.isTrue(Resource.findAll === User.findAll)
      assert.isTrue(Resource.findAll === User2.findAll)
      assert.isTrue(User.findAll === User2.findAll)
      assert.isTrue(User2.findAll === User3.findAll)
    })
    it('should be tested')
  })
}
