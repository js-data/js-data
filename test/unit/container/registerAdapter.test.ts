import { assert, JSData } from '../../_setup'

describe('Container#registerAdapter', () => {
  it('should register an adapter', () => {
    const Container = JSData.Container
    const store = new Container()
    assert.equal(typeof store.registerAdapter, 'function')
    assert.strictEqual(store.registerAdapter, Container.prototype.registerAdapter)

    store.defineMapper('user')

    store.registerAdapter('foo', {}, { default: true })
    store.registerAdapter('bar', {})
    assert.deepEqual(store.getAdapters(), {
      foo: {},
      bar: {}
    })
    const mapper = store.defineMapper('foo')
    assert.deepEqual(mapper.getAdapters(), {
      foo: {},
      bar: {}
    })
    assert.equal(store.mapperDefaults.defaultAdapter, 'foo')
  })
})
