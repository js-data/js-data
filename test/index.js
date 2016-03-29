import * as integration from './integration/index'
import * as unit from './unit/index'

export function init () {
  describe('JSData', (t) => {
    integration.init()
    unit.init()
  })
}
