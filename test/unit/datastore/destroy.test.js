export function init () {
  describe('destroy', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.destroy)
      Test.assert.isTrue(store.destroy === DataStore.prototype.destroy)
    })
    it('should work')
  })
}
