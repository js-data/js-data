export function init () {
  describe('DataStore', function () {
    it('relation links should stay up-to-date', function () {
      const Test = this

      const store = new Test.JSData.DataStore({
        linkRelations: true
      })
      store.defineMapper('foo', {
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
      Test.assert.isTrue(bar88.foo === foo66)
      Test.assert.equal(66, bar88.foo_id)
      bar88.foo_id = 77
      Test.assert.isTrue(bar88.foo === foo77)
      Test.assert.equal(77, bar88.foo_id)
      bar88.foo = foo66
      Test.assert.isTrue(bar88.foo === foo66)
      Test.assert.equal(66, bar88.foo_id)
      Test.assert.objectsEqual(foo77.bars, [])
      foo77.bars = [bar88]
      Test.assert.isTrue(foo77.bars[0] === store.getAll('bar')[0])
      Test.assert.equal(bar88.foo_id, 77)
      Test.assert.objectsEqual(foo66.bars, [])
      foo66.bars = [bar88]
      Test.assert.isTrue(foo66.bars[0] === store.getAll('bar')[0])
      Test.assert.equal(bar88.foo_id, 66)
      Test.assert.objectsEqual(foo77.bars, [])
    })
    it('should allow enhanced relation getters', function () {
      const Test = this

      let wasItActivated = false
      const store = new Test.JSData.DataStore({
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
      Test.assert.equal(foo.bar.id, 1)
      Test.assert.isTrue(wasItActivated)
    })
    it('should configure enumerability and linking of relations', function () {
      const Test = this

      const store = new Test.JSData.DataStore({
        linkRelations: true
      })
      store.defineMapper('parent', {
        relations: {
          hasMany: {
            child: {
              localField: 'children',
              foreignKey: 'parentId'
            }
          }
        }
      })
      store.defineMapper('child', {
        relations: {
          belongsTo: {
            parent: {
              link: false,
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
              enumerable: false,
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

      Test.assert.isDefined(store.get('child', child.id))
      Test.assert.equal(child.parentId, 2)
      Test.assert.isTrue(child.parent === store.get('parent', child.parentId))

      Test.assert.isDefined(store.get('otherChild', otherChild.id))
      Test.assert.equal(otherChild.parentId, 4)
      Test.assert.isTrue(otherChild.parent === store.get('parent', otherChild.parentId), 'parent was injected and linked')
      Test.assert.isDefined(store.get('parent', otherChild.parentId), 'parent was injected and linked')

      let foundParent = false
      let k
      for (k in child) {
        if (k === 'parent' && child[k] === child.parent && child[k] === store.get('parent', child.parentId)) {
          foundParent = true
        }
      }
      Test.assert.isTrue(foundParent, 'parent is enumerable')
      foundParent = false
      for (k in otherChild) {
        if (k === 'parent' && otherChild[k] === otherChild.parent && otherChild[k] === store.get('parent', otherChild.parentId)) {
          foundParent = true
        }
      }
      Test.assert.isFalse(foundParent, 'parent is NOT enumerable')
    })
    it('should unlink upon ejection', function () {
      const Test = this

      Test.UserCollection.add(Test.data.user10)
      Test.OrganizationCollection.add(Test.data.organization15)
      Test.CommentCollection.add(Test.data.comment19)
      Test.ProfileCollection.add(Test.data.profile21)

      // user10 relations
      Test.assert.isArray(Test.UserCollection.get(10).comments)
      Test.CommentCollection.remove(11)
      Test.assert.isUndefined(Test.CommentCollection.get(11))
      Test.assert.equal(Test.UserCollection.get(10).comments.length, 2)
      Test.CommentCollection.remove(12)
      Test.assert.isUndefined(Test.CommentCollection.get(12))
      Test.assert.equal(Test.UserCollection.get(10).comments.length, 1)
      Test.CommentCollection.remove(13)
      Test.assert.isUndefined(Test.CommentCollection.get(13))
      Test.assert.equal(Test.UserCollection.get(10).comments.length, 0)
      Test.OrganizationCollection.remove(14)
      Test.assert.isUndefined(Test.OrganizationCollection.get(14))
      Test.assert.isUndefined(Test.UserCollection.get(10).organization)

      // organization15 relations
      Test.assert.isArray(Test.OrganizationCollection.get(15).users)
      Test.UserCollection.remove(16)
      Test.assert.isUndefined(Test.UserCollection.get(16))
      Test.assert.equal(Test.OrganizationCollection.get(15).users.length, 2)
      Test.UserCollection.remove(17)
      Test.assert.isUndefined(Test.UserCollection.get(17))
      Test.assert.equal(Test.OrganizationCollection.get(15).users.length, 1)
      Test.UserCollection.remove(18)
      Test.assert.isUndefined(Test.UserCollection.get(18))
      Test.assert.equal(Test.OrganizationCollection.get(15).users.length, 0)

      // comment19 relations
      Test.assert.deepEqual(Test.UserCollection.get(20), Test.CommentCollection.get(19).user)
      Test.assert.deepEqual(Test.UserCollection.get(19), Test.CommentCollection.get(19).approvedByUser)
      Test.UserCollection.remove(20)
      Test.assert.isUndefined(Test.CommentCollection.get(19).user)
      Test.UserCollection.remove(19)
      Test.assert.isUndefined(Test.CommentCollection.get(19).approvedByUser)

      // profile21 relations
      Test.assert.deepEqual(Test.UserCollection.get(22), Test.ProfileCollection.get(21).user)
      Test.UserCollection.remove(22)
      Test.assert.isUndefined(Test.ProfileCollection.get(21).user)
    })
  })
}
