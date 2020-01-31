import { assert, JSData } from '../../_setup'

describe('Record#set', () => {
  it('should be an instance method', () => {
    const Record = JSData.Record
    const record = new Record()
    assert.equal(typeof record.save, 'function')
    assert.strictEqual(record.save, Record.prototype.save)
  })
  it('should set a property', () => {
    const user = new JSData.Record()
    assert(!user.foo)
    user.set('foo', 'bar')
    assert.equal(user.foo, 'bar')
  })
  it('should set a nested property', () => {
    const user = new JSData.Record()
    assert(!user.address)
    user.set('address.state', 'TX')
    assert.equal(user.address.state, 'TX')
  })
  it('should set multiple properties', () => {
    const user = new JSData.Record()
    assert(!user.foo)
    assert(!user.beep)
    user.set({
      foo: 'bar',
      beep: 'boop'
    })
    assert.equal(user.foo, 'bar')
    assert.equal(user.beep, 'boop')
  })
  it('should trigger change events', done => {
    const UserMapper = new JSData.Mapper({
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
    user.on('change', () => {
      triggers++
    })
    user.on('change:foo', () => {
      triggers++
    })
    user.on('change:beep', () => {
      triggers++
    })
    assert(!user.foo)
    assert(!user.beep)
    user.set({
      foo: 'bar',
      beep: 'boop'
    })
    assert.equal(user.foo, 'bar')
    assert.equal(user.beep, 'boop')
    setTimeout(() => {
      assert.equal(triggers, 3, 'three events should have fired')
      done()
    }, 10)
  })
  it('should support "silent" option', done => {
    const UserMapper = new JSData.Mapper({
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
    user.on('change', () => {
      triggers++
    })
    user.on('change:foo', () => {
      triggers++
    })
    user.on('change:beep', () => {
      triggers++
    })
    assert(!user.foo)
    assert(!user.beep)
    user.set(
      {
        foo: 'bar'
      },
      { silent: true }
    )
    user.set('beep', 'boop', { silent: true })
    assert.equal(user.foo, 'bar')
    assert.equal(user.beep, 'boop')
    setTimeout(() => {
      assert.equal(triggers, 0, 'no events should have fired')
      done()
    }, 10)
  })
})
