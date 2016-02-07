export function init () {
  describe('#getCollection', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.getCollection)
      Test.assert.isTrue(store.getCollection === DataStore.prototype.getCollection)
    })
    it('should work')
  })
}
