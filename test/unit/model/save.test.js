/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('#save', function () {
    it('should be an instance function', function () {
      assert.isFunction(Model.prototype.save)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.prototype.save)
      assert.isFunction(User2.prototype.save)
      assert.isTrue(Model.prototype.save === User.prototype.save)
      assert.isTrue(Model.prototype.save === User2.prototype.save)
      assert.isTrue(User.prototype.save === User2.prototype.save)
      assert.isTrue(User2.prototype.save === User3.prototype.save)
    })
    it('should be tested')
  })
}
