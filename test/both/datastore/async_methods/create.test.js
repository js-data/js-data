describe('DS#create', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    return store.create('fruit loops', 5).then(function () {
      fail('should have rejected');
    }).catch(function (err) {
      assert.isTrue(err instanceof store.errors.NonexistentResourceError);
      assert.equal(err.message, 'fruit loops is not a registered resource!');
    });
  });
});
