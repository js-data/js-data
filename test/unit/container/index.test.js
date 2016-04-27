import { assert, JSData, sinon } from '../../_setup'

describe('Container', function () {
  it('should be a constructor function', function () {
    const Container = JSData.Container
    assert.equal(typeof Container, 'function')
    const container = new Container()
    assert(container instanceof Container)
    assert.deepEqual(container._adapters, {})
    assert.deepEqual(container._mappers, {})
    assert.deepEqual(container.mapperDefaults, {})
    assert.strictEqual(container.mapperClass, JSData.Mapper)
  })
  it('should accept overrides', function () {
    const Container = JSData.Container
    class Foo {}
    const container = new Container({
      mapperClass: Foo,
      foo: 'bar',
      mapperDefaults: {
        idAttribute: '_id'
      }
    })
    assert.deepEqual(container._adapters, {})
    assert.deepEqual(container._mappers, {})
    assert.equal(container.foo, 'bar')
    assert.deepEqual(container.mapperDefaults, {
      idAttribute: '_id'
    })
    assert.strictEqual(container.mapperClass, Foo)
  })
  it('should have events', function () {
    const store = new JSData.Container()
    const listener = sinon.stub()
    store.on('bar', listener)
    store.emit('bar')
    assert(listener.calledOnce)
  })
  it('should proxy Mapper events', function () {
    const store = new JSData.Container()
    store.defineMapper('user')
    const listener = sinon.stub()
    store.on('bar', listener)
    store.getMapper('user').emit('bar', 'foo')
    assert(listener.calledOnce)
    assert.deepEqual(listener.firstCall.args, ['user', 'foo'])
  })
  it('should proxy all Mapper events', function () {
    const store = new JSData.Container()
    store.defineMapper('user')
    const listener = sinon.stub()
    store.on('all', listener)
    store.getMapper('user').emit('bar', 'foo')
    assert(listener.calledOnce)
    assert.deepEqual(listener.firstCall.args, ['bar', 'user', 'foo'])
  })
  it('should proxy Mapper methods', function () {
    const store = new JSData.Container()
    store.defineMapper('user')
    assert.doesNotThrow(() => {
      assert.deepEqual(store.toJSON('user', { id: 1 }), { id: 1 })
    })
  })
})
