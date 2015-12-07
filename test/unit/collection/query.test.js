/* global JSData:true, Collection:true, Query:true, p1:true, p2:true, p3:true, p4:true, p5:true */
import {assert} from 'chai'

export function init () {
  describe('Query', function () {
    it('should correctly apply "where" predicates', function () {
      const collection = new Collection([
        p1,
        p2,
        p3,
        p4,
        p5
      ], 'id')
      let params = {
        author: 'John'
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p1], 'should default a string to "=="')

      params = {
        author: 'Adam',
        id: 9
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p5], 'should default a string to "=="')

      params = {
        where: {
          author: 'John'
        }
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p1], 'should default a string to "=="')

      params.where.author = {
        '==': 'John'
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p1], 'should accept normal "==" clause')

      params.where.author = {
        '===': null
      }

      assert.objectsEqual(collection.query().filter(params).run(), [], 'should accept normal "===" clause')

      params.where.author = {
        '!=': 'John'
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p2, p3, p4, p5], 'should accept normal "!=" clause')

      params.where = {
        age: {
          '>': 31
        }
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p3, p4, p5], 'should accept normal ">" clause')

      params.where = {
        age: {
          '>=': 31
        }
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p2, p3, p4, p5], 'should accept normal ">=" clause')

      params.where = {
        age: {
          '<': 31
        }
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p1], 'should accept normal "<" clause')

      params.where = {
        age: {
          '>': 30,
          '<': 33
        }
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p2, p3], 'should accept dual "<" and ">" clause')

      params.where = {
        age: {
          '|>': 30,
          '|<': 33
        }
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3, p4, p5], 'should accept or "<" and ">" clause')

      params.where = {
        age: {
          '|<=': 31
        },
        author: {
          '|==': 'Adam'
        }
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p4, p5], 'should accept or "<=" and "==" clause')

      params.where = {
        age: {
          '<=': 31
        }
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p1, p2], 'should accept normal "<=" clause')

      params.where = {
        age: {
          'in': [30, 33]
        },
        author: {
          'in': ['John', 'Sally', 'Adam']
        }
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p1, p4, p5], 'should accept normal "in" clause')

      params.where = {
        author: {
          'in': 'John'
        }
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p1], 'should accept normal "in" clause with a string')

      params.where = {
        author: {
          'notIn': 'John'
        }
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p2, p3, p4, p5], 'should accept normal "notIn" clause with a string')

      params.where = {
        age: {
          '|in': [31]
        },
        id: {
          '|in': [8]
        }
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p2, p4], 'should accept and/or clause')

      params.where = {
        id: {
          'notIn': [8]
        }
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3, p5], 'should accept notIn clause')

      params.where = { age: { garbage: 'should have no effect' } }

      assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3, p4, p5], 'should return all elements')

      params.where = { author: { like: 'Ada%' } }

      assert.objectsEqual(collection.query().filter(params).run(), [p4, p5], 'should support like')

      params.where = { author: { like: '%a%' } }

      assert.objectsEqual(collection.query().filter(params).run(), [p2, p4, p5], 'should support like')

      params.where = { author: { notLike: 'Ada%' } }

      assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3], 'should support notLike')
    })
    it('should correctly apply "orderBy" predicates', function () {
      const collection = new Collection([
        p1,
        p2,
        p3,
        p4
      ], 'id')

      let params = {
        orderBy: 'age'
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3, p4], 'should accept a single string and sort in ascending order for numbers')

      params.orderBy = 'author'

      assert.objectsEqual(collection.query().filter(params).run(), [p4, p1, p3, p2], 'should accept a single string and sort in ascending for strings')

      params.orderBy = [
        ['age', 'DESC']
      ]

      assert.objectsEqual(collection.query().filter(params).run(), [p4, p3, p2, p1], 'should accept an array of an array and sort in descending for numbers')

      params.orderBy = [
        ['author', 'DESC']
      ]

      assert.objectsEqual(collection.query().filter(params).run(), [p2, p3, p1, p4], 'should accept an array of an array and sort in descending for strings')

      params.orderBy = ['age']

      assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3, p4], 'should accept an array of a string and sort in ascending for numbers')

      params.orderBy = ['author']

      assert.objectsEqual(collection.query().filter(params).run(), [p4, p1, p3, p2], 'should accept an array of a string and sort in ascending for strings')
    })
    it('should work with multiple orderBy', function () {
      const items = [
        { id: 1, test: 1, test2: 1 },
        { id: 2, test: 2, test2: 2 },
        { id: 3, test: 3, test2: 3 },
        { id: 4, test: 1, test2: 4 },
        { id: 5, test: 2, test2: 5 },
        { id: 6, test: 3, test2: 6 },
        { id: 7, test: 1, test2: 1 },
        { id: 8, test: 2, test2: 2 },
        { id: 9, test: 3, test2: 3 },
        { id: 10, test: 1, test2: 4 },
        { id: 11, test: 2, test2: 5 },
        { id: 12, test: 3, test2: 6 }
      ]
      const collection = new Collection(items, 'id')
      let params = {}

      params.orderBy = [
        ['test', 'DESC'],
        ['test2', 'ASC'],
        ['id', 'ASC']
      ]

      assert.objectsEqual(collection.query().filter(params).run(), [
        items[2],
        items[8],
        items[5],
        items[11],
        items[1],
        items[7],
        items[4],
        items[10],
        items[0],
        items[6],
        items[3],
        items[9]
      ])

      params.orderBy = [
        ['test', 'DESC'],
        ['test2', 'ASC'],
        ['id', 'DESC']
      ]

      assert.objectsEqual(collection.query().filter(params).run(), [
        items[8],
        items[2],
        items[11],
        items[5],
        items[7],
        items[1],
        items[10],
        items[4],
        items[6],
        items[0],
        items[9],
        items[3]
      ])
    })
    it('should correctly apply "skip" predicates', function () {
      const collection = new Collection([
        p1,
        p2,
        p3,
        p4
      ], 'id')
      let params = {
        skip: 1
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p2, p3, p4], 'should skip 1')
      assert.objectsEqual(collection.query().skip(params.skip).run(), [p2, p3, p4], 'should skip 1')

      params.skip = 2
      assert.objectsEqual(collection.query().filter(params).run(), [p3, p4], 'should skip 2')
      assert.objectsEqual(collection.query().skip(params.skip).run(), [p3, p4], 'should skip 2')

      params.skip = 3
      assert.objectsEqual(collection.query().filter(params).run(), [p4], 'should skip 3')
      assert.objectsEqual(collection.query().skip(params.skip).run(), [p4], 'should skip 3')

      params.skip = 4
      assert.objectsEqual(collection.query().filter(params).run(), [], 'should skip 4')
      assert.objectsEqual(collection.query().skip(params.skip).run(), [], 'should skip 4')
    })
    it('should correctly apply "limit" predicates', function () {
      const collection = new Collection([
        p1,
        p2,
        p3,
        p4
      ], 'id')
      let params = {
        limit: 1
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p1], 'should limit to 1')
      assert.objectsEqual(collection.query().limit(params.limit).run(), [p1], 'should limit to 1')

      params.limit = 2
      assert.objectsEqual(collection.query().filter(params).run(), [p1, p2], 'should limit to 2')
      assert.objectsEqual(collection.query().limit(params.limit).run(), [p1, p2], 'should limit to 2')

      params.limit = 3
      assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3], 'should limit to 3')
      assert.objectsEqual(collection.query().limit(params.limit).run(), [p1, p2, p3], 'should limit to 3')

      params.limit = 4
      assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3, p4], 'should limit to 4')
      assert.objectsEqual(collection.query().limit(params.limit).run(), [p1, p2, p3, p4], 'should limit to 4')
    })
    it('should correctly apply "limit" and "skip" predicates together', function () {
      const collection = new Collection([
        p1,
        p2,
        p3,
        p4
      ], 'id')
      let params = {
        limit: 1,
        skip: 1
      }

      assert.objectsEqual(collection.query().filter(params).run(), [p2], 'should limit to 1 and skip 2')
      assert.objectsEqual(collection.query().skip(params.skip).limit(params.limit).run(), [p2], 'should limit to 1 and skip 2')

      params.limit = 2
      assert.objectsEqual(collection.query().filter(params).run(), [p2, p3], 'should limit to 2 and skip 1')
      assert.objectsEqual(collection.query().skip(params.skip).limit(params.limit).run(), [p2, p3], 'should limit to 2 and skip 1')

      params.skip = 2
      assert.objectsEqual(collection.query().filter(params).run(), [p3, p4], 'should limit to 2 and skip 2')
      assert.objectsEqual(collection.query().skip(params.skip).limit(params.limit).run(), [p3, p4], 'should limit to 2 and skip 2')

      params.limit = 1
      params.skip = 3
      assert.objectsEqual(collection.query().filter(params).run(), [p4], 'should limit to 1 and skip 3')
      assert.objectsEqual(collection.query().skip(params.skip).limit(params.limit).run(), [p4], 'should limit to 1 and skip 3')

      params.limit = 8
      params.skip = 0
      assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3, p4], 'should return all items')
      assert.objectsEqual(collection.query().skip(params.skip).limit(params.limit).run(), [p1, p2, p3, p4], 'should return all items')

      params.limit = 1
      params.skip = 5
      assert.objectsEqual(collection.query().filter(params).run(), [], 'should return nothing if skip if greater than the number of items')
      assert.objectsEqual(collection.query().skip(params.skip).limit(params.limit).run(), [], 'should return nothing if skip if greater than the number of items')

      params.limit = 8
      delete params.skip
      assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3, p4], 'should return all items')
      assert.throws(function () {
        collection.query().skip(params.skip).limit(params.limit).run()
      }, TypeError, 'skip: Expected number but found undefined!', 'skip() should throw error if "num" is not a number')

      delete params.limit
      params.skip = 5
      assert.objectsEqual(collection.query().filter(params).run(), [], 'should return nothing if skip if greater than the number of items')
      assert.throws(function () {
        collection.query().skip(params.skip).limit(params.limit).run()
      }, TypeError, 'limit: Expected number but found undefined!', 'limit() should throw error if "num" is not a number')
    })
    it('should allow custom filter function', function () {
      const collection = new Collection([
        p1,
        p2,
        p3,
        p4
      ], 'id')

      assert.objectsEqual(collection.query().filter(function (item) {
        return item.author === 'John' || item.age % 30 === 1
      }).run(), [p1, p2], 'should keep p1 and p2')
    })
    it('should order by nested keys', function () {
      let things = [
        {
          id: 1,
          foo: {
            bar: 'f'
          }
        },
        {
          id: 2,
          foo: {
            bar: 'a'
          }
        },
        {
          id: 3,
          foo: {
            bar: 'c'
          }
        },
        {
          id: 4,
          foo: {
            bar: 'b'
          }
        }
      ]

      const collection = new Collection(things, 'id')

      let params = {
        orderBy: [['foo.bar', 'ASC']]
      }

      assert.objectsEqual(collection.query().filter(params).run(), [things[1], things[3], things[2], things[0]], 'should order by a nested key')

      params = {
        orderBy: [['foo.bar', 'DESC']]
      }
      assert.objectsEqual(collection.query().filter(params).run(), [things[0], things[2], things[3], things[1]], 'should order by a nested key')
    })
    it('should filter by nested keys', function () {
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

      const collection = new Collection(things, 'id')

      let params = {
        where: {
          'foo.bar': {
            '>': 2
          }
        }
      }

      assert.objectsEqual(collection.query().filter(params).run(), [things[2], things[3]], 'should filter by a nested key')
    })
    it('should support the "like" operator', function () {
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
      const collection = new Collection(users, 'id')

      assert.deepEqual(collection.query().filter({ where: { name: { like: 'foo' } } }).run(), [users[0]], 'foo')
      assert.deepEqual(collection.query().filter({ where: { name: { like: '_foo' } } }).run(), [users[1]], '_foo')
      assert.deepEqual(collection.query().filter({ where: { name: { like: 'foo_' } } }).run(), [users[2]], 'foo_')
      assert.deepEqual(collection.query().filter({ where: { name: { like: '%foo' } } }).run(), [users[0], users[1], users[3], users[7], users[8]], '%foo')
      assert.deepEqual(collection.query().filter({ where: { name: { likei: 'FOO%' } } }).run(), [users[0], users[2], users[4], users[7], users[8], users[9]], 'FOO%')
      assert.deepEqual(collection.query().filter({ where: { name: { like: '%foo%' } } }).run(), users, '%foo%')
      assert.deepEqual(collection.query().filter({ where: { name: { like: '%foo%foo%' } } }).run(), [users[6], users[7], users[8], users[9]], '%foo%foo%')
      assert.deepEqual(collection.query().filter({ where: { name: { like: 'foo%foo' } } }).run(), [users[7], users[8]], 'foo%foo')
      assert.deepEqual(collection.query().filter({ where: { name: { like: 'foo_foo' } } }).run(), [users[8]], 'foo_foo')
      assert.deepEqual(collection.query().filter({ where: { name: { like: 'foo%foo_' } } }).run(), [users[9]], 'foo%foo')

      assert.deepEqual(collection.query().filter({ where: { name: { notLike: 'foo' } } }).run(), [users[1], users[2], users[3], users[4], users[5], users[6], users[7], users[8], users[9]])
      assert.deepEqual(collection.query().filter({ where: { name: { notLike: '_foo' } } }).run(), [users[0], users[2], users[3], users[4], users[5], users[6], users[7], users[8], users[9]])
      assert.deepEqual(collection.query().filter({ where: { name: { notLike: 'foo_' } } }).run(), [users[0], users[1], users[3], users[4], users[5], users[6], users[7], users[8], users[9]])
      assert.deepEqual(collection.query().filter({ where: { name: { notLike: '%foo' } } }).run(), [users[2], users[4], users[5], users[6], users[9]])
      assert.deepEqual(collection.query().filter({ where: { name: { notLike: 'foo%' } } }).run(), [users[1], users[3], users[5], users[6]])
      assert.deepEqual(collection.query().filter({ where: { name: { notLike: '%foo%' } } }).run(), [])
      assert.deepEqual(collection.query().filter({ where: { name: { notLike: '%foo%foo%' } } }).run(), [users[0], users[1], users[2], users[3], users[4], users[5]])
      assert.deepEqual(collection.query().filter({ where: { name: { notLike: 'foo%foo' } } }).run(), [users[0], users[1], users[2], users[3], users[4], users[5], users[6], users[9]])
      assert.deepEqual(collection.query().filter({ where: { name: { notLike: 'foo_foo' } } }).run(), [users[0], users[1], users[2], users[3], users[4], users[5], users[6], users[7], users[9]])
      assert.deepEqual(collection.query().filter({ where: { name: { notLike: 'foo%foo_' } } }).run(), [users[0], users[1], users[2], users[3], users[4], users[5], users[6], users[7], users[8]])
    })
    it.skip('should allow use of scopes', function () {
      const store = new JSData.DS({
        log: false,
        scopes: {
          defaultScope: {
            foo: 'bar'
          }
        }
      })
      let Foo = store.defineModel({
        name: 'foo',
        scopes: {
          second: {
            beep: 'boop'
          },
          limit: {
            limit: 1
          }
        }
      })
      let foos = Foo.inject([
        { id: 1, foo: 'bar' },
        { id: 2, beep: 'boop' },
        { id: 3, foo: 'bar', beep: 'boop' },
        { id: 4, foo: 'bar', beep: 'boop' },
        { id: 5, foo: 'bar', beep: 'boop' },
        { id: 6, foo: 'bar', beep: 'boop' },
        { id: 7, foo: 'bar', beep: 'boop' },
        { id: 8, foo: 'bar', beep: 'boop' }
      ])
      assert.objectsEqual(Foo.filter(null, {
        scope: ['second', 'limit']
      }), [foos[2]])
      assert.objectsEqual(Foo.filter(null, {
        scope: ['second']
      }), Foo.filter({
        foo: 'bar',
        beep: 'boop'
      }))
      assert.objectsEqual(Foo.filter(), Foo.filter({
        foo: 'bar'
      }))
    })
  })
}
