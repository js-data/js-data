import { assert, JSData } from '../../_setup'

describe('Collection#filter', function () {
  // Most filter tests are on the Query class
  it('should work', function () {
    const collection = this.PostCollection
    const p1 = this.data.p1
    const p2 = this.data.p2
    const p3 = this.data.p3
    const p4 = this.data.p4
    const p5 = this.data.p5
    this.store.add('post', [p1, p2, p3, p4, p5])

    const params = {
      author: 'John'
    }

    assert.objectsEqual(collection.filter(params), [p1], 'should default a string to "=="')
  })
  it.skip('should allow use of scopes', function () {
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
    const foos = store.add('foo', [
      { id: 1, foo: 'bar' },
      { id: 2, beep: 'boop' },
      { id: 3, foo: 'bar', beep: 'boop' },
      { id: 4, foo: 'bar', beep: 'boop' },
      { id: 5, foo: 'bar', beep: 'boop' },
      { id: 6, foo: 'bar', beep: 'boop' },
      { id: 7, foo: 'bar', beep: 'boop' },
      { id: 8, foo: 'bar', beep: 'boop' }
    ])
    assert.objectsEqual(store.filter('foo', null, {
      scope: ['second', 'limit']
    }), [foos[2]])
    assert.objectsEqual(store.filter('foo', null, {
      scope: ['second']
    }), store.filter('foo', {
      foo: 'bar',
      beep: 'boop'
    }))
    assert.objectsEqual(store.filter('foo'), store.filter('foo', {
      foo: 'bar'
    }))
  })
})
