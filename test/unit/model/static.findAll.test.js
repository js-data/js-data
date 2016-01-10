export function init () {
  describe('static findAll', function () {
    it('should be a static function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Model.findAll)
      let User = Test.JSData.Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Test.JSData.Model {}
      class User3 extends User2 {}
      Test.assert.isFunction(User.findAll)
      Test.assert.isFunction(User2.findAll)
      Test.assert.isTrue(Test.JSData.Model.findAll === User.findAll)
      Test.assert.isTrue(Test.JSData.Model.findAll === User2.findAll)
      Test.assert.isTrue(User.findAll === User2.findAll)
      Test.assert.isTrue(User2.findAll === User3.findAll)
    })
    it('should findAll', async function () {
      const Test = this
      const query = { id: 1 }
      const id = 1
      const props = [{ id, name: 'John' }]
      let findAllCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        findAll (modelConfig, _query, Opts) {
          findAllCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(modelConfig === User, 'should pass in the Model')
            Test.assert.deepEqual(_query, query, 'should pass in the query')
            Test.assert.equal(Opts.pojo, false, 'Opts are provided')
            resolve(props)
          })
        }
      })
      const users = await User.findAll(query)
      Test.assert.isTrue(findAllCalled, 'Adapter#findAll should have been called')
      Test.assert.deepEqual(users, props, 'user should have been found')
      Test.assert.isTrue(users[0] instanceof User, 'user is a User')
    })
    it('should return raw', async function () {
      const Test = this
      const query = { id: 1 }
      const id = 1
      const props = [{ id, name: 'John' }]
      let findAllCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        findAll (modelConfig, _query, Opts) {
          findAllCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(modelConfig === User, 'should pass in the Model')
            Test.assert.deepEqual(_query, query, 'should pass in the query')
            Test.assert.equal(Opts.raw, true, 'Opts are provided')
            resolve({
              data: props,
              found: 1
            })
          })
        }
      })
      let data = await User.findAll(query)
      Test.assert.isTrue(findAllCalled, 'Adapter#findAll should have been called')
      Test.assert.objectsEqual(data.data, props, 'user should have been found')
      Test.assert.isTrue(data.data[0] instanceof User, 'user is a User')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(data.found, 1, 'should have other metadata in response')
    })
  })
}
