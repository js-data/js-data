export function init () {
  describe('#set', function () {
    it('should be an instance function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Model.prototype.set)
      let User = Test.JSData.Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Test.JSData.Model {}
      class User3 extends User2 {}
      Test.assert.isFunction(User.prototype.set)
      Test.assert.isFunction(User2.prototype.set)
      Test.assert.isTrue(Test.JSData.Model.prototype.set === User.prototype.set)
      Test.assert.isTrue(Test.JSData.Model.prototype.set === User2.prototype.set)
      Test.assert.isTrue(User.prototype.set === User2.prototype.set)
      Test.assert.isTrue(User2.prototype.set === User3.prototype.set)
    })
    it('should set a property', function () {
      const Test = this
      class User extends Test.JSData.Model {}
      const user = new User()
      Test.assert.isUndefined(user.foo)
      user.set('foo', 'bar')
      Test.assert.equal(user.foo, 'bar')
    })
    it('should set a nested property', function () {
      const Test = this
      class User extends Test.JSData.Model {}
      const user = new User()
      Test.assert.isUndefined(user.address)
      user.set('address.state', 'TX')
      Test.assert.equal(user.address.state, 'TX')
    })
    it('should set multiple properties', function () {
      const Test = this
      class User extends Test.JSData.Model {}
      const user = new User()
      Test.assert.isUndefined(user.foo)
      Test.assert.isUndefined(user.beep)
      user.set({
        foo: 'bar',
        beep: 'boop'
      })
      Test.assert.equal(user.foo, 'bar')
      Test.assert.equal(user.beep, 'boop')
    })
    it('should trigger change events', function (done) {
      const Test = this
      class User extends Test.JSData.Model {}
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
      Test.assert.isUndefined(user.foo)
      Test.assert.isUndefined(user.beep)
      user.set({
        foo: 'bar',
        beep: 'boop'
      })
      Test.assert.equal(user.foo, 'bar')
      Test.assert.equal(user.beep, 'boop')
      setTimeout(function () {
        Test.assert.equal(triggers, 3, 'three events should have fired')
        done()
      }, 10)
    })
    it('should support "silent" option', function (done) {
      const Test = this
      class User extends Test.JSData.Model {}
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
      Test.assert.isUndefined(user.foo)
      Test.assert.isUndefined(user.beep)
      user.set({
        foo: 'bar'
      }, { silent: true })
      user.set('beep', 'boop', { silent: true })
      Test.assert.equal(user.foo, 'bar')
      Test.assert.equal(user.beep, 'boop')
      setTimeout(function () {
        Test.assert.equal(triggers, 0, 'no events should have fired')
        done()
      }, 10)
    })
  })
}
