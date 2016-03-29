import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be a constructor function', (t) => {
  t.is(typeof JSData.Query, 'function', 'should be a function')
  let query = new JSData.Query()
  t.ok(query instanceof JSData.Query, 'query should be an instance')
})
test.todo('should be tested')
