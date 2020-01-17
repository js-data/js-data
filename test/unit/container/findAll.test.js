import { assert, JSData } from '../../_setup'

describe('Container#findAll', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container
    const store = new Container()
    assert.equal(typeof store.findAll, 'function')
    assert.strictEqual(store.findAll, Container.prototype.findAll)
  })
  it('should work')
})
