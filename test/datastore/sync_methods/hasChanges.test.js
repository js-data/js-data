describe('DS.hasChanges(resourceName, id)', function () {
  function errorPrefix(resourceName, id) {
    return 'DS.hasChanges(' + resourceName + ', ' + id + '): ';
  }

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      datastore.hasChanges('does not exist', {});
    }, datastore.errors.NonexistentResourceError, errorPrefix('does not exist', {}) + 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        datastore.hasChanges('post', key);
      }, datastore.errors.IllegalArgumentError, errorPrefix('post', key) + 'id: Must be a string or a number!');
    });
  });
  it('should return false if the item is not in the store', function () {
    assert.isFalse(datastore.hasChanges('post', 5));
  });
  it('should return whether an item has changes', function () {

    datastore.inject('post', p1);

    assert.isFalse(datastore.hasChanges('post', 5));

    var post = datastore.get('post', 5);
    post.author = 'Jake';

    datastore.digest();

    assert.isTrue(datastore.hasChanges('post', 5));
  });
});
