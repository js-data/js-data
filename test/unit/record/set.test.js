export function init () {
  describe('set', function () {
    it('should be an instance method', function () {
      const Test = this
      const Record = Test.JSData.Record
      const record = new Record()
      Test.assert.isFunction(record.save)
      Test.assert.isTrue(record.save === Record.prototype.save)
    })
    it('should set a property', function () {
      const Test = this
      const user = new Test.JSData.Record()
      Test.assert.isUndefined(user.foo)
      user.set('foo', 'bar')
      Test.assert.equal(user.foo, 'bar')
    })
    it('should set a nested property', function () {
      const Test = this
      const user = new Test.JSData.Record()
      Test.assert.isUndefined(user.address)
      user.set('address.state', 'TX')
      Test.assert.equal(user.address.state, 'TX')
    })
    it('should set multiple properties', function () {
      const Test = this
      const user = new Test.JSData.Record()
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
      const UserMapper = new Test.JSData.Mapper({
        name: 'user',
        schema: {
          properties: {
            foo: { type: 'string', track: true },
            beep: { type: 'string', track: true }
          }
        }
      })
      let triggers = 0
      const user = UserMapper.createRecord()
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
      const UserMapper = new Test.JSData.Mapper({
        name: 'user',
        schema: {
          properties: {
            foo: { type: 'string', track: true },
            beep: { type: 'string', track: true }
          }
        }
      })
      let triggers = 0
      const user = UserMapper.createRecord()
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
