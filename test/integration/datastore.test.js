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

    store.on('change', function (mapperName, record, changes) {
      assert.equal(mapperName, 'foo')
      assert.strictEqual(record, foo)
      try {
        assert.deepEqual(changes, { added: { bar: 'baz' }, changed: {}, removed: {} })
      } catch (err) {
        assert.deepEqual(changes, { added: {}, changed: { bar: 'beep' }, removed: {} })
      }
      handlersCalled++
    })

    store.getCollection('foo').on('change', function (record, changes) {
      assert.strictEqual(record, foo)
      try {
        assert.deepEqual(changes, { added: { bar: 'baz' }, changed: {}, removed: {} })
      } catch (err) {
        assert.deepEqual(changes, { added: {}, changed: { bar: 'beep' }, removed: {} })
      }
      handlersCalled++
    })

    foo.on('change', (record, changes) => {
      assert.strictEqual(record, foo)
      try {
        assert.deepEqual(changes, { added: { bar: 'baz' }, changed: {}, removed: {} })
      } catch (err) {
        assert.deepEqual(changes, { added: {}, changed: { bar: 'beep' }, removed: {} })
      }
      handlersCalled++
    })

    store.on('change:bar', function (mapperName, record, value) {
      assert.equal(mapperName, 'foo')
      assert.strictEqual(record, foo)
      assert(value === 'baz' || value === 'beep')
      handlersCalled++
    })

    store.getCollection('foo').on('change:bar', function (record, value) {
      assert.strictEqual(record, foo)
      assert(value === 'baz' || value === 'beep')
      handlersCalled++
    })

    foo.on('change:bar', (record, value) => {
      assert.strictEqual(record, foo)
      assert(value === 'baz' || value === 'beep')
      handlersCalled++
    })

    // Modify the record directly
    foo.bar = 'baz'

    setTimeout(() => {
      if (handlersCalled !== 6) {
        done('not all handlers were called')
      } else {
        // Modify the record indirectly
        store.add('foo', { id: 1, bar: 'beep' })

        setTimeout(() => {
          if (handlersCalled !== 12) {
            done('not all handlers were called')
          } else {
            done()
          }
        }, 500)
      }
    }, 500)
  })
  it('should add relations', function () {
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
      id: 66,
      bars: [{ id: 88 }]
    })
    assert.strictEqual(foo66, store.get('foo', 66))
    assert.strictEqual(foo66.bars[0], store.get('bar', 88))
    assert.strictEqual(foo66.bars[0].foo_id, 66)

    const bar99 = store.add('bar', {
      id: 99,
      foo: { id: 101 }
    })
    assert.strictEqual(bar99, store.get('bar', 99))
    assert.strictEqual(bar99.foo, store.get('foo', 101))
    assert.strictEqual(bar99.foo_id, 101)

    const bar = store.add('bar', {
      foo: {}
    })
    assert.strictEqual(bar, store.unsaved('bar')[0])
    assert.strictEqual(bar.foo, store.unsaved('foo')[0])
    assert.strictEqual(bar.foo_id, undefined)

    let bar2 = store.add('bar', bar)
    assert.strictEqual(bar2, bar)
    let foo2 = store.add('foo', bar.foo)
    assert.strictEqual(foo2, bar.foo)
    assert.equal(store.unsaved('bar').length, 1)
    assert.equal(store.unsaved('foo').length, 1)

    store.prune('bar')
    store.prune('foo')

    const foo = store.add('foo', {
      bars: [{}]
    })
    assert.strictEqual(foo, store.unsaved('foo')[0])
    assert.strictEqual(foo.bars[0], store.unsaved('bar')[0])
    assert.strictEqual(foo.bars[0].foo_id, undefined)

    foo2 = store.add('foo', foo)
    assert.strictEqual(foo2, foo)
    bar2 = store.add('bar', foo.bars[0])
    assert.strictEqual(bar2, foo.bars[0])
    assert.equal(store.unsaved('bar').length, 1)
    assert.equal(store.unsaved('foo').length, 1)
  })
  it('should correctly unlink inverse records', function () {
    const store = new JSData.DataStore()

    store.defineMapper('A', {
      idAttribute: 'uid',
      properties: {
        uid: { type: 'string' }
      },
      relations: {
        hasMany: {
          B: {
            localField: 'b',
            foreignKey: 'a_uid'
          }
        }
      }
    })

    store.defineMapper('B', {
      idAttribute: 'uid',
      properties: {
        uid: { type: 'string' },
        a_uid: { type: ['string', 'null'] }
      },
      relations: {
        belongsTo: {
          A: {
            localField: 'a',
            foreignKey: 'a_uid'
          }
        }
      }
    })

    const aRecord = store.add('A', { uid: 'a1' })
    const bRecords = store.add('B', [{ uid: 'b1', a_uid: 'a1' }, { uid: 'b2', a_uid: 'a1' }])
    assert.objectsEqual(aRecord.b, bRecords)
    assert.strictEqual(bRecords[0].a, aRecord)
    assert.strictEqual(bRecords[1].a, aRecord)

    const aRecord2 = store.add('A', { uid: 'a2' })
    const bRecords2 = store.add('B', [{ uid: 'b3', a_uid: 'a2' }, { uid: 'b4', a_uid: 'a2' }])
    assert.objectsEqual(aRecord2.b, bRecords2)
    assert.strictEqual(bRecords2[0].a, aRecord2)
    assert.strictEqual(bRecords2[1].a, aRecord2)

    store.remove('B', 'b2')
    assert.objectsEqual(aRecord.b, [bRecords[0]])
    assert.strictEqual(bRecords[0].a, aRecord)
    assert.strictEqual(bRecords[1].a, undefined)

    store.remove('A', 'a2')
    assert.objectsEqual(aRecord2.b, [])
    assert.equal(bRecords2[0].a, undefined)
    assert.equal(bRecords2[1].a, undefined)
  })
  it('should add property accessors to prototype of target and allow relation re-assignment using defaults', function () {
    const store = new JSData.DataStore()
    store.defineMapper('foo', {
      relations: {
        hasMany: {
          bar: {
            localField: 'bars',
            foreignKey: 'fooId'
          }
        }
      }
    })
    store.defineMapper('bar', {
      relations: {
        belongsTo: {
          foo: {
            localField: 'foo',
            foreignKey: 'fooId'
          }
        }
      }
    })
    const foo = store.add('foo', { id: 1 })
    const foo2 = store.add('foo', { id: 2 })
    const bar = store.add('bar', { id: 1, fooId: 1 })
    const bar2 = store.add('bar', { id: 2, fooId: 1 })
    const bar3 = store.add('bar', { id: 3 })
    assert.strictEqual(bar.foo, foo)
    assert.strictEqual(bar2.foo, foo)
    assert(!bar3.foo)
    bar.foo = foo2
    bar3.foo = foo
    assert.strictEqual(bar.foo, foo2)
    assert.strictEqual(bar2.foo, foo)
    assert.strictEqual(bar3.foo, foo)
  })

  it('should not create an inverseLink if no inverseRelationship is defined', function () {
    const store = new JSData.DataStore()
    store.defineMapper('foo', {
    })
    store.defineMapper('bar', {
      relations: {
        belongsTo: {
          foo: {
            localField: '_foo',
            foreignKey: 'foo_id'
          }
        }
      }
    })
    const foo = store.add('foo', { id: 1 })
    const bar = store.add('bar', { id: 1, foo_id: 1 })
    assert.strictEqual(bar._foo, foo)
  })

  it('should add property accessors to prototype of target and allow relation re-assignment using customizations', function () {
    const store = new JSData.DataStore()
    store.defineMapper('foo', {
      relations: {
        hasMany: {
          bar: {
            localField: 'bars',
            foreignKey: 'fooId'
          }
        }
      }
    })
    store.defineMapper('bar', {
      relations: {
        belongsTo: {
          foo: {
            localField: '_foo',
            foreignKey: 'fooId'
          }
        }
      }
    })
    const foo = store.add('foo', { id: 1 })
    const foo2 = store.add('foo', { id: 2 })
    const bar = store.add('bar', { id: 1, fooId: 1 })
    const bar2 = store.add('bar', { id: 2, fooId: 1 })
    const bar3 = store.add('bar', { id: 3 })
    assert.strictEqual(bar._foo, foo)
    assert.strictEqual(bar2._foo, foo)
    assert(!bar3._foo)
    bar._foo = foo2
    bar3._foo = foo
    assert.strictEqual(bar._foo, foo2)
    assert.strictEqual(bar2._foo, foo)
    assert.strictEqual(bar3._foo, foo)
  })
  it('should allow custom getter and setter', function () {
    const store = new JSData.DataStore()
    store.defineMapper('foo', {
      relations: {
        hasMany: {
          bar: {
            localField: 'bars',
            foreignKey: 'fooId'
          }
        }
      }
    })
    store.defineMapper('bar', {
      relations: {
        belongsTo: {
          foo: {
            localField: '_foo',
            foreignKey: 'fooId',
            get: function (Relation, bar, originalGet) {
              getCalled++
              return originalGet()
            },
            set: function (Relation, bar, foo, originalSet) {
              setCalled++
              originalSet()
            }
          }
        }
      }
    })
    let getCalled = 0
    let setCalled = 0
    const foo = store.add('foo', { id: 1 })
    const foo2 = store.add('foo', { id: 2 })
    const bar = store.add('bar', { id: 1, fooId: 1 })
    const bar2 = store.add('bar', { id: 2, fooId: 1 })
    const bar3 = store.add('bar', { id: 3 })
    assert.strictEqual(bar._foo, foo)
    assert.strictEqual(bar2._foo, foo)
    assert(!bar3._foo)
    bar._foo = foo2
    bar3._foo = foo
    assert.strictEqual(bar._foo, foo2)
    assert.strictEqual(bar2._foo, foo)
    assert.strictEqual(bar3._foo, foo)
    assert.equal(getCalled, 11)
    assert.equal(setCalled, 4)
  })
  it('supports tree-like relations', function () {
    const store = new JSData.DataStore()

    store.defineMapper('node', {
      relations: {
        belongsTo: {
          node: {
            localField: 'parent',
            foreignKey: 'parentId'
          }
        },
        hasMany: {
          node: {
            localField: 'children',
            foreignKey: 'parentId'
          }
        }
      }
    })

    const nodes = store.add('node', [
      {
        id: 0,
        name: 'A',
        parentId: null
      },
      {
        id: 1,
        name: 'B',
        parentId: null
      },
      {
        id: 2,
        name: 'A.1',
        parentId: 0
      },
      {
        id: 3,
        name: 'A.2',
        parentId: 0
      },
      {
        id: 4,
        name: 'A.2.a',
        parentId: 3
      }
    ])

    assert.equal(nodes[0].parent, null)
    assert.deepEqual(nodes[0].children, [nodes[2], nodes[3]])

    assert.equal(nodes[1].parent, null)
    assert.deepEqual(nodes[1].children, [])

    assert.strictEqual(nodes[2].parent, nodes[0])
    assert.deepEqual(nodes[2].children, [])

    assert.equal(nodes[3].parent, nodes[0])
    assert.deepEqual(nodes[3].children, [nodes[4]])

    assert.equal(nodes[4].parent, nodes[3])
    assert.deepEqual(nodes[4].children, [])
  })

  it('should find hasMany foreignKeys with custom idAttribute', function () {
    const store = new JSData.DataStore()

    store.defineMapper('foo', {
      relations: {
        hasMany: {
          bar: {
            localField: 'bars',
            localKeys: 'barIds'
          }
        }
      },
      idAttribute: 'fooId'
    })
    store.defineMapper('bar', {
      relations: {
        hasMany: {
          foo: {
            localField: 'foos',
            foreignKeys: 'barIds'
          }
        }
      }
    })

    const bars = store.add('bar', [
      {
        id: 0,
        name: 'A'
      },
      {
        id: 1,
        name: 'B'
      },
      {
        id: 2,
        name: 'C'
      }
    ])

    const foo = store.add('foo', {
      fooId: 9,
      name: 'Z',
      barIds: [0, 2]
    })

    assert.isOk(foo.bars)
    assert.deepEqual(foo.bars, [bars[0], bars[2]])
  })
})
