describe('DS#refresh', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    var tasks = [];

    tasks.push(store.refresh('does not exist', 5).then(function () {
      fail('should not have succeeded');
    }).catch(function (err) {
      assert.isTrue(err instanceof store.errors.NonexistentResourceError);
      assert.equal(err.message, 'does not exist is not a registered resource!');
    }));

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      tasks.push(store.refresh('post', key).then(function () {
        fail('should not have succeeded');
      }).catch(function (err) {
        assert.isTrue(err instanceof store.errors.IllegalArgumentError);
        assert.equal(err.message, '"id" must be a string or a number!');
      }));
    });

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        tasks.push(store.refresh('post', 5, key).then(function () {
          fail('should not have succeeded');
        }).catch(function (err) {
          assert.isTrue(err instanceof store.errors.IllegalArgumentError);
          assert.equal(err.message, '"options" must be an object!');
        }));
      }
    });

    return store.utils.Promise.all(tasks);
  });
});
