import { assert, JSData } from '../../_setup'

describe('Container#destroyAll', function () {
  it('should be an instance method', function () {
    const Container = JSData.Container
    const store = new Container()
    assert.equal(typeof store.destroyAll, 'function')
    assert.strictEqual(store.destroyAll, Container.prototype.destroyAll)
  })
  it('should work')
})
