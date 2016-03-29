import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test.cb.skip('should define properties on prototype', (t) => {
  try {
    let didSetName = false
    let didSetRole = false
    let changeCallCount = 0
    let changeTitleCallCount = 0
    let changeLevelCallCount = 0

    const User = new JSData.Mapper({
      name: 'user',
      schema: {
        properties: {
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
              t.is(typeof getter, 'function', 'original getter should be provided')
              return 'foo'
            },
            set: function (value, setter) {
              t.is(typeof setter, 'function', 'original setter should be provided')
              didSetName = value
            }
          },
          role: {
            track: true,
            get: function (getter) {
              t.is(typeof getter, 'function', 'original getter should be provided')
              return 'foo2'
            },
            set: function (value, setter) {
              t.is(typeof setter, 'function', 'original setter should be provided')
              didSetRole = value
            }
          }
        }
      }
    })

    const user = User.createRecord({ id: 1, age: 30, title: 'boss', level: 1, name: 'foo', role: 'foo2' })

    const keys = ['id', 'age', 'title', 'level', 'name', 'role']
    const enumeratedKeys = []

    for (var key in user) {
      enumeratedKeys.push(key)
    }

    t.same(enumeratedKeys, keys, 'should have keys enumerated')

    user.on('change', function (_user, changes) {
      t.ok(_user === user, 'event handler should get instance')
      t.ok(changes, '"changes" should be an object')
      changeCallCount++
    })
    user.on('change:title', function (_user, value) {
      t.ok(_user === user, 'event handler should get instance')
      t.is(typeof value, 'string', '"value" should be provided')
      changeTitleCallCount++
    })
    user.on('change:level', function (_user, value) {
      t.ok(_user === user, 'event handler should get instance')
      t.is(typeof value, 'number', '"value" should be provided')
      changeLevelCallCount++
    })

    t.is(user.id, 1, 'id should have a value')
    t.ok(user.age, 30, 'age should have a value')
    t.ok(user.title, 'boss', 'title should have a value')
    t.ok(user.level, 1, 'level should have a value')
    t.is(user.name, 'foo', 'should allow custom getter')
    user.name = 'bar'
    t.is(user.name, 'foo', 'should allow custom setter')
    t.is(didSetName, 'bar', 'custom getter should be called')
    t.is(user.role, 'foo2', 'should allow custom getter')
    user.role = 'bar2'
    t.is(user.role, 'foo2', 'should allow custom setter')
    t.is(didSetRole, 'bar2', 'custom getter should be called')

    t.same(user._get('changes'), {}, 'user should not have changes')
    t.notOk(user._get('changing'), 'user should NOT be changing')
    t.notOk(user._get('changed'), 'user title should NOT be changing')

    user.title = 'manager'

    t.ok(user._get('changing'), 'user should be changing')
    t.same(user._get('changed'), ['title'], 'user title should be changing')
    t.same(user._get('changes'), { title: 'manager' }, 'user should have changes')

    user.level = 2

    t.ok(user._get('changing'), 'user should be changing')
    t.same(user._get('changed'), ['title', 'level'], 'user level should be changing')
    t.same(user._get('changes'), { title: 'manager', level: 2 }, 'user should have changes')

    // events have not fired because changes a being batched into the next event loop
    t.is(changeCallCount, 0, '"change" event should not have fired yet')
    t.is(changeTitleCallCount, 0, '"change:title" event should not have fired yet')
    t.is(changeLevelCallCount, 0, '"change:level" event should not have fired yet')

    setTimeout(function () {
      try {
        // changes should have been batched into the next event loop
        t.is(changeCallCount, 1, '"change" event should have fired once')
        t.is(changeTitleCallCount, 1, '"change:title" event should have fired once')
        t.is(changeLevelCallCount, 1, '"change:level" event should have fired once')

        t.same(user._get('changes'), { title: 'manager', level: 2 }, 'user should have changes')
        t.notOk(user._get('changing'), 'user should NOT be changing')
        t.notOk(user._get('changed'), 'user title should NOT be changing')

        user.title = 'boss'

        t.ok(user._get('changing'), 'user should be changing')
        t.same(user._get('changed'), ['title'], 'user title should be changing')
        t.notOk(user._get('changes').title, 'user title should NOT have changes')
        t.is(user._get('changes').level, 2, 'user level should have a change')
        t.same(user._get('changes'), { level: 2 }, 'user should have 1 change')

        setTimeout(function () {
          try {
            t.notOk(user._get('changes').title, 'user title should NOT have changes')
            t.same(user._get('changes'), { level: 2 }, 'user should have 1 change')
            t.is(user._get('changes').level, 2, 'user level should have a change')
            t.notOk(user._get('changing'), 'user should NOT be changing')
            t.notOk(user._get('changed'), 'user title should NOT be changing')

            t.is(changeCallCount, 2, '"change" event should have fired twice')
            t.is(changeTitleCallCount, 2, '"change:title" event should have fired twice')
            t.is(changeLevelCallCount, 1, '"change:level" event should have fired only once')

            // remove event listeners
            user.off()

            t.end()
          } catch (err) {
            t.end(err)
          }
        }, 50)
      } catch (err) {
        t.end(err)
      }
    }, 50)
  } catch (err) {
    t.end(err)
  }
})
test('should validate based on json-schema.org rules', (t) => {
  const User = new JSData.Mapper({
    name: 'user',
    schema: {
      properties: {
        age: {
          type: 'number'
        },
        title: {
          type: ['string', 'null']
        },
        level: {}
      }
    }
  })

  const user = User.createRecord({ id: 1, age: 30, title: 'boss', level: 1 })

  t.throws(function () {
    user.age = 'foo'
  }, Error, 'type: Expected: number. Actual: string', 'should require a number')
  t.throws(function () {
    user.age = {}
  }, Error, 'type: Expected: number. Actual: object', 'should require a number')
  t.notThrows(function () {
    user.age = undefined
  }, 'should accept undefined')
  t.throws(function () {
    user.title = 1234
  }, Error, 'type: Expected: string or null. Actual: number', 'should require a string or null')
  t.notThrows(function () {
    user.title = 'foo'
  }, 'should accept a string')
  t.notThrows(function () {
    user.title = null
  }, 'should accept null')
  t.notThrows(function () {
    user.title = undefined
  }, 'should accept undefined')

  t.throws(function () {
    const user = User.createRecord({ age: 'foo' })
    user.set('foo', 'bar')
  }, Error, 'type: Expected: number. Actual: string', 'should validate on create')

  t.notThrows(function () {
    const user = User.createRecord({ age: 'foo' }, { noValidate: true })
    user.set('foo', 'bar')
  }, 'should NOT validate on create')
})
