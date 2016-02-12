export function init () {
  describe('getMapper', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.getMapper)
      Test.assert.isTrue(store.getMapper === DataStore.prototype.getMapper)
    })
    it('should return the specified mapper', function () {
      const Test = this
      const Container = Test.JSData.Container
      const container = new Container()
      const foo = container.defineMapper('foo')
      Test.assert.isTrue(foo === container.getMapper('foo'))
      Test.assert.throws(function () {
        container.getMapper('bar')
      }, ReferenceError, 'bar is not a registered mapper!')
    })
  })
}
