export const productSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  title: 'Product',
  description: "A product from Acme's catalog",
  type: 'object',
  properties: {
    id: {
      description: 'The unique identifier for a product',
      type: 'number'
    },
    name: { type: 'string' },
    price: {
      type: 'number',
      minimum: 0,
      exclusiveMinimum: true
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      uniqueItems: true
    },
    dimensions: {
      type: 'object',
      properties: {
        length: { type: 'number' },
        width: { type: 'number' },
        height: { type: 'number' }
      },
      required: ['length', 'width', 'height']
    },
    warehouseLocation: {
      description: 'Coordinates of the warehouse with the product',
      type: 'object',
      properties: {
        latitude: { type: 'number' },
        longitude: { type: 'number' }
      }
    }
  },
  required: ['id', 'name', 'price']
}
