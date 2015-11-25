/* global Resource:true */
import {assert} from 'chai'

export function init () {
  describe('#save', function () {
    it('should be an instance function', function () {
      assert.isFunction(Resource.prototype.save)
      let User = Resource.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Resource {}
      class User3 extends User2 {}
      assert.isFunction(User.prototype.save)
      assert.isFunction(User2.prototype.save)
      assert.isTrue(Resource.prototype.save === User.prototype.save)
      assert.isTrue(Resource.prototype.save === User2.prototype.save)
      assert.isTrue(User.prototype.save === User2.prototype.save)
      assert.isTrue(User2.prototype.save === User3.prototype.save)
    })
    it('should be tested')
  })
}
