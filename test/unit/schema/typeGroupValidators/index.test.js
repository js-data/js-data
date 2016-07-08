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

  it('allows custom validation keywords', function () {
    const STRING_OPS = JSData.Schema.STRING_OPS
    const validationKeywords = JSData.Schema.validationKeywords
    STRING_OPS.push('foo')
    validationKeywords.foo = function (value, schema, opts) {
      if (value !== 'bar') {
        return [
          {
            actual: value,
            expected: 'bar',
            path: opts.path[0]
          }
        ]
      }
    }
    const schema = new JSData.Schema({
      type: 'object',
      properties: {
        thing: { foo: true, type: 'string', required: true },
        name: { type: 'string' }
      }
    })
    let errors = schema.validate({
      name: 1234
    })

    assert.deepEqual(
      errors,
      [
        {
          expected: 'a value',
          actual: 'undefined',
          path: 'thing'
        },
        {
          expected: 'one of (string)',
          actual: 'number',
          path: 'name'
        }
      ]
    )

    errors = schema.validate({
      name: 'john',
      thing: 'baz'
    })
    assert.deepEqual(
      errors,
      [
        {
          expected: 'bar',
          actual: 'baz',
          path: 'thing'
        }
      ]
    )

    errors = schema.validate({
      name: 'john',
      thing: 'bar'
    })
    assert.equal(errors, undefined)

    delete validationKeywords.foo
    STRING_OPS.pop()
  })
})
