import { assert, JSData, objectsEqual } from '../../_setup'

describe('DataStore#findAll', () => {
  it('should be an instance method', () => {
    const DataStore = JSData.DataStore
    const store = new DataStore()
    assert.equal(typeof store.findAll, 'function')
    assert.strictEqual(store.findAll, DataStore.prototype.findAll)
  })
  it('should findAll', async function () {
    const query = { name: 'John' }
    const props = [{ id: 1, name: 'John' }]
    let callCount = 0
    this.store.registerAdapter(
      'mock',
      {
        findAll () {
          callCount++
          return JSData.utils.resolve(props)
        }
      },
      { default: true }
    )
    const users = await this.store.findAll('user', query)
    assert.equal(callCount, 1, 'findAll should have been called once')
    assert.equal(typeof this.store._completedQueries.user[this.store.hashQuery('user', query)], 'function')
    objectsEqual(users, props, 'users should have been found')
    assert(users[0] instanceof this.User.recordClass, 'user is a record')
    objectsEqual(await this.store.findAll('user', query), users, 'should return the cached users')
    assert.equal(callCount, 1, 'findAll should have been called once')
    objectsEqual(await this.store.findAll('user', query, { force: true }), props, 'should make a new query')
    assert.equal(callCount, 2, 'findAll should have been called twice')
    objectsEqual(await this.store.findAll('user', query), props, 'should return the cached users')
    assert.equal(callCount, 2, 'findAll should have been called twice')
  })
  it('should findAll with scoped store', async function () {
    const query = { name: 'John' }
    const props = [{ id: 1, name: 'John' }]
    let callCount = 0
    this.store.registerAdapter(
      'mock',
      {
        findAll () {
          callCount++
          return JSData.utils.resolve(props)
        }
      },
      { default: true }
    )
    const scopedStore = this.store.as('user')
    const users = await scopedStore.findAll(query)
    assert.equal(callCount, 1, 'findAll should have been called once')
    assert.equal(typeof scopedStore._completedQueries.user[scopedStore.hashQuery(query)], 'function')
    objectsEqual(users, props, 'users should have been found')
    assert(users[0] instanceof this.User.recordClass, 'user is a record')
    objectsEqual(await scopedStore.findAll(query), users, 'should return the cached users')
    assert.equal(callCount, 1, 'findAll should have been called once')
    objectsEqual(await scopedStore.findAll(query, { force: true }), props, 'should make a new query')
    assert.equal(callCount, 2, 'findAll should have been called twice')
    objectsEqual(await scopedStore.findAll(query), props, 'should return the cached users')
    assert.equal(callCount, 2, 'findAll should have been called twice')
    assert.equal(scopedStore.getAll().length, 1, 'user should have been added to the store')
  })
  it('should return pending query', async function () {
    const query = { name: 'John' }
    const props = [{ id: 1, name: 'John' }]
    let callCount = 0
    this.store.registerAdapter(
      'mock',
      {
        findAll () {
          callCount++
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(props)
            }, 300)
          })
        }
      },
      { default: true }
    )
    const results = await Promise.all([this.store.findAll('user', query), this.store.findAll('user', query)])
    assert.equal(callCount, 1, 'findAll should have been called once')
    objectsEqual(results[0], props, 'users should have been found')
    objectsEqual(results[1], props, 'users should have been found')
    assert.strictEqual(results[0][0], results[1][0], 'users are the same object')
  })
  it('should delete pending query on error', function () {
    const query = { name: 'John' }
    let callCount = 0
    this.store.registerAdapter(
      'mock',
      {
        findAll () {
          callCount++
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error('foo'))
            }, 300)
          })
        }
      },
      { default: true }
    )
    const pendingQuery = this.store.findAll('user', query)
    assert(this.store._pendingQueries.user[this.store.hashQuery('user', query)])
    return pendingQuery.catch(err => {
      assert.equal(callCount, 1, 'findAll should have been called once')
      assert(!this.store._pendingQueries.user[this.store.hashQuery('user', query)])
      assert.equal(err.message, 'foo')
    })
  })
})
