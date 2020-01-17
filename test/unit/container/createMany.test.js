import { assert, JSData } from '../../_setup'

describe('Container#createMany', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container
    const store = new Container()
    assert.equal(typeof store.createMany, 'function')
    assert.strictEqual(store.createMany, Container.prototype.createMany)
  })
  it('should work')
})
