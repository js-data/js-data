import { assert, JSData } from '../../_setup'

describe('Collection#mapCall', function () {
  it('should map and call', function () {
    const data = [
      { id: 1, getId () { return this.id } },
      { id: 2, getId () { return this.id } }
    ]
    const collection = new JSData.Collection(data)
    assert.deepEqual(collection.mapCall('getId'), [1, 2])
  })
})
