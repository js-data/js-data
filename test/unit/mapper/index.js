import * as create from './create.test'
import * as createRecord from './createRecord.test'
import * as createMany from './createMany.test'
import * as destroy from './destroy.test'
import * as destroyAll from './destroyAll.test'
import * as find from './find.test'
import * as findAll from './findAll.test'
import * as update from './update.test'
import * as updateMany from './updateMany.test'
import * as updateAll from './updateAll.test'

const defaults = {
  csp: false,
  defaultAdapter: 'http',
  idAttribute: 'id',
  relationsEnumerable: false,
  raw: false,
  upsert: true
}

export function init () {
  describe('Mapper', function () {
    it('should be a constructor function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Model, 'should be a function')
      let instance = new Test.JSData.Model()
      Test.assert.isTrue(instance instanceof Test.JSData.Model, 'instance should be an instance')
      instance = new Test.JSData.Model({ foo: 'bar' })
      Test.assert.deepEqual(instance, { foo: 'bar' }, 'instance should get initialization properties')
    })
    it('should have the correct static defaults', function () {
      const Test = this
      for (var key in defaults) {
        Test.assert.equal(Test.JSData.Model[key], defaults[key], key + ' should be ' + defaults[key])
      }
    })
    it('child should inherit static defaults', function () {
      const Test = this
      var key
      let User = Test.JSData.Model.extend({}, {
        name: 'user'
      })
      for (key in defaults) {
        Test.assert.equal(User[key], defaults[key], key + ' should be ' + defaults[key])
      }
      class User2 extends Test.JSData.Model {}
      for (key in defaults) {
        Test.assert.equal(User2[key], defaults[key], key + ' should be ' + defaults[key])
      }
    })
    it('child should override static defaults', function () {
      const Test = this
      const store = new Test.JSData.DS()

      /**
       * ES5 ways of creating a new Model
       */
      const User = Test.JSData.Model.extend({
        initialize () {
          this.foo = 'foo'
        }
      }, {
        csp: true,
        idAttribute: '_id',
        name: 'user'
      })
      const user = new User({ id: 1 })
      Test.assert.equal(user.foo, 'foo', 'initialize should have been called')
      Test.assert.isTrue(user instanceof User)
      Test.assert.isTrue(User.is(user))
      Test.assert.notEqual(User.name, 'User')

      const Post = Test.JSData.Model.extend({
        initialize () {
          this.foo = 'foo'
        }
      }, {
        idAttribute: '_id',
        name: 'post'
      })
      const post = new Post({ id: 1 })
      Test.assert.equal(post.foo, 'foo', 'initialize should have been called')
      Test.assert.isTrue(post instanceof Post)
      Test.assert.isTrue(Post.is(post))
      Test.assert.equal(Post.name, 'Post')

      const Comment = store.defineModel({
        idAttribute: '_id',
        name: 'comment'
      })
      const comment = new Comment({ id: 1 })
      Test.assert.isTrue(comment instanceof Comment)
      Test.assert.isTrue(Comment.is(comment))
      Test.assert.equal(Comment.name, 'Comment')

      const Label = Test.JSData.Model.extend({
        constructor: function MyLabel () {
          Object.getPrototypeOf(this.constructor).apply(this, arguments)
        }
      })
      const label = new Label({ id: 1 })
      Test.assert.isTrue(label instanceof Label)
      Test.assert.isTrue(Label.is(label))
      Test.assert.equal(Label.name, 'MyLabel')

      /**
       * ES6 ways of creating a new Model
       */
      class Profile extends Test.JSData.Model {}
      Profile.configure({
        idAttribute: '_id'
      })
      const profile = new Profile({ id: 1 })
      Test.assert.isTrue(profile instanceof Profile)
      Test.assert.isTrue(Profile.is(profile))
      Test.assert.equal(Profile.name, 'Profile')

      class Type extends Test.JSData.Model {}
      Type.configure({
        idAttribute: '_id'
      })
      const type = new Type({ id: 1 })
      Test.assert.isTrue(type instanceof Type)
      Test.assert.isTrue(Type.is(type))
      Test.assert.equal(Type.name, 'Type')

     /**
       * ES7 way of creating a new Model
       */
      // Doesn't work right now because of https://github.com/babel/babel/issues/2645
      // @configure({
      //   idAttribute: '_id'
      // })
      // class User5 extends Model {}
    })
    // it('should allow schema definition with basic indexes', function () {
    //   class User extends Model {}
    //   User.setSchema({
    //     age: { indexed: true },
    //     role: { indexed: true }
    //   })
    //   User.inject([
    //     { id: 2, age: 18, role: 'admin' },
    //     { id: 3, age: 19, role: 'dev' },
    //     { id: 9, age: 19, role: 'admin' },
    //     { id: 6, age: 19, role: 'owner' },
    //     { id: 4, age: 22, role: 'dev' },
    //     { id: 1, age: 23, role: 'owner' }
    //   ])
    //   Test.assert.deepEqual(
    //     User.getAll(19, { index: 'age' }),
    //     [
    //       { id: 3, age: 19, role: 'dev' },
    //       { id: 6, age: 19, role: 'owner' },
    //       { id: 9, age: 19, role: 'admin' }
    //     ],
    //     'should have found all of age:19 using 1 keyList'
    //   )
    // })

    it('should have events', function () {
      const Test = this
      class User extends Test.JSData.Model {}
      const listener = Test.sinon.stub()
      User.on('bar', listener)
      User.emit('bar')
      Test.assert.isTrue(User._events() !== Test.JSData.Model._events())
      Test.assert.isTrue(listener.calledOnce)
    })

    it('should work with csp set to true', function () {
      const Test = this
      const User = Test.JSData.Model.extend({}, {
        csp: true,
        name: 'user'
      })
      const user = new User({ name: 'John' })
      Test.assert.isTrue(user instanceof User)
      Test.assert.notEqual(User.name, 'User')

      Test.assert.equal(this.Post.name, 'Post')
    })

    // it('should allow enhanced relation getters', function () {
    //   let wasItActivated = false
    //   class Foo extends Model {}
    //   class Bar extends Model {}
    //   Foo.belongsTo(Bar, {
    //     localField: 'bar',
    //     foreignKey: 'barId',
    //     get: function (Foo, relation, foo, orig) {
    //       // "relation.name" has relationship "relation.type" to "relation.relation"
    //       wasItActivated = true
    //       return orig()
    //     }
    //   })
    //   const foo = Foo.inject({
    //     id: 1,
    //     barId: 1,
    //     bar: {
    //       id: 1
    //     }
    //   })
    //   Test.assert.equal(foo.bar.id, 1)
    //   Test.assert.isTrue(wasItActivated)
    // })
    // it('should update links', function () {
    //   class Foo extends Model {}
    //   class Bar extends Model {}
    //   Foo.autoInject = true
    //   Foo.linkRelations = true
    //   Bar.autoInject = true
    //   Bar.linkRelations = true
    //   Foo.hasMany(Bar, {
    //     localField: 'bars',
    //     foreignKey: 'foo_id'
    //   })
    //   Bar.belongsTo(Foo, {
    //     localField: 'foo',
    //     foreignKey: 'foo_id'
    //   })
    //   const foo66 = Foo.inject({
    //     id: 66
    //   })
    //   const foo77 = Foo.inject({
    //     id: 77
    //   })
    //   const bar88 = Bar.inject({
    //     id: 88,
    //     foo_id: 66
    //   })
    //   Test.assert.isTrue(bar88.foo === foo66)
    //   Test.assert.equal(66, bar88.foo_id)
    //   bar88.foo_id = 77
    //   Test.assert.isTrue(bar88.foo === foo77)
    //   Test.assert.equal(77, bar88.foo_id)
    //   bar88.foo = foo66
    //   Test.assert.isTrue(bar88.foo === foo66)
    //   Test.assert.equal(66, bar88.foo_id)
    //   foo66.bars = [bar88]
    //   Test.assert.objectsEqual(foo66.bars, Bar.getAll())
    //   Test.assert.objectsEqual(foo77.bars, [])
    //   foo77.bars = [bar88]
    //   Test.assert.objectsEqual(foo66.bars, [])
    //   Test.assert.objectsEqual(foo77.bars, Bar.getAll())
    // })
    it('should allow instance events', function (done) {
      const Test = this
      let changed = false
      class Foo extends Test.JSData.Model {}
      Foo.setSchema({
        bar: { type: 'string', track: true }
      })
      const foo = new Foo({ id: 1 })

      setTimeout(function () {
        if (!changed) {
          done('failed to fire change event')
        }
      }, 10)

      foo.on('change', function () {
        changed = true
        done()
      })

      foo.bar = 'baz'
    })
    it('should allow Resource change events', function (done) {
      const Test = this
      let changed = false
      class Foo extends Test.JSData.Model {}
      Foo.setSchema({
        bar: { type: 'string', track: true }
      })
      const fooCollection = new Test.JSData.Collection([], {
        model: Foo
      })
      const foo = fooCollection.add({ id: 1 })

      setTimeout(function () {
        if (!changed) {
          done('failed to fire change event')
        }
      }, 10)

      fooCollection.on('change', function () {
        changed = true
        done()
      })

      foo.bar = 'baz'
    })
    // it('should allow resources to extend other resources in ES6', function () {
    //   class Baz extends Model {}
    //   Baz.linkRelations = true
    //   class Foo extends Model {
    //     say () {
    //       return this.constructor.name
    //     }
    //   }
    //   Foo.linkRelations = true
    //   Foo.belongsTo(Baz, {
    //     localField: 'baz',
    //     foreignKey: 'bazId'
    //   })
    //   class Bar extends Foo {}
    //   Test.assert.equal(Foo.name, 'Foo')
    //   Test.assert.equal(Bar.name, 'Bar')

    //   const baz = Baz.inject({ id: 10 })

    //   const foo = Foo.inject({ id: 1, type: 'foo', bazId: 10 })
    //   const bar = Bar.inject({ id: 1, type: 'bar', bazId: 10 })
    //   Test.assert.isTrue(baz === foo.baz)
    //   Test.assert.isTrue(baz === bar.baz)

    //   Test.assert.equal(foo.say(), 'Foo')
    //   Test.assert.equal(bar.say(), 'Bar')
    // })
    // it('should allow resources to extend other resources in ES5', function () {
    //   const Baz = Model.extend({}, { name: 'Baz', linkRelations: true })
    //   const Foo = Model.extend({
    //     say () {
    //       return this.constructor.name
    //     }
    //   }, { name: 'Foo', linkRelations: true })
    //   Foo.belongsTo(Baz, {
    //     localField: 'baz',
    //     foreignKey: 'bazId'
    //   })
    //   const Bar = Foo.extend({}, { name: 'Bar' })
    //   Test.assert.equal(Foo.name, 'Foo')
    //   Test.assert.equal(Bar.name, 'Bar')

    //   const baz = Baz.inject({ id: 10 })

    //   const foo = Foo.inject({ id: 1, type: 'foo', bazId: 10 })
    //   const bar = Bar.inject({ id: 1, type: 'bar', bazId: 10 })
    //   Test.assert.isTrue(baz === foo.baz)
    //   Test.assert.isTrue(baz === bar.baz)

    //   Test.assert.equal(foo.say(), 'Foo')
    //   Test.assert.equal(bar.say(), 'Bar')
    // })
    it('should allow instance events 2', function (done) {
      const Test = this
      let changed = false
      class Foo extends Test.JSData.Model {}
      Foo.setSchema({
        bar: { type: 'string', track: true }
      })
      const foo = new Foo({ id: 1 })

      setTimeout(function () {
        if (!changed) {
          done('failed to fire change event')
        }
      }, 10)

      foo.on('change', function (Foo, foo) {
        changed = true
        done()
      })

      foo.set('bar', 'baz')
    })
    it('should allow Resource change events 2', function (done) {
      const Test = this
      let changed = false
      class Foo extends Test.JSData.Model {}
      Foo.setSchema({
        bar: { type: 'string', track: true }
      })
      const fooCollection = new Test.JSData.Collection([], { model: Foo })
      const foo = fooCollection.add({ id: 1 })

      setTimeout(function () {
        if (!changed) {
          done('failed to fire change event')
        }
      }, 10)

      fooCollection.on('change', function (fooCollection, foo) {
        changed = true
        done()
      })

      foo.set('bar', 'baz')
    })

    create.init()
    createRecord.init()
    createMany.init()
    destroy.init()
    destroyAll.init()
    find.init()
    findAll.init()
    update.init()
    updateMany.init()
    updateAll.init()
  })
}
