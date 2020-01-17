import { assert, JSData } from '../../_setup'

describe('Record#changes', () => {
  it('should be an instance method', () => {
    const Record = JSData.Record
    const record = new Record()
    assert.equal(typeof record.get, 'function')
    assert.strictEqual(record.get, Record.prototype.get)
  })
  it('should return a property', () => {
    const user = new JSData.Record({ foo: 'bar' })
    assert.equal(user.get('foo'), 'bar')
  })
  it('should return undefined if the property does not exist', () => {
    const user = new JSData.Record()
    assert(!user.get('foo'))
  })
  it('should return a nested property', () => {
    const user = new JSData.Record({ address: { state: 'TX' } })
    assert.equal(user.get('address.state'), 'TX')
  })
})
