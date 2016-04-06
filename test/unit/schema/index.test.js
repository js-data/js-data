import { assert, JSData } from '../../_setup'
import { productSchema } from './_productSchema'

describe('Schema', function () {
  it('has the right exports', function () {
    assert.equal(typeof JSData.Schema, 'function')
    assert.equal(typeof JSData.Schema.validate, 'function')
    assert(JSData.Schema.types)
    assert(JSData.Schema.validationKeywords)
    assert(JSData.Schema.typeGroupValidators)
  })

  it('should validate', function () {
    const ProductSchema = new JSData.Schema(productSchema)

    let errors = ProductSchema.validate({
      id: 3,
      name: 'A blue mouse',
      price: 25.50,
      dimensions: {
        length: 3.1,
        width: 1.0,
        height: 1.0
      },
      warehouseLocation: {
        latitude: 54.4,
        longitude: -32.7
      }
    })

    assert(!errors)

    errors = ProductSchema.validate('foo')
    assert.deepEqual(
      errors,
      [{ expected: 'one of (object)', actual: 'string', path: '' }]
    )
    errors = ProductSchema.validate(45)
    assert.deepEqual(
      errors,
      [{ expected: 'one of (object)', actual: 'number', path: '' }]
    )
    errors = ProductSchema.validate(null)
    assert.deepEqual(
      errors,
      [{ expected: 'one of (object)', actual: 'null', path: '' }]
    )
    errors = ProductSchema.validate(true)
    assert.deepEqual(
      errors,
      [{ expected: 'one of (object)', actual: 'boolean', path: '' }]
    )
    errors = ProductSchema.validate(undefined)
    assert(!errors)
    errors = ProductSchema.validate({
      id: 3,
      // name is missing
      price: 'wrong top',
      dimensions: {
        length: 3.1,
        // width is missing
        height: 'should be a number'
      },
      warehouseLocation: {
        latitude: 54.4,
        longitude: -32.7
      }
    })
    assert.deepEqual(
      errors,
      [
        { expected: 'a value', actual: 'undefined', path: 'name' },
        { expected: 'one of (number)', actual: 'string', path: 'price' },
        { expected: 'a value', actual: 'undefined', path: 'dimensions.width' },
        { expected: 'one of (number)', actual: 'string', path: 'dimensions.height' }
      ]
    )
  })
})
