import { assert, JSData } from '../../_setup'
import { productSchema } from './_productSchema'

describe('Schema.pick', function () {
  it('has the right exports', function () {
    assert.isFunction(JSData.Schema.prototype.pick)
  })

  it('Copies a value based on the properties defined in the schema', function () {
    const schema = new JSData.Schema(productSchema)

    const data = {
      id: 1,
      foo: 'bar',
      dimensions: {
        length: 1234,
        beep: 'boop'
      }
    }

    const copy = schema.pick(data)

    assert.deepEqual(copy, {
      id: 1,
      dimensions: {
        height: undefined,
        length: 1234,
        width: undefined
      },
      name: undefined,
      price: undefined,
      tags: undefined,
      warehouseLocation: undefined
    })
  })

  it('Copies a value based on the items defined in the schema allowing extra properties', function () {
    const schema = new JSData.Schema({
      type: 'object',
      properties: {
        id: {
          type: 'number'
        },
        tags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string'
              },
              id: {
                type: 'number'
              }
            },
            additionalProperties: true
          }
        }
      },
      additionalProperties: true
    })

    const data = {
      id: 1,
      foo: 'bar',
      tags: [
        {
          name: 'foo',
          beep: 'boop'
        }
      ]
    }

    const copy = schema.pick(data)

    assert.deepEqual(copy, {
      id: 1,
      foo: 'bar',
      tags: [
        {
          name: 'foo',
          id: undefined,
          beep: 'boop'
        }
      ]
    })
  })

  it('Copies a value based on the items defined in the schema disallowing extra properties', function () {
    const schema = new JSData.Schema({
      type: 'object',
      properties: {
        id: {
          type: 'number'
        },
        tags: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string'
              },
              id: {
                type: 'number'
              }
            }
          }
        }
      }
    })

    const data = {
      id: 1,
      foo: 'bar',
      tags: [
        {
          name: 'foo',
          beep: 'boop'
        }
      ]
    }

    const copy = schema.pick(data, { strict: true })

    assert.deepEqual(copy, {
      id: 1,
      // foo was stripped
      tags: [
        {
          name: 'foo',
          id: undefined
          // beep was stripped
        }
      ]
    })
  })

  it('Copies a value based on the parent schema', function () {
    const schema = new JSData.Schema({
      type: 'object',
      extends: productSchema,
      properties: {
        id: {
          type: 'number'
        },
        roles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string'
              },
              id: {
                type: 'number'
              }
            }
          }
        }
      }
    })

    const data = {
      id: 1,
      foo: 'bar',
      roles: [
        {
          name: 'foo',
          beep: 'boop'
        }
      ],
      dimensions: {}
    }

    const copy = schema.pick(data)

    assert.deepEqual(copy, {
      id: 1,
      dimensions: {
        height: undefined,
        length: undefined,
        width: undefined
      },
      price: undefined,
      name: undefined,
      tags: undefined,
      roles: [
        {
          name: 'foo',
          id: undefined
        }
      ],
      warehouseLocation: undefined
    })
  })

  it('should ignore undefined properties', function () {
    const store = new JSData.DataStore()

    const countrySchema = new JSData.Schema({
      type: 'object',
      properties: {
        code: {
          type: 'string',
          indexed: true
        }
      }
    })

    store.defineMapper('country', {
      schema: countrySchema
    })

    store.add('country', [
      {
        code: 'foo'
      },
      {
        code: 'bar'
      }
    ])

    const addressSchema = new JSData.Schema({
      type: 'object',
      properties: {
        uid: { type: 'string' },
        tag: { type: ['string', 'null'] },
        country: {
          type: 'object',
          extends: countrySchema,
          get () {
            return store.getAll('country', this.tag, { index: 'code' })[0]
          }
        }
      }
    })

    store.defineMapper('address', {
      schema: addressSchema
    })

    const address = store.createRecord('address', { uid: '123', tag: 'foo' })
    const address2 = store.createRecord('address', { uid: '789', tag: 'beep' })

    assert.deepEqual(address.toJSON(), {
      uid: '123',
      tag: 'foo',
      country: {
        code: 'foo'
      }
    })

    assert.deepEqual(address2.toJSON(), {
      uid: '789',
      tag: 'beep',
      country: undefined
    })
  })
})
