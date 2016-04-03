import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be a constructor function', (t) => {
  t.is(typeof JSData.Record, 'function', 'should be a function')
  let instance = new JSData.Record()
  t.ok(instance instanceof JSData.Record, 'instance should be an instance')
  instance = new JSData.Record({ foo: 'bar' })
  t.context.objectsEqual(instance, { foo: 'bar' }, 'instance should get initialization properties')
})

test.cb('should allow instance events (assignment operator)', (t) => {
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
      t.end('failed to fire change event')
    }
  }, 1000)

  foo.on('change', (Foo, foo) => {
    changed = true
    t.end()
  })

  foo.bar = 'baz'
})

test.cb('should allow instance events (setter method)', (t) => {
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
      t.end('failed to fire change event')
    }
  }, 1000)

  foo.on('change', (Foo, foo) => {
    changed = true
    t.end()
  })

  foo.set('bar', 'baz')
})

test('should throw if a Record class does not have a Mapper', (t) => {
  const record = new JSData.Record()
  t.throws(() => {
    record._mapper()
  }, Error, 'This recordClass has no Mapper!')
})

test('hashCode should work', (t) => {
  const BarMapper = new JSData.Mapper({ name: 'bar', idAttribute: '_id' })
  let bar = BarMapper.createRecord({ _id: 1 })
  t.is(bar.hashCode(), 1)
})
