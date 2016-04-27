import { assert, JSData } from '../../_setup'

describe('Record', function () {
  it('should be a constructor function', function () {
    assert.equal(typeof JSData.Record, 'function', 'should be a function')
    let instance = new JSData.Record()
    assert(instance instanceof JSData.Record, 'instance should be an instance')
    instance = new JSData.Record({ foo: 'bar' })
    assert.objectsEqual(instance, { foo: 'bar' }, 'instance should get initialization properties')
  })

  it('should allow instance events (assignment operator)', function (done) {
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

    foo.on('change', (Foo, foo) => {
      changed = true
      done()
    })

    foo.bar = 'baz'
  })

  it('should allow instance events (setter method)', function (done) {
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

    foo.on('change', (Foo, foo) => {
      changed = true
      done()
    })

    foo.set('bar', 'baz')
  })

  it('should throw if a Record class does not have a Mapper', function () {
    const record = new JSData.Record()
    assert.throws(() => {
      record._mapper()
    }, Error, '[Record#_mapper:] mapper not found\nhttp://www.js-data.io/v3.0/docs/errors#404')
  })

  it('hashCode should work', function () {
    const BarMapper = new JSData.Mapper({ name: 'bar', idAttribute: '_id' })
    let bar = BarMapper.createRecord({ _id: 1 })
    assert.equal(bar.hashCode(), 1)
  })
})
