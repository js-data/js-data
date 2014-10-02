describe('DS#destroyAll', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    store.destroyAll('does not exist', {}).then(function () {
      fail('should have rejected');
    }, function (err) {
      assert.isTrue(err instanceof store.errors.NonexistentResourceError);
      assert.equal(err.message, 'does not exist is not a registered resource!');
    });
  });
});
