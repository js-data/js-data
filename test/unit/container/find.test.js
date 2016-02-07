export function init () {
  describe('#find', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.find)
      Test.assert.isTrue(store.find === DataStore.prototype.find)
    })
    it('should work')
  })
}
