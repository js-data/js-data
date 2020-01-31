import { assert, JSData } from '../../_setup'

const utils = JSData.utils

describe('utils.err', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.err, 'function', 'has the err method')
  })

  it('returns a wrapped function that will generate an Error for a given domain and target', () => {
    const errorGenerator = utils.err('domain', 'target')
    const error400 = errorGenerator(400, 'expected type', 'actual type')
    assert(error400 instanceof Error)

    const error404 = utils.err(JSData)(404, 'not found')
    assert(error404 instanceof Error)
  })
})
