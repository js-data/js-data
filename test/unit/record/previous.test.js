import { assert, JSData } from '../../_setup'

describe('Record#previous', function () {
  it('should be an instance method', function () {
    const Record = JSData.Record
    const record = new Record()
    assert.equal(typeof record.previous, 'function')
    assert.strictEqual(record.previous, Record.prototype.previous)
  })
  it('should hold previous data', function () {
    const post = new this.Post.recordClass(this.data.p1) // eslint-disable-line
    assert.objectsEqual(post, post.previous())
    post.foo = 'bar'
    assert.objectsNotEqual(post, post.previous())
    delete post.foo
    assert.objectsEqual(post, post.previous())
  })
  it('should hold previous data for a specified key', function () {
    const post = new this.Post.recordClass(this.data.p1) // eslint-disable-line
    assert.equal('John', post.previous('author'))
    post.author = 'Arnold'
    assert.equal('John', post.previous('author'))
    post.author = 'John'
    assert.equal('John', post.previous('author'))
  })
})
