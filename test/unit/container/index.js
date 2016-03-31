import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be a constructor function', (t) => {
  const Container = JSData.Container
  t.is(typeof Container, 'function')
  const container = new Container()
  t.ok(container instanceof Container)
})
test('should initialize with defaults', (t) => {
  const Container = JSData.Container
  const container = new Container()
  t.same(container._adapters, {})
  t.same(container._mappers, {})
  t.same(container.mapperDefaults, {})
  t.ok(container.mapperClass === JSData.Mapper)
})
test('should accept overrides', (t) => {
  const Container = JSData.Container
  class Foo {}
  const container = new Container({
    mapperClass: Foo,
    foo: 'bar',
    mapperDefaults: {
      idAttribute: '_id'
    }
  })
  t.same(container._adapters, {})
  t.same(container._mappers, {})
  t.is(container.foo, 'bar')
  t.same(container.mapperDefaults, {
    idAttribute: '_id'
  })
  t.ok(container.mapperClass === Foo)
})
test('should have events', (t) => {
  const store = new JSData.DataStore()
  const listener = sinon.stub()
  store.on('bar', listener)
  store.emit('bar')
  t.ok(listener.calledOnce)
})
test('should proxy Mapper events', (t) => {
  const store = new JSData.DataStore()
  store.defineMapper('user')
  const listener = sinon.stub()
  store.on('bar', listener)
  store.getMapper('user').emit('bar', 'foo')
  t.ok(listener.calledOnce)
  t.same(listener.firstCall.args, ['user', 'foo'])
})
test('should proxy all Mapper events', (t) => {
  const store = new JSData.DataStore()
  store.defineMapper('user')
  const listener = sinon.stub()
  store.on('all', listener)
  store.getMapper('user').emit('bar', 'foo')
  t.ok(listener.calledOnce)
  t.same(listener.firstCall.args, ['bar', 'user', 'foo'])
})
