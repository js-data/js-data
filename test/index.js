import * as integration from './integration/index'
import * as unit from './unit/index'

export function init () {
  describe('JSData', function () {
    integration.init()
    unit.init()
  })
}
