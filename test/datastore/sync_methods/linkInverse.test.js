describe('DS.linkInverse(resourceName, id[, relations])', function () {
  function errorPrefix(resourceName) {
    return 'DS.linkInverse(' + resourceName + ', id[, relations]): ';
  }

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      datastore.linkInverse('does not exist', {});
    }, datastore.errors.NonexistentResourceError, errorPrefix('does not exist') + 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        datastore.linkInverse('post', key);
      }, datastore.errors.IllegalArgumentError, errorPrefix('post') + 'id: Must be a string or a number!');
    });
  });
  it('should find inverse links', function () {
    datastore.inject('user', { organizationId: 5, id: 1 });
    datastore.inject('organization', { id: 5 });
    datastore.inject('comment', { userId: 1, id: 23 });
    datastore.inject('comment', { userId: 1, id: 44 });

    // link user to its relations
    datastore.linkInverse('user', 1, ['organization']);

    assert.isArray(datastore.get('organization', 5).users);
    assert.equal(1, datastore.get('organization', 5).users.length);

    // link user to all of its all relations
    datastore.linkInverse('user', 1);

    assert.isObject(datastore.get('comment', 23).user);
    assert.isObject(datastore.get('comment', 44).user);
  });
});
