import { assert, JSData, createStore, createRelation, sinon } from '../../_setup'

const { Mapper, belongsTo } = JSData

describe('JSData.belongsTo', function () {
  let store

  describe('configuration', function () {
    let mapper, anotherMapper

    beforeEach(function () {
      mapper = new Mapper({ name: 'foo' })
      anotherMapper = new Mapper({ name: 'bar' })
    })

    it('should throw error if "localField" is missed', function () {
      assert.throws(() => {
        belongsTo(anotherMapper, { foreignKey: 'fooId' })(mapper)
      }, Error, '[new Relation:opts.localField] expected: string, found: undefined\nhttp://www.js-data.io/v3.0/docs/errors#400')
    })

    it('should throw error if "foreignKey" is missed', function () {
      assert.throws(() => {
        belongsTo(anotherMapper, { localField: 'bar' })(mapper)
      }, Error, '[new Relation:opts.foreignKey] expected: string, found: undefined\nhttp://www.js-data.io/v3.0/docs/errors#400')
    })

    it('should throw error if related mapper is passed as string and "getRelation" option is not a function', function () {
      assert.throws(() => {
        belongsTo('anotherMapper', { localField: 'bar', foreignKey: 'fooId' })(mapper)
      }, Error, '[new Relation:opts.getRelation] expected: function, found: undefined\nhttp://www.js-data.io/v3.0/docs/errors#400')
    })

    it('should throw error if related mapper is undefined', function () {
      assert.throws(() => {
        belongsTo(undefined, { localField: 'bar', foreignKey: 'fooId' })(mapper)
      }, Error, '[new Relation:related] expected: Mapper or string, found: undefined\nhttp://www.js-data.io/v3.0/docs/errors#400')
    })

    it('should not throw error if related mapper is a string and "getRelation" option is a function', function () {
      assert.doesNotThrow(() => {
        belongsTo('another', { localField: 'bar', foreignKey: 'fooId', getRelation: () => anotherMapper })(mapper)
      })
    })
  })

  describe('when 2 way relation is defined (belongsTo + hasMany)', function () {
    let foos, bars

    beforeEach(function () {
      store = createStore()
      store.defineMapper('foo', {
        relations: {
          hasMany: createRelation('bar', { localField: 'bars', foreignKey: 'fooId' })
        }
      })
      store.defineMapper('bar', {
        relations: {
          belongsTo: createRelation('foo', { localField: 'foo', foreignKey: 'fooId' })
        }
      })
      foos = store.add('foo', [{ id: 1 }, { id: 2 }])
      bars = store.add('bar', [{ id: 1, fooId: 1 }, { id: 2, fooId: 1 }])
    })

    it('should add property accessors to prototype of target', function () {
      const Foo = store.getMapper('foo').recordClass
      const Bar = store.getMapper('bar').recordClass

      assert.isTrue(Object.hasOwnProperty.call(Foo.prototype, 'bars'))
      assert.isTrue(Object.hasOwnProperty.call(Bar.prototype, 'foo'))
    })

    it('should automatically map relations when record is added to store', function () {
      assert.sameMembers(foos[0].bars, bars)
      assert.isTrue(bars.every(bar => bar.foo === foos[0]))
    })

    it('should allow relation re-assignment', function () {
      bars[0].foo = foos[1]

      assert.sameMembers(foos[0].bars, [bars[1]])
      assert.sameMembers(foos[1].bars, [bars[0]])
    })

    it('should allow relation ids re-assignment', function () {
      bars[0].fooId = foos[1].id

      assert.sameMembers(foos[0].bars, [bars[1]])
      assert.sameMembers(foos[1].bars, [bars[0]])
    })
  })

  describe('when one way relation is defined', function () {
    beforeEach(function () {
      store = createStore()
      store.defineMapper('foo')
      store.defineMapper('bar', {
        relations: {
          belongsTo: createRelation('foo', { localField: 'foo', foreignKey: 'fooId' })
        }
      })
    })

    it('should not create an inverse link', function () {
      const foo = store.add('foo', { id: 1 })
      const bar = store.add('bar', { id: 1, fooId: 1 })

      assert.strictEqual(bar.foo, foo)
      assert.isUndefined(foo.bars)
    })
  })

  describe('when getter/setter is specified for association', function () {
    let getter, setter

    beforeEach(function () {
      store = createStore()
      store.defineMapper('foo', {
        relations: {
          hasMany: createRelation('bar', { localField: 'bars', foreignKey: 'fooId' })
        }
      })
      getter = sinon.spy(function (Relation, bar, originalGet) {
        return originalGet()
      })
      setter = sinon.spy(function (Relation, bar, foo, originalSet) {
        originalSet()
      })
      store.defineMapper('bar', {
        relations: {
          belongsTo: createRelation('foo', {
            localField: 'foo',
            foreignKey: 'fooId',
            get: getter,
            set: setter
          })
        }
      })
    })

    it('should call custom getter each time relation is retrieved', function () {
      store.add('foo', { id: 1, name: 'test' })
      store.add('bar', { id: 1, fooId: 1 })

      assert.isTrue(getter.called)
    })

    it('should call custom setter each time relation is changed', function () {
      store.add('foo', { id: 1, name: 'test' })
      const bar = store.add('bar', { id: 1, fooId: 1 })

      bar.foo = null

      assert.isTrue(setter.called)
    })
  })
})
