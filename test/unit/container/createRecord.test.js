import { assert, JSData } from '../../_setup'

describe('Container#createRecord', function () {
  it('should be an instance method', function () {
    const Container = JSData.Container
    const store = new Container()
    assert.equal(typeof store.createRecord, 'function')
    assert.strictEqual(store.createRecord, Container.prototype.createRecord)
  })
  it('should work')
})
