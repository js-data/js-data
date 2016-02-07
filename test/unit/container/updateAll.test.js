export function init () {
  describe('#updateAll', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.updateAll)
      Test.assert.isTrue(store.updateAll === DataStore.prototype.updateAll)
    })
    it('should work')
  })
}
