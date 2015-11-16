import * as collection from './collection.test'
import * as resource from './resource.test'

export function init () {
  describe('core', function () {
    collection.init()
    resource.init()
  })
}
