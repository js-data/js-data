/* global JSData:true, Model:true, Collection:true, configure:true, sinon:true */
import {assert} from 'chai'
import * as changes from './changes.test'
import * as create from './create.test'
import * as staticCreate from './static.create.test'
import * as staticCreateInstance from './static.createInstance.test'
import * as staticCreateMany from './static.createMany.test'
import * as destroy from './destroy.test'
import * as staticDestroy from './static.destroy.test'
import * as staticDestroyAll from './static.destroyAll.test'
import * as staticFind from './static.find.test'
import * as staticFindAll from './static.findAll.test'
import * as get from './get.test'
import * as hasChanges from './hasChanges.test'
import * as revert from './revert.test'
import * as save from './save.test'
import * as set from './set.test'
import * as staticUpdate from './static.update.test'
import * as staticUpdateMany from './static.updateMany.test'
import * as staticUpdateAll from './static.updateAll.test'
import * as unset from './unset.test'

const defaults = {
  csp: false,
  defaultAdapter: 'http',
  idAttribute: 'id',
  relationsEnumerable: false,
  raw: false,
  upsert: true
}

export function init () {
  describe('Model', function () {
    it('should be a constructor function', function () {
      assert.isFunction(Model, 'should be a function')
      let instance = new Model()
      assert.isTrue(instance instanceof Model, 'instance should be an instance')
      instance = new Model({ foo: 'bar' })
      assert.deepEqual(instance, { foo: 'bar' }, 'instance should get initialization properties')
    })
    it('should have the correct static defaults', function () {
      for (var key in defaults) {
        assert.equal(Model[key], defaults[key], key + ' should be ' + defaults[key])
      }
    })
    it('child should inherit static defaults', function () {
      var key
      let User = Model.extend({}, {
        name: 'user'
      })
      for (key in defaults) {
        assert.equal(User[key], defaults[key], key + ' should be ' + defaults[key])
      }
      class User2 extends Model {}
      for (key in defaults) {
        assert.equal(User2[key], defaults[key], key + ' should be ' + defaults[key])
      }
    })
    it('child should override static defaults', function () {
      const store = new JSData.DS()

      /**
       * ES5 ways of creating a new Model
       */
      const User = Model.extend({
        initialize () {
          this.foo = 'foo'
        }
      }, {
        csp: true,
        idAttribute: '_id',
        name: 'user'
      })
      const user = new User({ id: 1 })
      assert.equal(user.foo, 'foo', 'initialize should have been called')
      assert.isTrue(user instanceof User)
      assert.isTrue(User.is(user))
      assert.equal(User.name, '')

      const Post = Model.extend({
        initialize () {
          this.foo = 'foo'
        }
      }, {
        idAttribute: '_id',
        name: 'post'
      })
      const post = new Post({ id: 1 })
      assert.equal(post.foo, 'foo', 'initialize should have been called')
      assert.isTrue(post instanceof Post)
      assert.isTrue(Post.is(post))
      assert.equal(Post.name, 'Post')

      const Comment = store.defineModel({
        idAttribute: '_id',
        name: 'comment'
      })
      const comment = new Comment({ id: 1 })
      assert.isTrue(comment instanceof Comment)
      assert.isTrue(Comment.is(comment))
      assert.equal(Comment.name, 'Comment')

      const Label = Model.extend({
        constructor: function MyLabel () {
          Object.getPrototypeOf(this.constructor).apply(this, arguments)
        }
      })
      const label = new Label({ id: 1 })
      assert.isTrue(label instanceof Label)
      assert.isTrue(Label.is(label))
      assert.equal(Label.name, 'MyLabel')


      /**
       * ES6 ways of creating a new Model
       */
      class Profile extends Model {}
      configure({
        idAttribute: '_id'
      })(Profile)
      const profile = new Profile({ id: 1 })
      assert.isTrue(profile instanceof Profile)
      assert.isTrue(Profile.is(profile))
      assert.equal(Profile.name, 'Profile')

      class Type extends Model {}
      Type.configure({
        idAttribute: '_id'
      })
      const type = new Type({ id: 1 })
      assert.isTrue(type instanceof Type)
      assert.isTrue(Type.is(type))
      assert.equal(Type.name, 'Type')

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
    //   assert.deepEqual(
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
      class User extends Model {}
      const listener = sinon.stub()
      User.on('bar', listener)
      User.emit('bar')
      assert.isTrue(User._events() !== Model._events())
      assert.isTrue(listener.calledOnce)
    })

    it('should work with csp set to true', function () {
      const User = Model.extend({}, {
        csp: true,
        name: 'user'
      })
      const user = new User({ name: 'John' })
      assert.isTrue(user instanceof User)
      assert.equal(User.name, '')

      assert.equal(this.Post.name, 'Post')
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
    //   assert.equal(foo.bar.id, 1)
    //   assert.isTrue(wasItActivated)
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
    //   assert.isTrue(bar88.foo === foo66)
    //   assert.equal(66, bar88.foo_id)
    //   bar88.foo_id = 77
    //   assert.isTrue(bar88.foo === foo77)
    //   assert.equal(77, bar88.foo_id)
    //   bar88.foo = foo66
    //   assert.isTrue(bar88.foo === foo66)
    //   assert.equal(66, bar88.foo_id)
    //   foo66.bars = [bar88]
    //   assert.objectsEqual(foo66.bars, Bar.getAll())
    //   assert.objectsEqual(foo77.bars, [])
    //   foo77.bars = [bar88]
    //   assert.objectsEqual(foo66.bars, [])
    //   assert.objectsEqual(foo77.bars, Bar.getAll())
    // })
    it('should allow instance events', function (done) {
      let changed = false
      class Foo extends Model {}
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
      let changed = false
      class Foo extends Model {}
      Foo.setSchema({
        bar: { type: 'string', track: true }
      })
      const fooCollection = new Collection([], {
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
    //   assert.equal(Foo.name, 'Foo')
    //   assert.equal(Bar.name, 'Bar')

    //   const baz = Baz.inject({ id: 10 })

    //   const foo = Foo.inject({ id: 1, type: 'foo', bazId: 10 })
    //   const bar = Bar.inject({ id: 1, type: 'bar', bazId: 10 })
    //   assert.isTrue(baz === foo.baz)
    //   assert.isTrue(baz === bar.baz)

    //   assert.equal(foo.say(), 'Foo')
    //   assert.equal(bar.say(), 'Bar')
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
    //   assert.equal(Foo.name, 'Foo')
    //   assert.equal(Bar.name, 'Bar')

    //   const baz = Baz.inject({ id: 10 })

    //   const foo = Foo.inject({ id: 1, type: 'foo', bazId: 10 })
    //   const bar = Bar.inject({ id: 1, type: 'bar', bazId: 10 })
    //   assert.isTrue(baz === foo.baz)
    //   assert.isTrue(baz === bar.baz)

    //   assert.equal(foo.say(), 'Foo')
    //   assert.equal(bar.say(), 'Bar')
    // })
    it('should allow instance events 2', function (done) {
      let changed = false
      class Foo extends Model {}
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
      let changed = false
      class Foo extends Model {}
      Foo.setSchema({
        bar: { type: 'string', track: true }
      })
      const fooCollection = new Collection([], { model: Foo })
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

    changes.init()
    create.init()
    staticCreate.init()
    staticCreateInstance.init()
    staticCreateMany.init()
    destroy.init()
    staticDestroy.init()
    staticDestroyAll.init()
    staticFind.init()
    staticFindAll.init()
    get.init()
    hasChanges.init()
    revert.init()
    save.init()
    set.init()
    staticUpdate.init()
    staticUpdateMany.init()
    staticUpdateAll.init()
    unset.init()
  })
}
