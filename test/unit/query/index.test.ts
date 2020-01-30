import { assert, JSData } from '../../_setup'

describe('Query', () => {
  it('should be a constructor function', () => {
    assert.equal(typeof JSData.Query, 'function', 'should be a function')
    const query = new JSData.Query()
    assert(query instanceof JSData.Query, 'query should be an instance')
  })

  it('can make a subclass', () => {
    class FooQuery extends JSData.Query {
      foo () {
        return 'foo'
      }
    }

    // tslint:disable-next-line:max-classes-per-file
    class BarQuery extends JSData.Query {
      _bar: string;

      constructor (collection) {
        super(collection)
        this._bar = 'bar'
      }

      bar () {
        return this._bar
      }
    }

    const fooQ = new FooQuery('test')
    const barQ = new BarQuery('test')
    assert.equal(fooQ.foo(), 'foo')
    assert.equal(fooQ.collection, 'test')
    assert.equal(barQ.bar(), 'bar')
    assert.equal(barQ.collection, 'test')
  })
})
