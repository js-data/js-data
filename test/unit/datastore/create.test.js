export function init () {
  describe('#create', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.create)
      Test.assert.isTrue(store.create === DataStore.prototype.create)
    })
    it('should work')
  })
}
