import { assert, JSData } from '../../_setup'

describe('LinkedCollection#add', function () {
  it('should add', function () {
    const store = new JSData.DataStore()
    const mapper = store.defineMapper('user') // eslint-disable-line
    const collection = store.getCollection('user')
    const user = collection.add({ id: 1 })
    assert.equal(user.id, 1)
  })
  it('should inject relations', function () {
    // can inject items without relations
    this.UserCollection.add(this.data.user1)
    this.OrganizationCollection.add(this.data.organization2)
    this.CommentCollection.add(this.data.comment3)
    this.ProfileCollection.add(this.data.profile4)

    assert.deepEqual(this.UserCollection.get(1).id, this.data.user1.id)
    assert.deepEqual(this.OrganizationCollection.get(2).id, this.data.organization2.id)
    assert.deepEqual(this.CommentCollection.get(3).id, this.data.comment3.id)
    assert.deepEqual(this.ProfileCollection.get(4).id, this.data.profile4.id)

    // can inject items with relations
    this.UserCollection.add(this.data.user10)
    this.OrganizationCollection.add(this.data.organization15)
    this.CommentCollection.add(this.data.comment19)
    this.ProfileCollection.add(this.data.profile21)
    this.GroupCollection.add(this.data.group1)

    // originals
    assert.equal(this.UserCollection.get(10).name, this.data.user10.name)
    assert.equal(this.UserCollection.get(10).id, this.data.user10.id)
    assert.equal(this.UserCollection.get(10).organizationId, this.data.user10.organizationId)
    assert(Array.isArray(this.UserCollection.get(10).comments))
    assert.deepEqual(this.OrganizationCollection.get(15).name, this.data.organization15.name)
    assert.deepEqual(this.OrganizationCollection.get(15).id, this.data.organization15.id)
    assert(Array.isArray(this.OrganizationCollection.get(15).users))
    assert.deepEqual(this.CommentCollection.get(19).id, this.data.comment19.id)
    assert.deepEqual(this.CommentCollection.get(19).content, this.data.comment19.content)
    assert.deepEqual(this.ProfileCollection.get(21).id, this.data.profile21.id)
    assert.deepEqual(this.ProfileCollection.get(21).content, this.data.profile21.content)
    assert.deepEqual(this.GroupCollection.get(1).id, this.data.group1.id)
    assert.deepEqual(this.GroupCollection.get(1).name, this.data.group1.name)
    assert(Array.isArray(this.GroupCollection.get(1).userIds))

    // user10 relations
    assert.deepEqual(this.CommentCollection.get(11), this.UserCollection.get(10).comments[0])
    assert.deepEqual(this.CommentCollection.get(12), this.UserCollection.get(10).comments[1])
    assert.deepEqual(this.CommentCollection.get(13), this.UserCollection.get(10).comments[2])
    assert.deepEqual(this.OrganizationCollection.get(14), this.UserCollection.get(10).organization)
    assert.deepEqual(this.ProfileCollection.get(15), this.UserCollection.get(10).profile)
    assert(Array.isArray(this.UserCollection.get(10).groups))
    assert.deepEqual(this.UserCollection.get(10).groups[0], this.GroupCollection.get(1))

    // group1 relations
    assert(Array.isArray(this.GroupCollection.get(1).users))
    assert.deepEqual(this.GroupCollection.get(1).users[0], this.UserCollection.get(10))

    // organization15 relations
    assert.deepEqual(this.UserCollection.get(16), this.OrganizationCollection.get(15).users[0])
    assert.deepEqual(this.UserCollection.get(17), this.OrganizationCollection.get(15).users[1])
    assert.deepEqual(this.UserCollection.get(18), this.OrganizationCollection.get(15).users[2])

    // comment19 relations
    assert.deepEqual(this.UserCollection.get(20), this.CommentCollection.get(19).user)
    assert.deepEqual(this.UserCollection.get(19), this.CommentCollection.get(19).approvedByUser)

    // profile21 relations
    assert.deepEqual(this.UserCollection.get(22), this.ProfileCollection.get(21).user)
  })
  it('should inject localKeys relations', function () {
    const store = this.store
    const group = store.add('group', {
      id: 1,
      users: {
        id: 1
      }
    })
    assert.strictEqual(group, store.get('group', 1))
    assert.strictEqual(group.users[0], store.get('user', 1))
  })
  it('should find inverse links', function () {
    this.UserCollection.add({ organizationId: 5, id: 1 })
    this.OrganizationCollection.add({ id: 5 })

    assert.objectsEqual(this.UserCollection.get(1).organization, { id: 5 })

    assert.objectsEqual(this.UserCollection.get(1).comments, [])
    assert.objectsEqual(this.UserCollection.get(1).approvedComments, [])

    this.CommentCollection.add({ approvedBy: 1, id: 23 })

    assert.equal(0, this.UserCollection.get(1).comments.length)
    assert.equal(1, this.UserCollection.get(1).approvedComments.length)

    this.CommentCollection.add({ approvedBy: 1, id: 44 })

    assert.equal(0, this.UserCollection.get(1).comments.length)
    assert.equal(2, this.UserCollection.get(1).approvedComments.length)
  })
  it('should inject cyclic dependencies', function () {
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
        },
        belongsTo: {
          foo: {
            localField: 'parent',
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

    assert.equal(injected[0].id, 1)
    assert.equal(injected[0].children[0].id, 2)
    assert.equal(injected[0].children[1].id, 3)
    assert.equal(injected[0].children[0].children[0].id, 4)
    assert.equal(injected[0].children[0].children[1].id, 5)
    assert.equal(injected[0].children[1].children[0].id, 6)
    assert.equal(injected[0].children[1].children[1].id, 7)

    assert(store.getCollection('foo').get(1))
    assert(store.getCollection('foo').get(2))
    assert(store.getCollection('foo').get(3))
    assert(store.getCollection('foo').get(4))
    assert(store.getCollection('foo').get(5))
    assert(store.getCollection('foo').get(6))
    assert(store.getCollection('foo').get(7))
  })
  it('should work when injecting child relations multiple times', function () {
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

    assert(store.get('parent', 1).children[0] instanceof Child.recordClass)

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

    assert(store.get('parent', 1).children[0] instanceof Child.recordClass)
    assert(store.get('parent', 1).children[1] instanceof Child.recordClass)
    assert.deepEqual(store.filter('child', { parentId: 1 }), store.get('parent', 1).children)
  })

  it('should not auto-add relations where auto-add has been disabled', function () {
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
    assert.equal(foo.bars[0].fooId, 1)
    assert.equal(foo.bars[1].fooId, 1)
    assert.equal(foo.bars.length, 2)
    assert.deepEqual(store.getAll('bar'), [], 'nothing should have been injected')
  })
  it('should allow custom relation injection logic', function () {
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
    assert.objectsEqual(foo.bars, [
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
  it('should update links', function () {
    const store = new JSData.DataStore()
    store.defineMapper('foo', {
      relations: {
        hasMany: {
          bar: {
            localField: 'bars',
            foreignKey: 'fooId'
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
    assert.equal(foo.bars.length, 3)
    assert.equal(store.getAll('bar').length, 3)
  })
  it('should inject 1,000 items', function () {
    const users = []
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
    this.UserCollection.add(users)
    // console.log('\tinject 1,000 users time taken: ', new Date().getTime() - start, 'ms')
  })
  it('should inject 1,000 items where there is an index on "age"', function () {
    const collection = new JSData.Collection({ mapper: new JSData.Mapper({ name: 'user' }) })
    collection.createIndex('age')
    collection.createIndex('created')
    collection.createIndex('updated')
    const users = []
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
})
