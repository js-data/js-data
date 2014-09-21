describe('DS.link(resourceName, id[, relations])', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      datastore.link('does not exist', {});
    }, datastore.errors.NonexistentResourceError, 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        datastore.link('post', key);
      }, datastore.errors.IllegalArgumentError, '"id" must be a string or a number!');
    });
  });
  it('should find links', function () {
    var org66 = datastore.inject('organization', {
      id: 66
    });
    var user88 = datastore.inject('user', {
      id: 88,
      organizationId: 66
    });
    datastore.inject('user', {
      id: 99,
      organizationId: 66
    });
    var profile77 = datastore.inject('profile', {
      id: 77,
      userId: 88
    });

    datastore.link('user', 88, ['organization']);
    datastore.link('user', 88, ['profile']);
    datastore.link('organization', 66, ['user']);

    assert.isTrue(user88.organization === org66);
    assert.isTrue(user88.profile === profile77);
    assert.equal(2, org66.users.length);
  });
  it('should find all links', function () {
    var org66 = datastore.inject('organization', {
      id: 66
    });
    var user88 = datastore.inject('user', {
      id: 88,
      organizationId: 66
    });
    var user99 = datastore.inject('user', {
      id: 99,
      organizationId: 66
    });
    var profile77 = datastore.inject('profile', {
      id: 77,
      userId: 88
    });

    datastore.link('user', 88, []);
    datastore.link('user', 88, []);
    datastore.link('organization', 66, []);

    assert.isTrue(user88.organization === org66);
    assert.isTrue(user88.profile === profile77);
    assert.isUndefined(user99.profile);
    assert.equal(2, org66.users.length);
  });
});
