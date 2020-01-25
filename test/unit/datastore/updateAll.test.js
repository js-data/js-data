import { assert, JSData } from '../../_setup'

describe('DataStore#updateAll', function () {
  it('should be an instance method', function () {
    const DataStore = JSData.DataStore
    const store = new DataStore()
    assert.equal(typeof store.updateAll, 'function')
    assert.strictEqual(store.updateAll, DataStore.prototype.updateAll)
  })
  it('should updateAll', async function () {
    const query = { name: 'John' }
    const props = [{ id: 1, name: 'John' }]
    this.store.registerAdapter('mock', {
      updateAll () {
        props[0].foo = 'bar'
        return JSData.utils.resolve(props)
      }
    }, { default: true })
    const users = await this.store.updateAll('user', props, query)
    assert.equal(users[0].foo, 'bar', 'user was updated')
    assert(users[0] instanceof this.store.getMapper('user').recordClass, 'user is a record')
  })
})
