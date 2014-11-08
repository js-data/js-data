describe('DS#getAll', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      store.getAll('does not exist');
    }, store.errors.NonexistentResourceError, 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_ARRAY, function (key) {
      if (key) {
        assert.throws(function () {
          store.getAll('post', key);
        }, store.errors.IllegalArgumentError, '"ids" must be an array!');
      }
    });
  });
  it('should return an array of all items in the store', function () {
    assert.isArray(store.getAll('post'), 'should be an array');
    assert.equal(store.getAll('post').length, 0, 'should be an empty array');
    store.inject('post', p1);
    store.inject('post', p2);
    store.inject('post', p3);
    assert.isArray(store.getAll('post'), 'should be an array');
    assert.equal(store.getAll('post').length, 3, 'should be an array of length 3');
    assert.deepEqual(store.getAll('post'), store.filter('post', {}));
  });
  it('should return results that match a set of ids', function () {
    store.inject('post', [p1, p2, p3]);
    var posts = store.getAll('post', [5, 7]);
    assert.deepEqual(DSUtils.toJson(posts), DSUtils.toJson([p1, p3]));
  });
});
