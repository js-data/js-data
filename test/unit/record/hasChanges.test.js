import { assert, JSData, sinon } from '../../_setup'

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
  it('should return true if a tracked field is changed', function (done) {
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
    const listener = sinon.stub()
    post.on('change', listener)
    assert(!post.hasChanges())
    post.author = 'Jake'
    assert(post.hasChanges())
    post.author = 'John'
    assert(!post.hasChanges())
    setTimeout(function () {
      assert.equal(listener.callCount, 0)
      done()
    }, 5)
  })

  /* The previous test has a property set and changed back within a single event loop
  * So no listener is ever called.
  * This test checks that hasChanges() is still false (if the state is set back to the previous)
  * even if both changes were registered and a listener was called on each change (twice in total).
  */

  it('is not affected by timing', function (done) {
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
    const listener = sinon.stub()
    post.on('change', listener)
    post.author = 'Jake'
    assert(post.hasChanges())
    const secondSpec = function () {
      assert.equal(listener.callCount, 2)
      assert(!post.hasChanges())
      done()
    }
    setTimeout(function () {
      assert.equal(listener.callCount, 1)
      post.author = 'John'
      setTimeout(secondSpec, 5)
    }, 5)
  })
})
