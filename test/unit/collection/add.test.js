export function init () {
  describe('#add', function () {
    it('should inject new items into the collection', function () {
      const Test = this
      const collection = new Test.JSData.Collection()
      const user = collection.add({ id: 1 })
      const users = collection.add([{ id: 2 }, { id: 3 }])
      Test.assert.isTrue(collection.get(1) === user)
      Test.assert.deepEqual(collection.between([2], [3], {
        rightInclusive: true
      }), users)
    })
    it('should inject multiple items into the collection', function () {
      const Test = this
      Test.assert.objectsEqual(Test.PostCollection.add([
        Test.data.p1,
        Test.data.p2,
        Test.data.p3,
        Test.data.p4
      ]), [Test.data.p1, Test.data.p2, Test.data.p3, Test.data.p4])

      Test.assert.objectsEqual(Test.PostCollection.get(5), Test.data.p1)
      Test.assert.objectsEqual(Test.PostCollection.get(6), Test.data.p2)
      Test.assert.objectsEqual(Test.PostCollection.get(7), Test.data.p3)
      Test.assert.objectsEqual(Test.PostCollection.get(8), Test.data.p4)
    })
    it('should inject existing items into the store', function () {
      const Test = this
      const collection = new Test.JSData.Collection({ mapper: new Test.JSData.Mapper({ name: 'user' }) })

      const user = collection.add({ id: 1 })
      const users = collection.add([{ id: 2 }, { id: 3 }])
      const userAgain = collection.add({ id: 1 })
      const usersAgain = collection.add([{ id: 2 }, { id: 3 }])
      Test.assert.isTrue(collection.get(1) === user, 'original reference should still be valid')
      Test.assert.isTrue(collection.get(1) === userAgain, 'new reference should be valid')
      Test.assert.isTrue(user === userAgain, 'both references should point to the same object')
      Test.assert.deepEqual(collection.between([2], [3], {
        rightInclusive: true
      }), users, 'injection of array should work')
      Test.assert.deepEqual(collection.between([2], [3], {
        rightInclusive: true
      }), usersAgain, 're-inject of array should work')
      Test.assert.deepEqual(users, usersAgain, 'inject arrays should be equal')
    })
    it('should replace existing items', function () {
      const Test = this
      const collection = new Test.JSData.Collection({ mapper: new Test.JSData.Mapper({ name: 'user' }) })
      const user = collection.add({ id: 1, foo: 'bar', beep: 'boop' })
      Test.assert.equal(user.id, 1)
      Test.assert.equal(user.foo, 'bar')
      Test.assert.equal(user.beep, 'boop')
      Test.assert.isUndefined(user.biz)
      const existing = collection.add({ id: 1, biz: 'baz', foo: 'BAR' }, { onConflict: 'replace' })
      Test.assert.isTrue(user === existing)
      Test.assert.equal(user.id, 1)
      Test.assert.equal(user.biz, 'baz')
      Test.assert.equal(user.foo, 'BAR')
      Test.assert.isUndefined(user.beep)
    })
    // it.skip('should inject relations', function () {
    //   // can inject items without relations
    //   Test.UserCollection.add(Test.data.user1)
    //   Test.OrganizationCollection.add(Test.data.organization2)
    //   Test.CommentCollection.add(Test.data.comment3)
    //   Test.ProfileCollection.add(Test.data.profile4)

    //   Test.assert.deepEqual(Test.UserCollection.get(1).id, Test.data.user1.id)
    //   Test.assert.deepEqual(Test.OrganizationCollection.get(2).id, Test.data.organization2.id)
    //   Test.assert.deepEqual(Test.CommentCollection.get(3).id, Test.data.comment3.id)
    //   Test.assert.deepEqual(Test.ProfileCollection.get(4).id, Test.data.profile4.id)

    //   // can inject items with relations
    //   Test.UserCollection.add(Test.data.user10)
    //   Test.OrganizationCollection.add(Test.data.organization15)
    //   Test.CommentCollection.add(Test.data.comment19)
    //   Test.ProfileCollection.add(Test.data.profile21)
    //   Test.GroupCollection.add(Test.data.group1)

    //   // originals
    //   Test.assert.equal(Test.UserCollection.get(10).name, Test.data.user10.name)
    //   Test.assert.equal(Test.UserCollection.get(10).id, Test.data.user10.id)
    //   Test.assert.equal(Test.UserCollection.get(10).organizationId, Test.data.user10.organizationId)
    //   Test.assert.isArray(Test.UserCollection.get(10).comments)
    //   Test.assert.deepEqual(Test.OrganizationCollection.get(15).name, Test.data.organization15.name)
    //   Test.assert.deepEqual(Test.OrganizationCollection.get(15).id, Test.data.organization15.id)
    //   Test.assert.isArray(Test.OrganizationCollection.get(15).users)
    //   Test.assert.deepEqual(Test.CommentCollection.get(19).id, Test.data.comment19.id)
    //   Test.assert.deepEqual(Test.CommentCollection.get(19).content, Test.data.comment19.content)
    //   Test.assert.deepEqual(Test.ProfileCollection.get(21).id, Test.data.profile21.id)
    //   Test.assert.deepEqual(Test.ProfileCollection.get(21).content, Test.data.profile21.content)
    //   Test.assert.deepEqual(Test.GroupCollection.get(1).id, Test.data.group1.id)
    //   Test.assert.deepEqual(Test.GroupCollection.get(1).name, Test.data.group1.name)
    //   Test.assert.isArray(Test.GroupCollection.get(1).userIds)

    //   // user10 relations
    //   Test.assert.deepEqual(Test.CommentCollection.get(11), Test.UserCollection.get(10).comments[0])
    //   Test.assert.deepEqual(Test.CommentCollection.get(12), Test.UserCollection.get(10).comments[1])
    //   Test.assert.deepEqual(Test.CommentCollection.get(13), Test.UserCollection.get(10).comments[2])
    //   Test.assert.deepEqual(Test.OrganizationCollection.get(14), Test.UserCollection.get(10).organization)
    //   Test.assert.deepEqual(Test.ProfileCollection.get(15), Test.UserCollection.get(10).profile)
    //   Test.assert.isArray(Test.UserCollection.get(10).groups)
    //   Test.assert.deepEqual(Test.UserCollection.get(10).groups[0], Test.GroupCollection.get(1))

    //   // group1 relations
    //   Test.assert.isArray(Test.GroupCollection.get(1).users)
    //   Test.assert.deepEqual(Test.GroupCollection.get(1).users[0], Test.UserCollection.get(10))

    //   // organization15 relations
    //   Test.assert.deepEqual(Test.UserCollection.get(16), Test.OrganizationCollection.get(15).users[0])
    //   Test.assert.deepEqual(Test.UserCollection.get(17), Test.OrganizationCollection.get(15).users[1])
    //   Test.assert.deepEqual(Test.UserCollection.get(18), Test.OrganizationCollection.get(15).users[2])

    //   // comment19 relations
    //   Test.assert.deepEqual(Test.UserCollection.get(20), Test.CommentCollection.get(19).user)
    //   Test.assert.deepEqual(Test.UserCollection.get(19), Test.CommentCollection.get(19).approvedByUser)

    //   // profile21 relations
    //   Test.assert.deepEqual(Test.UserCollection.get(22), Test.ProfileCollection.get(21).user)
    // })
    // it.skip('should find inverse links', function () {
    //   Test.UserCollection.add({ organizationId: 5, id: 1 })
    //   Test.OrganizationCollection.add({ id: 5 })

    //   Test.assert.objectsEqual(Test.UserCollection.get(1).organization, { id: 5 })

    //   Test.assert.objectsEqual(Test.UserCollection.get(1).comments, [])
    //   Test.assert.objectsEqual(Test.UserCollection.get(1).approvedComments, [])

    //   const comment1 = Test.CommentCollection.add({ approvedBy: 1, id: 23 })

    //   Test.assert.equal(0, Test.UserCollection.get(1).comments.length)
    //   Test.assert.equal(1, Test.UserCollection.get(1).approvedComments.length)

    //   const comment2 = Test.CommentCollection.add({ approvedBy: 1, id: 44 })

    //   Test.assert.equal(0, Test.UserCollection.get(1).comments.length)
    //   Test.assert.equal(2, Test.UserCollection.get(1).approvedComments.length)
    // })
    // it.skip('should inject cyclic dependencies', function () {
    //   class Foo extends Test.JSData.Mapper {}
    //   Foo.configure({
    //     linkRelations: true
    //   })
    //   Foo.hasMany(Foo, {
    //     localField: 'children',
    //     foreignKey: 'parentId'
    //   })
    //   const injected = Foo.inject([{
    //     id: 1,
    //     children: [
    //       {
    //         id: 2,
    //         parentId: 1,
    //         children: [
    //           {
    //             id: 4,
    //             parentId: 2
    //           },
    //           {
    //             id: 5,
    //             parentId: 2
    //           }
    //         ]
    //       },
    //       {
    //         id: 3,
    //         parentId: 1,
    //         children: [
    //           {
    //             id: 6,
    //             parentId: 3
    //           },
    //           {
    //             id: 7,
    //             parentId: 3
    //           }
    //         ]
    //       }
    //     ]
    //   }])

    //   Test.assert.equal(injected[0].id, 1)
    //   Test.assert.equal(injected[0].children[0].id, 2)
    //   Test.assert.equal(injected[0].children[1].id, 3)
    //   Test.assert.equal(injected[0].children[0].children[0].id, 4)
    //   Test.assert.equal(injected[0].children[0].children[1].id, 5)
    //   Test.assert.equal(injected[0].children[1].children[0].id, 6)
    //   Test.assert.equal(injected[0].children[1].children[1].id, 7)

    //   Test.assert.isDefined(Foo.get(1))
    //   Test.assert.isDefined(Foo.get(2))
    //   Test.assert.isDefined(Foo.get(3))
    //   Test.assert.isDefined(Foo.get(4))
    //   Test.assert.isDefined(Foo.get(5))
    //   Test.assert.isDefined(Foo.get(6))
    //   Test.assert.isDefined(Foo.get(7))
    // })
    // it.skip('should work when injecting child relations multiple times', function () {
    //   class Parent extends Test.JSData.Mapper {}
    //   Parent.configure({
    //     linkRelations: true
    //   })

    //   class Child extends Test.JSData.Mapper {}
    //   Child.configure({
    //     linkRelations: true
    //   })

    //   Parent.hasMany(Child, {
    //     localField: 'children'
    //   })
    //   Child.belongsTo(Parent)

    //   Parent.inject({
    //     id: 1,
    //     name: 'parent1',
    //     children: [{
    //       id: 1,
    //       name: 'child1'
    //     }]
    //   })

    //   Test.assert.isTrue(Parent.get(1).children[0] instanceof Child)

    //   Parent.inject({
    //     id: 1,
    //     name: 'parent',
    //     children: [
    //       {
    //         id: 1,
    //         name: 'Child-1'
    //       },
    //       {
    //         id: 2,
    //         name: 'Child-2'
    //       }
    //     ]
    //   })

    //   Test.assert.isTrue(Parent.get(1).children[0] instanceof Child)
    //   Test.assert.isTrue(Parent.get(1).children[1] instanceof Child)
    //   Test.assert.deepEqual(Child.filter({ parent_id: 1 }), Parent.get(1).children)
    // })
    // it.skip('should configure enumerability and linking of relations', function () {
    //   class Parent extends Test.JSData.Mapper {}
    //   Parent.configure({
    //     linkRelations: true
    //   })

    //   class Child extends Test.JSData.Mapper {}
    //   Child.configure({
    //     linkRelations: true
    //   })

    //   class OtherChild extends Test.JSData.Mapper {}
    //   OtherChild.configure({
    //     linkRelations: true
    //   })

    //   Parent.hasMany(Child, {
    //     localField: 'children'
    //   })
    //   Child.belongsTo(Parent, {
    //     link: false
    //   })
    //   OtherChild.belongsTo(Parent, {
    //     enumerable: true
    //   })

    //   const child = Child.inject({
    //     id: 1,
    //     parentId: 2,
    //     parent: {
    //       id: 2
    //     }
    //   })

    //   const otherChild = OtherChild.inject({
    //     id: 3,
    //     parentId: 4,
    //     parent: {
    //       id: 4
    //     }
    //   })

    //   Test.assert.isDefined(Child.get(child.id))
    //   Test.assert.isTrue(child.parent === Parent.get(child.parentId))

    //   Test.assert.isDefined(OtherChild.get(otherChild.id))
    //   Test.assert.isTrue(otherChild.parent === Parent.get(otherChild.parentId), 'parent was injected and linked')
    //   Test.assert.isDefined(Parent.get(otherChild.parentId), 'parent was injected and linked')

    //   let foundParent = false
    //   for (var k in otherChild) {
    //     if (k === 'parent' && otherChild[k] === otherChild.parent && otherChild[k] === Parent.get(otherChild.parentId)) {
    //       foundParent = true
    //     }
    //   }
    //   Test.assert.isTrue(foundParent, 'parent is enumerable')
    // })
    it('should replace existing items', function () {
      const Test = this
      let post = Test.PostCollection.add(Test.data.p1)
      post.foo = 'bar'
      post.beep = 'boop'
      Test.assert.objectsEqual(post, {
        author: 'John',
        age: 30,
        id: 5,
        foo: 'bar',
        beep: 'boop'
      })
      post = Test.PostCollection.add(Test.data.p1, { onConflict: 'replace' })
      Test.assert.objectsEqual(post, {
        author: 'John',
        age: 30,
        id: 5
      })
    })
    // it.skip('should not auto-inject relations where auto-injection has been disabled', function () {
    //   const Foo = Test.JSData.Mapper.extend(null, {
    //     name: 'foo'
    //   })
    //   const Bar = Test.JSData.Mapper.extend(null, {
    //     name: 'bar'
    //   })
    //   Foo.hasMany(Bar, {
    //     localField: 'bars',
    //     inject: false
    //   })
    //   Bar.belongsTo(Foo)
    //   const foo = Foo.inject({
    //     id: 1,
    //     bars: [
    //       {
    //         id: 1,
    //         fooId: 1
    //       },
    //       {
    //         id: 2,
    //         fooId: 1
    //       }
    //     ]
    //   })
    //   Test.assert.deepEqual(Bar.getAll(), [], 'nothing should have been injected')
    // })
    // it.skip('should allow custom relation injection logic', function () {
    //   const Foo = Test.JSData.Mapper.extend(null, {
    //     name: 'foo',
    //     linkRelations: true
    //   })
    //   const Bar = Test.JSData.Mapper.extend(null, {
    //     name: 'bar',
    //     linkRelations: true
    //   })
    //   Foo.hasMany(Bar, {
    //     localField: 'bars',
    //     foreignKey: 'fooId',
    //     inject: function (Foo, relationDef, foo) {
    //       const bars = relationDef.Relation.inject(foo.test_bars)
    //       for (var i = 0; i < bars.length; i++) {
    //         bars[i].beep = 'boop'
    //       }
    //       delete foo.test_bars
    //     }
    //   })
    //   Bar.belongsTo(Foo)
    //   const foo = Foo.inject({
    //     id: 1,
    //     test_bars: [
    //       {
    //         id: 1,
    //         fooId: 1
    //       },
    //       {
    //         id: 2,
    //         fooId: 1
    //       }
    //     ]
    //   })
    //   Test.assert.objectsEqual(foo.bars, [
    //     {
    //       id: 1,
    //       fooId: 1,
    //       beep: 'boop'
    //     },
    //     {
    //       id: 2,
    //       fooId: 1,
    //       beep: 'boop'
    //     }
    //   ], 'bars should have been injected')
    // })
    // it.skip('should not link relations nor delete field if "link" is false', function () {
    //   class Foo extends Test.JSData.Mapper {}
    //   Foo.configure({
    //     linkRelations: true
    //   })
    //   class Bar extends Test.JSData.Mapper {}
    //   Bar.configure({
    //     linkRelations: true
    //   })
    //   Foo.hasMany(Bar, {
    //     foreignKey: 'fooId',
    //     localField: 'bars',
    //     link: false
    //   })
    //   Bar.belongsTo(Foo, {
    //     localField: 'foo',
    //     foreignKey: 'fooId'
    //   })
    //   const foo = Foo.inject({
    //     id: 1,
    //     bars: [
    //       {
    //         id: 1,
    //         fooId: 1
    //       },
    //       {
    //         id: 2,
    //         fooId: 1
    //       }
    //     ]
    //   })
    //   Bar.inject({
    //     id: 3,
    //     fooId: 1
    //   })
    //   Test.assert.deepEqual(foo.bars, [
    //     {
    //       id: 1,
    //       fooId: 1
    //     },
    //     {
    //       id: 2,
    //       fooId: 1
    //     }
    //   ], 'bars should have been injected, but not linked')
    //   Test.assert.equal(Bar.getAll().length, 3, '3 bars should be in the store')
    // })
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
    // it('should inject 10,000 items', function () {
    //   const Test = this
    //   let users = []
    //   for (var i = 0; i < 10000; i++) {
    //     users.push({
    //       id: i,
    //       name: 'john smith #' + i,
    //       age: Math.floor(Math.random() * 100),
    //       created: new Date().getTime(),
    //       updated: new Date().getTime()
    //     })
    //   }
    //   const start = new Date().getTime()
    //   Test.UserCollection.add(users)
    //   console.log('\tinject 10,000 users time taken: ', new Date().getTime() - start, 'ms')
    // })
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
    // it.skip('should inject 10,000 items where there is an index on "age"', function () {
    //   class UserMapper extends Test.JSData.Mapper {}
    //   User.createIndex('age')
    //   User.createIndex('created')
    //   User.createIndex('updated')
    //   let users = []
    //   for (var i = 0; i < 10000; i++) {
    //     users.push({
    //       id: i,
    //       name: 'john smith #' + i,
    //       age: Math.floor(Math.random() * 100),
    //       created: new Date().getTime(),
    //       updated: new Date().getTime()
    //     })
    //   }
    //   const start = new Date().getTime()
    //   User.inject(users)
    //   // console.log('\tinject 10,000 users time taken: ', new Date().getTime() - start, 'ms')
    //   // console.log('\tusers age 40-44', User.between(40, 45, { index: 'age' }).length)
    // })
  })
}
