describe('DS#lastSaved', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      store.lastSaved('does not exist', {});
    }, store.errors.NonexistentResourceError, 'does not exist is not a registered resource!');
  });
});
