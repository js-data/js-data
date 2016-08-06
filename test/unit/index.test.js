import { assert, JSData } from '../_setup'

describe('JSData', function () {
  it('has all the right exports', function () {
    assert.equal(typeof JSData.belongsTo, 'function', 'has the belongsTo decorator')
    assert.equal(typeof JSData.Collection, 'function', 'has the Collection class')
    assert.equal(typeof JSData.Container, 'function', 'has the Container class')
    assert.equal(typeof JSData.Index, 'function', 'has the Index class')
    assert.equal(typeof JSData.DataStore, 'function', 'has the DataStore class')
    assert.equal(typeof JSData.hasMany, 'function', 'has the hasMany decorator')
    assert.equal(typeof JSData.hasOne, 'function', 'has the hasOne decorator')
    assert.equal(typeof JSData.LinkedCollection, 'function', 'has the LinkedCollection class')
    assert.equal(typeof JSData.Mapper, 'function', 'has the Mapper class')
    assert.equal(typeof JSData.Query, 'function', 'has the Query class')
    assert.equal(typeof JSData.Record, 'function', 'has the Record class')
    assert.equal(typeof JSData.Schema, 'function', 'has the Schema class')
    assert.equal(typeof JSData.Settable, 'function', 'has the Settable class')
    assert.equal(typeof JSData.SimpleStore, 'function', 'has the SimpleStore class')
    assert(JSData.version, 'has a version')
  })
})
