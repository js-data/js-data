import { assert, JSData } from '../../_setup'

describe('DataStore#createMany', function () {
  it('should be an instance method', function () {
    const DataStore = JSData.DataStore
    const store = new DataStore()
    assert.equal(typeof store.createMany, 'function')
    assert.strictEqual(store.createMany, DataStore.prototype.createMany)
  })
  it('should createMany', async function () {
    const props = [{ name: 'John' }]
    this.store.registerAdapter('mock', {
      createMany () {
        props[0].id = 1
        return JSData.utils.resolve(props)
      }
    }, { default: true })
    const users = await this.store.createMany('user', props)
    assert(users[0][this.store.getMapper('user').idAttribute], 'new user has an id')
    assert(users[0] instanceof this.store.getMapper('user').recordClass, 'user is a record')
  })
})
