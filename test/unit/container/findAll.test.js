export function init () {
  describe('findAll', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.findAll)
      Test.assert.isTrue(store.findAll === DataStore.prototype.findAll)
    })
    it('should work')
  })
}
