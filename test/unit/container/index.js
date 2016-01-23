export function init () {
  describe('Container', function () {
    it('should be a constructor function', function () {
      const Test = this
      const Container = Test.JSData.Container
      Test.assert.isFunction(Container)
      const container = new Container()
      Test.assert.isTrue(container instanceof Container)
    })
    it('should initialize with defaults', function () {
      const Test = this
      const Container = Test.JSData.Container
      const container = new Container()
      Test.assert.deepEqual(container._adapters, {})
      Test.assert.deepEqual(container._mappers, {})
      Test.assert.deepEqual(container.mapperDefaults, {})
      Test.assert.isTrue(container.MapperClass === Test.JSData.Mapper)
    })
    it('should accept overrides', function () {
      const Test = this
      const Container = Test.JSData.Container
      class Foo {}
      const container = new Container({
        MapperClass: Foo,
        foo: 'bar',
        mapperDefaults: {
          idAttribute: '_id'
        }
      })
      Test.assert.deepEqual(container._adapters, {})
      Test.assert.deepEqual(container._mappers, {})
      Test.assert.equal(container.foo, 'bar')
      Test.assert.deepEqual(container.mapperDefaults, {
        idAttribute: '_id'
      })
      Test.assert.isTrue(container.MapperClass === Foo)
    })

    it('Container#defineMapper should be an instance method', function () {
      const Test = this
      const Container = Test.JSData.Container
      const container = new Container()
      Test.assert.isFunction(container.defineMapper)
      Test.assert.isTrue(container.defineMapper === Container.prototype.defineMapper)
    })
    it('should create a new mapper', function () {
      const Test = this
      const Container = Test.JSData.Container
      let container = new Container()
      let mapper = container.defineMapper('foo')
      Test.assert.isTrue(mapper === container._mappers.foo)
      Test.assert.isTrue(mapper instanceof Test.JSData.Mapper)
      Test.assert.isTrue(mapper.getAdapters() === container.getAdapters())

      class Foo extends Test.JSData.Mapper {}
      container = new Container({
        MapperClass: Foo
      })
      mapper = container.defineMapper('foo')
      Test.assert.isTrue(mapper === container._mappers.foo)
      Test.assert.isTrue(mapper instanceof Foo)
      Test.assert.isTrue(mapper.getAdapters() === container.getAdapters())

      container = new Container({
        mapperDefaults: {
          foo: 'bar'
        }
      })
      mapper = container.defineMapper('foo')
      Test.assert.isTrue(mapper === container._mappers.foo)
      Test.assert.isTrue(mapper instanceof Test.JSData.Mapper)
      Test.assert.equal(mapper.foo, 'bar')
      Test.assert.isTrue(mapper.getAdapters() === container.getAdapters())

      container = new Container({
        mapperDefaults: {
          foo: 'bar'
        }
      })
      mapper = container.defineMapper('foo', {
        foo: 'beep'
      })
      Test.assert.isTrue(mapper === container._mappers.foo)
      Test.assert.isTrue(mapper instanceof Test.JSData.Mapper)
      Test.assert.equal(mapper.foo, 'beep')
      Test.assert.isTrue(mapper.getAdapters() === container.getAdapters())

      Test.assert.throws(function () {
        mapper = container.defineMapper()
      }, Error, 'name is required!')

      Test.assert.throws(function () {
        mapper = container.defineMapper({
          foo: 'bar'
        })
      }, Error, 'name is required!')

      mapper = container.defineMapper({
        foo: 'bar',
        name: 'foo'
      })
      Test.assert.equal(mapper.name, 'foo')
    })

    it('Container#getMapper should be an instance method', function () {
      const Test = this
      const Container = Test.JSData.Container
      const container = new Container()
      Test.assert.isFunction(container.getMapper)
      Test.assert.isTrue(container.getMapper === Container.prototype.getMapper)
    })

    it('Container#getMapper should return the specified mapper', function () {
      const Test = this
      const Container = Test.JSData.Container
      const container = new Container()
      const foo = container.defineMapper('foo')
      Test.assert.isTrue(foo === container.getMapper('foo'))
      Test.assert.throws(function () {
        container.getMapper('bar')
      }, ReferenceError, 'bar is not a registered mapper!')
    })

    it('Container#getAdapters should return the adapters of the container', function () {
      const Test = this
      const Container = Test.JSData.Container
      const container = new Container()
      Test.assert.isTrue(container.getAdapters() === container._adapters)
    })

    it('Container#registerAdapter should be an instance method', function () {
      const Test = this
      const Container = Test.JSData.Container
      const container = new Container()
      Test.assert.isFunction(container.registerAdapter)
      Test.assert.isTrue(container.registerAdapter === Container.prototype.registerAdapter)
    })
    it('Container#registerAdapter should register an adapter', function () {
      const Test = this
      const Container = Test.JSData.Container
      const container = new Container()
      container.registerAdapter('foo', {}, { 'default': true })
      container.registerAdapter('bar', {})
      Test.assert.deepEqual(container.getAdapters(), {
        foo: {},
        bar: {}
      })
      const mapper = container.defineMapper('foo')
      Test.assert.deepEqual(mapper.getAdapters(), {
        foo: {},
        bar: {}
      })
      Test.assert.equal(container.defaultAdapter, 'foo')
    })
  })
}
