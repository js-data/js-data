export function init () {
  describe('find', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.find)
      Test.assert.isTrue(store.find === DataStore.prototype.find)
    })
    it('should find', async function () {
      const Test = this
      const id = 1
      const props = { id, name: 'John' }
      let callCount = 0
      Test.store.registerAdapter('mock', {
        find () {
          callCount++
          return Test.JSData.utils.resolve(props)
        }
      }, { 'default': true })
      const user = await Test.store.find('user', id)
      Test.assert.equal(callCount, 1, 'find should have been called once')
      Test.assert.isNumber(Test.store._completedQueries.user[id])
      Test.assert.objectsEqual(user, props, 'user should have been found')
      Test.assert.isTrue(user instanceof Test.User.RecordClass, 'user is a record')
      Test.assert.isTrue(user === await Test.store.find('user', id), 'should return the cached user')
      Test.assert.equal(callCount, 1, 'find should have been called once')
      Test.assert.isTrue(user === await Test.store.find('user', id, { force: true }), 'should make a new query')
      Test.assert.equal(callCount, 2, 'find should have been called twice')
      Test.assert.isTrue(user === await Test.store.find('user', id), 'should return the cached user')
      Test.assert.equal(callCount, 2, 'find should have been called twice')
    })
    it('should return pending query', async function () {
      const Test = this
      const id = 1
      const props = { id, name: 'John' }
      let callCount = 0
      Test.store.registerAdapter('mock', {
        find () {
          callCount++
          return new Promise(function (resolve) {
            setTimeout(function () {
              resolve(props)
            }, 300)
          })
        }
      }, { 'default': true })
      const users = await Promise.all([
        Test.store.find('user', id),
        Test.store.find('user', id)
      ])
      Test.assert.equal(callCount, 1, 'find should have been called once')
      Test.assert.objectsEqual(users[0], props, 'user should have been found')
      Test.assert.objectsEqual(users[1], props, 'user should have been found')
      Test.assert.isTrue(users[0] === users[1], 'users are the same object')
    })
    it('should delete pending query on error', function () {
      const Test = this
      const id = 1
      let callCount = 0
      Test.store.registerAdapter('mock', {
        find () {
          callCount++
          return new Promise(function (resolve, reject) {
            setTimeout(function () {
              reject('foo')
            }, 300)
          })
        }
      }, { 'default': true })
      const pendingQuery = Test.store.find('user', id)
      Test.assert.isDefined(Test.store._pendingQueries.user[id])
      return pendingQuery.catch(function (err) {
        Test.assert.equal(callCount, 1, 'find should have been called once')
        Test.assert.isUndefined(Test.store._pendingQueries.user[id])
        Test.assert.equal(err, 'foo')
      })
    })
  })
}
