export const propertiesTests = [
  {
    'description': 'object properties validation',
    'schema': {
      'properties': {
        'foo': { 'type': 'integer' },
        'bar': { 'type': 'string' }
      }
    },
    'tests': [
      {
        'description': 'both properties present and valid is valid',
        'data': { 'foo': 1, 'bar': 'baz' },
        'valid': true
      },
      {
        'description': 'one property invalid is invalid',
        'data': { 'foo': 1, 'bar': {} },
        'valid': false
      },
      {
        'description': 'both properties invalid is invalid',
        'data': { 'foo': [], 'bar': {} },
        'valid': false
      },
      {
        'description': 'does not invalidate other properties',
        'data': { 'quux': [] },
        'valid': true
      },
      {
        'description': 'ignores non-objects',
        'data': [],
        'valid': true
      }
    ]
  },
  {
    'description': 'properties, patternProperties, additionalProperties interaction',
    'schema': {
      'properties': {
        'foo': { 'type': 'array', 'maxItems': 3 },
        'bar': { 'type': 'array' }
      },
      'patternProperties': { 'f.o': { 'minItems': 2 } },
      'additionalProperties': { 'type': 'integer' }
    },
    'tests': [
      {
        'description': 'property validates property',
        'data': { 'foo': [1, 2] },
        'valid': true
      },
      {
        'description': 'property invalidates property',
        'data': { 'foo': [1, 2, 3, 4] },
        'valid': false
      },
      // TODO Make Work?
      // {
      //   'description': 'patternProperty invalidates property',
      //   'data': { 'foo': [] },
      //   'valid': false
      // },
      {
        'description': 'patternProperty validates nonproperty',
        'data': { 'fxo': [1, 2] },
        'valid': true
      },
      // TODO make work?
      // {
      //   'description': 'patternProperty invalidates nonproperty',
      //   'data': { 'fxo': [] },
      //   'valid': false
      // },
      {
        'description': 'additionalProperty ignores property',
        'data': { 'bar': [] },
        'valid': true
      },
      {
        'description': 'additionalProperty validates others',
        'data': { 'quux': 3 },
        'valid': true
      },
      {
        'description': 'additionalProperty invalidates others',
        'data': { 'quux': 'foo' },
        'valid': false
      }
    ]
  }
]

export const additionalProperties = [
  {
    'description':
    'additionalProperties being false does not allow other properties',
    'schema': {
      'properties': { 'foo': {}, 'bar': {} },
      'patternProperties': { '^v': {} },
      'additionalProperties': false
    },
    'tests': [
      {
        'description': 'no additional properties is valid',
        'data': { 'foo': 1 },
        'valid': true
      },
      {
        'description': 'an additional property is invalid',
        'data': { 'foo': 1, 'bar': 2, 'quux': 'boom' },
        'valid': false
      },
      {
        'description': 'ignores non-objects',
        'data': [1, 2, 3],
        'valid': true
      },
      {
        'description': 'patternProperties are not additional properties',
        'data': { 'foo': 1, 'vroom': 2 },
        'valid': true
      }
    ]
  },
  {
    'description':
    'additionalProperties allows a schema which should validate',
    'schema': {
      'properties': { 'foo': {}, 'bar': {} },
      'additionalProperties': { 'type': 'boolean' }
    },
    'tests': [
      {
        'description': 'no additional properties is valid',
        'data': { 'foo': 1 },
        'valid': true
      },
      {
        'description': 'an additional valid property is valid',
        'data': { 'foo': 1, 'bar': 2, 'quux': true },
        'valid': true
      },
      {
        'description': 'an additional invalid property is invalid',
        'data': { 'foo': 1, 'bar': 2, 'quux': 12 },
        'valid': false
      }
    ]
  },
  {
    'description':
    'additionalProperties can exist by itself',
    'schema': {
      'additionalProperties': { 'type': 'boolean' }
    },
    'tests': [
      {
        'description': 'an additional valid property is valid',
        'data': { 'foo': true },
        'valid': true
      },
      {
        'description': 'an additional invalid property is invalid',
        'data': { 'foo': 1 },
        'valid': false
      }
    ]
  },
  {
    'description': 'additionalProperties are allowed by default',
    'schema': { 'properties': { 'foo': {}, 'bar': {} } },
    'tests': [
      {
        'description': 'additional properties are allowed',
        'data': { 'foo': 1, 'bar': 2, 'quux': true },
        'valid': true
      }
    ]
  }
]
