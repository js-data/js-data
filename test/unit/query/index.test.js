import { assert, JSData } from '../../_setup'

describe('Query', function () {
  it('should be a constructor function', function () {
    assert.equal(typeof JSData.Query, 'function', 'should be a function')
    let query = new JSData.Query()
    assert(query instanceof JSData.Query, 'query should be an instance')
  })

  it('can make a subclass', function () {
    const FooQuery = JSData.Query.extend({
      foo () { return 'foo' }
    })
    class BarQuery extends JSData.Query {
      bar () { return 'bar' }
    }
    const fooQ = new FooQuery('test')
    const barQ = new BarQuery('test')
    assert.equal(fooQ.foo(), 'foo')
    assert.equal(fooQ.collection, 'test')
    assert.equal(barQ.bar(), 'bar')
    assert.equal(barQ.collection, 'test')
  })
})
