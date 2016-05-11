import { assert, JSData } from '../../_setup'

describe('Record#changes', function () {
  const makeAdapter = function () {
    const self = this
    return {
      find (mapper, id, opts) {
        if (mapper.name === 'organization') {
          return Promise.resolve(self.data.organization2)
        } else {
          return Promise.resolve()
        }
      },
      findAll (mapper, query, opts) {
        if (mapper.name === 'profile') {
          return Promise.resolve([self.data.profile4])
        } else if (mapper.name === 'group') {
          return Promise.resolve([self.data.group3])
        } else if (mapper.name === 'comment') {
          return Promise.resolve([self.data.comment3])
        } else if (mapper.name === 'user') {
          return Promise.resolve([self.data.user1])
        }
        return Promise.resolve([])
      }
    }
  }

  it('should be an instance method', function () {
    const Record = JSData.Record
    const record = new Record()
    assert.equal(typeof record.loadRelations, 'function')
    assert.strictEqual(record.loadRelations, Record.prototype.loadRelations)
  })

  it('should load relations', async function () {
    const mockAdapter = makeAdapter.call(this)
    const store = this.store
    const user = store.createRecord('user', this.data.user1)
    store.registerAdapter('mock', mockAdapter, { default: true })

    await user.loadRelations(['organization', 'profile', 'comments', 'group'])

    assert.objectsEqual(user.organization, this.data.organization2)
    assert.objectsEqual(user.profile, this.data.profile4)
    assert.objectsEqual(user.comments, [this.data.comment3])
    assert.objectsEqual([user.groups[0].toJSON()], [this.data.group3])
  })

  it('should load relations', async function () {
    const store = this.store
    const user = store.createRecord('user', this.data.user1)
    store.registerAdapter('mock', {
      findAll () { return Promise.resolve([]) }
    }, { default: true })

    await user.loadRelations(['profile'])

    assert.equal(user.profile, undefined)
  })

  it('should load localKeys relations', async function () {
    const mockAdapter = makeAdapter.call(this)
    const store = this.store
    const group = store.createRecord('group', this.data.group3)
    store.registerAdapter('mock', mockAdapter, { default: true })

    await group.loadRelations(['user'])

    assert.objectsEqual(group.users, [this.data.user1])
  })

  it('should load belongsTo relations using a DataStore', async function () {
    const mockAdapter = makeAdapter.call(this)
    const store = this.store
    const user = store.add('user', this.data.user1)
    store.registerAdapter('mock', mockAdapter, { default: true })

    await user.loadRelations('organization')

    assert.objectsEqual(user.organization, this.data.organization2)
    assert.strictEqual(user.organization, store.get('organization', user.organizationId))
  })

  it('should load relations with custom load method', async function () {
    const store = new JSData.DataStore()
    store.defineMapper('foo', {
      relations: {
        hasMany: {
          bar: {
            localField: 'bars',
            foreignKey: 'fooId'
          }
        }
      }
    })
    store.defineMapper('bar', {
      relations: {
        belongsTo: {
          foo: {
            localField: 'foo',
            foreignKey: 'fooId',
            load (BarMapper, Relation, bar, opts) {
              return Promise.resolve({ id: 2 })
            }
          }
        }
      }
    })
    const bar = store.add('bar', { id: 1, fooId: 2 })
    await bar.loadRelations('foo')
    assert.equal(bar.foo.id, 2)
  })
})
