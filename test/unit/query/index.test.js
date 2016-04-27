import { assert, JSData } from '../../_setup'

describe('Query', function () {
  it('should be a constructor function', function () {
    assert.equal(typeof JSData.Query, 'function', 'should be a function')
    let query = new JSData.Query()
    assert(query instanceof JSData.Query, 'query should be an instance')
  })
  it('should be tested')
})
