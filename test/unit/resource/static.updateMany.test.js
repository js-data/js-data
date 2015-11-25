/* global Resource:true */
import {assert} from 'chai'

export function init () {
  describe('static updateAll', function () {
    it('should be a static function', function () {
      assert.isFunction(Resource.updateAll)
      let User = Resource.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Resource {}
      class User3 extends User2 {}
      assert.isFunction(User.updateAll)
      assert.isFunction(User2.updateAll)
      assert.isTrue(Resource.updateAll === User.updateAll)
      assert.isTrue(Resource.updateAll === User2.updateAll)
      assert.isTrue(User.updateAll === User2.updateAll)
      assert.isTrue(User2.updateAll === User3.updateAll)
    })
    it('should be tested')
  })
}
