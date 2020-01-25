import { assert, JSData } from '../../_setup'

describe('DataStore#updateMany', function () {
  it('should be an instance method', function () {
    const DataStore = JSData.DataStore
    const store = new DataStore()
    assert.equal(typeof store.updateMany, 'function')
    assert.strictEqual(store.updateMany, DataStore.prototype.updateMany)
  })
  it('should updateMany', async function () {
    const props = [{ id: 1, name: 'John' }]
    this.store.registerAdapter('mock', {
      updateMany () {
        props[0].foo = 'bar'
        return JSData.utils.resolve(props)
      }
    }, { default: true })
    const users = await this.store.updateMany('user', props)
    assert.equal(users[0].foo, 'bar', 'user was updated')
    assert(users[0] instanceof this.store.getMapper('user').recordClass, 'user is a record')
  })
})
