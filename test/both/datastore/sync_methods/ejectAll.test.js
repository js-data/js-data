describe('DS#ejectAll', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      store.ejectAll('does not exist');
    }, store.errors.NonexistentResourceError, 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        assert.throws(function () {
          store.ejectAll('post', key);
        }, store.errors.IllegalArgumentError, '"params" must be an object!');
      }
    });
  });
  it('should eject items that meet the criteria from the store', function () {
    store.inject('post', p1);
    store.inject('post', p2);
    store.inject('post', p3);
    store.inject('post', p4);
    store.inject('post', p5);
    assert.doesNotThrow(function () {
      store.ejectAll('post', { where: { author: 'Adam' } });
    });
    assert.isDefined(store.get('post', 5));
    assert.isDefined(store.get('post', 6));
    assert.isDefined(store.get('post', 7));
    assert.isUndefined(store.get('post', 8));
    assert.isUndefined(store.get('post', 9));
  });
  it('should eject items that meet the criteria from the store 2', function () {
    store.inject('post', p1);
    store.inject('post', p2);
    store.inject('post', p3);
    store.inject('post', p4);
    store.inject('post', p5);
    try {
      store.ejectAll('post', { where: { age: 33 } });
    } catch (err) {
      console.error(err.stack);
    }
    assert.doesNotThrow(function () {
      store.ejectAll('post', { where: { age: 33 } });
    });

    assert.isDefined(store.get('post', 5));
    assert.isDefined(store.get('post', 6));
    assert.isDefined(store.get('post', 7));
    assert.isUndefined(store.get('post', 8));
    assert.isUndefined(store.get('post', 9));
  });
  it('should eject all items from the store', function () {
    store.inject('post', p1);
    store.inject('post', p2);
    store.inject('post', p3);
    store.inject('post', p4);

    assert.deepEqual(JSON.stringify(store.get('post', 5)), JSON.stringify(p1));
    assert.deepEqual(JSON.stringify(store.get('post', 6)), JSON.stringify(p2));
    assert.deepEqual(JSON.stringify(store.get('post', 7)), JSON.stringify(p3));
    assert.deepEqual(JSON.stringify(store.get('post', 8)), JSON.stringify(p4));

    store.store.post.completedQueries.test = 'stuff';

    assert.doesNotThrow(function () {
      store.ejectAll('post');
    });

    assert.deepEqual(JSON.stringify(store.store.post.completedQueries), JSON.stringify({}));
    assert.isUndefined(store.get('post', 5));
    assert.isUndefined(store.get('post', 6));
    assert.isUndefined(store.get('post', 7));
    assert.isUndefined(store.get('post', 8));
  });
});
