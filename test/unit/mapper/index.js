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
      const Mapper = Test.JSData.Mapper
      Test.assert.isFunction(Mapper)
      const mapper = new Mapper()
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
      const User = new Test.JSData.Mapper()
      const listener = Test.sinon.stub()
      User.on('bar', listener)
      User.emit('bar')
      Test.assert.isTrue(listener.calledOnce)
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
