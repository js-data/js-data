import { assert, JSData, sinon } from '../../_setup'

describe('Mapper', function () {
  it('should be a constructor function', function () {
    const Mapper = JSData.Mapper
    assert.equal(typeof Mapper, 'function')
    const mapper = new Mapper({ name: 'foo' })
    assert.equal(mapper instanceof Mapper, true)
  })
  it('should require a name', function () {
    assert.throws(
      () => {
        new JSData.Mapper() // eslint-disable-line
      },
      Error,
      '[new Mapper:opts.name] expected: string, found: undefined\nhttp://www.js-data.io/v3.0/docs/errors#400'
    )
  })
  it('should have events', function () {
    const User = new JSData.Mapper({ name: 'user' })
    const listener = sinon.stub()
    User.on('bar', listener)
    User.emit('bar')
    assert.equal(listener.calledOnce, true)
  })
  it('should only work with known crud methods', function () {
    const User = new JSData.Mapper({ name: 'user' })
    assert.throws(
      () => {
        User.crud('foobar')
      },
      Error,
      '[Mapper#crud:foobar] method not found\nhttp://www.js-data.io/v3.0/docs/errors#404'
    )
  })
  it('should notify', function (done) {
    const stub = sinon.stub()
    const User = new JSData.Mapper({ name: 'user', notify: true })
    User.on('beforeUpdate', stub)
    User.beforeUpdate(1, { name: 'John' }, { op: 'beforeUpdate' })
    setTimeout(() => {
      assert.equal(stub.calledOnce, true)
      done()
    }, 10)
  })
  it('should work without a record class', function () {
    const User = new JSData.Mapper({ name: 'user', recordClass: false })
    assert.equal(User.recordClass, false)
  })
  it('should add methods to record class', function () {
    const User = new JSData.Mapper({
      name: 'user',
      methods: {
        foo () {
          return 'bar'
        }
      }
    })
    const user = User.createRecord()
    assert.equal(user.foo(), 'bar')
    const descriptor = Object.getOwnPropertyDescriptor(User.recordClass.prototype, 'foo')
    assert(descriptor.writable)
    assert(descriptor.configurable)
    assert.equal(descriptor.enumerable, false)
    assert.equal(typeof descriptor.value, 'function')
  })
})
