export function init () {
  describe('#add', function () {
    it('should inject relations', function () {
      const Test = this

      // can inject items without relations
      Test.UserCollection.add(Test.data.user1)
      Test.OrganizationCollection.add(Test.data.organization2)
      Test.CommentCollection.add(Test.data.comment3)
      Test.ProfileCollection.add(Test.data.profile4)

      Test.assert.deepEqual(Test.UserCollection.get(1).id, Test.data.user1.id)
      Test.assert.deepEqual(Test.OrganizationCollection.get(2).id, Test.data.organization2.id)
      Test.assert.deepEqual(Test.CommentCollection.get(3).id, Test.data.comment3.id)
      Test.assert.deepEqual(Test.ProfileCollection.get(4).id, Test.data.profile4.id)

      // can inject items with relations
      Test.UserCollection.add(Test.data.user10)
      Test.OrganizationCollection.add(Test.data.organization15)
      Test.CommentCollection.add(Test.data.comment19)
      Test.ProfileCollection.add(Test.data.profile21)
      Test.GroupCollection.add(Test.data.group1)

      // originals
      Test.assert.equal(Test.UserCollection.get(10).name, Test.data.user10.name)
      Test.assert.equal(Test.UserCollection.get(10).id, Test.data.user10.id)
      Test.assert.equal(Test.UserCollection.get(10).organizationId, Test.data.user10.organizationId)
      Test.assert.isArray(Test.UserCollection.get(10).comments)
      Test.assert.deepEqual(Test.OrganizationCollection.get(15).name, Test.data.organization15.name)
      Test.assert.deepEqual(Test.OrganizationCollection.get(15).id, Test.data.organization15.id)
      Test.assert.isArray(Test.OrganizationCollection.get(15).users)
      Test.assert.deepEqual(Test.CommentCollection.get(19).id, Test.data.comment19.id)
      Test.assert.deepEqual(Test.CommentCollection.get(19).content, Test.data.comment19.content)
      Test.assert.deepEqual(Test.ProfileCollection.get(21).id, Test.data.profile21.id)
      Test.assert.deepEqual(Test.ProfileCollection.get(21).content, Test.data.profile21.content)
      Test.assert.deepEqual(Test.GroupCollection.get(1).id, Test.data.group1.id)
      Test.assert.deepEqual(Test.GroupCollection.get(1).name, Test.data.group1.name)
      Test.assert.isArray(Test.GroupCollection.get(1).userIds)

      // user10 relations
      Test.assert.deepEqual(Test.CommentCollection.get(11), Test.UserCollection.get(10).comments[0])
      Test.assert.deepEqual(Test.CommentCollection.get(12), Test.UserCollection.get(10).comments[1])
      Test.assert.deepEqual(Test.CommentCollection.get(13), Test.UserCollection.get(10).comments[2])
      Test.assert.deepEqual(Test.OrganizationCollection.get(14), Test.UserCollection.get(10).organization)
      Test.assert.deepEqual(Test.ProfileCollection.get(15), Test.UserCollection.get(10).profile)
      Test.assert.isArray(Test.UserCollection.get(10).groups)
      Test.assert.deepEqual(Test.UserCollection.get(10).groups[0], Test.GroupCollection.get(1))

      // group1 relations
      Test.assert.isArray(Test.GroupCollection.get(1).users)
      Test.assert.deepEqual(Test.GroupCollection.get(1).users[0], Test.UserCollection.get(10))

      // organization15 relations
      Test.assert.deepEqual(Test.UserCollection.get(16), Test.OrganizationCollection.get(15).users[0])
      Test.assert.deepEqual(Test.UserCollection.get(17), Test.OrganizationCollection.get(15).users[1])
      Test.assert.deepEqual(Test.UserCollection.get(18), Test.OrganizationCollection.get(15).users[2])

      // comment19 relations
      Test.assert.deepEqual(Test.UserCollection.get(20), Test.CommentCollection.get(19).user)
      Test.assert.deepEqual(Test.UserCollection.get(19), Test.CommentCollection.get(19).approvedByUser)

      // profile21 relations
      Test.assert.deepEqual(Test.UserCollection.get(22), Test.ProfileCollection.get(21).user)
    })
    it('should find inverse links', function () {
      const Test = this
      Test.UserCollection.add({ organizationId: 5, id: 1 })
      Test.OrganizationCollection.add({ id: 5 })

      Test.assert.objectsEqual(Test.UserCollection.get(1).organization, { id: 5 })

      Test.assert.objectsEqual(Test.UserCollection.get(1).comments, [])
      Test.assert.objectsEqual(Test.UserCollection.get(1).approvedComments, [])

      Test.CommentCollection.add({ approvedBy: 1, id: 23 })

      Test.assert.equal(0, Test.UserCollection.get(1).comments.length)
      Test.assert.equal(1, Test.UserCollection.get(1).approvedComments.length)

      Test.CommentCollection.add({ approvedBy: 1, id: 44 })

      Test.assert.equal(0, Test.UserCollection.get(1).comments.length)
      Test.assert.equal(2, Test.UserCollection.get(1).approvedComments.length)
    })
    it('should inject cyclic dependencies', function () {
      const Test = this
      const store = new Test.JSData.DataStore({
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

      Test.assert.equal(injected[0].id, 1)
      Test.assert.equal(injected[0].children[0].id, 2)
      Test.assert.equal(injected[0].children[1].id, 3)
      Test.assert.equal(injected[0].children[0].children[0].id, 4)
      Test.assert.equal(injected[0].children[0].children[1].id, 5)
      Test.assert.equal(injected[0].children[1].children[0].id, 6)
      Test.assert.equal(injected[0].children[1].children[1].id, 7)

      Test.assert.isDefined(store.getCollection('foo').get(1))
      Test.assert.isDefined(store.getCollection('foo').get(2))
      Test.assert.isDefined(store.getCollection('foo').get(3))
      Test.assert.isDefined(store.getCollection('foo').get(4))
      Test.assert.isDefined(store.getCollection('foo').get(5))
      Test.assert.isDefined(store.getCollection('foo').get(6))
      Test.assert.isDefined(store.getCollection('foo').get(7))
    })
    it('should work when injecting child relations multiple times', function () {
      const Test = this
      const store = new Test.JSData.DataStore({
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

      Test.assert.isTrue(store.get('parent', 1).children[0] instanceof Child.RecordClass)

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

      Test.assert.isTrue(store.get('parent', 1).children[0] instanceof Child.RecordClass)
      Test.assert.isTrue(store.get('parent', 1).children[1] instanceof Child.RecordClass)
      Test.assert.deepEqual(store.filter('child', { parentId: 1 }), store.get('parent', 1).children)
    })
    it('should configure enumerability and linking of relations', function () {
      const Test = this

      const store = new Test.JSData.DataStore({
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
      store.defineMapper('child', {
        relations: {
          belongsTo: {
            parent: {
              link: false,
              localField: 'parent',
              foreignKey: 'parentId'
            }
          }
        }
      })
      store.defineMapper('otherChild', {
        relations: {
          belongsTo: {
            parent: {
              enumerable: false,
              localField: 'parent',
              foreignKey: 'parentId'
            }
          }
        }
      })

      const child = store.add('child', {
        id: 1,
        parent: {
          id: 2
        }
      })

      const otherChild = store.add('otherChild', {
        id: 3,
        parent: {
          id: 4
        }
      })

      Test.assert.isDefined(store.get('child', child.id))
      Test.assert.equal(child.parentId, 2)
      Test.assert.isTrue(child.parent === store.get('parent', child.parentId))

      Test.assert.isDefined(store.get('otherChild', otherChild.id))
      Test.assert.equal(otherChild.parentId, 4)
      Test.assert.isTrue(otherChild.parent === store.get('parent', otherChild.parentId), 'parent was injected and linked')
      Test.assert.isDefined(store.get('parent', otherChild.parentId), 'parent was injected and linked')

      let foundParent = false
      let k
      for (k in child) {
        if (k === 'parent' && child[k] === child.parent && child[k] === store.get('parent', child.parentId)) {
          foundParent = true
        }
      }
      Test.assert.isTrue(foundParent, 'parent is enumerable')
      foundParent = false
      for (k in otherChild) {
        if (k === 'parent' && otherChild[k] === otherChild.parent && otherChild[k] === store.get('parent', otherChild.parentId)) {
          foundParent = true
        }
      }
      Test.assert.isFalse(foundParent, 'parent is NOT enumerable')
    })
    it('should not auto-add relations where auto-add has been disabled', function () {
      const Test = this
      const store = new Test.JSData.DataStore({
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
      Test.assert.equal(bar1Json.fooId, 1)
      Test.assert.equal(bar2Json.fooId, 1)
      Test.assert.equal(foo.bars.length, 2)
      Test.assert.deepEqual(store.getAll('bar'), [], 'nothing should have been injected')
    })
    it('should allow custom relation injection logic', function () {
      const Test = this
      const store = new Test.JSData.DataStore({
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
      Test.assert.objectsEqual(foo.bars, [
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
    it('should not link relations nor delete field if "link" is false', function () {
      const Test = this
      const store = new Test.JSData.DataStore({
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
      Test.assert.equal(foo.bars.length, 2, 'bars should have been added, but not linked')
      Test.assert.equal(store.getAll('bar').length, 3, '3 bars should be in the store')
    })
    it('should inject 1,000 items', function () {
      const Test = this
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
      Test.UserCollection.add(users)
      // console.log('\tinject 1,000 users time taken: ', new Date().getTime() - start, 'ms')
    })
    it.skip('should inject 10,000 items', function () {
      const Test = this
      let users = []
      for (var i = 0; i < 10000; i++) {
        users.push({
          id: i,
          name: 'john smith #' + i,
          age: Math.floor(Math.random() * 100),
          created: new Date().getTime(),
          updated: new Date().getTime()
        })
      }
      const start = new Date().getTime()
      Test.UserCollection.add(users)
      console.log('\tinject 10,000 users time taken: ', new Date().getTime() - start, 'ms')
    })
    it('should inject 1,000 items where there is an index on "age"', function () {
      const Test = this
      const collection = new Test.JSData.Collection({ mapper: new Test.JSData.Mapper({ name: 'user' }) })
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
    it.skip('should inject 10,000 items where there is an index on "age"', function () {
      const Test = this
      const store = new Test.JSData.DataStore()
      store.defineMapper('user')
      store.createIndex('user', 'age')
      store.createIndex('user', 'created')
      store.createIndex('user', 'updated')
      let users = []
      for (var i = 0; i < 10000; i++) {
        users.push({
          id: i,
          name: 'john smith #' + i,
          age: Math.floor(Math.random() * 100),
          created: new Date().getTime(),
          updated: new Date().getTime()
        })
      }
      // const start = new Date().getTime()
      store.add('user', users)
      // console.log('\tinject 10,000 users time taken: ', new Date().getTime() - start, 'ms')
      // console.log('\tusers age 40-44', User.between(40, 45, { index: 'age' }).length)
    })
  })
}
