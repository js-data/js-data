import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should inject relations', (t) => {
  // can inject items without relations
  t.context.UserCollection.add(t.context.data.user1)
  t.context.OrganizationCollection.add(t.context.data.organization2)
  t.context.CommentCollection.add(t.context.data.comment3)
  t.context.ProfileCollection.add(t.context.data.profile4)

  t.same(t.context.UserCollection.get(1).id, t.context.data.user1.id)
  t.same(t.context.OrganizationCollection.get(2).id, t.context.data.organization2.id)
  t.same(t.context.CommentCollection.get(3).id, t.context.data.comment3.id)
  t.same(t.context.ProfileCollection.get(4).id, t.context.data.profile4.id)

  // can inject items with relations
  t.context.UserCollection.add(t.context.data.user10)
  t.context.OrganizationCollection.add(t.context.data.organization15)
  t.context.CommentCollection.add(t.context.data.comment19)
  t.context.ProfileCollection.add(t.context.data.profile21)
  t.context.GroupCollection.add(t.context.data.group1)

  // originals
  t.is(t.context.UserCollection.get(10).name, t.context.data.user10.name)
  t.is(t.context.UserCollection.get(10).id, t.context.data.user10.id)
  t.is(t.context.UserCollection.get(10).organizationId, t.context.data.user10.organizationId)
  t.ok(Array.isArray(t.context.UserCollection.get(10).comments))
  t.same(t.context.OrganizationCollection.get(15).name, t.context.data.organization15.name)
  t.same(t.context.OrganizationCollection.get(15).id, t.context.data.organization15.id)
  t.ok(Array.isArray(t.context.OrganizationCollection.get(15).users))
  t.same(t.context.CommentCollection.get(19).id, t.context.data.comment19.id)
  t.same(t.context.CommentCollection.get(19).content, t.context.data.comment19.content)
  t.same(t.context.ProfileCollection.get(21).id, t.context.data.profile21.id)
  t.same(t.context.ProfileCollection.get(21).content, t.context.data.profile21.content)
  t.same(t.context.GroupCollection.get(1).id, t.context.data.group1.id)
  t.same(t.context.GroupCollection.get(1).name, t.context.data.group1.name)
  t.ok(Array.isArray(t.context.GroupCollection.get(1).userIds))

  // user10 relations
  t.same(t.context.CommentCollection.get(11), t.context.UserCollection.get(10).comments[0])
  t.same(t.context.CommentCollection.get(12), t.context.UserCollection.get(10).comments[1])
  t.same(t.context.CommentCollection.get(13), t.context.UserCollection.get(10).comments[2])
  t.same(t.context.OrganizationCollection.get(14), t.context.UserCollection.get(10).organization)
  t.same(t.context.ProfileCollection.get(15), t.context.UserCollection.get(10).profile)
  t.ok(Array.isArray(t.context.UserCollection.get(10).groups))
  t.same(t.context.UserCollection.get(10).groups[0], t.context.GroupCollection.get(1))

  // group1 relations
  t.ok(Array.isArray(t.context.GroupCollection.get(1).users))
  t.same(t.context.GroupCollection.get(1).users[0], t.context.UserCollection.get(10))

  // organization15 relations
  t.same(t.context.UserCollection.get(16), t.context.OrganizationCollection.get(15).users[0])
  t.same(t.context.UserCollection.get(17), t.context.OrganizationCollection.get(15).users[1])
  t.same(t.context.UserCollection.get(18), t.context.OrganizationCollection.get(15).users[2])

  // comment19 relations
  t.same(t.context.UserCollection.get(20), t.context.CommentCollection.get(19).user)
  t.same(t.context.UserCollection.get(19), t.context.CommentCollection.get(19).approvedByUser)

  // profile21 relations
  t.same(t.context.UserCollection.get(22), t.context.ProfileCollection.get(21).user)
})
test('should find inverse links', (t) => {
  t.context.UserCollection.add({ organizationId: 5, id: 1 })
  t.context.OrganizationCollection.add({ id: 5 })

  t.context.objectsEqual(t.context.UserCollection.get(1).organization, { id: 5 })

  t.context.objectsEqual(t.context.UserCollection.get(1).comments, [])
  t.context.objectsEqual(t.context.UserCollection.get(1).approvedComments, [])

  t.context.CommentCollection.add({ approvedBy: 1, id: 23 })

  t.is(0, t.context.UserCollection.get(1).comments.length)
  t.is(1, t.context.UserCollection.get(1).approvedComments.length)

  t.context.CommentCollection.add({ approvedBy: 1, id: 44 })

  t.is(0, t.context.UserCollection.get(1).comments.length)
  t.is(2, t.context.UserCollection.get(1).approvedComments.length)
})
test('should inject cyclic dependencies', (t) => {
  const store = new JSData.DataStore({
    linkRelations: true
  })
  store.defineMapper('foo', {
    relations: {
      hasMany: {
        foo: {
          localField: 'children',
          foreignKey: 'parentId'
        }
      }
    }
  })
  const injected = store.getCollection('foo').add([{
    id: 1,
    children: [
      {
        id: 2,
        parentId: 1,
        children: [
          {
            id: 4,
            parentId: 2
          },
          {
            id: 5,
            parentId: 2
          }
        ]
      },
      {
        id: 3,
        parentId: 1,
        children: [
          {
            id: 6,
            parentId: 3
          },
          {
            id: 7,
            parentId: 3
          }
        ]
      }
    ]
  }])

  t.is(injected[0].id, 1)
  t.is(injected[0].children[0].id, 2)
  t.is(injected[0].children[1].id, 3)
  t.is(injected[0].children[0].children[0].id, 4)
  t.is(injected[0].children[0].children[1].id, 5)
  t.is(injected[0].children[1].children[0].id, 6)
  t.is(injected[0].children[1].children[1].id, 7)

  t.ok(store.getCollection('foo').get(1))
  t.ok(store.getCollection('foo').get(2))
  t.ok(store.getCollection('foo').get(3))
  t.ok(store.getCollection('foo').get(4))
  t.ok(store.getCollection('foo').get(5))
  t.ok(store.getCollection('foo').get(6))
  t.ok(store.getCollection('foo').get(7))
})
test('should work when injecting child relations multiple times', (t) => {
  const store = new JSData.DataStore({
    linkRelations: true
  })
  store.defineMapper('parent', {
    relations: {
      hasMany: {
        child: {
          localField: 'children',
          foreignKey: 'parentId'
        }
      }
    }
  })
  const Child = store.defineMapper('child', {
    relations: {
      belongsTo: {
        parent: {
          localField: 'parent',
          foreignKey: 'parentId'
        }
      }
    }
  })
  store.add('parent', {
    id: 1,
    name: 'parent1',
    children: [{
      id: 1,
      name: 'child1'
    }]
  })

  t.ok(store.get('parent', 1).children[0] instanceof Child.recordClass)

  store.add('parent', {
    id: 1,
    name: 'parent',
    children: [
      {
        id: 1,
        name: 'Child-1'
      },
      {
        id: 2,
        name: 'Child-2'
      }
    ]
  })

  t.ok(store.get('parent', 1).children[0] instanceof Child.recordClass)
  t.ok(store.get('parent', 1).children[1] instanceof Child.recordClass)
  t.same(store.filter('child', { parentId: 1 }), store.get('parent', 1).children)
})

