import { assert, JSData } from '../../_setup'

describe('Container#update', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container
    const store = new Container()
    assert.equal(typeof store.update, 'function')
    assert.strictEqual(store.update, Container.prototype.update)
  })
  it('should work')
})
