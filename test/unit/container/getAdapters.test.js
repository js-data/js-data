import { assert, JSData } from '../../_setup'

describe('Container#getAdapters', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container
    const store = new Container()
    assert.equal(typeof store.getAdapters, 'function')
    assert.strictEqual(store.getAdapters, Container.prototype.getAdapters)
  })
  it('should return the adapters of the container', () => {
    const Container = JSData.Container
    const container = new Container()
    assert.strictEqual(container.getAdapters(), container._adapters)
  })
})
