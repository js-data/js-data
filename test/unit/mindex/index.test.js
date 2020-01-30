import { assert, JSData } from '../../_setup'

describe('Index', () => {
  it('should be a constructor function', () => {
    assert.equal(typeof JSData.Index, 'function', 'should be a function')
    const index = new JSData.Index()
    assert(index instanceof JSData.Index, 'query should be an instance')
  })
})
