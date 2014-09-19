describe('DS.destroyAll(resourceName, params[, options]): ', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    datastore.destroyAll('does not exist', {}).then(function () {
      fail('should have rejected');
    }, function (err) {
      assert.isTrue(err instanceof datastore.errors.NonexistentResourceError);
      assert.equal(err.message, 'does not exist is not a registered resource!');
    });
  });
  it('should query the server for a collection', function (done) {
    var _this = this;
    datastore.inject('post', p1);
    datastore.inject('post', p2);
    datastore.inject('post', p3);
    datastore.inject('post', p4);
    datastore.inject('post', p5);

    datastore.destroyAll('post', { where: { age: 33 } }).then(function () {
      assert.isDefined(datastore.get('post', 5));
      assert.isDefined(datastore.get('post', 6));
      assert.isDefined(datastore.get('post', 7));
      assert.isUndefined(datastore.get('post', 8));
      assert.isUndefined(datastore.get('post', 9));

      datastore.inject('post', p1);
      datastore.inject('post', p2);
      datastore.inject('post', p3);
      datastore.inject('post', p4);
      datastore.inject('post', p5);

      datastore.destroyAll('post', {}).then(function () {
        assert.deepEqual(datastore.filter('post', {}), [], 'The posts should not be in the store yet');
        done();
      }, function (err) {
        console.log(err);
        done(err);
      }).catch(function (err) {
        console.error(err.stack);
        done('Should not have rejected!');
      });
      setTimeout(function () {
        assert.equal(_this.requests.length, 2);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/posts');
        assert.equal(_this.requests[1].method, 'delete');
        _this.requests[1].respond(200);
      }, 30);
    }).catch(function (err) {
      console.error(err.stack);
      done('Should not have rejected!');
    });

    setTimeout(function () {
      try {
        assert.equal(_this.requests.length, 1);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts?where=%7B%22age%22:33%7D');
        assert.equal(_this.requests[0].method, 'delete');
        _this.requests[0].respond(200);
      } catch (err) {
        done(err);
      }
    }, 30);
  });
  it('should handle nested resources', function (done) {
    var _this = this;

    datastore.destroyAll('comment', {
      content: 'test'
    }, {
      params: {
        approvedBy: 4
      }
    }).then(function () {
      datastore.destroyAll('comment', {
        content: 'test'
      }).then(function () {
        datastore.destroyAll('comment', {
          content: 'test'
        }, {
          params: {
            approvedBy: false
          }
        }).then(function () {
          done();
        }).catch(function (err) {
          console.log(err);
          done('Should not have failed!');
        });

        setTimeout(function () {
          assert.equal(3, _this.requests.length);
          assert.equal(_this.requests[2].url, 'http://test.js-data.io/comment?content=test');
          assert.equal(_this.requests[2].method, 'delete');
          _this.requests[2].respond(204);
        }, 30);
      }).catch(function (err) {
        console.log(err);
        done('Should not have failed!');
      });

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/comment?content=test');
        assert.equal(_this.requests[1].method, 'delete');
        _this.requests[1].respond(204);
      }, 30);
    }).catch(function (err) {
      console.log(err);
      done('Should not have failed!');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/user/4/comment?content=test');
      assert.equal(_this.requests[0].method, 'delete');
      _this.requests[0].respond(204);
    }, 30);
  });
});
