import { assert, JSData } from '../../_setup'

describe('Container#getAdapter', function () {
  it('should get an adapter', function () {
    const Container = JSData.Container
    const store = new Container()
    assert.equal(typeof store.getAdapter, 'function')
    assert.strictEqual(store.getAdapter, Container.prototype.getAdapter)

    const adapter = {}
    store.registerAdapter('foo', adapter)
    assert.equal(store.getAdapter('foo') === adapter, true)
    assert.throws(() => {
      store.getAdapter()
    }, Error, '[Container#getAdapter:name] expected: string, found: undefined\nhttp://www.js-data.io/v3.0/docs/errors#400')
  })
})
