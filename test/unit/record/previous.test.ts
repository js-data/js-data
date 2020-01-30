import { assert, JSData, objectsEqual, objectsNotEqual } from '../../_setup'

describe('Record#previous', () => {
  it('should be an instance method', () => {
    const Record = JSData.Record
    const record = new Record()
    assert.equal(typeof record.previous, 'function')
    assert.strictEqual(record.previous, Record.prototype.previous)
  })
  it('should hold previous data', function () {
    const post = new this.Post.recordClass(this.data.p1); // eslint-disable-line
    objectsEqual(post, post.previous())
    post.foo = 'bar'
    objectsNotEqual(post, post.previous())
    delete post.foo
    objectsEqual(post, post.previous())
  })
  it('should hold previous data for a specified key', function () {
    const post = new this.Post.recordClass(this.data.p1); // eslint-disable-line
    assert.equal('John', post.previous('author'))
    post.author = 'Arnold'
    assert.equal('John', post.previous('author'))
    post.author = 'John'
    assert.equal('John', post.previous('author'))
  })
})
