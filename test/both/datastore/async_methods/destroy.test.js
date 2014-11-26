describe('DS#destroy', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    var tasks = [];
    tasks.push(store.destroy('does not exist', 5).then(function () {
      fail('should have rejected');
    }).catch(function (err) {
      assert.isTrue(err instanceof store.errors.NonexistentResourceError);
      assert.equal(err.message, 'does not exist is not a registered resource!');
    }));

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      tasks.push(store.destroy('post', key).then(function () {
        fail('should have rejected');
      }).catch(function (err) {
        assert.isTrue(err instanceof store.errors.IllegalArgumentError);
        assert.equal(err.message, '"id" must be a string or a number!');
      }));
    });

    return store.utils.Promise.all(tasks);
  });
});
