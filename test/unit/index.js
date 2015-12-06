/* global JSData:true */
import * as collection from './collection'
import * as datastore from './datastore'
import * as decorators from './decorators'
import * as resource from './resource'
import * as utils from './utils'
import {assert} from 'chai'

assert.objectsEqual = function (a, b, msg) {
  assert.deepEqual(
    JSON.parse(JSON.stringify(a)),
    JSON.parse(JSON.stringify(b)),
    msg || 'Expected objects or arrays to be equal'
  )
}

assert.fail = function (msg) {
  assert.equal(`should not reach this!: ${msg}`, 'failure')
}

export function init () {
  describe('JSData', function () {
    it('has all the right exports', function () {
      assert.isFunction(JSData.action, 'has the action decorator')
      assert.isFunction(JSData.actions, 'has the actions decorator')
      assert.isFunction(JSData.belongsTo, 'has the belongsTo decorator')
      assert.isFunction(JSData.Collection, 'has the Collection class')
      assert.isFunction(JSData.configure, 'has the configure decorator')
      assert.isFunction(JSData.DS, 'has the DS class')
      assert.isFunction(JSData.hasMany, 'has the hasMany decorator')
      assert.isFunction(JSData.hasOne, 'has the hasOne decorator')
      assert.isFunction(JSData.initialize, 'has the initialize decorator')
      assert.isFunction(JSData.setSchema, 'has the schema decorator')
      assert.isFunction(JSData.Resource, 'has the Resource class')
      assert.isObject(JSData.version, 'has a version')
    })
    collection.init()
    datastore.init()
    decorators.init()
    resource.init()
    utils.init()
  })
}

export const TYPES_EXCEPT_STRING = [123, 123.123, null, undefined, {}, [], true, false, function () {}]
export const TYPES_EXCEPT_STRING_OR_ARRAY = [123, 123.123, null, undefined, {}, true, false, function () {}]
export const TYPES_EXCEPT_STRING_OR_NUMBER = [null, undefined, {}, [], true, false, function () {}]
export const TYPES_EXCEPT_STRING_OR_OBJECT = [123, 123.123, null, undefined, [], true, false, function () {}]
export const TYPES_EXCEPT_STRING_OR_NUMBER_OBJECT = [null, undefined, [], true, false, function () {}]
export const TYPES_EXCEPT_ARRAY = ['string', 123, 123.123, null, undefined, {}, true, false, function () {}]
export const TYPES_EXCEPT_STRING_OR_ARRAY_OR_NUMBER = [null, undefined, {}, true, false, function () {}]
export const TYPES_EXCEPT_NUMBER = ['string', null, undefined, {}, [], true, false, function () {}]
export const TYPES_EXCEPT_OBJECT = ['string', 123, 123.123, null, undefined, true, false, function () {}]
export const TYPES_EXCEPT_BOOLEAN = ['string', 123, 123.123, null, undefined, {}, [], function () {}]
export const TYPES_EXCEPT_FUNCTION = ['string', 123, 123.123, null, undefined, {}, [], true, false]
