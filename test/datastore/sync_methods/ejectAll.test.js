describe('DS.ejectAll(resourceName[, params])', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      datastore.ejectAll('does not exist');
    }, datastore.errors.NonexistentResourceError, 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        assert.throws(function () {
          datastore.ejectAll('post', key);
        }, datastore.errors.IllegalArgumentError, '"params" must be an object!');
      }
    });
  });
  it('should eject items that meet the criteria from the store', function () {
    datastore.inject('post', p1);
    datastore.inject('post', p2);
    datastore.inject('post', p3);
    datastore.inject('post', p4);
    datastore.inject('post', p5);
    assert.doesNotThrow(function () {
      datastore.ejectAll('post', { where: { author: 'Adam' } });
    });
    assert.isDefined(datastore.get('post', 5));
    assert.isDefined(datastore.get('post', 6));
    assert.isDefined(datastore.get('post', 7));
    assert.isUndefined(datastore.get('post', 8));
    assert.isUndefined(datastore.get('post', 9));
  });
  it('should eject items that meet the criteria from the store 2', function () {
    datastore.inject('post', p1);
    datastore.inject('post', p2);
    datastore.inject('post', p3);
    datastore.inject('post', p4);
    datastore.inject('post', p5);
    try {
      datastore.ejectAll('post', { where: { age: 33 } });
    } catch (err) {
      console.log(err.stack);
    }
    assert.doesNotThrow(function () {
      datastore.ejectAll('post', { where: { age: 33 } });
    });

    assert.isDefined(datastore.get('post', 5));
    assert.isDefined(datastore.get('post', 6));
    assert.isDefined(datastore.get('post', 7));
    assert.isUndefined(datastore.get('post', 8));
    assert.isUndefined(datastore.get('post', 9));
  });
  it('should eject all items from the store', function () {
    datastore.inject('post', p1);
    datastore.inject('post', p2);
    datastore.inject('post', p3);
    datastore.inject('post', p4);

    assert.deepEqual(datastore.get('post', 5), p1);
    assert.deepEqual(datastore.get('post', 6), p2);
    assert.deepEqual(datastore.get('post', 7), p3);
    assert.deepEqual(datastore.get('post', 8), p4);

    datastore.store.post.completedQueries.test = 'stuff';

    assert.doesNotThrow(function () {
      datastore.ejectAll('post');
    });

    assert.deepEqual(datastore.store.post.completedQueries, {});
    assert.isUndefined(datastore.get('post', 5));
    assert.isUndefined(datastore.get('post', 6));
    assert.isUndefined(datastore.get('post', 7));
    assert.isUndefined(datastore.get('post', 8));
  });
});
