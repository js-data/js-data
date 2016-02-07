export function init () {
  describe('#getAdapters', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.getAdapters)
      Test.assert.isTrue(store.getAdapters === DataStore.prototype.getAdapters)
    })
    it('should return the adapters of the container', function () {
      const Test = this
      const Container = Test.JSData.Container
      const container = new Container()
      Test.assert.isTrue(container.getAdapters() === container._adapters)
    })
  })
}
