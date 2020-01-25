import { assert, JSData } from '../../_setup'
import { productSchema } from '../schema/_productSchema'

describe('Mapper#validate', function () {
  it('should validate a record', function () {
    const ProductMapper = new JSData.Mapper({
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

    assert(!errors)

    errors = ProductMapper.validate([{
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
    }])

    assert(!errors)

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
    assert.deepEqual(
      errors,
      [
        { expected: 'a value', actual: 'undefined', path: 'name' },
        { expected: 'one of (number)', actual: 'string', path: 'price' },
        { expected: 'a value', actual: 'undefined', path: 'dimensions.width' },
        { expected: 'one of (number)', actual: 'string', path: 'dimensions.height' }
      ]
    )

    errors = ProductMapper.validate([{
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
    }])
    assert.deepEqual(
      errors,
      [
        [
          { expected: 'a value', actual: 'undefined', path: 'name' },
          { expected: 'one of (number)', actual: 'string', path: 'price' },
          { expected: 'a value', actual: 'undefined', path: 'dimensions.width' },
          { expected: 'one of (number)', actual: 'string', path: 'dimensions.height' }
        ]
      ]
    )
  })
  it('should validate based on json-schema.org rules', function () {
    const User = new JSData.Mapper({
      name: 'user',
      schema: {
        properties: {
          age: {
            type: 'number'
          },
          title: {
            type: ['string', 'null']
          },
          level: {}
        }
      }
    })

    const user = User.createRecord({ id: 1, age: 30, title: 'boss', level: 1 })

    try {
      user.age = 'foo'
      assert.fail()
    } catch (err) {
      assert(err instanceof Error)
      assert.deepEqual(err.errors, [{ actual: 'string', expected: 'one of (number)', path: 'age' }], 'should require a number')
      assert.equal(err.message, 'validation failed')
    }
    try {
      user.age = {}
    } catch (err) {
      assert(err instanceof Error)
      assert.deepEqual(err.errors, [{ actual: 'object', expected: 'one of (number)', path: 'age' }], 'should require a number')
      assert.equal(err.message, 'validation failed')
    }
    assert.doesNotThrow(function () {
      user.age = undefined
    }, 'should accept undefined')
    try {
      user.title = 1234
    } catch (err) {
      assert(err instanceof Error)
      assert.deepEqual(err.errors, [{ actual: 'number', expected: 'one of (string, null)', path: 'title' }], 'should require a string or null')
      assert.equal(err.message, 'validation failed')
    }
    assert.doesNotThrow(function () {
      user.title = 'foo'
    }, 'should accept a string')
    assert.doesNotThrow(function () {
      user.title = null
    }, 'should accept null')
    assert.doesNotThrow(function () {
      user.title = undefined
    }, 'should accept undefined')

    try {
      const user = User.createRecord({ age: 'foo' })
      user.set('foo', 'bar')
    } catch (err) {
      assert(err instanceof Error)
      assert.deepEqual(err.errors, [{ actual: 'string', expected: 'one of (number)', path: 'age' }], 'should validate on create')
      assert.equal(err.message, 'validation failed')
    }

    assert.doesNotThrow(function () {
      const user = User.createRecord({ age: 'foo' }, { noValidate: true })
      user.set('foo', 'bar')
    }, 'should NOT validate on create')
  })
})
