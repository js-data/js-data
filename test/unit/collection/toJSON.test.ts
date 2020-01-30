import { assert, JSData } from '../../_setup'

describe('Collection#toJSON', () => {
  it('should call toJSON on records in the collection', () => {
    const data = [{ id: 1 }, { id: 2 }]
    const UserMapper = new JSData.Mapper({ name: 'user' })
    const collection = new JSData.Collection(data, { mapper: UserMapper })
    assert.deepEqual(collection.toJSON(), [{ id: 1 }, { id: 2 }])
  })
})
