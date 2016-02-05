export function init () {
  describe('updateMany', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.updateMany)
      Test.assert.isTrue(store.updateMany === DataStore.prototype.updateMany)
    })
    it('should work')
  })
}
