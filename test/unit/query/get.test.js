import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test.todo('should work')

test('should not allow index access after operation', (t) => {
  const collection = t.context.PostCollection

  t.throws(function () {
    collection.query().filter().get().run()
  }, Error)
})
