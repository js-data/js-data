/* global JSData:true, Resource:true, configure:true */
import {assert} from 'chai'
import * as schema from './schema.test'

export function init () {
  describe('decorators/', function () {
    schema.init()
  })
}
