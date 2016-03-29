import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const DataStore = JSData.DataStore
  const store = new DataStore()
  t.is(typeof store.defineMapper, 'function')
  t.ok(store.defineMapper === DataStore.prototype.defineMapper)
})
test('should create a new mapper', (t) => {
  const Container = JSData.Container
  let container = new Container()
  let mapper = container.defineMapper('foo')
  t.ok(mapper === container._mappers.foo)
  t.ok(mapper instanceof JSData.Mapper)
  t.ok(mapper.getAdapters() === container.getAdapters())

  class Foo extends JSData.Mapper {}
  container = new Container({
    mapperClass: Foo
  })
  mapper = container.defineMapper('foo')
  t.ok(mapper === container._mappers.foo)
  t.ok(mapper instanceof Foo)
  t.ok(mapper.getAdapters() === container.getAdapters())

  container = new Container({
    mapperDefaults: {
      foo: 'bar'
    }
  })
  mapper = container.defineMapper('foo')
  t.ok(mapper === container._mappers.foo)
  t.ok(mapper instanceof JSData.Mapper)
  t.is(mapper.foo, 'bar')
  t.ok(mapper.getAdapters() === container.getAdapters())

  container = new Container({
    mapperDefaults: {
      foo: 'bar'
    }
  })
  mapper = container.defineMapper('foo', {
    foo: 'beep'
  })
  t.ok(mapper === container._mappers.foo)
  t.ok(mapper instanceof JSData.Mapper)
  t.is(mapper.foo, 'beep')
  t.ok(mapper.getAdapters() === container.getAdapters())

  t.throws(function () {
    mapper = container.defineMapper()
  }, Error, 'name is required!')

  t.throws(function () {
    mapper = container.defineMapper({
      foo: 'bar'
    })
  }, Error, 'name is required!')

  mapper = container.defineMapper({
    foo: 'bar',
    name: 'foo'
  })
  t.is(mapper.name, 'foo')
})
