describe('DS#destroyAll', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    return store.destroyAll('does not exist', {}).then(function () {
      fail('should have rejected');
    }).catch(function (err) {
      assert.isTrue(err instanceof store.errors.NonexistentResourceError);
      assert.equal(err.message, 'does not exist is not a registered resource!');
    });
  });
});
