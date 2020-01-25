import { assert, JSData } from '../../_setup'

describe('DataStore#update', function () {
  it('should be an instance method', function () {
    const DataStore = JSData.DataStore
    const store = new DataStore()
    assert.equal(typeof store.update, 'function')
    assert.strictEqual(store.update, DataStore.prototype.update)
  })
  it('should update', async function () {
    const id = 1
    const props = { id, name: 'John' }
    this.store.registerAdapter('mock', {
      update () {
        props.foo = 'bar'
        return JSData.utils.resolve(props)
      }
    }, { default: true })
    const user = await this.store.update('user', id, props)
    assert.equal(user.foo, 'bar', 'user was updated')
    assert(user instanceof this.store.getMapper('user').recordClass, 'user is a record')
  })
})
