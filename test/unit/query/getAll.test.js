import { assert } from '../../_setup'

describe('Query#getAll', () => {
  it('should work')

  it('should not allow index access after operation', function () {
    const collection = this.PostCollection

    assert.throws(() => {
      collection.query().filter().getAll().run()
    }, Error)
  })
})
