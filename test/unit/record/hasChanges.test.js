import { assert, JSData } from '../../_setup'

describe('Record#hasChanges', function () {
  it('should be an instance method', function () {
    const Record = JSData.Record
    const record = new Record()
    assert.equal(typeof record.hasChanges, 'function')
    assert.strictEqual(record.hasChanges, Record.prototype.hasChanges)
  })
  it('should detect when untracked fields are changed', function () {
    const post = new this.Post.recordClass(this.data.p1) // eslint-disable-line
    assert(!post.hasChanges())
    post.author = 'Jake'
    assert(post.hasChanges())
  })
  it('should return true if a tracked field is changed', function () {
    const PostMapper = new JSData.Mapper({
      name: 'post',
      schema: {
        properties: {
          author: {
            type: 'string',
            track: true
          }
        }
      }
    })
    const post = PostMapper.createRecord(this.data.p1)
    assert(!post.hasChanges())
    post.author = 'Jake'
    assert(post.hasChanges())
    post.author = 'John'
    assert(!post.hasChanges())
  })
})
