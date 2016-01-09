/* global Model:true, Collection: true */
import {assert} from 'chai'

export function init () {
  describe('#add', function () {
    it('should inject new items into the collection', function () {
      const collection = new Collection()
      const user = collection.add({ id: 1 })
      const users = collection.add([{ id: 2 }, { id: 3 }])
      assert.isTrue(collection.get(1) === user)
      assert.deepEqual(collection.between([2], [3], {
        rightInclusive: true
      }), users)
    })
    it('should inject multiple items into the collection', function () {
      assert.objectsEqual(this.PostCollection.add([
        this.data.p1,
        this.data.p2,
        this.data.p3,
        this.data.p4
      ]), [this.data.p1, this.data.p2, this.data.p3, this.data.p4]);

      assert.objectsEqual(this.PostCollection.get(5), this.data.p1)
      assert.objectsEqual(this.PostCollection.get(6), this.data.p2)
      assert.objectsEqual(this.PostCollection.get(7), this.data.p3)
      assert.objectsEqual(this.PostCollection.get(8), this.data.p4)
    })
    it('should inject existing items into the store', function () {
      class User extends Model {}
      const collection = new Collection({ model: User })

      const user = collection.add({ id: 1 })
      const users = collection.add([{ id: 2 }, { id: 3 }])
      const userAgain = collection.add({ id: 1 })
      const usersAgain = collection.add([{ id: 2 }, { id: 3 }])
      assert.isTrue(collection.get(1) === user, 'original reference should still be valid')
      assert.isTrue(collection.get(1) === userAgain, 'new reference should be valid')
      assert.isTrue(user === userAgain, 'both references should point to the same object')
      assert.deepEqual(collection.between([2], [3], {
        rightInclusive: true
      }), users, 'injection of array should work')
      assert.deepEqual(collection.between([2], [3], {
        rightInclusive: true
      }), usersAgain, 're-inject of array should work')
      assert.deepEqual(users, usersAgain, 'inject arrays should be equal')
    })
    it('should replace existing items', function () {
      class User extends Model {}
      const collection = new Collection({ model: User })
      const user = collection.add({ id: 1, foo: 'bar', beep: 'boop' })
      assert.equal(user.id, 1)
      assert.equal(user.foo, 'bar')
      assert.equal(user.beep, 'boop')
      assert.isUndefined(user.biz)
      const existing = collection.add({ id: 1, biz: 'baz', foo: 'BAR' }, { onConflict: 'replace' })
      assert.isTrue(user === existing)
      assert.equal(user.id, 1)
      assert.equal(user.biz, 'baz')
      assert.equal(user.foo, 'BAR')
      assert.isUndefined(user.beep)
    })
    // it.skip('should inject relations', function () {
    //   // can inject items without relations
    //   this.UserCollection.add(this.data.user1)
    //   this.OrganizationCollection.add(this.data.organization2)
    //   this.CommentCollection.add(this.data.comment3)
    //   this.ProfileCollection.add(this.data.profile4)

    //   assert.deepEqual(this.UserCollection.get(1).id, this.data.user1.id)
    //   assert.deepEqual(this.OrganizationCollection.get(2).id, this.data.organization2.id)
    //   assert.deepEqual(this.CommentCollection.get(3).id, this.data.comment3.id)
    //   assert.deepEqual(this.ProfileCollection.get(4).id, this.data.profile4.id)

    //   // can inject items with relations
    //   this.UserCollection.add(this.data.user10)
    //   this.OrganizationCollection.add(this.data.organization15)
    //   this.CommentCollection.add(this.data.comment19)
    //   this.ProfileCollection.add(this.data.profile21)
    //   this.GroupCollection.add(this.data.group1)

    //   // originals
    //   assert.equal(this.UserCollection.get(10).name, this.data.user10.name)
    //   assert.equal(this.UserCollection.get(10).id, this.data.user10.id)
    //   assert.equal(this.UserCollection.get(10).organizationId, this.data.user10.organizationId)
    //   assert.isArray(this.UserCollection.get(10).comments)
    //   assert.deepEqual(this.OrganizationCollection.get(15).name, this.data.organization15.name)
    //   assert.deepEqual(this.OrganizationCollection.get(15).id, this.data.organization15.id)
    //   assert.isArray(this.OrganizationCollection.get(15).users)
    //   assert.deepEqual(this.CommentCollection.get(19).id, this.data.comment19.id)
    //   assert.deepEqual(this.CommentCollection.get(19).content, this.data.comment19.content)
    //   assert.deepEqual(this.ProfileCollection.get(21).id, this.data.profile21.id)
    //   assert.deepEqual(this.ProfileCollection.get(21).content, this.data.profile21.content)
    //   assert.deepEqual(this.GroupCollection.get(1).id, this.data.group1.id)
    //   assert.deepEqual(this.GroupCollection.get(1).name, this.data.group1.name)
    //   assert.isArray(this.GroupCollection.get(1).userIds)

    //   // user10 relations
    //   assert.deepEqual(this.CommentCollection.get(11), this.UserCollection.get(10).comments[0])
    //   assert.deepEqual(this.CommentCollection.get(12), this.UserCollection.get(10).comments[1])
    //   assert.deepEqual(this.CommentCollection.get(13), this.UserCollection.get(10).comments[2])
    //   assert.deepEqual(this.OrganizationCollection.get(14), this.UserCollection.get(10).organization)
    //   assert.deepEqual(this.ProfileCollection.get(15), this.UserCollection.get(10).profile)
    //   assert.isArray(this.UserCollection.get(10).groups)
    //   assert.deepEqual(this.UserCollection.get(10).groups[0], this.GroupCollection.get(1))

    //   // group1 relations
    //   assert.isArray(this.GroupCollection.get(1).users)
    //   assert.deepEqual(this.GroupCollection.get(1).users[0], this.UserCollection.get(10))

    //   // organization15 relations
    //   assert.deepEqual(this.UserCollection.get(16), this.OrganizationCollection.get(15).users[0])
    //   assert.deepEqual(this.UserCollection.get(17), this.OrganizationCollection.get(15).users[1])
    //   assert.deepEqual(this.UserCollection.get(18), this.OrganizationCollection.get(15).users[2])

    //   // comment19 relations
    //   assert.deepEqual(this.UserCollection.get(20), this.CommentCollection.get(19).user)
    //   assert.deepEqual(this.UserCollection.get(19), this.CommentCollection.get(19).approvedByUser)

    //   // profile21 relations
    //   assert.deepEqual(this.UserCollection.get(22), this.ProfileCollection.get(21).user)
    // })
    // it.skip('should find inverse links', function () {
    //   this.UserCollection.add({ organizationId: 5, id: 1 })
    //   this.OrganizationCollection.add({ id: 5 })

    //   assert.objectsEqual(this.UserCollection.get(1).organization, { id: 5 })

    //   assert.objectsEqual(this.UserCollection.get(1).comments, [])
    //   assert.objectsEqual(this.UserCollection.get(1).approvedComments, [])

    //   const comment1 = this.CommentCollection.add({ approvedBy: 1, id: 23 })

    //   assert.equal(0, this.UserCollection.get(1).comments.length)
    //   assert.equal(1, this.UserCollection.get(1).approvedComments.length)

    //   const comment2 = this.CommentCollection.add({ approvedBy: 1, id: 44 })

    //   assert.equal(0, this.UserCollection.get(1).comments.length)
    //   assert.equal(2, this.UserCollection.get(1).approvedComments.length)
    // })
    // it.skip('should inject cyclic dependencies', function () {
    //   class Foo extends Model {}
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

    //   assert.equal(injected[0].id, 1)
    //   assert.equal(injected[0].children[0].id, 2)
    //   assert.equal(injected[0].children[1].id, 3)
    //   assert.equal(injected[0].children[0].children[0].id, 4)
    //   assert.equal(injected[0].children[0].children[1].id, 5)
    //   assert.equal(injected[0].children[1].children[0].id, 6)
    //   assert.equal(injected[0].children[1].children[1].id, 7)

    //   assert.isDefined(Foo.get(1))
    //   assert.isDefined(Foo.get(2))
    //   assert.isDefined(Foo.get(3))
    //   assert.isDefined(Foo.get(4))
    //   assert.isDefined(Foo.get(5))
    //   assert.isDefined(Foo.get(6))
    //   assert.isDefined(Foo.get(7))
    // })
    // it.skip('should work when injecting child relations multiple times', function () {
    //   class Parent extends Model {}
    //   Parent.configure({
    //     linkRelations: true
    //   })

    //   class Child extends Model {}
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

    //   assert.isTrue(Parent.get(1).children[0] instanceof Child)

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

    //   assert.isTrue(Parent.get(1).children[0] instanceof Child)
    //   assert.isTrue(Parent.get(1).children[1] instanceof Child)
    //   assert.deepEqual(Child.filter({ parent_id: 1 }), Parent.get(1).children)
    // })
    // it.skip('should configure enumerability and linking of relations', function () {
    //   class Parent extends Model {}
    //   Parent.configure({
    //     linkRelations: true
    //   })

    //   class Child extends Model {}
    //   Child.configure({
    //     linkRelations: true
    //   })

    //   class OtherChild extends Model {}
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

    //   assert.isDefined(Child.get(child.id))
    //   assert.isTrue(child.parent === Parent.get(child.parentId))

    //   assert.isDefined(OtherChild.get(otherChild.id))
    //   assert.isTrue(otherChild.parent === Parent.get(otherChild.parentId), 'parent was injected and linked')
    //   assert.isDefined(Parent.get(otherChild.parentId), 'parent was injected and linked')

    //   let foundParent = false
    //   for (var k in otherChild) {
    //     if (k === 'parent' && otherChild[k] === otherChild.parent && otherChild[k] === Parent.get(otherChild.parentId)) {
    //       foundParent = true
    //     }
    //   }
    //   assert.isTrue(foundParent, 'parent is enumerable')
    // })
    it('should replace existing items', function () {
      let post = this.PostCollection.add(this.data.p1)
      post.foo = 'bar'
      post.beep = 'boop'
      assert.objectsEqual(post, {
        author: 'John',
        age: 30,
        id: 5,
        foo: 'bar',
        beep: 'boop'
      })
      post = this.PostCollection.add(this.data.p1, { onConflict: 'replace' })
      assert.objectsEqual(post, {
        author: 'John',
        age: 30,
        id: 5
      })
    })
    // it.skip('should not auto-inject relations where auto-injection has been disabled', function () {
    //   const Foo = Model.extend(null, {
    //     name: 'foo'
    //   })
    //   const Bar = Model.extend(null, {
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
    //   assert.deepEqual(Bar.getAll(), [], 'nothing should have been injected')
    // })
    // it.skip('should allow custom relation injection logic', function () {
    //   const Foo = Model.extend(null, {
    //     name: 'foo',
    //     linkRelations: true
    //   })
    //   const Bar = Model.extend(null, {
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
    //   assert.objectsEqual(foo.bars, [
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
    //   class Foo extends Model {}
    //   Foo.configure({
    //     linkRelations: true
    //   })
    //   class Bar extends Model {}
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
    //   assert.deepEqual(foo.bars, [
    //     {
    //       id: 1,
    //       fooId: 1
    //     },
    //     {
    //       id: 2,
    //       fooId: 1
    //     }
    //   ], 'bars should have been injected, but not linked')
    //   assert.equal(Bar.getAll().length, 3, '3 bars should be in the store')
    // })
    it('should inject 1,000 items', function () {
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
      const start = new Date().getTime()
      this.UserCollection.add(users)
      // console.log('\tinject 1,000 users time taken: ', new Date().getTime() - start, 'ms')
    })
    // it.skip('should inject 10,000 items', function () {
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
    //   this.UserCollection.add(users)
    //   // console.log('\tinject 10,000 users time taken: ', new Date().getTime() - start, 'ms')
    // })
    it('should inject 1,000 items where there is an index on "age"', function () {
      class User extends Model {}
      const collection = new Collection({ model: User })
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
      const start = new Date().getTime()
      collection.add(users)
      // console.log('\tinject 1,000 users time taken: ', new Date().getTime() - start, 'ms')
    })
    // it.skip('should inject 10,000 items where there is an index on "age"', function () {
    //   class User extends Model {}
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
    it('should inject temporary items', function () {
      const user = this.UserCollection.add({
        name: 'John'
      }, { autoPk: true })
      assert.isDefined(user.id)
      assert.isTrue(this.UserCollection.autoPks[user.id] === user)
      assert.isTrue(this.UserCollection.getAll()[0] === user)
      assert.isTrue(this.UserCollection.getAutoPkItems()[0] === user)
      assert.deepEqual(user.toJSON(), { name: 'John', id: user.id })
      assert.equal(user.hashCode(), user.id)
    })
  })
}
