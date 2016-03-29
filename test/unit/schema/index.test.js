import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

import productSchema from './_productSchema'

test.beforeEach(beforeEach)

test('has the right exports', (t) => {
  t.is(typeof JSData.Schema, 'function')
  t.is(typeof JSData.Schema.validate, 'function')
  t.ok(JSData.Schema.types)
  t.ok(JSData.Schema.validationKeywords)
  t.ok(JSData.Schema.typeGroupValidators)
})

test('should validate', (t) => {
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

  t.notOk(errors)

  errors = ProductSchema.validate('foo')
  t.same(
    errors,
    [{ expected: 'one of (object)', actual: 'string', path: '' }]
  )
  errors = ProductSchema.validate(45)
  t.same(
    errors,
    [{ expected: 'one of (object)', actual: 'number', path: '' }]
  )
  errors = ProductSchema.validate(null)
  t.same(
    errors,
    [{ expected: 'one of (object)', actual: 'null', path: '' }]
  )
  errors = ProductSchema.validate(true)
  t.same(
    errors,
    [{ expected: 'one of (object)', actual: 'boolean', path: '' }]
  )
  errors = ProductSchema.validate(undefined)
  t.notOk(errors)
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
