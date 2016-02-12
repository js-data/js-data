export function init () {
  describe('filter', function () {
    // Most filter tests are on the Query class
    it('should work', function () {
      const Test = this
      const collection = Test.PostCollection
      const p1 = Test.data.p1
      const p2 = Test.data.p2
      const p3 = Test.data.p3
      const p4 = Test.data.p4
      const p5 = Test.data.p5
      Test.store.add('post', [p1, p2, p3, p4, p5])

      let params = {
        author: 'John'
      }

      Test.assert.objectsEqual(collection.filter(params), [p1], 'should default a string to "=="')
    })
    it.skip('should allow use of scopes', function () {
      const Test = this
      const store = new Test.JSData.DataStore({
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
      Test.assert.objectsEqual(store.filter('foo', null, {
        scope: ['second', 'limit']
      }), [foos[2]])
      Test.assert.objectsEqual(store.filter('foo', null, {
        scope: ['second']
      }), store.filter('foo', {
        foo: 'bar',
        beep: 'boop'
      }))
      Test.assert.objectsEqual(store.filter('foo'), store.filter('foo', {
        foo: 'bar'
      }))
    })
  })
}
