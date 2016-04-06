import { assert, JSData } from '../../_setup'

describe('Record#changes', function () {
  it('should be an instance method', function () {
    const Record = JSData.Record
    const record = new Record()
    assert.equal(typeof record.get, 'function')
    assert.strictEqual(record.get, Record.prototype.get)
  })
  it('should return a property', function () {
    const user = new JSData.Record({ foo: 'bar' })
    assert.equal(user.get('foo'), 'bar')
  })
  it('should return undefined if the property does not exist', function () {
    const user = new JSData.Record()
    assert(!user.get('foo'))
  })
  it('should return a nested property', function () {
    const user = new JSData.Record({ address: { state: 'TX' } })
    assert.equal(user.get('address.state'), 'TX')
  })
})
