import { assert, JSData } from '../../_setup'

describe('Record#revert', function () {
  it('should be an instance method', function () {
    const Record = JSData.Record
    const record = new Record()
    assert.equal(typeof record.revert, 'function')
    assert.strictEqual(record.revert, Record.prototype.revert)
  })
  it('should return the previous version of an item', function () {
    const post = new this.Post.recordClass(this.data.p1) // eslint-disable-line
    post.author = 'Jake'
    post.revert()
    assert.objectsEqual(post, this.data.p1)
  })
  it('should preserve fields in the optional preserve array', function () {
    const post = new this.Post.recordClass(this.data.p1) // eslint-disable-line
    post.author = 'Jake'
    post.age = 20
    post.revert({ preserve: ['age'] })
    assert.equal(post.age, 20, 'The age of the post should have been preserved')
    assert.equal(post.author, 'John', 'The author of the post should have been reverted')
  })
  it('should revert key which has not been injected', function () {
    const post = new this.Post.recordClass(this.data.p1) // eslint-disable-line
    assert(!post.newProperty)
    post.newProperty = 'new Property'
    post.revert()
    assert(!post.newProperty)
  })
})
