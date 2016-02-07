import * as collection from './collection.test'
import * as datastore from './datastore.test'

export function init () {
  describe('Integration tests', function () {
    collection.init()
    datastore.init()
  })
}
