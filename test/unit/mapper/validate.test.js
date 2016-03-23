import {productSchema} from '../schema/productSchema'

export function init () {
  describe('validate', function () {
    it('should validate a record', function () {
      const Test = this
      const ProductMapper = new Test.JSData.Mapper({
        name: 'product',
        schema: productSchema
      })

      let errors = ProductMapper.validate({
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

      Test.assert.throws(function () {
        errors = ProductMapper.validate('foo')
      }, Error, 'not a record!')
      errors = ProductMapper.validate({
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
  })
}
