import * as between from './between.test'
import * as filter from './filter.test'
import * as forEach from './forEach.test'
import * as getAll from './getAll.test'
import * as limit from './limit.test'
import * as map from './map.test'
import * as orderBy from './orderBy.test'
import * as skip from './skip.test'

export function init () {
  describe('Query', function () {
    it('should be a constructor function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Query, 'should be a function')
      let query = new Test.JSData.Query()
      Test.assert.isTrue(query instanceof Test.JSData.Query, 'query should be an instance')
    })

    between.init()
    filter.init()
    forEach.init()
    getAll.init()
    limit.init()
    map.init()
    orderBy.init()
    skip.init()
  })
}
