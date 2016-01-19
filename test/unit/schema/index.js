import * as typeGroupValidators from './typeGroupValidators/index'
import {productSchema} from './productSchema'

export function init () {
  describe('Schema', function () {
    it('has the right exports', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Schema)
      Test.assert.isFunction(Test.JSData.validate)
      Test.assert.isObject(Test.JSData.validationKeywords)
      Test.assert.isObject(Test.JSData.typeGroupValidators)
    })

    it('should validate', function () {
      const Test = this
      const ProductSchema = new Test.JSData.Schema(productSchema)

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

      Test.assert.isUndefined(errors)

      errors = ProductSchema.validate('foo')
      Test.assert.deepEqual(
        errors,
        [{ expected: 'one of (object)', actual: 'string', path: '' }]
      )
      errors = ProductSchema.validate(45)
      Test.assert.deepEqual(
        errors,
        [{ expected: 'one of (object)', actual: 'number', path: '' }]
      )
      errors = ProductSchema.validate(null)
      Test.assert.deepEqual(
        errors,
        [{ expected: 'one of (object)', actual: 'null', path: '' }]
      )
      errors = ProductSchema.validate(true)
      Test.assert.deepEqual(
        errors,
        [{ expected: 'one of (object)', actual: 'boolean', path: '' }]
      )
      errors = ProductSchema.validate(undefined)
      Test.assert.isUndefined(errors)
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
      Test.assert.deepEqual(
        errors,
        [
          { expected: 'a value', actual: 'undefined', path: 'name' },
          { expected: 'one of (number)', actual: 'string', path: 'price' },
          { expected: 'a value', actual: 'undefined', path: 'dimensions.width' },
          { expected: 'one of (number)', actual: 'string', path: 'dimensions.height' }
        ]
      )
    })

    typeGroupValidators.init()
  })
}
