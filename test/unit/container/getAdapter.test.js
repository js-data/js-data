export function init () {
  describe('getAdapter', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.getAdapter)
      Test.assert.isTrue(store.getAdapter === DataStore.prototype.getAdapter)
    })
    it('should work')
  })
}
