import { assert, JSData } from '../../_setup'

describe('Index', function () {
  it('should be a constructor function', function () {
    assert.equal(typeof JSData.Index, 'function', 'should be a function')
    const index = new JSData.Index()
    assert(index instanceof JSData.Index, 'query should be an instance')
  })
})
