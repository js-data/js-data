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

export function init () {
  describe('Mapper', function () {
    it('should be a constructor function', function () {
      const Test = this
      const Mapper = Test.JSData.Mapper
      Test.assert.isFunction(Mapper)
      const mapper = new Mapper({ name: 'foo' })
      Test.assert.isTrue(mapper instanceof Mapper)
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
      const User = new Test.JSData.Mapper({ name: 'user' })
      const listener = Test.sinon.stub()
      User.on('bar', listener)
      User.emit('bar')
      Test.assert.isTrue(listener.calledOnce)
    })

    // it('should allow instance events', function (done) {
    //   const Test = this
    //   let changed = false
    //   class Foo extends Test.JSData.Mapper {}
    //   Foo.setSchema({
    //     bar: { type: 'string', track: true }
    //   })
    //   const foo = new Foo({ id: 1 })

    //   setTimeout(function () {
    //     if (!changed) {
    //       done('failed to fire change event')
    //     }
    //   }, 10)

    //   foo.on('change', function () {
    //     changed = true
    //     done()
    //   })

    //   foo.bar = 'baz'
    // })
    // it('should allow Resource change events', function (done) {
    //   const Test = this
    //   let changed = false
    //   class Foo extends Test.JSData.Mapper {}
    //   Foo.setSchema({
    //     bar: { type: 'string', track: true }
    //   })
    //   const fooCollection = new Test.JSData.Collection([], {
    //     model: Foo
    //   })
    //   const foo = fooCollection.add({ id: 1 })

    //   setTimeout(function () {
    //     if (!changed) {
    //       done('failed to fire change event')
    //     }
    //   }, 10)

    //   fooCollection.on('change', function () {
    //     changed = true
    //     done()
    //   })

    //   foo.bar = 'baz'
    // })
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
    // it('should allow instance events 2', function (done) {
    //   const Test = this
    //   let changed = false
    //   class Foo extends Test.JSData.Mapper {}
    //   Foo.setSchema({
    //     bar: { type: 'string', track: true }
    //   })
    //   const foo = new Foo({ id: 1 })

    //   setTimeout(function () {
    //     if (!changed) {
    //       done('failed to fire change event')
    //     }
    //   }, 10)

    //   foo.on('change', function (Foo, foo) {
    //     changed = true
    //     done()
    //   })

    //   foo.set('bar', 'baz')
    // })
    // it('should allow Resource change events 2', function (done) {
    //   const Test = this
    //   let changed = false
    //   class Foo extends Test.JSData.Mapper {}
    //   Foo.setSchema({
    //     bar: { type: 'string', track: true }
    //   })
    //   const fooCollection = new Test.JSData.Collection([], { model: Foo })
    //   const foo = fooCollection.add({ id: 1 })

    //   setTimeout(function () {
    //     if (!changed) {
    //       done('failed to fire change event')
    //     }
    //   }, 10)

    //   fooCollection.on('change', function (fooCollection, foo) {
    //     changed = true
    //     done()
    //   })

    //   foo.set('bar', 'baz')
    // })

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
