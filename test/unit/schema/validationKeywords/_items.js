export const itemsTests = [
  {
    description: 'a schema given for items',
    schema: {
      items: { type: 'integer' }
    },
    tests: [
      {
        description: 'valid items',
        data: [1, 2, 3],
        valid: true
      },
      {
        description: 'wrong type of items',
        data: [1, 'x'],
        valid: false
      },
      {
        description: 'ignores non-arrays',
        data: { foo: 'bar' },
        valid: true
      }
    ]
  },
  {
    description: 'an array of schemas for items',
    schema: {
      items: [
        { type: 'integer' },
        { type: 'string' }
      ]
    },
    tests: [
      {
        description: 'correct types',
        data: [1, 'foo'],
        valid: true
      },
      {
        description: 'wrong types',
        data: ['foo', 1],
        valid: false
      }
    ]
  }
]

export const additionalItemsTests = [
  {
    description: 'additionalItems as schema',
    schema: {
      items: [{}],
      additionalItems: { type: 'integer' }
    },
    tests: [
      {
        description: 'additional items match schema',
        data: [null, 2, 3, 4],
        valid: true
      },
      {
        description: 'additional items do not match schema',
        data: [null, 2, 3, 'foo'],
        valid: false
      }
    ]
  },
  {
    description: 'items is schema, no additionalItems',
    schema: {
      items: {},
      additionalItems: false
    },
    tests: [
      {
        description: 'all items match schema',
        data: [1, 2, 3, 4, 5],
        valid: true
      }
    ]
  },
  {
    description: 'array of items with no additionalItems',
    schema: {
      items: [{}, {}, {}],
      additionalItems: false
    },
    tests: [
      {
        description: 'no additional items present',
        data: [1, 2, 3],
        valid: true
      },
      {
        description: 'additional items are not permitted',
        data: [1, 2, 3, 4],
        valid: false
      }
    ]
  },
  {
    description: 'additionalItems as false without items',
    schema: { additionalItems: false },
    tests: [
      {
        description:
        'items defaults to empty schema so everything is valid',
        data: [1, 2, 3, 4, 5],
        valid: true
      },
      {
        description: 'ignores non-arrays',
        data: { foo: 'bar' },
        valid: true
      }
    ]
  },
  {
    description: 'additionalItems are allowed by default',
    schema: { items: [{ type: 'integer' }] },
    tests: [
      {
        description: 'only the first item is validated',
        data: [1, 'foo', false],
        valid: true
      }
    ]
  }
]
