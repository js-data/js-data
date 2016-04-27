import { assert, JSData } from '../../_setup'

describe('Collection#remove', function () {
  it('should remove an item from the collection', function () {
    this.UserCollection.createIndex('age')
    const user = this.UserCollection.add({ id: 1, age: 30 })
    const user2 = this.UserCollection.add({ id: 2, age: 31 })
    const user3 = this.UserCollection.add({ id: 3, age: 32 })
    const users = [user, user2, user3]
    assert(this.UserCollection.get(1) === user, 'user 1 is in the store')
    assert(this.UserCollection.get(2) === user2, 'user 2 is in the store')
    assert(this.UserCollection.get(3) === user3, 'user 3 is in the store')
    assert.deepEqual(this.UserCollection.between([30], [32], {
      rightInclusive: true,
      index: 'age'
    }), users, 'users can be selected by age index')
    this.UserCollection.remove(1)
    assert(!this.UserCollection.get(1), 'user 1 is no longer in the store')
    users.shift()
    assert.deepEqual(this.UserCollection.between([30], [32], {
      rightInclusive: true,
      index: 'age'
    }), users, 'user 1 cannot be retrieved by index')
  })

  it('should remove plain records', function () {
    const data = [
      { id: 1, getId () { return this.id } },
      { id: 2, getId () { return this.id } }
    ]
    const collection = new JSData.Collection(data)
    const item = collection.get(1)
    const removed = collection.remove(1)
    assert.equal(item === removed, true)
  })
})
