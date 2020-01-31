import { assert, JSData } from '../../_setup'

describe('DataStore#create', () => {
  it('should be an instance method', () => {
    const DataStore = JSData.DataStore
    const store = new DataStore()
    assert.equal(typeof store.create, 'function')
    assert.strictEqual(store.create, DataStore.prototype.create)
  })
  it('should create', async function () {
    const props: any = { name: 'John' }
    this.store.registerAdapter(
      'mock',
      {
        create () {
          props.id = 1
          return JSData.utils.resolve(props)
        }
      },
      { default: true }
    )
    const user = await this.store.create('user', props)
    assert(user[this.store.getMapper('user').idAttribute], 'new user has an id')
    assert(user instanceof this.store.getMapper('user').recordClass, 'user is a record')
  })
})
