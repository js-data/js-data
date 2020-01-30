import { assert, JSData } from '../../_setup'

describe('Container#destroyAll', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container
    const store = new Container()
    assert.equal(typeof store.destroyAll, 'function')
    assert.strictEqual(store.destroyAll, Container.prototype.destroyAll)
  })
  it('should work')
})
