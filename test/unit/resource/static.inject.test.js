/* global Resource:true */
import {assert} from 'chai'

export function init () {
  describe('static inject', function () {
    it('should be a static function', function () {
      assert.isFunction(Resource.inject)
      let User = Resource.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Resource {}
      class User3 extends User2 {}
      assert.isFunction(User.inject)
      assert.isFunction(User2.inject)
      assert.isTrue(Resource.inject === User.inject)
      assert.isTrue(Resource.inject === User2.inject)
      assert.isTrue(User.inject === User2.inject)
      assert.isTrue(User2.inject === User3.inject)
    })
    it('should inject new items into the store', function () {
      class User extends Resource {}
      User.setSchema({ id: {} })

      const user = User.inject({ id: 1 })
      const users = User.inject([{ id: 2 }, { id: 3 }])
      assert.isTrue(User.get(1) === user)
      assert.deepEqual(User.between([2], [3], {
        rightInclusive: true
      }), users)
    })
    it('should inject multiple items into the store', function () {

      assert.objectsEqual(this.Post.inject([
        this.data.p1,
        this.data.p2,
        this.data.p3,
        this.data.p4
      ]), [this.data.p1, this.data.p2, this.data.p3, this.data.p4]);

      assert.objectsEqual(this.Post.get(5), this.data.p1)
      assert.objectsEqual(this.Post.get(6), this.data.p2)
      assert.objectsEqual(this.Post.get(7), this.data.p3)
      assert.objectsEqual(this.Post.get(8), this.data.p4)
    })
    it('should inject existing items into the store', function () {
      class User extends Resource {}
      User.setSchema({ id: {} })

      const user = User.inject({ id: 1 })
      const users = User.inject([{ id: 2 }, { id: 3 }])
      const userAgain = User.inject({ id: 1 })
      const usersAgain = User.inject([{ id: 2 }, { id: 3 }])
      assert.isTrue(User.get(1) === user, 'original reference should still be valid')
      assert.isTrue(User.get(1) === userAgain, 'new reference should be valid')
      assert.isTrue(user === userAgain, 'both references should point to the same object')
      assert.deepEqual(User.between([2], [3], {
        rightInclusive: true
      }), users, 'injection of array should work')
      assert.deepEqual(User.between([2], [3], {
        rightInclusive: true
      }), usersAgain, 're-inject of array should work')
      assert.deepEqual(users, usersAgain, 'inject arrays should be equal')
    })
    it('should replace existing items', function () {
      class User extends Resource {}
      User.setSchema({ id: {} })
      const user = User.inject({ id: 1, foo: 'bar', beep: 'boop' })
      assert.equal(user.id, 1)
      assert.equal(user.foo, 'bar')
      assert.equal(user.beep, 'boop')
      assert.isUndefined(user.biz)
      const existing = User.inject({ id: 1, biz: 'baz', foo: 'BAR' }, { onConflict: 'replace' })
      assert.isTrue(user === existing)
      assert.equal(user.id, 1)
      assert.equal(user.biz, 'baz')
      assert.equal(user.foo, 'BAR')
      assert.isUndefined(user.beep)
    })
    it('should inject relations', function () {
      // can inject items without relations
      this.User.inject(this.data.user1)
      this.Organization.inject(this.data.organization2)
      this.Comment.inject(this.data.comment3)
      this.Profile.inject(this.data.profile4)

      assert.deepEqual(this.User.get(1).id, this.data.user1.id)
      assert.deepEqual(this.Organization.get(2).id, this.data.organization2.id)
      assert.deepEqual(this.Comment.get(3).id, this.data.comment3.id)
      assert.deepEqual(this.Profile.get(4).id, this.data.profile4.id)

      // can inject items with relations
      this.User.inject(this.data.user10)
      this.Organization.inject(this.data.organization15)
      this.Comment.inject(this.data.comment19)
      this.Profile.inject(this.data.profile21)
      this.Group.inject(this.data.group1)

      // originals
      assert.equal(this.User.get(10).name, this.data.user10.name)
      assert.equal(this.User.get(10).id, this.data.user10.id)
      assert.equal(this.User.get(10).organizationId, this.data.user10.organizationId)
      assert.isArray(this.User.get(10).comments)
      assert.deepEqual(this.Organization.get(15).name, this.data.organization15.name)
      assert.deepEqual(this.Organization.get(15).id, this.data.organization15.id)
      assert.isArray(this.Organization.get(15).users)
      assert.deepEqual(this.Comment.get(19).id, this.data.comment19.id)
      assert.deepEqual(this.Comment.get(19).content, this.data.comment19.content)
      assert.deepEqual(this.Profile.get(21).id, this.data.profile21.id)
      assert.deepEqual(this.Profile.get(21).content, this.data.profile21.content)
      assert.deepEqual(this.Group.get(1).id, this.data.group1.id)
      assert.deepEqual(this.Group.get(1).name, this.data.group1.name)
      assert.isArray(this.Group.get(1).userIds)

      // user10 relations
      assert.deepEqual(this.Comment.get(11), this.User.get(10).comments[0])
      assert.deepEqual(this.Comment.get(12), this.User.get(10).comments[1])
      assert.deepEqual(this.Comment.get(13), this.User.get(10).comments[2])
      assert.deepEqual(this.Organization.get(14), this.User.get(10).organization)
      assert.deepEqual(this.Profile.get(15), this.User.get(10).profile)
      assert.isArray(this.User.get(10).groups)
      assert.deepEqual(this.User.get(10).groups[0], this.Group.get(1))

      // group1 relations
      assert.isArray(this.Group.get(1).users)
      assert.deepEqual(this.Group.get(1).users[0], this.User.get(10))

      // organization15 relations
      assert.deepEqual(this.User.get(16), this.Organization.get(15).users[0])
      assert.deepEqual(this.User.get(17), this.Organization.get(15).users[1])
      assert.deepEqual(this.User.get(18), this.Organization.get(15).users[2])

      // comment19 relations
      assert.deepEqual(this.User.get(20), this.Comment.get(19).user)
      assert.deepEqual(this.User.get(19), this.Comment.get(19).approvedByUser)

      // profile21 relations
      assert.deepEqual(this.User.get(22), this.Profile.get(21).user)
    })
    it('should find inverse links', function () {
      this.User.inject({ organizationId: 5, id: 1 })

      this.Organization.inject({ id: 5 })

      assert.objectsEqual(this.User.get(1).organization, { id: 5 })

      assert.objectsEqual(this.User.get(1).comments, [])
      assert.objectsEqual(this.User.get(1).approvedComments, [])

      this.Comment.inject({ approvedBy: 1, id: 23 })

      assert.equal(0, this.User.get(1).comments.length)
      assert.equal(1, this.User.get(1).approvedComments.length)

      this.Comment.inject({ approvedBy: 1, id: 44 })

      assert.equal(0, this.User.get(1).comments.length)
      assert.equal(2, this.User.get(1).approvedComments.length)
    })
    it('should inject cyclic dependencies', function () {
      class Foo extends Resource {}
      Foo.configure({
        linkRelations: true
      })
      Foo.setSchema({
        id: {}
      })
      Foo.hasMany(Foo, {
        localField: 'children',
        foreignKey: 'parentId'
      })
      const injected = Foo.inject([{
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

      assert.isDefined(Foo.get(1))
      assert.isDefined(Foo.get(2))
      assert.isDefined(Foo.get(3))
      assert.isDefined(Foo.get(4))
      assert.isDefined(Foo.get(5))
      assert.isDefined(Foo.get(6))
      assert.isDefined(Foo.get(7))
    })
    it('should work when injecting child relations multiple times', function () {
      class Parent extends Resource {}
      Parent.configure({
        linkRelations: true
      })
      Parent.setSchema({
        id: {}
      })

      class Child extends Resource {}
      Child.configure({
        linkRelations: true
      })
      Child.setSchema({
        id: {}
      })

      Parent.hasMany(Child, {
        localField: 'children'
      })
      Child.belongsTo(Parent)

      Parent.inject({
        id: 1,
        name: 'parent1',
        children: [{
          id: 1,
          name: 'child1'
        }]
      })

      assert.isTrue(Parent.get(1).children[0] instanceof Child)

      Parent.inject({
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

      assert.isTrue(Parent.get(1).children[0] instanceof Child)
      assert.isTrue(Parent.get(1).children[1] instanceof Child)
      assert.deepEqual(Child.filter({ parentId: 1 }), Parent.get(1).children)
    })
    it('should configure enumerability and linking of relations', function () {
      class Parent extends Resource {}
      Parent.configure({
        linkRelations: true
      })
      Parent.setSchema({
        id: {}
      })

      class Child extends Resource {}
      Child.configure({
        linkRelations: true
      })
      Child.setSchema({
        id: {}
      })

      class OtherChild extends Resource {}
      OtherChild.configure({
        linkRelations: true
      })
      OtherChild.setSchema({
        id: {}
      })

      Parent.hasMany(Child, {
        localField: 'children'
      })
      Child.belongsTo(Parent, {
        link: false
      })
      OtherChild.belongsTo(Parent, {
        enumerable: true
      })

      const child = Child.inject({
        id: 1,
        parentId: 2,
        parent: {
          id: 2
        }
      })

      const otherChild = OtherChild.inject({
        id: 3,
        parentId: 4,
        parent: {
          id: 4
        }
      })

      assert.isDefined(Child.get(child.id))
      assert.isFalse(child.parent === Parent.get(child.parentId), 'parent was injected but not linked')

      assert.isDefined(OtherChild.get(otherChild.id))
      assert.isTrue(otherChild.parent === Parent.get(otherChild.parentId), 'parent was injected and linked')
      assert.isDefined(Parent.get(otherChild.parentId), 'parent was injected and linked')

      let foundParent = false
      for (var k in otherChild) {
        if (k === 'parent' && otherChild[k] === otherChild.parent && otherChild[k] === Parent.get(otherChild.parentId)) {
          foundParent = true
        }
      }
      assert.isTrue(foundParent, 'parent is enumerable')
    })
    it('should replace existing items', function () {
      let post = this.Post.inject(this.data.p1)
      post.foo = 'bar'
      post.beep = 'boop'
      assert.objectsEqual(post, {
        author: 'John',
        age: 30,
        id: 5,
        foo: 'bar',
        beep: 'boop'
      })
      post = this.Post.inject(this.data.p1, { onConflict: 'replace' })
      assert.objectsEqual(post, {
        author: 'John',
        age: 30,
        id: 5
      })
    })
    it('should not auto-inject relations where auto-injection has been disabled', function () {
      const Foo = Resource.extend(null, {
        name: 'foo'
      })
      const Bar = Resource.extend(null, {
        name: 'bar'
      })
      Foo.hasMany(Bar, {
        localField: 'bars',
        inject: false
      })
      Bar.belongsTo(Foo)
      const foo = Foo.inject({
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
      assert.deepEqual(Bar.getAll(), [], 'nothing should have been injected')
    })
    it('should allow custom relation injection logic', function () {
      const Foo = Resource.extend(null, {
        name: 'foo',
        linkRelations: true
      })
      const Bar = Resource.extend(null, {
        name: 'bar',
        linkRelations: true
      })
      Foo.hasMany(Bar, {
        localField: 'bars',
        foreignKey: 'fooId',
        inject: function (Foo, relationDef, foo) {
          const bars = relationDef.Relation.inject(foo.test_bars)
          for (var i = 0; i < bars.length; i++) {
            bars[i].beep = 'boop'
          }
          delete foo.test_bars
        }
      })
      Bar.belongsTo(Foo)
      const foo = Foo.inject({
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
      ], 'bars should have been injected')
    })
    it('should not link relations nor delete field if "link" is false', function () {
      class Foo extends Resource {}
      Foo.configure({
        linkRelations: true
      })
      Foo.setSchema({
        id: {}
      })
      class Bar extends Resource {}
      Bar.configure({
        linkRelations: true
      })
      Bar.setSchema({
        id: {}
      })
      Foo.hasMany(Bar, {
        localField: 'bars',
        link: false
      })
      Bar.belongsTo(Foo)
      const foo = Foo.inject({
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
      Bar.inject({
        id: 3,
        fooId: 1
      })
      assert.deepEqual(foo.bars, [
        {
          id: 1,
          fooId: 1
        },
        {
          id: 2,
          fooId: 1
        }
      ], 'bars should have been injected, but not linked')
      assert.equal(Bar.getAll().length, 3, '3 bars should be in the store')
    })
  })
}
