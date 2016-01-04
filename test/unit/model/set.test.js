/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('#set', function () {
    it('should be an instance function', function () {
      assert.isFunction(Model.prototype.set)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.prototype.set)
      assert.isFunction(User2.prototype.set)
      assert.isTrue(Model.prototype.set === User.prototype.set)
      assert.isTrue(Model.prototype.set === User2.prototype.set)
      assert.isTrue(User.prototype.set === User2.prototype.set)
      assert.isTrue(User2.prototype.set === User3.prototype.set)
    })
    it('should set a property', function () {
      class User extends Model {}
      const user = new User()
      assert.isUndefined(user.foo)
      user.set('foo', 'bar')
      assert.equal(user.foo, 'bar')
    })
    it('should set a nested property', function () {
      class User extends Model {}
      const user = new User()
      assert.isUndefined(user.address)
      user.set('address.state', 'TX')
      assert.equal(user.address.state, 'TX')
    })
    it('should set multiple properties', function () {
      class User extends Model {}
      const user = new User()
      assert.isUndefined(user.foo)
      assert.isUndefined(user.beep)
      user.set({
        foo: 'bar',
        beep: 'boop'
      })
      assert.equal(user.foo, 'bar')
      assert.equal(user.beep, 'boop')
    })
    it('should trigger change events', function (done) {
      class User extends Model {}
      User.setSchema({
        foo: { type: 'string', track: true },
        beep: { type: 'string', track: true }
      })
      let triggers = 0
      const user = new User()
      user.on('change', function () {
        triggers++
      })
      user.on('change:foo', function () {
        triggers++
      })
      user.on('change:beep', function () {
        triggers++
      })
      assert.isUndefined(user.foo)
      assert.isUndefined(user.beep)
      user.set({
        foo: 'bar',
        beep: 'boop'
      })
      assert.equal(user.foo, 'bar')
      assert.equal(user.beep, 'boop')
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
      const user = new User()
      user.on('change', function () {
        triggers++
      })
      user.on('change:foo', function () {
        triggers++
      })
      user.on('change:beep', function () {
        triggers++
      })
      assert.isUndefined(user.foo)
      assert.isUndefined(user.beep)
      user.set({
        foo: 'bar'
      }, { silent: true })
      user.set('beep', 'boop', { silent: true })
      assert.equal(user.foo, 'bar')
      assert.equal(user.beep, 'boop')
      setTimeout(function () {
        assert.equal(triggers, 0, 'no events should have fired')
        done()
      }, 10)
    })
  })
}
