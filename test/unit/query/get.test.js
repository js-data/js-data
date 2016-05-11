import { assert } from '../../_setup'

describe('Query#get', function () {
  it('should work')

  it('should not allow index access after operation', function () {
    const collection = this.PostCollection

    assert.throws(function () {
      collection.query().filter().get().run()
    }, Error)
  })
})
