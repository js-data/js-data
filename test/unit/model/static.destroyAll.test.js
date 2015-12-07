/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('static destroyAll', function () {
    it('should be a static function', function () {
      assert.isFunction(Model.destroyAll)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.destroyAll)
      assert.isFunction(User2.destroyAll)
      assert.isTrue(Model.destroyAll === User.destroyAll)
      assert.isTrue(Model.destroyAll === User2.destroyAll)
      assert.isTrue(User.destroyAll === User2.destroyAll)
      assert.isTrue(User2.destroyAll === User3.destroyAll)
    })
    it('should be tested')
  })
}
