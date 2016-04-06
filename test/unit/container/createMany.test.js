import { assert, JSData } from '../../_setup'

describe('Container#createMany', function () {
  it('should be an instance method', function () {
    const Container = JSData.Container
    const store = new Container()
    assert.equal(typeof store.createMany, 'function')
    assert.strictEqual(store.createMany, Container.prototype.createMany)
  })
  it('should work')
})
