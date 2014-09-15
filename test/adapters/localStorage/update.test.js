describe('DSLocalStorageAdapter.update(resourceConfig, id, attrs[, options])', function () {

  it('should make a PUT request', function (done) {
    var path = DSUtils.makePath('api', 'posts', 1);

    localStorage.setItem(path, DSUtils.toJson(p1));

    assert.deepEqual(DSUtils.fromJson(localStorage.getItem(path)), p1, 'p1 should be in localStorage');

    dsLocalStorageAdapter.update({
      baseUrl: 'api',
      endpoint: 'posts',
      getEndpoint: function () {
        return 'posts';
      }
    }, 1, { author: 'Sally' }).then(function (data) {
      assert.deepEqual(data, { author: 'Sally', age: 30, id: 5 }, 'data should have been updated');
      assert.deepEqual(DSUtils.fromJson(localStorage.getItem(path)), { author: 'Sally', age: 30, id: 5 }, 'p1 should be in localStorage');

      path = DSUtils.makePath('api2', 'posts', 2);

      localStorage.setItem(path, DSUtils.toJson(p2));

      assert.deepEqual(DSUtils.fromJson(localStorage.getItem(path)), p2, 'p2 should be in localStorage');

      dsLocalStorageAdapter.update({
        baseUrl: 'api',
        endpoint: 'posts',
        getEndpoint: function () {
          return 'posts';
        }
      }, 2, { age: 44 }, { baseUrl: 'api2' }).then(function (data) {
        assert.deepEqual(data, { author: 'Sally', age: 44, id: 6 }, 'data should have been updated');
        assert.deepEqual(DSUtils.fromJson(localStorage.getItem(path)), { author: 'Sally', age: 44, id: 6 }, 'p1 should be in localStorage');

        done();
      }, function (err) {
        console.error(err.stack);
        fail('should not have rejected');
      });

      datastore.digest();
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    datastore.digest();
  });
});
