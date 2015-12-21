/* global JSData:true, Model:true, configure:true, sinon:true */
import {assert} from 'chai'
import * as create from './create.test'
import * as staticCreate from './static.create.test'
import * as staticCreateInstance from './static.createInstance.test'
import * as staticCreateMany from './static.createMany.test'
import * as destroy from './destroy.test'
import * as staticDestroy from './static.destroy.test'
import * as staticDestroyAll from './static.destroyAll.test'
import * as staticEject from './static.eject.test'
import * as staticEjectAll from './static.ejectAll.test'
import * as staticFind from './static.find.test'
import * as staticFindAll from './static.findAll.test'
import * as staticGet from './static.get.test'
import * as staticGetAll from './static.getAll.test'
import * as staticInject from './static.inject.test'
import * as save from './save.test'
import * as staticUpdate from './static.update.test'
import * as staticUpdateMany from './static.updateMany.test'
import * as staticUpdateAll from './static.updateAll.test'
import * as toJSON from './toJSON.test'

let isBrowser = false

try {
  isBrowser = !!window
} catch (e) {
}

const defaults = {
  autoInject: isBrowser,
  bypassCache: false,
  csp: false,
  defaultAdapter: 'http',
  eagerEject: false,
  idAttribute: 'id',
  linkRelations: isBrowser,
  onConflict: 'merge',
  relationsEnumerable: false,
  raw: false,
  strategy: 'single',
  upsert: true,
  useFilter: true
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
    it('should allow schema definition with basic indexes', function () {
      class User extends Model {}
      User.setSchema({
        id: {},
        age: { indexed: true },
        role: { indexed: true }
      })
      User.inject([
        { id: 2, age: 18, role: 'admin' },
        { id: 3, age: 19, role: 'dev' },
        { id: 9, age: 19, role: 'admin' },
        { id: 6, age: 19, role: 'owner' },
        { id: 4, age: 22, role: 'dev' },
        { id: 1, age: 23, role: 'owner' }
      ])
      assert.deepEqual(
        User.getAll(19, { index: 'age' }),
        [
          { id: 3, age: 19, role: 'dev' },
          { id: 6, age: 19, role: 'owner' },
          { id: 9, age: 19, role: 'admin' }
        ],
        'should have found all of age:19 using 1 keyList'
      )
    })

    it('should have events', function () {
      class User extends Model {}
      const listener = sinon.stub()
      User.emit('foo')
      User.on('bar', listener)
      User.collection.emit('bar')
      assert.isTrue(User._events !== Model._events)
      assert.isTrue(listener.calledOnce)
    })

    create.init()
    staticCreate.init()
    staticCreateInstance.init()
    staticCreateMany.init()
    destroy.init()
    staticDestroy.init()
    staticDestroyAll.init()
    staticEject.init()
    staticEjectAll.init()
    staticFind.init()
    staticFindAll.init()
    staticGet.init()
    staticGetAll.init()
    staticInject.init()
    save.init()
    staticUpdate.init()
    staticUpdateMany.init()
    staticUpdateAll.init()
    toJSON.init()
  })
}
