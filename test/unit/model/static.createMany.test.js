/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('static createMany', function () {
    it('should be a static function', function () {
      assert.isFunction(Model.createMany)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.createMany)
      assert.isFunction(User2.createMany)
      assert.isTrue(Model.createMany === User.createMany)
      assert.isTrue(Model.createMany === User2.createMany)
      assert.isTrue(User.createMany === User2.createMany)
      assert.isTrue(User2.createMany === User3.createMany)
    })
    it('should be tested')
  })
}
