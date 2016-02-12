export function init () {
  describe('getAdapterName', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.getAdapterName)
      Test.assert.isTrue(store.getAdapterName === DataStore.prototype.getAdapterName)
    })
    it('should work')
  })
}
