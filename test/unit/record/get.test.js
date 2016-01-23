export function init () {
  describe('#get', function () {
    it('should be an instance function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Model.prototype.get)
      let User = Test.JSData.Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Test.JSData.Model {}
      class User3 extends User2 {}
      Test.assert.isFunction(User.prototype.get)
      Test.assert.isFunction(User2.prototype.get)
      Test.assert.isTrue(Test.JSData.Model.prototype.get === User.prototype.get)
      Test.assert.isTrue(Test.JSData.Model.prototype.get === User2.prototype.get)
      Test.assert.isTrue(User.prototype.get === User2.prototype.get)
      Test.assert.isTrue(User2.prototype.get === User3.prototype.get)
    })
    it('should return a property', function () {
      const Test = this
      class User extends Test.JSData.Model {}
      const user = new User({ foo: 'bar' })
      Test.assert.equal(user.get('foo'), 'bar')
    })
    it('should return undefined if the property does not exist', function () {
      const Test = this
      class User extends Test.JSData.Model {}
      const user = new User()
      Test.assert.isUndefined(user.get('foo'))
    })
    it('should return a nested property', function () {
      const Test = this
      class User extends Test.JSData.Model {}
      const user = new User({ address: { state: 'TX' } })
      Test.assert.equal(user.get('address.state'), 'TX')
    })
  })
}
