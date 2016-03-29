import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'
import productSchema from '../schema/_productSchema'

test.beforeEach(beforeEach)

test('should validate', (t) => {
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

  t.notOk(errors)

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
  errors = ProductMapper.validate(product)
  t.same(
    errors,
    [
      { expected: 'a value', actual: 'undefined', path: 'name' },
      { expected: 'one of (number)', actual: 'string', path: 'price' },
      { expected: 'a value', actual: 'undefined', path: 'dimensions.width' },
      { expected: 'one of (number)', actual: 'string', path: 'dimensions.height' }
    ]
  )
})
