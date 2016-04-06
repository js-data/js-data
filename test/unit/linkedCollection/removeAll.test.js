import { assert } from '../../_setup'

describe('LinkedCollection#removeAll', function () {
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
})
