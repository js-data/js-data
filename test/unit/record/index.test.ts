import { assert, JSData, objectsEqual } from '../../_setup'

describe('Record', () => {
  it('should be a constructor function', () => {
    assert.equal(typeof JSData.Record, 'function', 'should be a function')
    let instance = new JSData.Record()
    assert(instance instanceof JSData.Record, 'instance should be an instance')
    instance = new JSData.Record({ foo: 'bar' })
    objectsEqual(instance, { foo: 'bar' }, 'instance should get initialization properties')
  })

  it('should allow instance events (assignment operator)', done => {
    let changed = false
    const FooMapper = new JSData.Mapper({
      name: 'foo',
      schema: {
        properties: {
          bar: { type: 'string', track: true }
        }
      }
    })
    const foo = FooMapper.createRecord({ id: 1 })

    setTimeout(() => {
      if (!changed) {
        done('failed to fire change event')
      }
    }, 1000)

    foo.on('change', () => {
      changed = true
      done()
    })

    foo.bar = 'baz'
  })

  it('should allow instance events (setter method)', done => {
    let changed = false
    const FooMapper = new JSData.Mapper({
      name: 'foo',
      schema: {
        properties: {
          bar: { type: 'string', track: true }
        }
      }
    })
    const foo = FooMapper.createRecord({ id: 1 })

    setTimeout(() => {
      if (!changed) {
        done('failed to fire change event')
      }
    }, 1000)

    foo.on('change', () => {
      changed = true
      done()
    })

    foo.set('bar', 'baz')
  })

  it('should throw if a Record class does not have a Mapper', () => {
    const record = new JSData.Record()
    assert.throws(
      () => {
        record._mapper()
      },
      Error,
      '[Record#_mapper:] mapper not found\nhttp://www.js-data.io/v3.0/docs/errors#404'
    )
  })

  it('should throw a validation error on instantiation', () => {
    const store = new JSData.DataStore()
    store.defineMapper('user', {
      schema: {
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      }
    })
    try {
      store.createRecord('user', { name: 1234, age: 30 })
    } catch (err) {
      assert.equal(err.message, 'validation failed')
      assert.deepEqual(err.errors, [
        {
          expected: 'one of (string)',
          actual: 'number',
          path: 'name'
        }
      ])
    }
  })

  it('should skip validation on instantiation', () => {
    const store = new JSData.DataStore()
    store.defineMapper('user', {
      schema: {
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      }
    })
    assert.doesNotThrow(() => {
      store.createRecord('user', { name: 1234, age: 30 }, { noValidate: true })
    })
  })

  it('should throw a validation error on property assignment', () => {
    const store = new JSData.DataStore()
    store.defineMapper('user', {
      schema: {
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      }
    })
    const user = store.createRecord('user', { name: 'John', age: 30 })
    try {
      user.name = 1234
    } catch (err) {
      assert.equal(err.message, 'validation failed')
      assert.deepEqual(err.errors, [
        {
          expected: 'one of (string)',
          actual: 'number',
          path: 'name'
        }
      ])
    }
  })

  it('should allow validtion on set to be disabled', () => {
    const store = new JSData.DataStore()
    store.defineMapper('user', {
      schema: {
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      },
      validateOnSet: false
    })
    const user = store.createRecord('user', { name: 'John', age: 30 })
    assert.doesNotThrow(() => {
      user.name = 1234
    })
  })

  it('should be saved or unsaved', () => {
    const store = new JSData.DataStore()
    store.defineMapper('user')
    const user = store.createRecord('user', { id: 1 })
    const user2 = store.createRecord('user')
    assert.equal(user.isNew(), false)
    assert.equal(user2.isNew(), true)
  })
})
