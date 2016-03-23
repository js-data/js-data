export function init () {
  describe('defineMapper', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.defineMapper)
      Test.assert.isTrue(store.defineMapper === DataStore.prototype.defineMapper)
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
        mapperClass: Foo
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
  })
}
