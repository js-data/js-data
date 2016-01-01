/* global JSData:true, Model:true, configure:true */
import {assert} from 'chai'
import * as hasMany from './hasMany.test'
import * as schema from './schema.test'

export function init () {
  describe('decorators/', function () {
    hasMany.init()
    schema.init()
  })
}
