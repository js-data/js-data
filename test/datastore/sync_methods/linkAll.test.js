describe('DS.linkAll(resourceName[, params][, relations])', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      datastore.linkAll('does not exist', {});
    }, datastore.errors.NonexistentResourceError, 'does not exist is not a registered resource!');
  });
  it('should find links', function () {
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

    datastore.linkAll('user', {}, ['organization']);
    datastore.linkAll('user', {}, ['profile']);
    datastore.linkAll('organization', {}, ['user']);

    assert.isTrue(user88.organization === org66, 1);
    assert.isTrue(user88.profile === profile77, 2);
    assert.isTrue(user99.organization === org66, 3);
    assert.isUndefined(user99.profile, 4);
    assert.equal(2, org66.users.length, 5);
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

    datastore.linkAll('user', {}, []);
    datastore.linkAll('user', {}, []);
    datastore.linkAll('organization', {}, []);

    assert.isTrue(user88.organization === org66);
    assert.isTrue(user88.profile === profile77);
    assert.isTrue(user99.organization === org66);
    assert.isUndefined(user99.profile);
    assert.equal(2, org66.users.length);
  });
});
