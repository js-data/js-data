describe('DSHttpAdapter.update(resourceConfig, id, attrs, options)', function () {

  it('should make a PUT request', function (done) {
    var _this = this;

    dsHttpAdapter.update({
      baseUrl: 'api',
      endpoint: 'posts',
      getEndpoint: function () {
        return 'posts';
      }
    }, 1, { author: 'John', age: 30 }).then(function (data) {
      assert.deepEqual(data, p1, 'post 5 should have been updated');

      dsHttpAdapter.update({
        baseUrl: 'api',
        endpoint: 'posts',
        getEndpoint: function () {
          return 'posts';
        }
      }, 1, { author: 'John', age: 30 }, { baseUrl: 'api2' }).then(function (data) {
        assert.deepEqual(data, p1, 'post 5 should have been updated');
        assert.equal(lifecycle.queryTransform.callCount, 0, 'queryTransform should not have been called');
        done();
      }).catch(function (err) {
        console.error(err.stack);
        done('should not have rejected');
      });

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'api2/posts/1');
        assert.equal(_this.requests[1].method, 'put');
        assert.equal(_this.requests[1].requestBody, JSON.stringify({ author: 'John', age: 30 }));
        _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(p1));
      }, 10);
    }).catch(function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'api/posts/1');
      assert.equal(_this.requests[0].method, 'put');
      assert.equal(_this.requests[0].requestBody, JSON.stringify({ author: 'John', age: 30 }));
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(p1));
    }, 10);
  });
});
