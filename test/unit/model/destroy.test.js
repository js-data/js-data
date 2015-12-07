/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('#destroy', function () {
    it('should be an instance function', function () {
      assert.isFunction(Model.prototype.destroy)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.prototype.destroy)
      assert.isFunction(User2.prototype.destroy)
      assert.isTrue(Model.prototype.destroy === User.prototype.destroy)
      assert.isTrue(Model.prototype.destroy === User2.prototype.destroy)
      assert.isTrue(User.prototype.destroy === User2.prototype.destroy)
      assert.isTrue(User2.prototype.destroy === User3.prototype.destroy)
    })
    it('should be tested')
  })
}
