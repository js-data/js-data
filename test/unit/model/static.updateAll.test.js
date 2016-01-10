export function init () {
  describe('static updateAll', function () {
    it('should be a static function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Model.updateAll)
      let User = Test.JSData.Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Test.JSData.Model {}
      class User3 extends User2 {}
      Test.assert.isFunction(User.updateAll)
      Test.assert.isFunction(User2.updateAll)
      Test.assert.isTrue(Test.JSData.Model.updateAll === User.updateAll)
      Test.assert.isTrue(Test.JSData.Model.updateAll === User2.updateAll)
      Test.assert.isTrue(User.updateAll === User2.updateAll)
      Test.assert.isTrue(User2.updateAll === User3.updateAll)
    })
    it('should update', async function () {
      const Test = this
      const id = 1
      const query = { a: 'b' }
      const props = { name: 'John' }
      let updateAllCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        updateAll (modelConfig, _query, _props, Opts) {
          updateAllCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(modelConfig === User, 'should pass in the Model')
            Test.assert.deepEqual(_query, query, 'should pass in the query')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.pojo, false, 'Opts are provided')
            _props.foo = 'bar'
            _props.id = id
            resolve([_props])
          })
        }
      })
      const users = await User.updateAll(query, props)
      Test.assert.isTrue(updateAllCalled, 'Adapter#updateAll should have been called')
      Test.assert.equal(users[0].foo, 'bar', 'user has a new field')
      Test.assert.isTrue(users[0] instanceof User, 'user is a User')
    })
    it('should return raw', async function () {
      const Test = this
      const id = 1
      const query = { a: 'b' }
      const props = { name: 'John' }
      let updateAllCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        updateAll (modelConfig, _query, _props, Opts) {
          updateAllCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(modelConfig === User, 'should pass in the Model')
            Test.assert.deepEqual(_query, query, 'should pass in the query')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.raw, true, 'Opts are provided')
            _props.foo = 'bar'
            _props.id = id
            resolve({
              data: [_props],
              updated: 1
            })
          })
        }
      })
      let data = await User.updateAll(query, props)
      Test.assert.isTrue(updateAllCalled, 'Adapter#update should have been called')
      Test.assert.equal(data.data[0].foo, 'bar', 'user has a new field')
      Test.assert.isTrue(data.data[0] instanceof User, 'user is a User')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(data.updated, 1, 'should have other metadata in response')
    })
  })
}
