import { assert, JSData } from '../../_setup'

describe('Collection#reduce', () => {
  it('should reduce', () => {
    const data = [{ id: 2 }, { id: 3 }, { id: 1 }]
    const collection = new JSData.Collection(data)
    const expectedSum = data.reduce((prev, curr) => prev + curr.id, 0)
    const reduction = collection.reduce((prev, item) => prev + item.id, 0)
    assert.equal(reduction, expectedSum, 'should have correctly reduce the items to a single value')
  })
})
