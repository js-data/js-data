import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

// Most filter tests are on the Query class
test('should work', (t) => {
  const collection = t.context.PostCollection
  const p1 = t.context.data.p1
  const p2 = t.context.data.p2
  const p3 = t.context.data.p3
  const p4 = t.context.data.p4
  const p5 = t.context.data.p5
  t.context.store.add('post', [p1, p2, p3, p4, p5])

  let params = {
    author: 'John'
  }

  t.context.objectsEqual(collection.filter(params), [p1], 'should default a string to "=="')
})
test.skip('should allow use of scopes', (t) => {
  const store = new JSData.DataStore({
    scopes: {
      defaultScope: {
        foo: 'bar'
      }
    }
  })
  store.defineMapper('foo', {
    scopes: {
      second: {
        beep: 'boop'
      },
      limit: {
        limit: 1
      }
    }
  })
  let foos = store.add('foo', [
    { id: 1, foo: 'bar' },
    { id: 2, beep: 'boop' },
    { id: 3, foo: 'bar', beep: 'boop' },
    { id: 4, foo: 'bar', beep: 'boop' },
    { id: 5, foo: 'bar', beep: 'boop' },
    { id: 6, foo: 'bar', beep: 'boop' },
    { id: 7, foo: 'bar', beep: 'boop' },
    { id: 8, foo: 'bar', beep: 'boop' }
  ])
  t.context.objectsEqual(store.filter('foo', null, {
    scope: ['second', 'limit']
  }), [foos[2]])
  t.context.objectsEqual(store.filter('foo', null, {
    scope: ['second']
  }), store.filter('foo', {
    foo: 'bar',
    beep: 'boop'
  }))
  t.context.objectsEqual(store.filter('foo'), store.filter('foo', {
    foo: 'bar'
  }))
})
