import * as array from './array.test'
import * as string from './string.test'

export function init () {
  describe('typeGroupValidators', function () {
    it('has the right default validators', function () {
      const Test = this
      const typeGroupValidators = Test.JSData.Schema.typeGroupValidators
      const EXPECTED_KEYS = [
        'array',
        'integer',
        'number',
        'numeric',
        'object',
        'string'
      ]
      Test.assert.deepEqual(
        Object.keys(typeGroupValidators),
        EXPECTED_KEYS,
        'has the expected keys'
      )
    })

    array.init()
    string.init()
  })
}
