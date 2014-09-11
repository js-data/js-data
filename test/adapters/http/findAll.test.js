describe('dsHttpAdapter.findAll(resourceConfig, params, options)', function () {

  it('should make a GET request', function (done) {
    var _this = this;

    dsHttpAdapter.findAll({
      baseUrl: 'api',
      endpoint: 'posts',
      getEndpoint: function () {
        return 'posts';
      }
    }, {}).then(function (data) {
      assert.deepEqual(data, [p1], 'posts should have been found');

      dsHttpAdapter.findAll({
        baseUrl: 'api',
        endpoint: 'posts',
        getEndpoint: function () {
          return 'posts';
        }
      }, {
        where: {
          author: {
            '==': 'John'
          }
        }
      }, { baseUrl: 'api2' }).then(function (data) {
        assert.deepEqual(data, [p1], 'posts should have been found');
        assert.equal(lifecycle.queryTransform.callCount, 2, 'queryTransform should have been called');
        done();
      }).catch(function (err) {
        console.error(err.stack);
        done('should not have rejected');
      });

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'api2/posts?where=%7B%22author%22:%7B%22%3D%3D%22:%22John%22%7D%7D');
        assert.equal(_this.requests[1].method, 'get');
        _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify([p1]));
      }, 10);
    }).catch(function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'api/posts');
      assert.equal(_this.requests[0].method, 'get');
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify([p1]));
    }, 10);
  });
});
