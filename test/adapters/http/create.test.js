describe('DSHttpAdapter.create(resourceConfig, attrs, options)', function () {

  it('should make a POST request', function (done) {
    var _this = this;

    dsHttpAdapter.create({
      baseUrl: 'api',
      endpoint: 'posts',
      getEndpoint: function () {
        return 'posts';
      }
    }, { author: 'John', age: 30 }).then(function (data) {
      assert.deepEqual(data, p1, 'post should have been created');

      dsHttpAdapter.create({
        baseUrl: 'api',
        endpoint: 'posts',
        getEndpoint: function () {
          return 'posts';
        }
      }, { author: 'John', age: 30 }, { baseUrl: 'api2' }).then(function (data) {
        assert.deepEqual(data, p1, 'post should have been created');

        assert.equal(lifecycle.queryTransform.callCount, 0, 'queryTransform should not have been called');

        done();
      }).catch(function (err) {
        console.error(err.stack);
        done('should not have rejected');
      });

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'api2/posts');
        assert.equal(_this.requests[1].requestBody, DSUtils.toJson({ author: 'John', age: 30 }));
        _this.requests[1].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(p1));
      }, 10);
    }).catch(function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'api/posts');
      assert.equal(_this.requests[0].method, 'post');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ author: 'John', age: 30 }));
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(p1));
    }, 10);
  });
});
