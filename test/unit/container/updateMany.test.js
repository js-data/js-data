import { assert, JSData } from '../../_setup'

describe('Container#find', function () {
  it('should be an instance method', function () {
    const Container = JSData.Container
    const store = new Container()
    assert.equal(typeof store.updateMany, 'function')
    assert.strictEqual(store.updateMany, Container.prototype.updateMany)
  })
  it('should work')
})
