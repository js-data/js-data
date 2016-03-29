import {
  JSData
} from '../_setup'
import test from 'ava'

test('has all the right exports', (t) => {
  t.is(typeof JSData.belongsTo, 'function', 'has the belongsTo decorator')
  t.is(typeof JSData.Collection, 'function', 'has the Collection class')
  t.is(typeof JSData.Container, 'function', 'has the Container class')
  t.is(typeof JSData.DataStore, 'function', 'has the DataStore class')
  t.is(typeof JSData.hasMany, 'function', 'has the hasMany decorator')
  t.is(typeof JSData.hasOne, 'function', 'has the hasOne decorator')
  t.is(typeof JSData.LinkedCollection, 'function', 'has the LinkedCollection class')
  t.is(typeof JSData.Mapper, 'function', 'has the Mapper class')
  t.is(typeof JSData.Query, 'function', 'has the Query class')
  t.is(typeof JSData.Record, 'function', 'has the Record class')
  t.is(typeof JSData.Schema, 'function', 'has the Schema class')
  t.ok(JSData.version, 'has a version')
})
