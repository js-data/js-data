import {
  JSData
} from '../../../_setup'
import test from 'ava'

test('has the right default validators', (t) => {
  const typeGroupValidators = JSData.Schema.typeGroupValidators
  const EXPECTED_KEYS = [
    'array',
    'integer',
    'number',
    'numeric',
    'object',
    'string'
  ]
  t.same(
    Object.keys(typeGroupValidators),
    EXPECTED_KEYS,
    'has the expected keys'
  )
})
