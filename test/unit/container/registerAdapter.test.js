export function init () {
  describe('#registerAdapter', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.registerAdapter)
      Test.assert.isTrue(store.registerAdapter === DataStore.prototype.registerAdapter)
    })
    it('should register an adapter', function () {
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
      Test.assert.equal(container.mapperDefaults.defaultAdapter, 'foo')
    })
  })
}
