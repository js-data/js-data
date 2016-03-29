import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Record = JSData.Record
  const record = new Record()
  t.is(typeof record.get, 'function')
  t.ok(record.get === Record.prototype.get)
})
test('should return a property', (t) => {
  const user = new JSData.Record({ foo: 'bar' })
  t.is(user.get('foo'), 'bar')
})
test('should return undefined if the property does not exist', (t) => {
  const user = new JSData.Record()
  t.notOk(user.get('foo'))
})
test('should return a nested property', (t) => {
  const user = new JSData.Record({ address: { state: 'TX' } })
  t.is(user.get('address.state'), 'TX')
})
