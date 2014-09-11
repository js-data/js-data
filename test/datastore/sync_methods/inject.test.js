describe('DS.inject(resourceName, attrs[, options])', function () {
  function errorPrefix(resourceName) {
    return 'DS.inject(' + resourceName + ', attrs[, options]): ';
  }

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      datastore.inject('does not exist', {});
    }, datastore.errors.NonexistentResourceError, errorPrefix('does not exist') + 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      assert.throws(function () {
        datastore.inject('post', key);
      }, datastore.errors.IllegalArgumentError, errorPrefix('post') + 'attrs: Must be an object or an array!');
    });

    assert.throws(function () {
      datastore.inject('post', {});
    }, datastore.errors.RuntimeError, errorPrefix('post') + 'attrs: Must contain the property specified by `idAttribute`!');
  });
  it('should inject an item into the store', function () {

    assert.equal(datastore.lastModified('post', 5), 0);
    assert.doesNotThrow(function () {
      assert.deepEqual(datastore.inject('post', p1), p1);
    });
    assert.notEqual(datastore.lastModified('post', 5), 0);
    assert.isNumber(datastore.lastModified('post', 5));
  });
//  it('should get mad when primary keys are changed', function (done) {
//
//    assert.equal(datastore.lastModified('post', 5), 0);
//    assert.doesNotThrow(function () {
//      assert.deepEqual(datastore.inject('post', p1), p1);
//    });
//    assert.notEqual(datastore.lastModified('post', 5), 0);
//    assert.isNumber(datastore.lastModified('post', 5));
//
//    var post = datastore.get('post', 5);
//
//    post.id = 10;
//
//    datastore.digest();
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
      assert.deepEqual(datastore.inject('post', [p1, p2, p3, p4]), [p1, p2, p3, p4]);
    });

    assert.deepEqual(datastore.get('post', 5), p1);
    assert.deepEqual(datastore.get('post', 6), p2);
    assert.deepEqual(datastore.get('post', 7), p3);
    assert.deepEqual(datastore.get('post', 8), p4);
  });
  it('should inject relations', function () {
    // can inject items without relations
    datastore.inject('user', user1);
    datastore.inject('organization', organization2);
    datastore.inject('comment', comment3);
    datastore.inject('profile', profile4);

    assert.deepEqual(datastore.get('user', 1), user1);
    assert.deepEqual(datastore.get('organization', 2), organization2);
    assert.deepEqual(datastore.get('comment', 3).id, comment3.id);
    assert.deepEqual(datastore.get('profile', 4).id, profile4.id);

    // can inject items with relations
    datastore.inject('user', user10, 0);
    datastore.inject('organization', organization15);
    datastore.inject('comment', comment19);
    datastore.inject('profile', profile21);

    // originals
    assert.equal(datastore.get('user', 10).name, user10.name);
    assert.equal(datastore.get('user', 10).id, user10.id);
    assert.equal(datastore.get('user', 10).organizationId, user10.organizationId);
    assert.isArray(datastore.get('user', 10).comments);
    assert.deepEqual(datastore.get('organization', 15).name, organization15.name);
    assert.deepEqual(datastore.get('organization', 15).id, organization15.id);
    assert.isArray(datastore.get('organization', 15).users);
    assert.deepEqual(datastore.get('comment', 19).id, comment19.id);
    assert.deepEqual(datastore.get('comment', 19).content, comment19.content);
    assert.deepEqual(datastore.get('profile', 21).id, profile21.id);
    assert.deepEqual(datastore.get('profile', 21).content, profile21.content);

    // user10 relations
    assert.deepEqual(datastore.get('comment', 11), datastore.get('user', 10).comments[0]);
    assert.deepEqual(datastore.get('comment', 12), datastore.get('user', 10).comments[1]);
    assert.deepEqual(datastore.get('comment', 13), datastore.get('user', 10).comments[2]);
    assert.deepEqual(datastore.get('organization', 14), datastore.get('user', 10).organization);
    assert.deepEqual(datastore.get('profile', 15), datastore.get('user', 10).profile);

    // organization15 relations
    assert.deepEqual(datastore.get('user', 16), datastore.get('organization', 15).users[0]);
    assert.deepEqual(datastore.get('user', 17), datastore.get('organization', 15).users[1]);
    assert.deepEqual(datastore.get('user', 18), datastore.get('organization', 15).users[2]);

    // comment19 relations
    assert.deepEqual(datastore.get('user', 20), datastore.get('comment', 19).user);
    assert.deepEqual(datastore.get('user', 19), datastore.get('comment', 19).approvedByUser);

    // profile21 relations
    assert.deepEqual(datastore.get('user', 22), datastore.get('profile', 21).user);
  });
  it('should find inverse links', function () {
    datastore.inject('user', { organizationId: 5, id: 1 });

    datastore.inject('organization', { id: 5 }, { linkInverse: true });

    assert.isObject(datastore.get('user', 1).organization);

    assert.isUndefined(datastore.get('user', 1).comments);

    datastore.inject('comment', { approvedBy: 1, id: 23 }, { linkInverse: true });

    assert.equal(1, datastore.get('user', 1).comments.length);

    datastore.inject('comment', { approvedBy: 1, id: 44 }, { linkInverse: true });

    assert.equal(2, datastore.get('user', 1).comments.length);
  });
});
