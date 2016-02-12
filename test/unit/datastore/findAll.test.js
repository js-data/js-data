export function init () {
  describe('findAll', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.findAll)
      Test.assert.isTrue(store.findAll === DataStore.prototype.findAll)
    })
    it('should findAll', async function () {
      const Test = this
      const query = { name: 'John' }
      const props = [{ id: 1, name: 'John' }]
      let callCount = 0
      Test.store.registerAdapter('mock', {
        findAll () {
          callCount++
          return Test.JSData.utils.resolve(props)
        }
      }, { 'default': true })
      const users = await Test.store.findAll('user', query)
      Test.assert.equal(callCount, 1, 'findAll should have been called once')
      Test.assert.isNumber(Test.store._completedQueries.user[Test.store.hashQuery('user', query)])
      Test.assert.objectsEqual(users, props, 'users should have been found')
      Test.assert.isTrue(users[0] instanceof Test.User.RecordClass, 'user is a record')
      Test.assert.objectsEqual(await Test.store.findAll('user', query), users, 'should return the cached users')
      Test.assert.equal(callCount, 1, 'findAll should have been called once')
      Test.assert.objectsEqual(await Test.store.findAll('user', query, { force: true }), props, 'should make a new query')
      Test.assert.equal(callCount, 2, 'findAll should have been called twice')
      Test.assert.objectsEqual(await Test.store.findAll('user', query), props, 'should return the cached users')
      Test.assert.equal(callCount, 2, 'findAll should have been called twice')
    })
    it('should return pending query', async function () {
      const Test = this
      const query = { name: 'John' }
      const props = [{ id: 1, name: 'John' }]
      let callCount = 0
      Test.store.registerAdapter('mock', {
        findAll () {
          callCount++
          return new Promise(function (resolve) {
            setTimeout(function () {
              resolve(props)
            }, 300)
          })
        }
      }, { 'default': true })
      const results = await Promise.all([
        Test.store.findAll('user', query),
        Test.store.findAll('user', query)
      ])
      Test.assert.equal(callCount, 1, 'findAll should have been called once')
      Test.assert.objectsEqual(results[0], props, 'users should have been found')
      Test.assert.objectsEqual(results[1], props, 'users should have been found')
      Test.assert.isTrue(results[0][0] === results[1][0], 'users are the same object')
    })
    it('should delete pending query on error', function () {
      const Test = this
      const query = { name: 'John' }
      let callCount = 0
      Test.store.registerAdapter('mock', {
        findAll () {
          callCount++
          return new Promise(function (resolve, reject) {
            setTimeout(function () {
              reject('foo')
            }, 300)
          })
        }
      }, { 'default': true })
      const pendingQuery = Test.store.findAll('user', query)
      Test.assert.isDefined(Test.store._pendingQueries.user[Test.store.hashQuery('user', query)])
      return pendingQuery.catch(function (err) {
        Test.assert.equal(callCount, 1, 'findAll should have been called once')
        Test.assert.isUndefined(Test.store._pendingQueries.user[Test.store.hashQuery('user', query)])
        Test.assert.equal(err, 'foo')
      })
    })
  })
}
