export function init () {
  describe('unset', function () {
    it('should be an instance method', function () {
      const Test = this
      const Record = Test.JSData.Record
      const record = new Record()
      Test.assert.isFunction(record.unset)
      Test.assert.isTrue(record.unset === Record.prototype.unset)
    })
    it('should unset a property', function () {
      const Test = this
      const user = new Test.JSData.Record({ foo: 'bar' })
      Test.assert.equal(user.foo, 'bar')
      user.unset('foo')
      Test.assert.isUndefined(user.foo)
    })
    it('should set a nested property', function () {
      const Test = this
      const user = new Test.JSData.Record({ address: { state: 'TX' } })
      Test.assert.equal(user.address.state, 'TX')
      user.unset('address.state')
      Test.assert.isUndefined(user.address.state)
    })
    // it('should trigger change events', function (done) {
    //   const Test = this
    //   class User extends Test.JSData.Model {}
    //   User.setSchema({
    //     foo: { type: 'string', track: true },
    //     beep: { type: 'string', track: true }
    //   })
    //   let triggers = 0
    //   const user = new User({ foo: 'bar', beep: 'boop' })
    //   user.on('change', function () {
    //     triggers++
    //   })
    //   user.on('change:foo', function () {
    //     triggers++
    //   })
    //   user.on('change:beep', function () {
    //     triggers++
    //   })
    //   Test.assert.equal(user.foo, 'bar')
    //   Test.assert.equal(user.beep, 'boop')
    //   user.unset('foo')
    //   user.unset('beep')
    //   Test.assert.isUndefined(user.foo)
    //   Test.assert.isUndefined(user.beep)
    //   setTimeout(function () {
    //     Test.assert.equal(triggers, 3, 'three events should have fired')
    //     done()
    //   }, 10)
    // })
    // it('should support "silent" option', function (done) {
    //   const Test = this
    //   class User extends Test.JSData.Model {}
    //   User.setSchema({
    //     foo: { type: 'string', track: true },
    //     beep: { type: 'string', track: true }
    //   })
    //   let triggers = 0
    //   const user = new User({ foo: 'bar', beep: 'boop' })
    //   user.on('change', function () {
    //     triggers++
    //   })
    //   user.on('change:foo', function () {
    //     triggers++
    //   })
    //   user.on('change:beep', function () {
    //     triggers++
    //   })
    //   Test.assert.equal(user.foo, 'bar')
    //   Test.assert.equal(user.beep, 'boop')
    //   user.unset('foo', { silent: true })
    //   user.unset('beep', { silent: true })
    //   Test.assert.isUndefined(user.foo)
    //   Test.assert.isUndefined(user.beep)
    //   setTimeout(function () {
    //     Test.assert.equal(triggers, 0, 'no events should have fired')
    //     done()
    //   }, 10)
    // })
  })
}
