export const propertiesTests = [
  {
    description: 'object properties validation',
    schema: {
      type: 'object',
      properties: {
        foo: { type: 'integer' },
        bar: { type: 'string' }
      }
    },
    tests: [
      {
        description: 'both properties present and valid is valid',
        data: { foo: 1, bar: 'baz' },
        valid: true
      },
      {
        description: 'one property invalid is invalid',
        data: { foo: 1, bar: {} },
        valid: false
      },
      {
        description: 'both properties invalid is invalid',
        data: { foo: [], bar: {} },
        valid: false
      },
      {
        description: 'does not invalidate other properties',
        data: { quux: [] },
        valid: true
      },
      {
        description: 'ignores non-objects',
        data: [],
        valid: true
      }
    ]
  },
  {
    description: 'properties, patternProperties, additionalProperties interaction',
    schema: {
      type: 'object',
      properties: {
        foo: { type: 'array', maxItems: 3 },
        bar: { type: 'array' }
      },
      patternProperties: { 'f.o': { minItems: 2 } },
      additionalProperties: { type: 'integer' }
    },
    tests: [
      {
        description: 'property validates property',
        data: { foo: [1, 2] },
        valid: true
      },
      {
        description: 'property invalidates property',
        data: { foo: [1, 2, 3, 4] },
        valid: false
      },
      // TODO Make Work?
      // {
      //   'description': 'patternProperty invalidates property',
      //   'data': { 'foo': [] },
      //   'valid': false
      // },
      {
        description: 'patternProperty validates nonproperty',
        data: { fxo: [1, 2] },
        valid: true
      },
      // TODO make work?
      // {
      //   'description': 'patternProperty invalidates nonproperty',
      //   'data': { 'fxo': [] },
      //   'valid': false
      // },
      {
        description: 'additionalProperty ignores property',
        data: { bar: [] },
        valid: true
      },
      {
        description: 'additionalProperty validates others',
        data: { quux: 3 },
        valid: true
      },
      {
        description: 'additionalProperty invalidates others',
        data: { quux: 'foo' },
        valid: false
      }
    ]
  }
]

export const additionalProperties = [
  {
    description:
    'when "additionalProperties" option is false',
    schema: {
      type: 'object',
      properties: { foo: {}, bar: {} },
      patternProperties: { '^v': {} },
      additionalProperties: false
    },
    tests: [
      {
        description: 'should pass validation if record has only specified fields',
        data: { foo: 1 },
        valid: true
      },
      {
        description: 'should not pass validation if record has non-specified fields in schema',
        data: { foo: 1, bar: 2, quux: 'boom' },
        valid: false
      },
      {
        description: 'should ignore validation if record is not an object',
        data: [1, 2, 3],
        valid: true
      },
      {
        description: 'should pass validation if record contains fields which are matched by "patternProperties"',
        data: { foo: 1, vroom: 2 },
        valid: true
      }
    ]
  },
  {
    description:
    'when "additionalProperties" allows to pass "boolean" types',
    schema: {
      type: 'object',
      properties: { foo: {}, bar: {} },
      additionalProperties: { type: 'boolean' }
    },
    tests: [
      {
        description: 'should pass validation if record does not contain additional fields',
        data: { foo: 1 },
        valid: true
      },
      {
        description: 'should pass validation if record contains boolean additional fields',
        data: { foo: 1, bar: 2, quux: true },
        valid: true
      },
      {
        description: 'should not pass validation if record contains non-bookean additional fields',
        data: { foo: 1, bar: 2, quux: 12 },
        valid: false
      }
    ]
  },
  {
    description:
    'when schema does not have "properties" option but has "additionalProperties" which allows to pass boolean',
    schema: {
      type: 'object',
      additionalProperties: { type: 'boolean' }
    },
    tests: [
      {
        description: 'should pass validation if record contains boolean fields',
        data: { foo: true },
        valid: true
      },
      {
        description: 'should not pass validation if record contains non-boolean fields',
        data: { foo: 1 },
        valid: false
      }
    ]
  },
  {
    description: 'by default',
    schema: {
      type: 'object',
      properties: { foo: {}, bar: {} }
    },
    tests: [
      {
        description: 'should pass validation if records contains additional fields',
        data: { foo: 1, bar: 2, quux: true },
        valid: true
      }
    ]
  }
]
