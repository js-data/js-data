import { assert, JSData } from '../../_setup'

describe('Query#mapCall', () => {
  it('should map and call', () => {
    const data = [
      {
        id: 1,
        getId () {
          return this.id
        }
      },
      {
        id: 2,
        getId () {
          return this.id
        }
      }
    ]
    const collection = new JSData.Collection(data)
    assert.deepEqual(
      collection
        .query()
        .mapCall('getId')
        .run(),
      [1, 2]
    )
  })
})
