import { assert } from '../../_setup'

describe('Collection#get', function () {
  it('should get an item from the collection', function () {
    const user = this.UserCollection.add({ id: 1 })
    assert(this.UserCollection.get(1) === user, 'should get the user from the collection')
    assert(!this.UserCollection.get(2), 'should return undefined if the item is not in the collection')
    assert(!this.UserCollection.get(), 'should return undefined if item id is not provided')
  })
})
