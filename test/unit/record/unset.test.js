import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Record = JSData.Record
  const record = new Record()
  t.is(typeof record.unset, 'function')
  t.ok(record.unset === Record.prototype.unset)
})
test('should unset a property', (t) => {
  const user = new JSData.Record({ foo: 'bar' })
  t.is(user.foo, 'bar')
  user.unset('foo')
  t.notOk(user.foo)
})
test('should set a nested property', (t) => {
  const user = new JSData.Record({ address: { state: 'TX' } })
  t.is(user.address.state, 'TX')
  user.unset('address.state')
  t.notOk(user.address.state)
})
test.cb('should trigger change events', (t) => {
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
  user.on('change', (t) => {
    triggers++
  })
  user.on('change:foo', (t) => {
    triggers++
  })
  user.on('change:beep', (t) => {
    triggers++
  })
  t.is(user.foo, 'bar')
  t.is(user.beep, 'boop')
  user.unset('foo')
  user.unset('beep')
  t.notOk(user.foo)
  t.notOk(user.beep)
  setTimeout(function () {
    t.is(triggers, 3, 'three events should have fired')
    t.end()
  }, 10)
})
test.cb('should support "silent" option', (t) => {
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
  user.on('change', (t) => {
    triggers++
  })
  user.on('change:foo', (t) => {
    triggers++
  })
  user.on('change:beep', (t) => {
    triggers++
  })
  t.is(user.foo, 'bar')
  t.is(user.beep, 'boop')
  user.unset('foo', { silent: true })
  user.unset('beep', { silent: true })
  t.notOk(user.foo)
  t.notOk(user.beep)
  setTimeout(function () {
    t.is(triggers, 0, 'no events should have fired')
    t.end()
  }, 10)
})
