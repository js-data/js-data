import { assert, JSData } from '../../_setup'

describe('Query#filter', function () {
  it('should work', function () {
    const collection = this.PostCollection
    const p1 = this.data.p1
    const p2 = this.data.p2
    const p3 = this.data.p3
    const p4 = this.data.p4
    const p5 = this.data.p5

    p1.roles = ['admin']
    p2.roles = ['admin', 'dev']
    p3.roles = ['admin', 'dev']
    p4.roles = []
    p5.roles = ['admin', 'dev', 'owner']

    this.store.add('post', [p1, p2, p3, p4, p5])

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
        in: [30, 33]
      },
      author: {
        in: ['John', 'Sally', 'Adam']
      }
    }

    assert.objectsEqual(collection.query().filter(params).run(), [p1, p4, p5], 'should accept normal "in" clause')

    params.where = {
      author: {
        in: 'John'
      }
    }

    assert.objectsEqual(collection.query().filter(params).run(), [p1], 'should accept normal "in" clause with a string')

    params.where = {
      author: {
        notIn: 'John'
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
        notIn: [8]
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

    params.where = { roles: { isectEmpty: ['admin'] } }

    assert.objectsEqual(collection.query().filter(params).run(), [p4], 'should support isectEmpty')

    params.where = { roles: { isectNotEmpty: ['admin'] } }

    assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3, p5], 'should support isectNotEmpty')

    params.where = { roles: { notContains: 'admin' } }

    assert.objectsEqual(collection.query().filter(params).run(), [p4], 'should support notContains')

    params.where = { age: { '!==': 33 } }

    assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3], 'should support !==')

    params = undefined

    assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3, p4, p5], 'should do nothing')

    params = { offset: 4 }

    assert.objectsEqual(collection.query().filter(params).run(), [p5], 'should support offset')

    params = {
      where: [
        {
          roles: {
            contains: 'admin'
          }
        },
        'or',
        {
          age: {
            '=': 30
          }
        }
      ]
    }
    assert.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3, p5])

    params = {
      where: [
        {
          roles: {
            contains: 'admin'
          },
          age: {
            '=': 30
          }
        },
        'or',
        {
          roles: {
            contains: 'owner'
          }
        }
      ]
    }
    assert.objectsEqual(collection.query().filter(params).run(), [p1, p5])

    params = {
      where: [
        [
          {
            roles: {
              contains: 'admin'
            },
            age: {
              '=': 30
            }
          },
          'or',
          {
            author: {
              '=': 'Mike'
            }
          }
        ],
        'or',
        {
          roles: {
            contains: 'owner'
          },
          age: {
            '=': 33
          }
        }
      ]
    }
    assert.objectsEqual(collection.query().filter(params).run(), [p1, p3, p5])
  })
  it('should allow custom filter function', function () {
    const p1 = this.data.p1
    const p2 = this.data.p2
    const p3 = this.data.p3
    const p4 = this.data.p4
    this.store.add('post', [p1, p2, p3, p4])

    assert.objectsEqual(this.store.query('post').filter(function (item) {
      return item.author === 'John' || item.age % 30 === 1
    }).run(), [p1, p2], 'should keep p1 and p2')
  })
  it('should filter by nested keys', function () {
    const store = new JSData.DataStore()
    store.defineMapper('thing')
    const things = [
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

    const params = {
      where: {
        'foo.bar': {
          '>': 2
        }
      }
    }

    assert.objectsEqual(store.query('thing').filter(params).run(), [things[2], things[3]], 'should filter by a nested key')
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
      { id: 10, name: 'fooxxfoox' }
    ]
    this.store.add('user', users)

    assert.objectsEqual(this.store.query('user').filter({ where: { name: { like: 'foo' } } }).run(), [users[0]], 'foo')
    assert.objectsEqual(this.store.query('user').filter({ where: { name: { like: '_foo' } } }).run(), [users[1]], '_foo')
    assert.objectsEqual(this.store.query('user').filter({ where: { name: { like: 'foo_' } } }).run(), [users[2]], 'foo_')
    assert.objectsEqual(this.store.query('user').filter({ where: { name: { like: '%foo' } } }).run(), [users[0], users[1], users[3], users[7], users[8]], '%foo')
    assert.objectsEqual(this.store.query('user').filter({ where: { name: { likei: 'FOO%' } } }).run(), [users[0], users[2], users[4], users[7], users[8], users[9]], 'FOO%')
    assert.objectsEqual(this.store.query('user').filter({ where: { name: { like: '%foo%' } } }).run(), users, '%foo%')
    assert.objectsEqual(this.store.query('user').filter({ where: { name: { like: '%foo%foo%' } } }).run(), [users[6], users[7], users[8], users[9]], '%foo%foo%')
    assert.objectsEqual(this.store.query('user').filter({ where: { name: { like: 'foo%foo' } } }).run(), [users[7], users[8]], 'foo%foo')
    assert.objectsEqual(this.store.query('user').filter({ where: { name: { like: 'foo_foo' } } }).run(), [users[8]], 'foo_foo')
    assert.objectsEqual(this.store.query('user').filter({ where: { name: { like: 'foo%foo_' } } }).run(), [users[9]], 'foo%foo')

    assert.objectsEqual(this.store.query('user').filter({ where: { name: { notLike: 'foo' } } }).run(), [users[1], users[2], users[3], users[4], users[5], users[6], users[7], users[8], users[9]])
    assert.objectsEqual(this.store.query('user').filter({ where: { name: { notLike: '_foo' } } }).run(), [users[0], users[2], users[3], users[4], users[5], users[6], users[7], users[8], users[9]])
    assert.objectsEqual(this.store.query('user').filter({ where: { name: { notLike: 'foo_' } } }).run(), [users[0], users[1], users[3], users[4], users[5], users[6], users[7], users[8], users[9]])
    assert.objectsEqual(this.store.query('user').filter({ where: { name: { notLike: '%foo' } } }).run(), [users[2], users[4], users[5], users[6], users[9]])
    assert.objectsEqual(this.store.query('user').filter({ where: { name: { notLike: 'foo%' } } }).run(), [users[1], users[3], users[5], users[6]])
    assert.objectsEqual(this.store.query('user').filter({ where: { name: { notLike: '%foo%' } } }).run(), [])
    assert.objectsEqual(this.store.query('user').filter({ where: { name: { notLike: '%foo%foo%' } } }).run(), [users[0], users[1], users[2], users[3], users[4], users[5]])
    assert.objectsEqual(this.store.query('user').filter({ where: { name: { notLike: 'foo%foo' } } }).run(), [users[0], users[1], users[2], users[3], users[4], users[5], users[6], users[9]])
    assert.objectsEqual(this.store.query('user').filter({ where: { name: { notLike: 'foo_foo' } } }).run(), [users[0], users[1], users[2], users[3], users[4], users[5], users[6], users[7], users[9]])
    assert.objectsEqual(this.store.query('user').filter({ where: { name: { notLike: 'foo%foo_' } } }).run(), [users[0], users[1], users[2], users[3], users[4], users[5], users[6], users[7], users[8]])
  })
})
