import { assert, JSData } from '../../_setup'

describe('Container#destroy', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container
    const store = new Container()
    assert.equal(typeof store.destroy, 'function')
    assert.strictEqual(store.destroy, Container.prototype.destroy)
  })
  it('should work')
})
