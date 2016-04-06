import { assert, JSData } from '../../_setup'

describe('Collection#map', function () {
  it('should map', function () {
    const data = [
      { id: 2 },
      { id: 3 },
      { id: 1 }
    ]
    const collection = new JSData.Collection(data)
    const ctx = {}
    const mapping = collection.map(function (item) {
      assert(this === ctx, 'should have correct context')
      return item.id
    }, ctx)
    assert(mapping.indexOf(1) !== -1)
    assert(mapping.indexOf(2) !== -1)
    assert(mapping.indexOf(3) !== -1)
    assert.equal(mapping.length, 3)
  })
})
