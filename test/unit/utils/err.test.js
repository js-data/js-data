import { assert, JSData } from '../../_setup'
const utils = JSData.utils

describe('utils.err', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.err, 'function', 'has the err method')
  })

  it('returns a wrapped function that will generate an Error for a given domain and target', function () {
    const errorGenerator = utils.err('domain', 'target')
    const error400 = errorGenerator(400, 'expected type', 'actual type')
    assert(error400 instanceof Error)

    const error404 = utils.err(JSData)(404, 'not found')
    assert(error404 instanceof Error)
  })
})
