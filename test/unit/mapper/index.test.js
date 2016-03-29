import {
  beforeEach,
  JSData
} from '../../_setup'
import sinon from 'sinon'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be a constructor function', (t) => {
  const Mapper = JSData.Mapper
  t.ok(typeof Mapper === 'function')
  const mapper = new Mapper({ name: 'foo' })
  t.ok(mapper instanceof Mapper)
})

test('should have events', (t) => {
  const User = new JSData.Mapper({ name: 'user' })
  const listener = sinon.stub()
  User.on('bar', listener)
  User.emit('bar')
  t.ok(listener.calledOnce)
})
