import { assert, JSData, sinon } from '../../_setup'

describe('DataStore', () => {
  it('should be a constructor function', () => {
    const DataStore = JSData.DataStore
    assert.equal(typeof DataStore, 'function')
    const store = new DataStore()
    assert(store instanceof DataStore)
    assert.strictEqual(JSData.utils.getSuper(store), JSData.SimpleStore)
  })
  it('should initialize with defaults', () => {
    const DataStore = JSData.DataStore
    const store = new DataStore()
    assert.deepEqual(store._adapters, {})
    assert.deepEqual(store._mappers, {})
    assert.deepEqual(store._collections, {})
    assert.deepEqual(store.mapperDefaults, {})
    assert.strictEqual(store.mapperClass, JSData.Mapper)
    assert.strictEqual(store.collectionClass, JSData.LinkedCollection)
  })
  it('should accept overrides', () => {
    const DataStore = JSData.DataStore

    class Foo {}

    // tslint:disable-next-line:max-classes-per-file
    class Bar {}

    const store = new DataStore({
      mapperClass: Foo,
      collectionClass: Bar,
      foo: 'bar',
      linkRelations: true,
      mapperDefaults: {
        idAttribute: '_id'
      }
    })
    assert.deepEqual(store._adapters, {})
    assert.deepEqual(store._mappers, {})
    assert.deepEqual(store._collections, {})
    assert.equal(store.foo, 'bar')
    assert.deepEqual(store.mapperDefaults, {
      idAttribute: '_id'
    })
    assert.strictEqual(store.mapperClass, Foo)
    assert.strictEqual(store.collectionClass, Bar)
    assert(store.linkRelations)
  })
  it('should have events', () => {
    const store = new JSData.DataStore()
    const listener = sinon.stub()
    store.on('bar', listener)
    store.emit('bar')
    assert(listener.calledOnce)
  })
  it('should proxy Mapper events', () => {
    const store = new JSData.DataStore()
    store.defineMapper('user')
    const listener = sinon.stub()
    store.on('bar', listener)
    store.getMapper('user').emit('bar', 'foo')
    assert(listener.calledOnce)
    assert.deepEqual(listener.firstCall.args, ['user', 'foo'])
  })
  it('should proxy all Mapper events', () => {
    const store = new JSData.DataStore()
    store.defineMapper('user')
    const listener = sinon.stub()
    store.on('all', listener)
    store.getMapper('user').emit('bar', 'foo')
    assert(listener.calledOnce)
    assert.deepEqual(listener.firstCall.args, ['bar', 'user', 'foo'])
  })
  it('should proxy Collection events', () => {
    const store = new JSData.DataStore()
    store.defineMapper('user')
    const listener = sinon.stub()
    store.on('bar', listener)
    store.getCollection('user').emit('bar', 'foo')
    assert(listener.calledOnce)
    assert.deepEqual(listener.firstCall.args, ['user', 'foo'])
  })
  it('should proxy all Collection events', () => {
    const store = new JSData.DataStore()
    store.defineMapper('user')
    const listener = sinon.stub()
    store.on('all', listener)
    store.getCollection('user').emit('bar', 'foo')
    assert(listener.calledOnce)
    assert.deepEqual(listener.firstCall.args, ['bar', 'user', 'foo'])
  })
})
