import { assert, JSData } from '../../_setup'

describe('DataStore#find', function () {
  it('should be an instance method', function () {
    const DataStore = JSData.DataStore
    const store = new DataStore()
    assert.equal(typeof store.find, 'function')
    assert.strictEqual(store.find, DataStore.prototype.find)
  })
  it('should find', async function () {
    const id = 1
    const props = { id, name: 'John' }
    let callCount = 0
    this.store.registerAdapter('mock', {
      find () {
        callCount++
        return JSData.utils.resolve(props)
      }
    }, { default: true })
    const user = await this.store.find('user', id)
    assert.equal(callCount, 1, 'find should have been called once')
    assert.equal(typeof this.store._completedQueries.user[id], 'function')
    assert.objectsEqual(user, props, 'user should have been found')
    assert(user instanceof this.User.recordClass, 'user is a record')
    assert.strictEqual(user, await this.store.find('user', id), 'should return the cached user')
    assert.equal(callCount, 1, 'find should have been called once')
    assert.strictEqual(user, await this.store.find('user', id, { force: true }), 'should make a new query')
    assert.equal(callCount, 2, 'find should have been called twice')
    assert.strictEqual(user, await this.store.find('user', id), 'should return the cached user')
    assert.equal(callCount, 2, 'find should have been called twice')
  })
  it('should return pending query', async function () {
    const id = 1
    const props = { id, name: 'John' }
    let callCount = 0
    this.store.registerAdapter('mock', {
      find () {
        callCount++
        return new Promise(function (resolve) {
          setTimeout(function () {
            resolve(props)
          }, 300)
        })
      }
    }, { default: true })
    const users = await Promise.all([
      this.store.find('user', id),
      this.store.find('user', id)
    ])
    assert.equal(callCount, 1, 'find should have been called once')
    assert.objectsEqual(users[0], props, 'user should have been found')
    assert.objectsEqual(users[1], props, 'user should have been found')
    assert.strictEqual(users[0], users[1], 'users are the same object')
  })
  it('should delete pending query on error', function () {
    const id = 1
    let callCount = 0
    this.store.registerAdapter('mock', {
      find () {
        callCount++
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            reject(new Error('foo'))
          }, 300)
        })
      }
    }, { default: true })
    const pendingQuery = this.store.find('user', id)
    assert(this.store._pendingQueries.user[id])
    return pendingQuery.catch((err) => {
      assert.equal(callCount, 1, 'find should have been called once')
      assert(!this.store._pendingQueries.user[id])
      assert.equal(err.message, 'foo')
    })
  })
})
