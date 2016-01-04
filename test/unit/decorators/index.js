/* global JSData:true, Model:true, configure:true */
import {assert} from 'chai'
import * as belongsTo from './belongsTo.test'
import * as hasMany from './hasMany.test'
import * as schema from './schema.test'

export function init () {
  describe('decorators/', function () {
    belongsTo.init()
    hasMany.init()
    schema.init()
  })
}
