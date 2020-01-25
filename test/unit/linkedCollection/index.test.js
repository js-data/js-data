import { assert, JSData, sinon } from '../../_setup'

describe('LinkedCollection', function () {
  it('should create a linked collection', function (done) {
    assert.equal(typeof JSData.LinkedCollection, 'function', 'should be a function')
    const store = new JSData.DataStore()
    const mapper = store.defineMapper('user', {
      schema: {
        properties: {
          id: { type: 'number' },
          name: { type: 'string', track: true }
        }
      }
    })
    const collection = store.getCollection('user')
    assert(collection instanceof JSData.LinkedCollection, 'collection should be an instance')
    assert.equal(collection.recordId(), 'id', 'collection should get initialization properties')

    const data = [
      { id: 2 },
      { id: 3 },
      { id: 1, name: 'John' }
    ]
    collection.add(data)
    assert.objectsEqual(collection.getAll(), [data[2], data[0], data[1]], 'data should be in order')

    assert.throws(() => {
      new JSData.LinkedCollection(null, { // eslint-disable-line
        mapper: mapper
      })
    }, Error, '[new LinkedCollection:opts.datastore] expected: DataStore, found: undefined\nhttp://www.js-data.io/v3.0/docs/errors#400')

    const stub = sinon.stub()
    collection.on('all', stub)
    collection.get(1).emit('foo', 1, 2)
    assert.equal(stub.calledOnce, true)
    assert.deepEqual(stub.firstCall.args, ['foo', 1, 2])

    collection.get(1).name = 'Johnny'

    setTimeout(() => {
      assert.equal(stub.calledThrice, true)
      assert.deepEqual(stub.secondCall.args[0], 'change:name')
      assert.deepEqual(stub.secondCall.args[1], collection.get(1))
      assert.deepEqual(stub.secondCall.args[2], 'Johnny')
      assert.deepEqual(stub.thirdCall.args[0], 'change')
      assert.deepEqual(stub.thirdCall.args[1], collection.get(1))
      assert.deepEqual(stub.thirdCall.args[2], { added: {}, changed: { name: 'Johnny' }, removed: {} })
      done()
    }, 10)
  })
})
