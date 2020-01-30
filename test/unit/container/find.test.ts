import { assert, JSData } from '../../_setup'

describe('Container#find', () => {
  it('should be an instance method', () => {
    const Container = JSData.Container
    const store = new Container()
    assert.equal(typeof store.find, 'function')
    assert.strictEqual(store.find, Container.prototype.find)
  })
  it('should work')
})
