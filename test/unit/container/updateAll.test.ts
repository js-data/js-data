import { assert, JSData } from '../../_setup'

describe('Container#find', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container
    const store = new Container()
    assert.equal(typeof store.updateAll, 'function')
    assert.strictEqual(store.updateAll, Container.prototype.updateAll)
  })
  it('should work')
})
