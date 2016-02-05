export function init () {
  describe('destroyAll', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.destroyAll)
      Test.assert.isTrue(store.destroyAll === DataStore.prototype.destroyAll)
    })
    it('should work')
  })
}
