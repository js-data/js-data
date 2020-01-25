import { assert, JSData } from '../../_setup'
import { productSchema } from '../schema/_productSchema'

describe('Record#validate', function () {
  it('should validate', function () {
    const ProductMapper = new JSData.Mapper({
      name: 'product',
      schema: productSchema
    })

    let product = ProductMapper.createRecord({
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
    }, {
      noValidate: true
    })

    let errors = product.validate()

    assert(product.isValid())
    assert(!errors)

    product = ProductMapper.createRecord({
      id: 3,
      // name is missing
      price: 'wrong type',
      dimensions: {
        length: 3.1,
        // width is missing
        height: 'should be a number'
      },
      warehouseLocation: {
        latitude: 54.4,
        longitude: -32.7
      }
    }, {
      noValidate: true
    })
    errors = product.validate()
    assert(!product.isValid())
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
