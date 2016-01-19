export function init () {
  describe.skip('schema', function () {
    it('should define properties on prototype', function (done) {
      const Test = this
      class User extends Test.JSData.Model {}

      let didSetName = false
      let didSetRole = false
      let changeCallCount = 0
      let changeTitleCallCount = 0
      let changeLevelCallCount = 0

      User.setSchema({
        age: {
          type: 'number'
        },
        title: {
          track: true
        },
        level: {
          track: true
        },
        name: {
          get: function (getter) {
            Test.assert.isFunction(getter, 'original getter should be provided')
            return 'foo'
          },
          set: function (value, setter) {
            Test.assert.isFunction(setter, 'original setter should be provided')
            didSetName = value
          }
        },
        role: {
          track: true,
          get: function (getter) {
            Test.assert.isFunction(getter, 'original getter should be provided')
            return 'foo2'
          },
          set: function (value, setter) {
            Test.assert.isFunction(setter, 'original setter should be provided')
            didSetRole = value
          }
        }
      })

      const user = new User({ id: 1, age: 30, title: 'boss', level: 1 })

      const keys = ['id', 'age', 'title', 'level', 'name', 'role']
      const enumeratedKeys = []

      for (var key in user) {
        enumeratedKeys.push(key)
      }

      Test.assert.equal(enumeratedKeys.length, keys.length, 'should have keys enumerated')

      user.on('change', function (_user, changes) {
        Test.assert.isTrue(_user === user, 'event handler should get instance')
        Test.assert.isObject(changes, '"changes" should be an object')
        changeCallCount++
      })
      user.on('change:title', function (_user, value) {
        Test.assert.isTrue(_user === user, 'event handler should get instance')
        Test.assert.isString(value, '"value" should be provided')
        changeTitleCallCount++
      })
      user.on('change:level', function (_user, value) {
        Test.assert.isTrue(_user === user, 'event handler should get instance')
        Test.assert.isNumber(value, '"value" should be provided')
        changeLevelCallCount++
      })

      Test.assert.equal(user.id, 1, 'id should have a value')
      Test.assert.isDefined(user.age, 30, 'age should have a value')
      Test.assert.isDefined(user.title, 'boss', 'title should have a value')
      Test.assert.isDefined(user.level, 1, 'level should have a value')
      Test.assert.equal(user.name, 'foo', 'should allow custom getter')
      user.name = 'bar'
      Test.assert.equal(user.name, 'foo', 'should allow custom setter')
      Test.assert.equal(didSetName, 'bar', 'custom getter should be called')
      Test.assert.equal(user.role, 'foo2', 'should allow custom getter')
      user.role = 'bar2'
      Test.assert.equal(user.role, 'foo2', 'should allow custom setter')
      Test.assert.equal(didSetRole, 'bar2', 'custom getter should be called')

      Test.assert.deepEqual(user._get('changes'), {}, 'user should not have changes')
      Test.assert.isUndefined(user._get('changing'), 'user should NOT be changing')
      Test.assert.isUndefined(user._get('changed'), 'user title should NOT be changing')

      user.title = 'manager'

      Test.assert.isTrue(user._get('changing'), 'user should be changing')
      Test.assert.deepEqual(user._get('changed'), ['title'], 'user title should be changing')
      Test.assert.deepEqual(user._get('changes'), { title: 'manager' }, 'user should have changes')

      user.level = 2

      Test.assert.isTrue(user._get('changing'), 'user should be changing')
      Test.assert.deepEqual(user._get('changed'), ['title', 'level'], 'user level should be changing')
      Test.assert.deepEqual(user._get('changes'), { title: 'manager', level: 2 }, 'user should have changes')

      // events have not fired because changes a being batched into the next event loop
      Test.assert.equal(changeCallCount, 0, '"change" event should not have fired yet')
      Test.assert.equal(changeTitleCallCount, 0, '"change:title" event should not have fired yet')
      Test.assert.equal(changeLevelCallCount, 0, '"change:level" event should not have fired yet')

      setTimeout(function () {
        // changes should have been batched into the next event loop
        Test.assert.equal(changeCallCount, 1, '"change" event should have fired once')
        Test.assert.equal(changeTitleCallCount, 1, '"change:title" event should have fired once')
        Test.assert.equal(changeLevelCallCount, 1, '"change:level" event should have fired once')

        Test.assert.deepEqual(user._get('changes'), { title: 'manager', level: 2 }, 'user should have changes')
        Test.assert.isUndefined(user._get('changing'), 'user should NOT be changing')
        Test.assert.isUndefined(user._get('changed'), 'user title should NOT be changing')

        user.title = 'boss'

        Test.assert.isTrue(user._get('changing'), 'user should be changing')
        Test.assert.deepEqual(user._get('changed'), ['title'], 'user title should be changing')
        Test.assert.isUndefined(user._get('changes').title, 'user title should NOT have changes')
        Test.assert.equal(user._get('changes').level, 2, 'user level should have a change')
        Test.assert.deepEqual(user._get('changes'), { level: 2 }, 'user should have 1 change')

        setTimeout(function () {
          Test.assert.isUndefined(user._get('changes').title, 'user title should NOT have changes')
          Test.assert.deepEqual(user._get('changes'), { level: 2 }, 'user should have 1 change')
          Test.assert.equal(user._get('changes').level, 2, 'user level should have a change')
          Test.assert.isUndefined(user._get('changing'), 'user should NOT be changing')
          Test.assert.isUndefined(user._get('changed'), 'user title should NOT be changing')

          Test.assert.equal(changeCallCount, 2, '"change" event should have fired twice')
          Test.assert.equal(changeTitleCallCount, 2, '"change:title" event should have fired twice')
          Test.assert.equal(changeLevelCallCount, 1, '"change:level" event should have fired only once')

          // remove event listeners
          user.off()

          done()
        }, 5)
      }, 5)
    })
    it('should validate based on json-schema.org rules', function () {
      const Test = this
      class User extends Test.JSData.Model {}

      User.setSchema({
        age: {
          type: 'number'
        },
        title: {
          type: ['string', 'null']
        },
        level: {}
      })

      const user = new User({ id: 1, age: 30, title: 'boss', level: 1 })

      Test.assert.throws(function () {
        user.age = 'foo'
      }, Error, 'type: Expected: number. Actual: string', 'should require a number')
      Test.assert.throws(function () {
        user.age = {}
      }, Error, 'type: Expected: number. Actual: object', 'should require a number')
      Test.assert.doesNotThrow(function () {
        user.age = undefined
      }, 'should accept undefined')
      Test.assert.throws(function () {
        user.title = 1234
      }, Error, 'type: Expected: string or null. Actual: number', 'should require a string or null')
      Test.assert.doesNotThrow(function () {
        user.title = 'foo'
      }, 'should accept a string')
      Test.assert.doesNotThrow(function () {
        user.title = null
      }, 'should accept null')
      Test.assert.doesNotThrow(function () {
        user.title = undefined
      }, 'should accept undefined')

      Test.assert.throws(function () {
        const user = new User({ age: 'foo' })
        user.set('foo', 'bar')
      }, Error, 'type: Expected: number. Actual: string', 'should validate on create')

      Test.assert.doesNotThrow(function () {
        const user = new User({ age: 'foo' }, { noValidate: true })
        user.set('foo', 'bar')
      }, 'should NOT validate on create')
    })
  })
}
