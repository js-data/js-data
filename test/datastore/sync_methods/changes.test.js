describe('DS.changes(resourceName, id)', function () {
  function errorPrefix(resourceName) {
    return 'DS.changes(' + resourceName + ', id): ';
  }

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      datastore.changes('does not exist', {});
    }, datastore.errors.NonexistentResourceError, errorPrefix('does not exist') + 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        datastore.changes('post', key);
      }, datastore.errors.IllegalArgumentError, errorPrefix('post') + 'id: Must be a string or a number!');
    });
  });
  it('should return false if the item is not in the store', function () {
    assert.isUndefined(datastore.changes('post', 5));
  });
  it('should return the changes in an object', function () {

    datastore.inject('post', p1);

    assert.deepEqual(datastore.changes('post', 5), {added: {}, changed: {}, removed: {}});

    var post = datastore.get('post', 5);
    post.author = 'Jake';

    datastore.digest();

    assert.deepEqual(datastore.changes('post', 5), {added: {}, changed: {
      author: 'Jake'
    }, removed: {}});
  });
});
