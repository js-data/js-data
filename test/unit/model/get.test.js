/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('#get', function () {
    it('should be an instance function', function () {
      assert.isFunction(Model.prototype.get)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.prototype.get)
      assert.isFunction(User2.prototype.get)
      assert.isTrue(Model.prototype.get === User.prototype.get)
      assert.isTrue(Model.prototype.get === User2.prototype.get)
      assert.isTrue(User.prototype.get === User2.prototype.get)
      assert.isTrue(User2.prototype.get === User3.prototype.get)
    })
    it('should return a property', function () {
      class User extends Model {}
      const user = new User({ foo: 'bar' })
      assert.equal(user.get('foo'), 'bar')
    })
    it('should return undefined if the property does not exist', function () {
      class User extends Model {}
      const user = new User()
      assert.isUndefined(user.get('foo'))
    })
    it('should return a nested property', function () {
      class User extends Model {}
      const user = new User({ address: { state: 'TX' } })
      assert.equal(user.get('address.state'), 'TX')
    })
  })
}
