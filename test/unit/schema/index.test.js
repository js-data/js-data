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

  it('should recursively instantiate schemas', function () {
    const schemaDef = JSData.utils.plainCopy(productSchema)
    schemaDef.properties.things = {
      type: 'array',
      items: {
        type: 'number'
      }
    }
    schemaDef.properties.anyFoo = {
      anyOf: [
        { type: 'number' },
        { type: 'string' }
      ]
    }
    schemaDef.properties.allFoo = {
      allOf: [
        { type: 'number' },
        { enum: [1, 2, 3] }
      ]
    }
    schemaDef.properties.oneFoo = {
      oneOf: [
        { type: 'string' },
        { enum: [1, 2, 3] }
      ]
    }
    const ProductSchema = new JSData.Schema(schemaDef)
    assert(ProductSchema instanceof JSData.Schema)
    assert(ProductSchema.properties.id instanceof JSData.Schema)
    assert(ProductSchema.properties.name instanceof JSData.Schema)
    assert(ProductSchema.properties.price instanceof JSData.Schema)
    assert(ProductSchema.properties.tags instanceof JSData.Schema)
    assert(ProductSchema.properties.dimensions instanceof JSData.Schema)
    assert(ProductSchema.properties.warehouseLocation instanceof JSData.Schema)
    assert(ProductSchema.properties.things instanceof JSData.Schema)
    assert(ProductSchema.properties.things.items instanceof JSData.Schema)
    assert(ProductSchema.properties.anyFoo.anyOf[0] instanceof JSData.Schema)
    assert(ProductSchema.properties.anyFoo.anyOf[1] instanceof JSData.Schema)
    assert(ProductSchema.properties.allFoo.allOf[0] instanceof JSData.Schema)
    assert(ProductSchema.properties.allFoo.allOf[1] instanceof JSData.Schema)
    assert(ProductSchema.properties.oneFoo.oneOf[0] instanceof JSData.Schema)
    assert(ProductSchema.properties.oneFoo.oneOf[1] instanceof JSData.Schema)
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
    // return
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
