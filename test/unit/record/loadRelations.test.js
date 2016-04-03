import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

const makeAdapter = function (t) {
  return {
    find (mapper, id, opts) {
      if (mapper.name === 'organization') {
        return Promise.resolve(t.context.data.organization2)
      } else {
        return Promise.resolve()
      }
    },
    findAll (mapper, query, opts) {
      return Promise.resolve([])
    }
  }
}

test('should be an instance method', (t) => {
  const Record = JSData.Record
  const record = new Record()
  t.is(typeof record.loadRelations, 'function')
  t.ok(record.loadRelations === Record.prototype.loadRelations)
})

test('should load belongsTo relations', async (t) => {
  const mockAdapter = makeAdapter(t)
  const store = t.context.store
  const user = store.createRecord('user', t.context.data.user1)
  store.registerAdapter('mock', mockAdapter, { default: true })

  await user.loadRelations(['organization'])

  t.context.objectsEqual(t, user.organization, t.context.data.organization2)
})

test('should load belongsTo relations using a DataStore', async (t) => {
  const mockAdapter = makeAdapter(t)
  const store = t.context.store
  const user = store.add('user', t.context.data.user1)
  store.registerAdapter('mock', mockAdapter, { default: true })

  await user.loadRelations('organization')

  t.context.objectsEqual(t, user.organization, t.context.data.organization2)
  t.ok(user.organization === store.get('organization', user.organizationId))
})
