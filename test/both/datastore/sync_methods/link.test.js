describe('DS#link', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      store.link('does not exist', {});
    }, store.errors.NonexistentResourceError, 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        store.link('post', key);
      }, store.errors.IllegalArgumentError, '"id" must be a string or a number!');
    });
  });
  it('should find links', function () {
    var org66 = store.inject('organization', {
      id: 66
    });
    var user88 = store.inject('user', {
      id: 88,
      organizationId: 66
    });
    store.inject('user', {
      id: 99,
      organizationId: 66
    });
    var profile77 = store.inject('profile', {
      id: 77,
      userId: 88
    });

    store.link('user', 88, ['organization']);
    store.link('user', 88, ['profile']);
    store.link('organization', 66, ['user']);

    assert.isTrue(user88.organization === org66);
    assert.isTrue(user88.profile === profile77);
    assert.equal(2, org66.users.length);
  });
  it('should find all links', function () {
    var org66 = store.inject('organization', {
      id: 66
    });
    var user88 = store.inject('user', {
      id: 88,
      organizationId: 66
    });
    var user99 = store.inject('user', {
      id: 99,
      organizationId: 66
    });
    var profile77 = store.inject('profile', {
      id: 77,
      userId: 88
    });

    store.link('user', 88, []);
    store.link('user', 88, []);
    store.link('organization', 66, []);

    assert.isTrue(user88.organization === org66);
    assert.isTrue(user88.profile === profile77);
    assert.isUndefined(user99.profile);
    assert.equal(2, org66.users.length);
  });
});
