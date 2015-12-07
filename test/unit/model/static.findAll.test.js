/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('static findAll', function () {
    it('should be a static function', function () {
      assert.isFunction(Model.findAll)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.findAll)
      assert.isFunction(User2.findAll)
      assert.isTrue(Model.findAll === User.findAll)
      assert.isTrue(Model.findAll === User2.findAll)
      assert.isTrue(User.findAll === User2.findAll)
      assert.isTrue(User2.findAll === User3.findAll)
    })
    it('should be tested')
  })
}
