import { assert, JSData } from '../../_setup'

describe('Container#defineMapper', function () {
  it('should be an instance method', function () {
    const Container = JSData.Container
    const store = new Container()
    assert.equal(typeof store.defineMapper, 'function')
    assert.strictEqual(store.defineMapper, Container.prototype.defineMapper)
  })
  it('should create a new mapper', function () {
    const Container = JSData.Container
    let container = new Container()
    let mapper = container.defineMapper('foo')
    assert.strictEqual(mapper, container._mappers.foo)
    assert(mapper instanceof JSData.Mapper)
    assert.strictEqual(mapper.getAdapters(), container.getAdapters())

    class Foo extends JSData.Mapper {
      constructor (opts) {
        super(opts)
        if (!this.lifecycleMethods) {
          JSData.Mapper.call(this, opts)
        }
      }
    }
    container = new Container({
      mapperClass: Foo
    })
    mapper = container.defineMapper('foo')
    assert.strictEqual(mapper, container._mappers.foo)
    assert(mapper instanceof Foo)
    assert.strictEqual(mapper.getAdapters(), container.getAdapters())

    container = new Container({
      mapperDefaults: {
        foo: 'bar'
      }
    })
    mapper = container.defineMapper('foo')
    assert.strictEqual(mapper, container._mappers.foo)
    assert(mapper instanceof JSData.Mapper)
    assert.equal(mapper.foo, 'bar')
    assert.strictEqual(mapper.getAdapters(), container.getAdapters())

    container = new Container({
      mapperDefaults: {
        foo: 'bar'
      }
    })
    mapper = container.defineMapper('foo', {
      foo: 'beep'
    })
    assert.strictEqual(mapper, container._mappers.foo)
    assert(mapper instanceof JSData.Mapper)
    assert.equal(mapper.foo, 'beep')
    assert.strictEqual(mapper.getAdapters(), container.getAdapters())

    assert.throws(function () {
      mapper = container.defineMapper()
    }, Error, '[Container#defineMapper:name] expected: string, found: undefined\nhttp://www.js-data.io/v3.0/docs/errors#400')

    assert.throws(function () {
      mapper = container.defineMapper({
        foo: 'bar'
      })
    }, Error, '[Container#defineMapper:name] expected: string, found: undefined\nhttp://www.js-data.io/v3.0/docs/errors#400')

    mapper = container.defineMapper({
      foo: 'bar',
      name: 'foo'
    })
    assert.equal(mapper.name, 'foo')
  })
  it('can get a scoped reference', function () {
    const Container = JSData.Container
    const container = new Container()
    const fooMapper = container.defineMapper('foo')
    const fooStore = container.as('foo')

    assert.strictEqual(fooStore._adapters, container._adapters)
    assert.strictEqual(fooStore._listeners, container._listeners)
    assert.strictEqual(fooStore.getMapper(), container.getMapper('foo'))
    assert.deepEqual(fooStore.createRecord({ foo: 'bar' }), container.createRecord('foo', { foo: 'bar' }))
    assert.strictEqual(fooMapper, container.getMapper('foo'))
    assert.strictEqual(fooStore.getMapper(), container.getMapper('foo'))
  })
})
