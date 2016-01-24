export function init () {
  describe('create', function () {
    it('should be an instance method', function () {
      const Test = this
      const Record = Test.JSData.Record
      const record = new Record()
      Test.assert.isFunction(record.create)
      Test.assert.isTrue(record.create === Record.prototype.create)
    })
    it('should be tested')
  })
}
