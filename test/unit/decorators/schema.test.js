/* global Model:true, JSData:true */
import {assert} from 'chai'

export function init () {
  describe('schema', function () {
    it('should define properties on prototype', function (done) {
      class User extends Model {}

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
            assert.isFunction(getter, 'original getter should be provided')
            return 'foo'
          },
          set: function (value, setter) {
            assert.isFunction(setter, 'original setter should be provided')
            didSetName = value
          }
        },
        role: {
          track: true,
          get: function (getter) {
            assert.isFunction(getter, 'original getter should be provided')
            return 'foo2'
          },
          set: function (value, setter) {
            assert.isFunction(setter, 'original setter should be provided')
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

      assert.equal(enumeratedKeys.length, keys.length, 'should have keys enumerated')

      user.on('change', function (_user, changes) {
        assert.isTrue(_user === user, 'event handler should get instance')
        assert.isObject(changes, '"changes" should be an object')
        changeCallCount++
      })
      user.on('change:title', function (_user, value) {
        assert.isTrue(_user === user, 'event handler should get instance')
        assert.isString(value, '"value" should be provided')
        changeTitleCallCount++
      })
      user.on('change:level', function (_user, value) {
        assert.isTrue(_user === user, 'event handler should get instance')
        assert.isNumber(value, '"value" should be provided')
        changeLevelCallCount++
      })

      assert.equal(user.id, 1, 'id should have a value')
      assert.isDefined(user.age, 30, 'age should have a value')
      assert.isDefined(user.title, 'boss', 'title should have a value')
      assert.isDefined(user.level, 1, 'level should have a value')
      assert.equal(user.name, 'foo', 'should allow custom getter')
      user.name = 'bar'
      assert.equal(user.name, 'foo', 'should allow custom setter')
      assert.equal(didSetName, 'bar', 'custom getter should be called')
      assert.equal(user.role, 'foo2', 'should allow custom getter')
      user.role = 'bar2'
      assert.equal(user.role, 'foo2', 'should allow custom setter')
      assert.equal(didSetRole, 'bar2', 'custom getter should be called')

      assert.deepEqual(user._get('changes'), {}, 'user should not have changes')
      assert.isUndefined(user._get('changing'), 'user should NOT be changing')
      assert.isUndefined(user._get('changed'), 'user title should NOT be changing')

      user.title = 'manager'

      assert.isTrue(user._get('changing'), 'user should be changing')
      assert.deepEqual(user._get('changed'), ['title'], 'user title should be changing')
      assert.deepEqual(user._get('changes'), { title: 'manager' }, 'user should have changes')

      user.level = 2

      assert.isTrue(user._get('changing'), 'user should be changing')
      assert.deepEqual(user._get('changed'), ['title', 'level'], 'user level should be changing')
      assert.deepEqual(user._get('changes'), { title: 'manager', level: 2 }, 'user should have changes')

      // events have not fired because changes a being batched into the next event loop
      assert.equal(changeCallCount, 0, '"change" event should not have fired yet')
      assert.equal(changeTitleCallCount, 0, '"change:title" event should not have fired yet')
      assert.equal(changeLevelCallCount, 0, '"change:level" event should not have fired yet')

      setTimeout(function () {
        // changes should have been batched into the next event loop
        assert.equal(changeCallCount, 1, '"change" event should have fired once')
        assert.equal(changeTitleCallCount, 1, '"change:title" event should have fired once')
        assert.equal(changeLevelCallCount, 1, '"change:level" event should have fired once')

        assert.deepEqual(user._get('changes'), { title: 'manager', level: 2 }, 'user should have changes')
        assert.isUndefined(user._get('changing'), 'user should NOT be changing')
        assert.isUndefined(user._get('changed'), 'user title should NOT be changing')

        user.title = 'boss'

        assert.isTrue(user._get('changing'), 'user should be changing')
        assert.deepEqual(user._get('changed'), ['title'], 'user title should be changing')
        assert.isUndefined(user._get('changes').title, 'user title should NOT have changes')
        assert.equal(user._get('changes').level, 2, 'user level should have a change')
        assert.deepEqual(user._get('changes'), { level: 2 }, 'user should have 1 change')

        setTimeout(function () {
          assert.isUndefined(user._get('changes').title, 'user title should NOT have changes')
          assert.deepEqual(user._get('changes'), { level: 2 }, 'user should have 1 change')
          assert.equal(user._get('changes').level, 2, 'user level should have a change')
          assert.isUndefined(user._get('changing'), 'user should NOT be changing')
          assert.isUndefined(user._get('changed'), 'user title should NOT be changing')

          assert.equal(changeCallCount, 2, '"change" event should have fired twice')
          assert.equal(changeTitleCallCount, 2, '"change:title" event should have fired twice')
          assert.equal(changeLevelCallCount, 1, '"change:level" event should have fired only once')

          // remove event listeners
          user.off()

          done()
        }, 5)
      }, 5)
    })
    it('should validate based on json-schema.org rules', function () {
      class User extends Model {}

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

      assert.throws(function () {
        user.age = 'foo'
      }, Error, 'type: Expected: number. Actual: string', 'should require a number')
      assert.throws(function () {
        user.age = {}
      }, Error, 'type: Expected: number. Actual: object', 'should require a number')
      assert.doesNotThrow(function () {
        user.age = undefined
      }, 'should accept undefined')
      assert.throws(function () {
        user.title = 1234
      }, Error, 'type: Expected: string or null. Actual: number', 'should require a string or null')
      assert.doesNotThrow(function () {
        user.title = 'foo'
      }, 'should accept a string')
      assert.doesNotThrow(function () {
        user.title = null
      }, 'should accept null')
      assert.doesNotThrow(function () {
        user.title = undefined
      }, 'should accept undefined')

      assert.throws(function () {
        new User({ age: 'foo' })
      }, Error, 'type: Expected: number. Actual: string', 'should validate on create')

      assert.doesNotThrow(function () {
        new User({ age: 'foo' }, { noValidate: true })
      }, 'should NOT validate on create')
    })
  })
}
