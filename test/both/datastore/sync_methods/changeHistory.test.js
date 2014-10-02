describe('DS#changeHistory', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      store.changeHistory('does not exist', {});
    }, store.errors.NonexistentResourceError, 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      if (key) {
        assert.throws(function () {
          store.changeHistory('post', key);
        }, store.errors.IllegalArgumentError, '"id" must be a string or a number!');
      }
    });
  });
  it('should return false if the item is not in the store', function () {
    assert.isUndefined(store.changeHistory('post', 5));
  });
});
