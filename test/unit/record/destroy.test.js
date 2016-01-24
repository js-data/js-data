export function init () {
  describe('destroy', function () {
    it('should be an instance method', function () {
      const Test = this
      const Record = Test.JSData.Record
      const record = new Record()
      Test.assert.isFunction(record.destroy)
      Test.assert.isTrue(record.destroy === Record.prototype.destroy)
    })
    it('should be tested')
  })
}
