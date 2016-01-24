export function init () {
  describe('get', function () {
    it('should be an instance method', function () {
      const Test = this
      const Record = Test.JSData.Record
      const record = new Record()
      Test.assert.isFunction(record.get)
      Test.assert.isTrue(record.get === Record.prototype.get)
    })
    it('should return a property', function () {
      const Test = this
      const user = new Test.JSData.Record({ foo: 'bar' })
      Test.assert.equal(user.get('foo'), 'bar')
    })
    it('should return undefined if the property does not exist', function () {
      const Test = this
      const user = new Test.JSData.Record()
      Test.assert.isUndefined(user.get('foo'))
    })
    it('should return a nested property', function () {
      const Test = this
      const user = new Test.JSData.Record({ address: { state: 'TX' } })
      Test.assert.equal(user.get('address.state'), 'TX')
    })
  })
}
