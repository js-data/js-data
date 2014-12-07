describe('DS#findAll', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    var tasks = [];

    tasks.push(store.findAll('does not exist', {}).then(function () {
      fail('should have rejected');
    }).catch(function (err) {
      assert.isTrue(err instanceof store.errors.NonexistentResourceError);
      assert.equal(err.message, 'does not exist is not a registered resource!');
    }));

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        tasks.push(store.findAll('post', key, { cacheResponse: false }).then(function () {
          fail('should have rejected');
        }).catch(function (err) {
          assert.isTrue(err instanceof store.errors.IllegalArgumentError);
          assert.equal(err.message, '"params" must be an object!');
        }));
      }
    });

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        tasks.push(store.findAll('post', {}, key).then(function () {
          fail('should have rejected');
        }).catch(function (err) {
          assert.isTrue(err instanceof store.errors.IllegalArgumentError);
          assert.equal(err.message, '"options" must be an object!');
        }));
      }
    });

    return store.utils.Promise.all(tasks);
  });
});
