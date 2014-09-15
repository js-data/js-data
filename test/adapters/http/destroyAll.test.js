describe('DSHttpAdapter.destroyAll(resourceConfig, params, options)', function () {

  it('should make a DELETE request', function (done) {
    var _this = this;

    dsHttpAdapter.destroyAll({
      baseUrl: 'api',
      endpoint: 'posts',
      getEndpoint: function () {
        return 'posts';
      }
    }, {}).then(function (data) {
      assert.equal('', data, 'posts should have been found');

      dsHttpAdapter.destroyAll({
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
        assert.equal('', data, 'posts should have been destroyed');
        assert.equal(lifecycle.queryTransform.callCount, 2, 'queryTransform should have been called');
        done();
      }).catch(function (err) {
        console.error(err.stack);
        done('should not have rejected');
      });

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'api2/posts?where=%7B%22author%22:%7B%22%3D%3D%22:%22John%22%7D%7D');
        assert.equal(_this.requests[1].method, 'delete');
        _this.requests[1].respond(204);
      }, 10);
    }).catch(function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'api/posts');
      assert.equal(_this.requests[0].method, 'delete');
      _this.requests[0].respond(204);
    }, 10);
  });
});
