describe('DS#linkInverse', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      store.linkInverse('does not exist', {});
    }, store.errors.NonexistentResourceError, 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        store.linkInverse('post', key);
      }, store.errors.IllegalArgumentError, '"id" must be a string or a number!');
    });
  });
  it('should find inverse links', function () {
    store.inject('user', { organizationId: 5, id: 1 });
    store.inject('organization', { id: 5 });
    store.inject('comment', { userId: 1, id: 23 });
    store.inject('comment', { userId: 1, id: 44 });

    // link user to its relations
    store.linkInverse('user', 1, ['organization']);

    assert.isArray(store.get('organization', 5).users);
    assert.equal(1, store.get('organization', 5).users.length);

    // link user to all of its all relations
    store.linkInverse('user', 1);

    assert.isObject(store.get('comment', 23).user);
    assert.isObject(store.get('comment', 44).user);
  });
});
