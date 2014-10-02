describe('DS#get', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      store.get('does not exist', {});
    }, store.errors.NonexistentResourceError, 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        store.get('post', key);
      }, store.errors.IllegalArgumentError, '"id" must be a string or a number!');
    });

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        assert.throws(function () {
          store.get('post', 5, key);
        }, store.errors.IllegalArgumentError, '"options" must be an object!');
      }
    });
  });
  it('should return undefined if the query has never been made before', function () {
    assert.isUndefined(store.get('post', 5), 'should be undefined');
  });
});
