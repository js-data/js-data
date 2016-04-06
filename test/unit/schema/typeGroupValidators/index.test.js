import { assert, JSData } from '../../../_setup'

describe('Schema.typeGroupValidators', function () {
  it('has the right default validators', function () {
    const typeGroupValidators = JSData.Schema.typeGroupValidators
    const EXPECTED_KEYS = [
      'array',
      'integer',
      'number',
      'numeric',
      'object',
      'string'
    ]
    assert.deepEqual(
      Object.keys(typeGroupValidators),
      EXPECTED_KEYS,
      'has the expected keys'
    )
  })
})
