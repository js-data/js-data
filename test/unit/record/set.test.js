import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Record = JSData.Record
  const record = new Record()
  t.is(typeof record.save, 'function')
  t.ok(record.save === Record.prototype.save)
})
test('should set a property', (t) => {
  const user = new JSData.Record()
  t.notOk(user.foo)
  user.set('foo', 'bar')
  t.is(user.foo, 'bar')
})
test('should set a nested property', (t) => {
  const user = new JSData.Record()
  t.notOk(user.address)
  user.set('address.state', 'TX')
  t.is(user.address.state, 'TX')
})
test('should set multiple properties', (t) => {
  const user = new JSData.Record()
  t.notOk(user.foo)
  t.notOk(user.beep)
  user.set({
    foo: 'bar',
    beep: 'boop'
  })
  t.is(user.foo, 'bar')
  t.is(user.beep, 'boop')
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
  const user = UserMapper.createRecord()
  user.on('change', (t) => {
    triggers++
  })
  user.on('change:foo', (t) => {
    triggers++
  })
  user.on('change:beep', (t) => {
    triggers++
  })
  t.notOk(user.foo)
  t.notOk(user.beep)
  user.set({
    foo: 'bar',
    beep: 'boop'
  })
  t.is(user.foo, 'bar')
  t.is(user.beep, 'boop')
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
  const user = UserMapper.createRecord()
  user.on('change', (t) => {
    triggers++
  })
  user.on('change:foo', (t) => {
    triggers++
  })
  user.on('change:beep', (t) => {
    triggers++
  })
  t.notOk(user.foo)
  t.notOk(user.beep)
  user.set({
    foo: 'bar'
  }, { silent: true })
  user.set('beep', 'boop', { silent: true })
  t.is(user.foo, 'bar')
  t.is(user.beep, 'boop')
  setTimeout(function () {
    t.is(triggers, 0, 'no events should have fired')
    t.end()
  }, 10)
})
