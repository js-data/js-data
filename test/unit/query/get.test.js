export function init () {
  describe('get', function () {
    it('should work')

    it('should not allow index access after operation', function () {
      const Test = this
      const collection = Test.PostCollection

      Test.assert.throws(function () {
        collection.query().filter().get().run()
      }, Error)
    })
  })
}
