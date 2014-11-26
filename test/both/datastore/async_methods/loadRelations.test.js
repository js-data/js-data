describe('DS#loadRelations', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    var tasks = [];

    tasks.push(store.loadRelations('does not exist', user10, []).then(function () {
      fail('should have rejected');
    }).catch(function (err) {
      assert.isTrue(err instanceof store.errors.NonexistentResourceError);
      assert.equal(err.message, 'does not exist is not a registered resource!');
    }));

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER_OBJECT, function (key) {
      if (DSUtils.isArray(key)) {
        return;
      }
      tasks.push(store.loadRelations('user', key).then(function () {
        fail('should have rejected');
      }).catch(function (err) {
        assert.isTrue(err instanceof store.errors.IllegalArgumentError);
        assert.equal(err.message, '"instance(id)" must be a string, number or object!');
      }));
    });

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_ARRAY, function (key) {
      if (key) {
        tasks.push(store.loadRelations('user', user10, key).then(function () {
          fail('should have rejected');
        }).catch(function (err) {
          assert.isTrue(err instanceof store.errors.IllegalArgumentError);
          assert.equal(err.message, '"relations" must be a string or an array!');
        }));
      }
    });

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        tasks.push(store.loadRelations('user', user10, [], key).then(function () {
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
