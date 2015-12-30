/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('#unset', function () {
    it('should be an instance function', function () {
      assert.isFunction(Model.prototype.unset)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.prototype.unset)
      assert.isFunction(User2.prototype.unset)
      assert.isTrue(Model.prototype.unset === User.prototype.unset)
      assert.isTrue(Model.prototype.unset === User2.prototype.unset)
      assert.isTrue(User.prototype.unset === User2.prototype.unset)
      assert.isTrue(User2.prototype.unset === User3.prototype.unset)
    })
    it('should unset a property', function () {
      class User extends Model {}
      const user = new User({ foo: 'bar' })
      assert.equal(user.foo, 'bar')
      user.unset('foo')
      assert.isUndefined(user.foo)
    })
    it('should set a nested property', function () {
      class User extends Model {}
      const user = new User({ address: { state: 'TX' } })
      assert.equal(user.address.state, 'TX')
      user.unset('address.state')
      assert.isUndefined(user.address.state)
    })
    it('should trigger change events', function (done) {
      class User extends Model {}
      User.setSchema({
        foo: { type: 'string', track: true },
        beep: { type: 'string', track: true }
      })
      let triggers = 0
      const user = new User({ foo: 'bar', beep: 'boop' })
      user.on('change', function () {
        triggers++
      })
      user.on('change:foo', function () {
        triggers++
      })
      user.on('change:beep', function () {
        triggers++
      })
      assert.equal(user.foo, 'bar')
      assert.equal(user.beep, 'boop')
      user.unset('foo')
      user.unset('beep')
      assert.isUndefined(user.foo)
      assert.isUndefined(user.beep)
      setTimeout(function () {
        assert.equal(triggers, 3, 'three events should have fired')
        done()
      }, 10)
    })
    it('should support "silent" option', function (done) {
      class User extends Model {}
      User.setSchema({
        foo: { type: 'string', track: true },
        beep: { type: 'string', track: true }
      })
      let triggers = 0
      const user = new User({ foo: 'bar', beep: 'boop' })
      user.on('change', function () {
        triggers++
      })
      user.on('change:foo', function () {
        triggers++
      })
      user.on('change:beep', function () {
        triggers++
      })
      assert.equal(user.foo, 'bar')
      assert.equal(user.beep, 'boop')
      user.unset('foo', { silent: true })
      user.unset('beep', { silent: true })
      assert.isUndefined(user.foo)
      assert.isUndefined(user.beep)
      setTimeout(function () {
        assert.equal(triggers, 0, 'no events should have fired')
        done()
      }, 10)
    })
  })
}
