describe('DS#linkAll', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      store.linkAll('does not exist', {});
    }, store.errors.NonexistentResourceError, 'does not exist is not a registered resource!');
  });
  it('should find links', function () {
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

    store.linkAll('user', {}, ['organization']);
    store.linkAll('user', {}, ['profile']);
    store.linkAll('organization', {}, ['user']);

    assert.isTrue(user88.organization === org66, 1);
    assert.isTrue(user88.profile === profile77, 2);
    assert.isTrue(user99.organization === org66, 3);
    assert.isUndefined(user99.profile, 4);
    assert.equal(2, org66.users.length, 5);
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

    store.linkAll('user', {}, []);
    store.linkAll('user', {}, []);
    store.linkAll('organization', {}, []);

    assert.isTrue(user88.organization === org66);
    assert.isTrue(user88.profile === profile77);
    assert.isTrue(user99.organization === org66);
    assert.isUndefined(user99.profile);
    assert.equal(2, org66.users.length);
  });

  it('should not link resources if localField is not specified', function () {
    store.defineResource({
      name: 'water',
      relations: {
        hasOne: {
          oxygen: {
            foreignKey: 'atomId'
          }
        }
      }
    });
    store.defineResource({
      name: 'oxygen',
      relations: {
        belongsTo: {
          water: {
            localKey: 'moleculeId'
          }
        }
      }
    });
    var water = store.inject('water', {
      id: 21,
      atomId: 41
    });
    var oxygen = store.inject('oxygen', {
      id: 41,
      moleculeId: 21
    });

    store.linkAll('water');
    store.linkAll('oxygen');

    Object.keys(water).forEach(function(key) {
      assert.isTrue(water[key] !== oxygen);
    });
    Object.keys(oxygen).forEach(function(key) {
      assert.isTrue(oxygen[key] !== water);
    });
  });
});
