export function init () {
  describe('#create', function () {
    it('should be an instance function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Model.prototype.create)
      let User = Test.JSData.Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Test.JSData.Model {}
      class User3 extends User2 {}
      Test.assert.isFunction(User.prototype.create)
      Test.assert.isFunction(User2.prototype.create)
      Test.assert.isTrue(Test.JSData.Model.prototype.create === User.prototype.create)
      Test.assert.isTrue(Test.JSData.Model.prototype.create === User2.prototype.create)
      Test.assert.isTrue(User.prototype.create === User2.prototype.create)
      Test.assert.isTrue(User2.prototype.create === User3.prototype.create)
    })
    it('should create', async function () {
      const Test = this
      const props = { name: 'John' }
      const opts = {}
      let createCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        autoInject: false
      })
      let user = new User(props)
      User.create = function (_props, _opts) {
        createCalled = true
        return new Promise(function (resolve, reject) {
          Test.assert.objectsEqual(_props, { name: 'John' }, 'should pass in the props')
          _props[User.idAttribute] = new Date().getTime()
          Test.assert.isTrue(_props instanceof User, 'props is a User')
          Test.assert.isTrue(_opts === opts, 'should pass in the opts')
          resolve({ id: _props.id, name: _props.name })
        })
      }

      const _user = await user.create(opts)
      Test.assert.isTrue(createCalled, 'Adapter#create should have been called')
      Test.assert.isTrue(_user !== user, 'same user is returned')
      Test.assert.isDefined(_user[User.idAttribute], 'created user has an id')
      Test.assert.isFalse(_user instanceof User, 'user is not a User')
    })
  })
}
