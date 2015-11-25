/* global Resource:true */
import {assert} from 'chai'

export function init () {
  describe('#destroy', function () {
    it('should be an instance function', function () {
      assert.isFunction(Resource.prototype.destroy)
      let User = Resource.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Resource {}
      class User3 extends User2 {}
      assert.isFunction(User.prototype.destroy)
      assert.isFunction(User2.prototype.destroy)
      assert.isTrue(Resource.prototype.destroy === User.prototype.destroy)
      assert.isTrue(Resource.prototype.destroy === User2.prototype.destroy)
      assert.isTrue(User.prototype.destroy === User2.prototype.destroy)
      assert.isTrue(User2.prototype.destroy === User3.prototype.destroy)
    })
    it('should be tested')
  })
}
