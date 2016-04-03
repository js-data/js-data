import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should work', (t) => {
  const collection = t.context.PostCollection
  const p1 = t.context.data.p1
  const p2 = t.context.data.p2
  const p3 = t.context.data.p3
  const p4 = t.context.data.p4
  const p5 = t.context.data.p5

  p1.roles = ['admin']
  p2.roles = ['admin', 'dev']
  p3.roles = ['admin', 'dev']
  p4.roles = []
  p5.roles = ['admin', 'dev', 'owner']

  t.context.store.add('post', [p1, p2, p3, p4, p5])

  let params = {
    author: 'John'
  }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p1], 'should default a string to "=="')

  params = {
    author: 'Adam',
    id: 9
  }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p5], 'should default a string to "=="')

  params = {
    where: {
      author: 'John'
    }
  }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p1], 'should default a string to "=="')

  params.where.author = {
    '==': 'John'
  }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p1], 'should accept normal "==" clause')

  params.where.author = {
    '===': null
  }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [], 'should accept normal "===" clause')

  params.where.author = {
    '!=': 'John'
  }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p2, p3, p4, p5], 'should accept normal "!=" clause')

  params.where = {
    age: {
      '>': 31
    }
  }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p3, p4, p5], 'should accept normal ">" clause')

  params.where = {
    age: {
      '>=': 31
    }
  }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p2, p3, p4, p5], 'should accept normal ">=" clause')

  params.where = {
    age: {
      '<': 31
    }
  }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p1], 'should accept normal "<" clause')

  params.where = {
    age: {
      '>': 30,
      '<': 33
    }
  }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p2, p3], 'should accept dual "<" and ">" clause')

  params.where = {
    age: {
      '|>': 30,
      '|<': 33
    }
  }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p1, p2, p3, p4, p5], 'should accept or "<" and ">" clause')

  params.where = {
    age: {
      '|<=': 31
    },
    author: {
      '|==': 'Adam'
    }
  }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p1, p2, p4, p5], 'should accept or "<=" and "==" clause')

  params.where = {
    age: {
      '<=': 31
    }
  }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p1, p2], 'should accept normal "<=" clause')

  params.where = {
    age: {
      'in': [30, 33]
    },
    author: {
      'in': ['John', 'Sally', 'Adam']
    }
  }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p1, p4, p5], 'should accept normal "in" clause')

  params.where = {
    author: {
      'in': 'John'
    }
  }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p1], 'should accept normal "in" clause with a string')

  params.where = {
    author: {
      'notIn': 'John'
    }
  }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p2, p3, p4, p5], 'should accept normal "notIn" clause with a string')

  params.where = {
    age: {
      '|in': [31]
    },
    id: {
      '|in': [8]
    }
  }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p2, p4], 'should accept and/or clause')

  params.where = {
    id: {
      'notIn': [8]
    }
  }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p1, p2, p3, p5], 'should accept notIn clause')

  params.where = { age: { garbage: 'should have no effect' } }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p1, p2, p3, p4, p5], 'should return all elements')

  params.where = { author: { like: 'Ada%' } }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p4, p5], 'should support like')

  params.where = { author: { like: '%a%' } }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p2, p4, p5], 'should support like')

  params.where = { author: { notLike: 'Ada%' } }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p1, p2, p3], 'should support notLike')

  params.where = { roles: { isectEmpty: ['admin'] } }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p4], 'should support isectEmpty')

  params.where = { roles: { isectNotEmpty: ['admin'] } }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p1, p2, p3, p5], 'should support isectNotEmpty')

  params.where = { roles: { notContains: 'admin' } }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p4], 'should support notContains')

  params.where = { age: { '!==': 33 } }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p1, p2, p3], 'should support !==')

  params = undefined

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p1, p2, p3, p4, p5], 'should do nothing')

  params = { offset: 4 }

  t.context.objectsEqual(t, collection.query().filter(params).run(), [p5], 'should support offset')
})
test('should allow custom filter function', (t) => {
  const p1 = t.context.data.p1
  const p2 = t.context.data.p2
  const p3 = t.context.data.p3
  const p4 = t.context.data.p4
  t.context.store.add('post', [p1, p2, p3, p4])

  t.context.objectsEqual(t, t.context.store.query('post').filter(function (item) {
    return item.author === 'John' || item.age % 30 === 1
  }).run(), [p1, p2], 'should keep p1 and p2')
})
test('should filter by nested keys', (t) => {
  const store = new JSData.DataStore()
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

  t.context.objectsEqual(t, store.query('thing').filter(params).run(), [things[2], things[3]], 'should filter by a nested key')
})
test('should support the "like" operator', (t) => {
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
  t.context.store.add('user', users)

  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { like: 'foo' } } }).run(), [users[0]], 'foo')
  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { like: '_foo' } } }).run(), [users[1]], '_foo')
  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { like: 'foo_' } } }).run(), [users[2]], 'foo_')
  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { like: '%foo' } } }).run(), [users[0], users[1], users[3], users[7], users[8]], '%foo')
  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { likei: 'FOO%' } } }).run(), [users[0], users[2], users[4], users[7], users[8], users[9]], 'FOO%')
  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { like: '%foo%' } } }).run(), users, '%foo%')
  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { like: '%foo%foo%' } } }).run(), [users[6], users[7], users[8], users[9]], '%foo%foo%')
  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { like: 'foo%foo' } } }).run(), [users[7], users[8]], 'foo%foo')
  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { like: 'foo_foo' } } }).run(), [users[8]], 'foo_foo')
  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { like: 'foo%foo_' } } }).run(), [users[9]], 'foo%foo')

  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { notLike: 'foo' } } }).run(), [users[1], users[2], users[3], users[4], users[5], users[6], users[7], users[8], users[9]])
  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { notLike: '_foo' } } }).run(), [users[0], users[2], users[3], users[4], users[5], users[6], users[7], users[8], users[9]])
  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { notLike: 'foo_' } } }).run(), [users[0], users[1], users[3], users[4], users[5], users[6], users[7], users[8], users[9]])
  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { notLike: '%foo' } } }).run(), [users[2], users[4], users[5], users[6], users[9]])
  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { notLike: 'foo%' } } }).run(), [users[1], users[3], users[5], users[6]])
  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { notLike: '%foo%' } } }).run(), [])
  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { notLike: '%foo%foo%' } } }).run(), [users[0], users[1], users[2], users[3], users[4], users[5]])
  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { notLike: 'foo%foo' } } }).run(), [users[0], users[1], users[2], users[3], users[4], users[5], users[6], users[9]])
  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { notLike: 'foo_foo' } } }).run(), [users[0], users[1], users[2], users[3], users[4], users[5], users[6], users[7], users[9]])
  t.context.objectsEqual(t, t.context.store.query('user').filter({ where: { name: { notLike: 'foo%foo_' } } }).run(), [users[0], users[1], users[2], users[3], users[4], users[5], users[6], users[7], users[8]])
})
