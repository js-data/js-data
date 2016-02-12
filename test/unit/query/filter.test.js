export function init () {
  describe('filter', function () {
    it('should work', function () {
      const Test = this
      const collection = Test.PostCollection
      const p1 = Test.data.p1
      const p2 = Test.data.p2
      const p3 = Test.data.p3
      const p4 = Test.data.p4
      const p5 = Test.data.p5

      p1.roles = ['admin']
      p2.roles = ['admin', 'dev']
      p3.roles = ['admin', 'dev']
      p4.roles = []
      p5.roles = ['admin', 'dev', 'owner']

      Test.store.add('post', [p1, p2, p3, p4, p5])

      let params = {
        author: 'John'
      }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p1], 'should default a string to "=="')

      params = {
        author: 'Adam',
        id: 9
      }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p5], 'should default a string to "=="')

      params = {
        where: {
          author: 'John'
        }
      }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p1], 'should default a string to "=="')

      params.where.author = {
        '==': 'John'
      }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p1], 'should accept normal "==" clause')

      params.where.author = {
        '===': null
      }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [], 'should accept normal "===" clause')

      params.where.author = {
        '!=': 'John'
      }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p2, p3, p4, p5], 'should accept normal "!=" clause')

      params.where = {
        age: {
          '>': 31
        }
      }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p3, p4, p5], 'should accept normal ">" clause')

      params.where = {
        age: {
          '>=': 31
        }
      }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p2, p3, p4, p5], 'should accept normal ">=" clause')

      params.where = {
        age: {
          '<': 31
        }
      }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p1], 'should accept normal "<" clause')

      params.where = {
        age: {
          '>': 30,
          '<': 33
        }
      }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p2, p3], 'should accept dual "<" and ">" clause')

      params.where = {
        age: {
          '|>': 30,
          '|<': 33
        }
      }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3, p4, p5], 'should accept or "<" and ">" clause')

      params.where = {
        age: {
          '|<=': 31
        },
        author: {
          '|==': 'Adam'
        }
      }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p4, p5], 'should accept or "<=" and "==" clause')

      params.where = {
        age: {
          '<=': 31
        }
      }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p1, p2], 'should accept normal "<=" clause')

      params.where = {
        age: {
          'in': [30, 33]
        },
        author: {
          'in': ['John', 'Sally', 'Adam']
        }
      }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p1, p4, p5], 'should accept normal "in" clause')

      params.where = {
        author: {
          'in': 'John'
        }
      }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p1], 'should accept normal "in" clause with a string')

      params.where = {
        author: {
          'notIn': 'John'
        }
      }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p2, p3, p4, p5], 'should accept normal "notIn" clause with a string')

      params.where = {
        age: {
          '|in': [31]
        },
        id: {
          '|in': [8]
        }
      }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p2, p4], 'should accept and/or clause')

      params.where = {
        id: {
          'notIn': [8]
        }
      }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3, p5], 'should accept notIn clause')

      params.where = { age: { garbage: 'should have no effect' } }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3, p4, p5], 'should return all elements')

      params.where = { author: { like: 'Ada%' } }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p4, p5], 'should support like')

      params.where = { author: { like: '%a%' } }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p2, p4, p5], 'should support like')

      params.where = { author: { notLike: 'Ada%' } }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3], 'should support notLike')

      params.where = { roles: { isectEmpty: ['admin'] } }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p4], 'should support isectEmpty')

      params.where = { roles: { isectNotEmpty: ['admin'] } }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3, p5], 'should support isectNotEmpty')

      params.where = { roles: { notContains: 'admin' } }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p4], 'should support notContains')

      params.where = { age: { '!==': 33 } }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3], 'should support !==')

      params = undefined

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3, p4, p5], 'should do nothing')

      params = { offset: 4 }

      Test.assert.objectsEqual(collection.query().filter(params).run(), [p5], 'should support offset')
    })
    it('should allow custom filter function', function () {
      const Test = this
      const p1 = Test.data.p1
      const p2 = Test.data.p2
      const p3 = Test.data.p3
      const p4 = Test.data.p4
      Test.store.add('post', [p1, p2, p3, p4])

      Test.assert.objectsEqual(Test.store.query('post').filter(function (item) {
        return item.author === 'John' || item.age % 30 === 1
      }).run(), [p1, p2], 'should keep p1 and p2')
    })
    it('should filter by nested keys', function () {
      const Test = this
      const store = new Test.JSData.DataStore()
      store.defineMapper('thing')
      let things = [
        {
          id: 1,
          foo: {
            bar: 1
          }
        },
        {
          id: 2,
          foo: {
            bar: 2
          }
        },
        {
          id: 3,
          foo: {
            bar: 3
          }
        },
        {
          id: 4,
          foo: {
            bar: 4
          }
        }
      ]

      store.add('thing', things)

      let params = {
        where: {
          'foo.bar': {
            '>': 2
          }
        }
      }

      Test.assert.objectsEqual(store.query('thing').filter(params).run(), [things[2], things[3]], 'should filter by a nested key')
    })
    it('should support the "like" operator', function () {
      const Test = this
      const users = [
        { id: 1, name: 'foo' },
        { id: 2, name: 'xfoo' },
        { id: 3, name: 'foox' },
        { id: 4, name: 'xxfoo' },
        { id: 5, name: 'fooxx' },
        { id: 6, name: 'xxfooxx' },
        { id: 7, name: 'xxfooxxfooxx' },
        { id: 8, name: 'fooxxfoo' },
        { id: 9, name: 'fooxfoo' },
        { id: 10, name: 'fooxxfoox' },
      ]
      Test.store.add('user', users)

      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { like: 'foo' } } }).run(), [users[0]], 'foo')
      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { like: '_foo' } } }).run(), [users[1]], '_foo')
      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { like: 'foo_' } } }).run(), [users[2]], 'foo_')
      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { like: '%foo' } } }).run(), [users[0], users[1], users[3], users[7], users[8]], '%foo')
      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { likei: 'FOO%' } } }).run(), [users[0], users[2], users[4], users[7], users[8], users[9]], 'FOO%')
      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { like: '%foo%' } } }).run(), users, '%foo%')
      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { like: '%foo%foo%' } } }).run(), [users[6], users[7], users[8], users[9]], '%foo%foo%')
      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { like: 'foo%foo' } } }).run(), [users[7], users[8]], 'foo%foo')
      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { like: 'foo_foo' } } }).run(), [users[8]], 'foo_foo')
      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { like: 'foo%foo_' } } }).run(), [users[9]], 'foo%foo')

      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { notLike: 'foo' } } }).run(), [users[1], users[2], users[3], users[4], users[5], users[6], users[7], users[8], users[9]])
      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { notLike: '_foo' } } }).run(), [users[0], users[2], users[3], users[4], users[5], users[6], users[7], users[8], users[9]])
      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { notLike: 'foo_' } } }).run(), [users[0], users[1], users[3], users[4], users[5], users[6], users[7], users[8], users[9]])
      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { notLike: '%foo' } } }).run(), [users[2], users[4], users[5], users[6], users[9]])
      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { notLike: 'foo%' } } }).run(), [users[1], users[3], users[5], users[6]])
      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { notLike: '%foo%' } } }).run(), [])
      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { notLike: '%foo%foo%' } } }).run(), [users[0], users[1], users[2], users[3], users[4], users[5]])
      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { notLike: 'foo%foo' } } }).run(), [users[0], users[1], users[2], users[3], users[4], users[5], users[6], users[9]])
      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { notLike: 'foo_foo' } } }).run(), [users[0], users[1], users[2], users[3], users[4], users[5], users[6], users[7], users[9]])
      Test.assert.objectsEqual(Test.store.query('user').filter({ where: { name: { notLike: 'foo%foo_' } } }).run(), [users[0], users[1], users[2], users[3], users[4], users[5], users[6], users[7], users[8]])
    })
  })
}
