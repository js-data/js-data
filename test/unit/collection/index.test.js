import { assert, JSData, sinon } from '../../_setup'

describe('Collection', function () {
  it('should be a constructor function', function () {
    assert.equal(typeof JSData.Collection, 'function', 'should be a function')
    const collection = new JSData.Collection()
    assert(collection instanceof JSData.Collection, 'collection should be an instance')
    assert.equal(collection.recordId(), 'id', 'collection should get initialization properties')
  })

  it('should accept just opts', function () {
    assert.doesNotThrow(() => {
      new JSData.Collection({ idAttribute: 'id' }) // eslint-disable-line
    })
  })

  it('should accept opts as string', function () {
    assert.doesNotThrow(() => {
      const collection = new JSData.Collection('_id')
      assert.equal(collection.idAttribute, '_id')
    })
  })

  it('should accept initialization data', function () {
    const data = [
      { id: 2 },
      { id: 3 },
      { id: 1 }
    ]
    const collection = new JSData.Collection(data)
    assert.deepEqual(collection.getAll(), [data[2], data[0], data[1]], 'data should be in order')
  })

  it('should bubble up record events', function () {
    const data = [
      { id: 2 },
      { id: 3 },
      { id: 1 }
    ]
    const stub = sinon.stub()
    const stub2 = sinon.stub()
    const UserMapper = new JSData.Mapper({ name: 'user' })
    const collection = new JSData.Collection(data, { mapper: UserMapper })
    collection.on('foo', stub)
    collection.on('all', stub2)
    collection.get(1).emit('foo', 1, 2)
    collection.get(2).emit('foo', 2, 3)
    assert.equal(stub.calledTwice, true)
    assert.equal(stub2.calledTwice, true)
    assert.deepEqual(stub.firstCall.args, [1, 2])
    assert.deepEqual(stub2.firstCall.args, ['foo', 1, 2])
    assert.deepEqual(stub.secondCall.args, [2, 3])
    assert.deepEqual(stub2.secondCall.args, ['foo', 2, 3])
  })

  it('can make a subclass', function () {
    const FooCollection = JSData.Collection.extend({
      foo () { return 'foo' }
    })
    class BarCollection extends JSData.Collection {
      bar () { return 'bar' }
    }
    const fooC = new FooCollection(null, { test: 'test' })
    const barC = new BarCollection(null, { test: 'test' })
    assert.equal(fooC.foo(), 'foo')
    assert.equal(fooC.test, 'test')
    assert.equal(barC.bar(), 'bar')
    assert.equal(barC.test, 'test')
  })
})
