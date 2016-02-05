export function init () {
  describe('update', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.update)
      Test.assert.isTrue(store.update === DataStore.prototype.update)
    })
    it('should work')
  })
}
