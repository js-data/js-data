import { assert, JSData } from '../../_setup'

describe('Container#create', function () {
  it('should be an instance method', function () {
    const Container = JSData.Container
    const store = new Container()
    assert.equal(typeof store.create, 'function')
    assert.strictEqual(store.create, Container.prototype.create)
  })
  it('should work')
})
