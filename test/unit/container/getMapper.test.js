import { assert, JSData } from '../../_setup'

describe('Container#getMapper', function () {
  it('should be an instance method', function () {
    const Container = JSData.Container
    const store = new Container()
    assert.equal(typeof store.getMapper, 'function')
    assert.strictEqual(store.getMapper, Container.prototype.getMapper)
  })
  it('should return the specified mapper', function () {
    const Container = JSData.Container
    const container = new Container()
    const foo = container.defineMapper('foo')
    assert.strictEqual(foo, container.getMapper('foo'))
    assert.throws(function () {
      container.getMapper('bar')
    }, Error, '[Container#getMapper:bar] mapper not found\nhttp://www.js-data.io/v3.0/docs/errors#404')
  })
})
