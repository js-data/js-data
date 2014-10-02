describe('DS#inject', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      store.inject('does not exist', {});
    }, store.errors.NonexistentResourceError, 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      assert.throws(function () {
        store.inject('post', key);
      }, store.errors.IllegalArgumentError, 'post.inject: "attrs" must be an object or an array!');
    });

    assert.throws(function () {
      store.inject('post', {});
    }, store.errors.RuntimeError, 'post.inject: "attrs" must contain the property specified by `idAttribute`!');
  });
  it('should inject an item into the store', function () {

    assert.equal(store.lastModified('post', 5), 0);
    assert.doesNotThrow(function () {
      assert.deepEqual(JSON.stringify(store.inject('post', p1)), JSON.stringify(p1));
    });
    assert.notEqual(store.lastModified('post', 5), 0);
    assert.isNumber(store.lastModified('post', 5));
  });
//  it('should get mad when primary keys are changed', function (done) {
//
//    assert.equal(store.lastModified('post', 5), 0);
//    assert.doesNotThrow(function () {
//      assert.deepEqual(store.inject('post', p1), p1);
//    });
//    assert.notEqual(store.lastModified('post', 5), 0);
//    assert.isNumber(store.lastModified('post', 5));
//
//    var post = store.get('post', 5);
//
//    post.id = 10;
//
//    store.digest();
//
//    setTimeout(function () {
//      assert.deepEqual('Doh! You just changed the primary key of an object! ' +
//        'I don\'t know how to handle this yet, so your data for the "post' +
//        '" resource is now in an undefined (probably broken) state.', $log.error.logs[0][0]);
//
//      done();
//    }, 50);
//  });
  it('should inject multiple items into the store', function () {

    assert.doesNotThrow(function () {
      assert.deepEqual(JSON.stringify(store.inject('post', [p1, p2, p3, p4])), JSON.stringify([p1, p2, p3, p4]));
    });

    assert.deepEqual(JSON.stringify(store.get('post', 5)), JSON.stringify(p1));
    assert.deepEqual(JSON.stringify(store.get('post', 6)), JSON.stringify(p2));
    assert.deepEqual(JSON.stringify(store.get('post', 7)), JSON.stringify(p3));
    assert.deepEqual(JSON.stringify(store.get('post', 8)), JSON.stringify(p4));
  });
  it('should inject relations', function () {
    // can inject items without relations
    store.inject('user', user1);
    store.inject('organization', organization2);
    store.inject('comment', comment3);
    store.inject('profile', profile4);

    assert.deepEqual(JSON.stringify(store.get('user', 1)), JSON.stringify(user1));
    assert.deepEqual(JSON.stringify(store.get('organization', 2)), JSON.stringify(organization2));
    assert.deepEqual(store.get('comment', 3).id, comment3.id);
    assert.deepEqual(store.get('profile', 4).id, profile4.id);

    // can inject items with relations
    store.inject('user', user10, 0);
    store.inject('organization', organization15);
    store.inject('comment', comment19);
    store.inject('profile', profile21);

    // originals
    assert.equal(store.get('user', 10).name, user10.name);
    assert.equal(store.get('user', 10).id, user10.id);
    assert.equal(store.get('user', 10).organizationId, user10.organizationId);
    assert.isArray(store.get('user', 10).comments);
    assert.deepEqual(store.get('organization', 15).name, organization15.name);
    assert.deepEqual(store.get('organization', 15).id, organization15.id);
    assert.isArray(store.get('organization', 15).users);
    assert.deepEqual(store.get('comment', 19).id, comment19.id);
    assert.deepEqual(store.get('comment', 19).content, comment19.content);
    assert.deepEqual(store.get('profile', 21).id, profile21.id);
    assert.deepEqual(store.get('profile', 21).content, profile21.content);

    // user10 relations
    assert.deepEqual(JSON.stringify(store.get('comment', 11)), JSON.stringify(store.get('user', 10).comments[0]));
    assert.deepEqual(JSON.stringify(store.get('comment', 12)), JSON.stringify(store.get('user', 10).comments[1]));
    assert.deepEqual(JSON.stringify(store.get('comment', 13)), JSON.stringify(store.get('user', 10).comments[2]));
    assert.deepEqual(JSON.stringify(store.get('organization', 14)), JSON.stringify(store.get('user', 10).organization));
    assert.deepEqual(JSON.stringify(store.get('profile', 15)), JSON.stringify(store.get('user', 10).profile));

    // organization15 relations
    assert.deepEqual(JSON.stringify(store.get('user', 16)), JSON.stringify(store.get('organization', 15).users[0]));
    assert.deepEqual(JSON.stringify(store.get('user', 17)), JSON.stringify(store.get('organization', 15).users[1]));
    assert.deepEqual(JSON.stringify(store.get('user', 18)), JSON.stringify(store.get('organization', 15).users[2]));

    // comment19 relations
    assert.deepEqual(JSON.stringify(store.get('user', 20)), JSON.stringify(store.get('comment', 19).user));
    assert.deepEqual(JSON.stringify(store.get('user', 19)), JSON.stringify(store.get('comment', 19).approvedByUser));

    // profile21 relations
    assert.deepEqual(JSON.stringify(store.get('user', 22)), JSON.stringify(store.get('profile', 21).user));
  });
  it('should find inverse links', function () {
    store.inject('user', { organizationId: 5, id: 1 });

    store.inject('organization', { id: 5 }, { findInverseLinks: true });

    assert.isObject(store.get('user', 1).organization);

    assert.isUndefined(store.get('user', 1).comments);

    store.inject('comment', { approvedBy: 1, id: 23 }, { findInverseLinks: true });

    assert.equal(1, store.get('user', 1).comments.length);

    store.inject('comment', { approvedBy: 1, id: 44 }, { findInverseLinks: true });

    assert.equal(2, store.get('user', 1).comments.length);
  });
  it('should inject cyclic dependencies', function () {
    store.defineResource({
      name: 'foo',
      relations: {
        hasMany: {
          foo: {
            localField: 'children',
            foreignKey: 'parentId'
          }
        }
      }
    });
    var injected = store.inject('foo', [{
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
    }]);

    assert.equal(injected[0].id, 1);
    assert.equal(injected[0].children[0].id, 2);
    assert.equal(injected[0].children[1].id, 3);
    assert.equal(injected[0].children[0].children[0].id, 4);
    assert.equal(injected[0].children[0].children[1].id, 5);
    assert.equal(injected[0].children[1].children[0].id, 6);
    assert.equal(injected[0].children[1].children[1].id, 7);

    assert.isDefined(store.get('foo', 1));
    assert.isDefined(store.get('foo', 2));
    assert.isDefined(store.get('foo', 3));
    assert.isDefined(store.get('foo', 4));
    assert.isDefined(store.get('foo', 5));
    assert.isDefined(store.get('foo', 6));
    assert.isDefined(store.get('foo', 7));
  });
});
