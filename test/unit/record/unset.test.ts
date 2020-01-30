import { assert, JSData } from '../../_setup'

describe('Record#unset', () => {
  it('should be an instance method', () => {
    const Record = JSData.Record
    const record = new Record()
    assert.equal(typeof record.unset, 'function')
    assert.strictEqual(record.unset, Record.prototype.unset)
  })
  it('should unset a property', () => {
    const user = new JSData.Record({ foo: 'bar' })
    assert.equal(user.foo, 'bar')
    user.unset('foo')
    assert(!user.foo)
  })
  it('should set a nested property', () => {
    const user = new JSData.Record({ address: { state: 'TX' } })
    assert.equal(user.address.state, 'TX')
    user.unset('address.state')
    assert(!user.address.state)
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
    const user = UserMapper.createRecord({ foo: 'bar', beep: 'boop' })
    user.on('change', () => {
      triggers++
    })
    user.on('change:foo', () => {
      triggers++
    })
    user.on('change:beep', () => {
      triggers++
    })
    assert.equal(user.foo, 'bar')
    assert.equal(user.beep, 'boop')
    user.unset('foo')
    user.unset('beep')
    assert(!user.foo)
    assert(!user.beep)
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
    const user = UserMapper.createRecord({ foo: 'bar', beep: 'boop' })
    user.on('change', () => {
      triggers++
    })
    user.on('change:foo', () => {
      triggers++
    })
    user.on('change:beep', () => {
      triggers++
    })
    assert.equal(user.foo, 'bar')
    assert.equal(user.beep, 'boop')
    user.unset('foo', { silent: true })
    user.unset('beep', { silent: true })
    assert(!user.foo)
    assert(!user.beep)
    setTimeout(() => {
      assert.equal(triggers, 0, 'no events should have fired')
      done()
    }, 10)
  })
})
