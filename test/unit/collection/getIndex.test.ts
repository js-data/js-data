import { assert, JSData } from '../../_setup'

describe('Collection#getIndex', () => {
  it('should get an index', () => {
    const collection = new JSData.Collection()
    collection.createIndex('age')
    assert.doesNotThrow(() => {
      const index = collection.getIndex('age')
      assert.equal(index instanceof JSData.Index, true)
    })
  })

  it('should error if index does not exist', () => {
    const collection = new JSData.Collection()
    assert.throws(
      () => {
        collection.getIndex('age')
      },
      Error,
      '[Collection#getIndex:age] index not found\nhttp://www.js-data.io/v3.0/docs/errors#404'
    )
  })
})
