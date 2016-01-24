export function init () {
  describe('save', function () {
    it('should be an instance method', function () {
      const Test = this
      const Record = Test.JSData.Record
      const record = new Record()
      Test.assert.isFunction(record.save)
      Test.assert.isTrue(record.save === Record.prototype.save)
    })
    it('should be tested')
  })
}
