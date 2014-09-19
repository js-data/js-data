describe('DS.eject(resourceName, id)', function () {
  function errorPrefix(resourceName, id) {
    return 'DS.eject(' + resourceName + ', ' + id + '): ';
  }

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      datastore.eject('does not exist', 5);
    }, datastore.errors.NonexistentResourceError, errorPrefix('does not exist', 5) + 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        datastore.eject('post', key);
      }, datastore.errors.IllegalArgumentError, errorPrefix('post', key) + 'id: Must be a string or a number!');
    });
  });
  it('should do nothing if the item is not in the store', function () {
    assert.equal(datastore.lastModified('post', 5), 0);
    assert.doesNotThrow(function () {
      datastore.eject('post', 5);
    });
    assert.equal(datastore.lastModified('post', 5), 0);
  });
  it('should eject an item from the store', function () {
    datastore.inject('post', p3);
    datastore.inject('post', p2);
    datastore.inject('post', p1);
    assert.notEqual(datastore.lastModified('post', 5), 0);
    assert.doesNotThrow(function () {
      datastore.eject('post', 5);
    });
    assert.isUndefined(datastore.get('post', 5));
    assert.equal(datastore.lastModified('post', 5), 0);
  });
  it('should unlink upon ejection', function () {
    datastore.inject('user', user10, 0);
    datastore.inject('organization', organization15);
    datastore.inject('comment', comment19);
    datastore.inject('profile', profile21);

    // user10 relations
    assert.isArray(datastore.get('user', 10).comments);
    datastore.eject('comment', 11);
    assert.isUndefined(datastore.get('comment', 11));
    assert.equal(datastore.get('user', 10).comments.length, 2);
    datastore.eject('comment', 12);
    assert.isUndefined(datastore.get('comment', 12));
    assert.equal(datastore.get('user', 10).comments.length, 1);
    datastore.eject('comment', 13);
    assert.isUndefined(datastore.get('comment', 13));
    assert.equal(datastore.get('user', 10).comments.length, 0);
    datastore.eject('organization', 14);
    assert.isUndefined(datastore.get('organization', 14));
    assert.isUndefined(datastore.get('user', 10).organization);

    // organization15 relations
    assert.isArray(datastore.get('organization', 15).users);
    datastore.eject('user', 16);
    assert.isUndefined(datastore.get('user', 16));
    assert.equal(datastore.get('organization', 15).users.length, 2);
    datastore.eject('user', 17);
    assert.isUndefined(datastore.get('user', 17));
    assert.equal(datastore.get('organization', 15).users.length, 1);
    datastore.eject('user', 18);
    assert.isUndefined(datastore.get('user', 18));
    assert.equal(datastore.get('organization', 15).users.length, 0);

    // comment19 relations
    assert.deepEqual(datastore.get('user', 20), datastore.get('comment', 19).user);
    assert.deepEqual(datastore.get('user', 19), datastore.get('comment', 19).approvedByUser);
    datastore.eject('user', 20);
    assert.isUndefined(datastore.get('comment', 19).user);
    datastore.eject('user', 19);
    assert.isUndefined(datastore.get('comment', 19).approvedByUser);

    // profile21 relations
    assert.deepEqual(datastore.get('user', 22), datastore.get('profile', 21).user);
    datastore.eject('user', 22);
    assert.isUndefined(datastore.get('profile', 21).user);
  });
});
