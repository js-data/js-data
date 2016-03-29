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
  t.context.store.add('post', [p1, p2, p3, p4])

  let params = {
    orderBy: 'age'
  }

  t.context.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3, p4], 'should accept a single string and sort in ascending order for numbers')

  params.orderBy = 'author'

  t.context.objectsEqual(collection.query().filter(params).run(), [p4, p1, p3, p2], 'should accept a single string and sort in ascending for strings')

  params.orderBy = [
    ['age', 'DESC']
  ]

  t.context.objectsEqual(collection.query().filter(params).run(), [p4, p3, p2, p1], 'should accept an array of an array and sort in descending for numbers')

  params.orderBy = [
    ['author', 'DESC']
  ]

  t.context.objectsEqual(collection.query().filter(params).run(), [p2, p3, p1, p4], 'should accept an array of an array and sort in descending for strings')

  params.orderBy = ['age']

  t.context.objectsEqual(collection.query().filter(params).run(), [p1, p2, p3, p4], 'should accept an array of a string and sort in ascending for numbers')

  params.orderBy = ['author']

  t.context.objectsEqual(collection.query().filter(params).run(), [p4, p1, p3, p2], 'should accept an array of a string and sort in ascending for strings')
})
test('should work with multiple orderBy', (t) => {
  const store = new JSData.DataStore()
  store.defineMapper('item')
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
  store.add('item', items)
  let params = {}

  params.orderBy = [
    ['test', 'DESC'],
    ['test2', 'ASC'],
    ['id', 'ASC']
  ]

  t.context.objectsEqual(store.query('item').filter(params).run(), [
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

  t.context.objectsEqual(store.query('item').filter(params).run(), [
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
test('should order by nested keys', (t) => {
  const store = new JSData.DataStore()
  store.defineMapper('thing')
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

  store.add('thing', things)

  let params = {
    orderBy: [['foo.bar', 'ASC']]
  }

  t.context.objectsEqual(store.query('thing').filter(params).run(), [things[1], things[3], things[2], things[0]], 'should order by a nested key')

  params = {
    orderBy: [['foo.bar', 'DESC']]
  }
  t.context.objectsEqual(store.query('thing').filter(params).run(), [things[0], things[2], things[3], things[1]], 'should order by a nested key')
})
