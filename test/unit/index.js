import * as collection from './collection/index'
import * as container from './container/index'
import * as datastore from './datastore/index'
// import * as decorators from './decorators/index'
import * as linkedCollection from './linkedCollection/index'
import * as mapper from './mapper/index'
import * as record from './record/index'
import * as schema from './schema/index'
import * as utils from './utils/index'

export function init () {
  describe('JSData', function () {
    it('has all the right exports', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.belongsTo, 'has the belongsTo decorator')
      Test.assert.isFunction(Test.JSData.Collection, 'has the Collection class')
      Test.assert.isFunction(Test.JSData.Container, 'has the Container class')
      Test.assert.isFunction(Test.JSData.DataStore, 'has the DataStore class')
      Test.assert.isFunction(Test.JSData.DS, 'has the DS class')
      Test.assert.isFunction(Test.JSData.hasMany, 'has the hasMany decorator')
      Test.assert.isFunction(Test.JSData.hasOne, 'has the hasOne decorator')
      Test.assert.isFunction(Test.JSData.LinkedCollection, 'has the LinkedCollection class')
      Test.assert.isFunction(Test.JSData.Mapper, 'has the Mapper class')
      Test.assert.isFunction(Test.JSData.Query, 'has the Query class')
      Test.assert.isFunction(Test.JSData.Record, 'has the Record class')
      Test.assert.isFunction(Test.JSData.Schema, 'has the Schema class')
      Test.assert.isObject(Test.JSData.version, 'has a version')
    })

    collection.init()
    container.init()
    datastore.init()
    // decorators.init()
    linkedCollection.init()
    mapper.init()
    record.init()
    schema.init()
    utils.init()
  })
}

