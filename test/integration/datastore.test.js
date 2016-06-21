import { assert, JSData } from '../_setup'

describe('DataStore integration tests', function () {
  it('relation links should stay up-to-date', function () {
    const store = new JSData.DataStore()
    store.defineMapper('foo', {
      schema: {
        properties: {
          id: { type: 'number' }
        }
      },
      relations: {
        hasMany: {
          bar: {
            localField: 'bars',
            foreignKey: 'foo_id'
          }
        }
      }
    })
    store.defineMapper('bar', {
      schema: {
        properties: {
          id: { type: 'number' },
          foo_id: { type: 'number' }
        }
      },
      relations: {
        belongsTo: {
          foo: {
            localField: 'foo',
            foreignKey: 'foo_id'
          }
        }
      }
    })
    const foo66 = store.add('foo', {
      id: 66
    })
    const foo77 = store.add('foo', {
      id: 77
    })
    const bar88 = store.add('bar', {
      id: 88,
      foo_id: 66
    })
    assert.strictEqual(bar88.foo, foo66)
    assert.strictEqual(foo66.bars[0], bar88)
    assert.deepEqual(foo77.bars, [])
    assert.equal(bar88.foo_id, 66)
    bar88.foo_id = 77
    assert.strictEqual(bar88.foo, foo77)
    assert.equal(bar88.foo_id, 77)
    assert.strictEqual(foo77.bars[0], bar88)
    assert.deepEqual(foo66.bars, [])
    bar88.foo = foo66
    assert.strictEqual(bar88.foo, foo66)
    assert.equal(bar88.foo_id, 66)
    assert.strictEqual(foo66.bars[0], bar88)
    assert.deepEqual(foo77.bars, [])
    foo77.bars = [bar88]
    assert.strictEqual(foo77.bars[0], bar88)
    assert.equal(bar88.foo_id, 77)
    assert.deepEqual(foo66.bars, [])
    foo66.bars = [bar88]
    assert.strictEqual(foo66.bars[0], bar88)
    assert.equal(bar88.foo_id, 66)
    assert.deepEqual(foo77.bars, [])
  })
  it('should allow enhanced relation getters', function () {
    let wasItActivated = false
    const store = new JSData.DataStore({
      linkRelations: true
    })
    store.defineMapper('foo', {
      relations: {
        belongsTo: {
          bar: {
            localField: 'bar',
            foreignKey: 'barId',
            get (def, foo, orig) {
              // "relation.name" has relationship "relation.type" to "relation.relation"
              wasItActivated = true
              return orig()
            }
          }
        }
      }
    })
    store.defineMapper('bar', {
      relations: {
        hasMany: {
          foo: {
            localField: 'foos',
            foreignKey: 'barId'
          }
        }
      }
    })
    const foo = store.add('foo', {
      id: 1,
      barId: 1,
      bar: {
        id: 1
      }
    })
    assert.equal(foo.bar.id, 1)
    assert(wasItActivated)
  })
  it('should configure enumerability and linking of relations', function () {
    const store = new JSData.DataStore()
    store.defineMapper('parent', {
      relations: {
        hasMany: {
          child: {
            localField: 'children',
            foreignKey: 'parentId'
          },
          otherChild: {
            localField: 'otherChildren',
            foreignKey: 'parentId'
          }
        }
      }
    })
    store.defineMapper('child', {
      relations: {
        belongsTo: {
          parent: {
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
            enumerable: true,
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

    assert(store.get('child', child.id))
    assert.equal(child.parentId, 2)
    assert(child.parent === store.get('parent', child.parentId))

    assert(store.get('otherChild', otherChild.id))
    assert.equal(otherChild.parentId, 4)
    assert(otherChild.parent === store.get('parent', otherChild.parentId), 'parent was injected and linked')
    assert(store.get('parent', otherChild.parentId), 'parent was injected and linked')

    let foundParent = false
    let k
    for (k in child) {
      if (k === 'parent' && child[k] === child.parent && child[k] === store.get('parent', child.parentId)) {
        foundParent = true
      }
    }
    assert(!foundParent, 'parent is NOT enumerable')
    foundParent = false
    for (k in otherChild) {
      if (k === 'parent' && otherChild[k] === otherChild.parent && otherChild[k] === store.get('parent', otherChild.parentId)) {
        foundParent = true
      }
    }
    assert(foundParent, 'parent is enumerable')
  })
  it.skip('should unlink upon ejection', function () {
    this.UserCollection.add(this.data.user10)
    this.OrganizationCollection.add(this.data.organization15)
    this.CommentCollection.add(this.data.comment19)
    this.ProfileCollection.add(this.data.profile21)

    // user10 relations
    assert(Array.isArray(this.UserCollection.get(10).comments))
    this.CommentCollection.remove(11)
    assert(!this.CommentCollection.get(11))
    assert.equal(this.UserCollection.get(10).comments.length, 2)
    this.CommentCollection.remove(12)
    assert(!this.CommentCollection.get(12))
    assert.equal(this.UserCollection.get(10).comments.length, 1)
    this.CommentCollection.remove(13)
    assert(!this.CommentCollection.get(13))
    assert.equal(this.UserCollection.get(10).comments.length, 0)
    this.OrganizationCollection.remove(14)
    assert(!this.OrganizationCollection.get(14))
    assert(!this.UserCollection.get(10).organization)

    // organization15 relations
    assert(Array.isArray(this.OrganizationCollection.get(15).users))
    this.UserCollection.remove(16)
    assert(!this.UserCollection.get(16))
    assert.equal(this.OrganizationCollection.get(15).users.length, 2)
    this.UserCollection.remove(17)
    assert(!this.UserCollection.get(17))
    assert.equal(this.OrganizationCollection.get(15).users.length, 1)
    this.UserCollection.remove(18)
    assert(!this.UserCollection.get(18))
    assert.equal(this.OrganizationCollection.get(15).users.length, 0)

    // comment19 relations
    assert.deepEqual(this.UserCollection.get(20), this.CommentCollection.get(19).user)
    assert.deepEqual(this.UserCollection.get(19), this.CommentCollection.get(19).approvedByUser)
    this.UserCollection.remove(20)
    assert(!this.CommentCollection.get(19).user)
    this.UserCollection.remove(19)
    assert(!this.CommentCollection.get(19).approvedByUser)

    // profile21 relations
    assert.deepEqual(this.UserCollection.get(22), this.ProfileCollection.get(21).user)
    this.UserCollection.remove(22)
    assert(!this.ProfileCollection.get(21).user)
  })
  it('should emit change events', function (done) {
    const store = new JSData.DataStore()
    let handlersCalled = 0
    store.defineMapper('foo', {
      type: 'object',
      schema: {
        properties: {
          bar: { type: 'string', track: true }
        }
      }
    })
    const foo = store.add('foo', { id: 1 })
    assert.equal(foo.bar, undefined)

    setTimeout(() => {
      if (handlersCalled !== 6) {
        done('not all handlers were called')
      } else {
        done()
      }
    }, 1000)

    store.on('change', function (mapperName, record, changes) {
      assert.equal(mapperName, 'foo')
      assert.strictEqual(record, foo)
      assert.deepEqual(changes, { added: { bar: 'baz' }, changed: {}, removed: {} })
      handlersCalled++
    })

    store.getCollection('foo').on('change', function (record, changes) {
      assert.strictEqual(record, foo)
      assert.deepEqual(changes, { added: { bar: 'baz' }, changed: {}, removed: {} })
      handlersCalled++
    })

    foo.on('change', (record, changes) => {
      assert.strictEqual(record, foo)
      assert.deepEqual(changes, { added: { bar: 'baz' }, changed: {}, removed: {} })
      handlersCalled++
    })

    store.on('change:bar', function (mapperName, record, value) {
      assert.equal(mapperName, 'foo')
      assert.strictEqual(record, foo)
      assert.equal(value, 'baz')
      handlersCalled++
    })

    store.getCollection('foo').on('change:bar', function (record, value) {
      assert.strictEqual(record, foo)
      assert.equal(value, 'baz')
      handlersCalled++
    })

    foo.on('change:bar', (record, value) => {
      assert.strictEqual(record, foo)
      assert.equal(value, 'baz')
      handlersCalled++
    })

    foo.bar = 'baz'
  })
})