test('should not auto-add relations where auto-add has been disabled', (t) => {
  const store = new JSData.DataStore({
    linkRelations: false
  })
  store.defineMapper('foo', {
    relations: {
      hasMany: {
        bar: {
          localField: 'bars',
          foreignKey: 'fooId',
          add: false
        }
      }
    }
  })
  store.defineMapper('bar', {
    relations: {
      belongsTo: {
        foo: {
          localField: 'foo',
          foreignKey: 'fooId'
        }
      }
    }
  })
  const bar1Json = {
    id: 1
  }
  const bar2Json = {
    id: 2
  }
  const foo = store.add('foo', {
    id: 1,
    bars: [bar1Json, bar2Json]
  })
  t.is(bar1Json.fooId, 1)
  t.is(bar2Json.fooId, 1)
  t.is(foo.bars.length, 2)
  t.same(store.getAll('bar'), [], 'nothing should have been injected')
})
test('should allow custom relation injection logic', (t) => {
  const store = new JSData.DataStore({
    linkRelations: true
  })
  store.defineMapper('foo', {
    relations: {
      hasMany: {
        bar: {
          localField: 'bars',
          foreignKey: 'fooId',
          add (store, relationDef, foo) {
            const bars = store.add(relationDef.relation, foo.test_bars)
            bars.forEach(function (bar) {
              bar.beep = 'boop'
            })
            delete foo.test_bars
          }
        }
      }
    }
  })
  store.defineMapper('bar', {
    relations: {
      belongsTo: {
        foo: {
          localField: 'foo',
          foreignKey: 'fooId'
        }
      }
    }
  })
  const foo = store.add('foo', {
    id: 1,
    test_bars: [
      {
        id: 1,
        fooId: 1
      },
      {
        id: 2,
        fooId: 1
      }
    ]
  })
  t.context.objectsEqual(foo.bars, [
    {
      id: 1,
      fooId: 1,
      beep: 'boop'
    },
    {
      id: 2,
      fooId: 1,
      beep: 'boop'
    }
  ], 'bars should have been added')
})
test('should not link relations nor delete field if "link" is false', (t) => {
  const store = new JSData.DataStore({
    linkRelations: true
  })
  store.defineMapper('foo', {
    relations: {
      hasMany: {
        bar: {
          localField: 'bars',
          foreignKey: 'fooId',
          link: false
        }
      }
    }
  })
  store.defineMapper('bar', {
    relations: {
      belongsTo: {
        foo: {
          localField: 'foo',
          foreignKey: 'fooId'
        }
      }
    }
  })
  const foo = store.add('foo', {
    id: 1,
    bars: [
      {
        id: 1,
        fooId: 1
      },
      {
        id: 2,
        fooId: 1
      }
    ]
  })
  store.add('bar', {
    id: 3,
    fooId: 1
  })
  t.is(foo.bars.length, 2, 'bars should have been added, but not linked')
  t.is(store.getAll('bar').length, 3, '3 bars should be in the store')
})
test('should inject 1,000 items', (t) => {
  let users = []
  for (var i = 0; i < 1000; i++) {
    users.push({
      id: i,
      name: 'john smith #' + i,
      age: Math.floor(Math.random() * 100),
      created: new Date().getTime(),
      updated: new Date().getTime()
    })
  }
  // const start = new Date().getTime()
  t.context.UserCollection.add(users)
  // console.log('\tinject 1,000 users time taken: ', new Date().getTime() - start, 'ms')
})
test('should inject 1,000 items where there is an index on "age"', (t) => {
  const collection = new JSData.Collection({ mapper: new JSData.Mapper({ name: 'user' }) })
  collection.createIndex('age')
  collection.createIndex('created')
  collection.createIndex('updated')
  let users = []
  for (var i = 0; i < 1000; i++) {
    users.push({
      id: i,
      name: 'john smith #' + i,
      age: Math.floor(Math.random() * 100),
      created: new Date().getTime(),
      updated: new Date().getTime()
    })
  }
  // const start = new Date().getTime()
  collection.add(users)
  // console.log('\tinject 1,000 users time taken: ', new Date().getTime() - start, 'ms')
})
