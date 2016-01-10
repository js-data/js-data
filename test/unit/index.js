import * as collection from './collection/index'
import * as datastore from './datastore/index'
import * as decorators from './decorators/index'
import * as model from './model/index'
import * as utils from './utils/index'

export function init () {
  describe('JSData', function () {
    it('has all the right exports', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.belongsTo, 'has the belongsTo decorator')
      Test.assert.isFunction(Test.JSData.Collection, 'has the Collection class')
      Test.assert.isFunction(Test.JSData.configure, 'has the configure decorator')
      Test.assert.isFunction(Test.JSData.DS, 'has the DS class')
      Test.assert.isFunction(Test.JSData.hasMany, 'has the hasMany decorator')
      Test.assert.isFunction(Test.JSData.hasOne, 'has the hasOne decorator')
      Test.assert.isFunction(Test.JSData.setSchema, 'has the schema decorator')
      Test.assert.isFunction(Test.JSData.Model, 'has the Model class')
      Test.assert.isObject(Test.JSData.version, 'has a version')
    })

    collection.init()
    datastore.init()
    decorators.init()
    model.init()
    utils.init()
  })
}

