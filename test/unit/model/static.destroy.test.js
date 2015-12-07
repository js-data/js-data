/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('static destroy', function () {
    it('should be a static function', function () {
      assert.isFunction(Model.destroy)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.destroy)
      assert.isFunction(User2.destroy)
      assert.isTrue(Model.destroy === User.destroy)
      assert.isTrue(Model.destroy === User2.destroy)
      assert.isTrue(User.destroy === User2.destroy)
      assert.isTrue(User2.destroy === User3.destroy)
    })
    it('should be tested')
  })
}
