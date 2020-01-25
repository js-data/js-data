import { assert } from '../../_setup'

describe('Collection#removeAll', function () {
  it('should eject items that meet the criteria from the store', function () {
    this.User.debug = true
    this.UserCollection.add([this.data.p1, this.data.p2, this.data.p3, this.data.p4, this.data.p5])
    assert(this.UserCollection.get(5))
    assert(this.UserCollection.get(6))
    assert(this.UserCollection.get(7))
    assert(this.UserCollection.get(8))
    assert(this.UserCollection.get(9))
    assert.doesNotThrow(() => {
      this.UserCollection.removeAll({ where: { author: 'Adam' } })
    })
    assert(this.UserCollection.get(5))
    assert(this.UserCollection.get(6))
    assert(this.UserCollection.get(7))
    assert(!this.UserCollection.get(8))
    assert(!this.UserCollection.get(9))
  })
  it('should eject all items from the store', function () {
    this.PostCollection.add([this.data.p1, this.data.p2, this.data.p3, this.data.p4])

    assert.objectsEqual(this.PostCollection.get(5), this.data.p1)
    assert.objectsEqual(this.PostCollection.get(6), this.data.p2)
    assert.objectsEqual(this.PostCollection.get(7), this.data.p3)
    assert.objectsEqual(this.PostCollection.get(8), this.data.p4)

    assert.doesNotThrow(() => {
      this.PostCollection.removeAll()
    })

    assert(!this.PostCollection.get(5))
    assert(!this.PostCollection.get(6))
    assert(!this.PostCollection.get(7))
    assert(!this.PostCollection.get(8))
  })

  it('should remove unsaved records', function () {
    const alice = { author: 'Alice' }
    const bob = this.store.createRecord('post', { author: 'Bob' })
    assert.objectsEqual(this.PostCollection.add([
      this.data.p1,
      this.data.p2,
      alice,
      this.data.p3,
      bob,
      this.data.p4
    ]), [this.data.p1, this.data.p2, alice, this.data.p3, bob, this.data.p4])

    assert.strictEqual(bob, this.PostCollection.filter({
      author: 'Bob'
    })[0])
    assert.notStrictEqual(alice, this.PostCollection.filter({
      author: 'Alice'
    })[0])

    assert.objectsEqual(this.PostCollection.get(5), this.data.p1)
    assert.objectsEqual(this.PostCollection.get(6), this.data.p2)
    assert.objectsEqual(this.PostCollection.get(7), this.data.p3)
    assert.objectsEqual(this.PostCollection.get(8), this.data.p4)
    assert.objectsEqual(this.PostCollection.filter({
      id: undefined
    }).length, 2)
    assert.objectsEqual(this.PostCollection.filter({
      author: 'Bob'
    }).length, 1)
    assert.objectsEqual(this.PostCollection.filter().length, 6)

    let removedAlices = this.PostCollection.removeAll([alice])
    assert.equal(removedAlices.length, 0)
    assert.objectsEqual(this.PostCollection.filter({
      author: 'Alice'
    }).length, 1)
    assert.objectsEqual(this.PostCollection.filter().length, 6)
    removedAlices = this.PostCollection.removeAll(this.PostCollection.filter({
      author: 'Alice'
    }))
    assert.objectsEqual(removedAlices, [{ author: 'Alice' }])
    assert.objectsEqual(this.PostCollection.filter({
      author: 'Alice'
    }).length, 0)
    assert.objectsEqual(this.PostCollection.filter().length, 5)
    assert.objectsEqual(this.PostCollection.filter({
      id: undefined
    }).length, 1)
    assert.objectsEqual(this.PostCollection.filter({
      author: 'Bob'
    }).length, 1)

    const bob2 = this.PostCollection.add({ author: 'Bob' })
    assert.objectsEqual(this.PostCollection.filter({
      id: undefined
    }).length, 2)
    assert.objectsEqual(this.PostCollection.filter({
      author: 'Bob'
    }).length, 2)
    assert.objectsEqual(this.PostCollection.filter().length, 6)

    const removedBobs = this.PostCollection.removeAll([bob2, bob])
    assert.strictEqual(removedBobs[0], bob2)
    assert.strictEqual(removedBobs[1], bob)

    assert.equal(this.PostCollection.filter({
      id: undefined
    }).length, 0)
    assert.equal(this.PostCollection.filter({
      author: 'Bob'
    }).length, 0)
    assert.objectsEqual(this.PostCollection.filter().length, 4)
  })

  it('should remove unsaved records with convenience method', function () {
    const alice = { author: 'Alice' }
    const bob = this.store.createRecord('post', { author: 'Bob' })
    assert.objectsEqual(this.PostCollection.add([
      this.data.p1,
      this.data.p2,
      alice,
      this.data.p3,
      bob,
      this.data.p4
    ]), [this.data.p1, this.data.p2, alice, this.data.p3, bob, this.data.p4])
    const storeAlice = this.PostCollection.filter({
      author: 'Alice'
    })[0]

    const bob2 = this.PostCollection.add({ author: 'Bob', num: 2 })

    assert.equal(this.PostCollection.getAll().length, 7)

    const records = this.PostCollection.unsaved()

    assert.objectsEqual(records, [
      bob2,
      bob,
      storeAlice
    ])

    const removedRecords = this.PostCollection.prune()

    assert.equal(removedRecords.length, 3)
    assert.equal(this.PostCollection.getAll().length, 4)
    assert.objectsEqual(removedRecords, [bob2, bob, alice])
  })
})
