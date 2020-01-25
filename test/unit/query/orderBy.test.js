import { assert, JSData } from '../../_setup'

describe('Query#orderBy', function () {
  it('should work', function () {
    const collection = this.PostCollection
    const p1 = this.data.p1
    const p2 = this.data.p2
    const p3 = this.data.p3
    const p4 = this.data.p4
    this.store.add('post', [p1, p2, p3, p4])

    const params = {
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
    const params = {}

    params.orderBy = [
      ['test', 'DESC'],
      ['test2', 'ASC'],
      ['id', 'ASC']
    ]

    assert.objectsEqual(store.query('item').filter(params).run(), [
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

    assert.objectsEqual(store.query('item').filter(params).run(), [
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
  it('should order by nested keys', function () {
    const store = new JSData.DataStore()
    store.defineMapper('thing')
    const things = [
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

    assert.objectsEqual(store.query('thing').filter(params).run(), [things[1], things[3], things[2], things[0]], 'should order by a nested key')

    params = {
      orderBy: [['foo.bar', 'DESC']]
    }
    assert.objectsEqual(store.query('thing').filter(params).run(), [things[0], things[2], things[3], things[1]], 'should order by a nested key')
  })
})
