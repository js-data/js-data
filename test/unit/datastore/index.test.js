import {
  beforeEach,
  JSData
} from '../../_setup'
import sinon from 'sinon'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be a constructor function', (t) => {
  const DataStore = JSData.DataStore
  t.is(typeof DataStore, 'function')
  const store = new DataStore()
  t.ok(store instanceof DataStore)
  t.ok(JSData.utils.getSuper(store) === JSData.Container)
})
test('should initialize with defaults', (t) => {
  const DataStore = JSData.DataStore
  const store = new DataStore()
  t.same(store._adapters, {})
  t.same(store._mappers, {})
  t.same(store._collections, {})
  t.same(store.mapperDefaults, {})
  t.ok(store.mapperClass === JSData.Mapper)
  t.ok(store.collectionClass === JSData.LinkedCollection)
})
test('should accept overrides', (t) => {
  const DataStore = JSData.DataStore
  class Foo {}
  class Bar {}
  const store = new DataStore({
    mapperClass: Foo,
    CollectionClass: Bar,
    foo: 'bar',
    linkRelations: true,
    mapperDefaults: {
      idAttribute: '_id'
    }
  })
  t.same(store._adapters, {})
  t.same(store._mappers, {})
  t.same(store._collections, {})
  t.is(store.foo, 'bar')
  t.same(store.mapperDefaults, {
    idAttribute: '_id'
  })
  t.ok(store.mapperClass === Foo)
  t.ok(store.CollectionClass === Bar)
  t.ok(store.linkRelations)
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
test('should proxy Collection events', (t) => {
  const store = new JSData.DataStore()
  store.defineMapper('user')
  const listener = sinon.stub()
  store.on('bar', listener)
  store.getCollection('user').emit('bar', 'foo')
  t.ok(listener.calledOnce)
  t.same(listener.firstCall.args, ['user', 'foo'])
})
test('should proxy all Collection events', (t) => {
  const store = new JSData.DataStore()
  store.defineMapper('user')
  const listener = sinon.stub()
  store.on('all', listener)
  store.getCollection('user').emit('bar', 'foo')
  t.ok(listener.calledOnce)
  t.same(listener.firstCall.args, ['bar', 'user', 'foo'])
})
