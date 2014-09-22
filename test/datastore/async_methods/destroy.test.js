describe('DS.destroy(resourceName, id)', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    datastore.destroy('does not exist', 5).then(function () {
      fail('should have rejected');
    }, function (err) {
      assert.isTrue(err instanceof datastore.errors.NonexistentResourceError);
      assert.equal(err.message, 'does not exist is not a registered resource!');
    });

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      datastore.destroy('post', key).then(function () {
        fail('should have rejected');
      }, function (err) {
        assert.isTrue(err instanceof datastore.errors.IllegalArgumentError);
        assert.equal(err.message, '"id" must be a string or a number!');
      });
    });
  });
  it('should delete an item from the data store', function (done) {
    var _this = this;

    datastore.inject('post', p1);

    datastore.destroy('post', 5).then(function (id) {
      try {
        assert.equal(id, '5', 'post 5 should have been deleted');
        assert.equal(lifecycle.beforeDestroy.callCount, 1, 'beforeDestroy should have been called');
        assert.equal(lifecycle.afterDestroy.callCount, 1, 'afterDestroy should have been called');
        assert.isUndefined(datastore.get('post', 5));
        assert.equal(datastore.lastModified('post', 5), 0);
        assert.equal(datastore.lastSaved('post', 5), 0);
        done();
      } catch (e) {
        done(e);
      }
    }).catch(function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      try {
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
        assert.equal(_this.requests[0].method, 'delete');
        _this.requests[0].respond(200, {'Content-Type': 'text/plain'}, '5');
      } catch (e) {
        done(e);
      }
    }, 30);
  });
  it('should handle nested resources', function (done) {
    var _this = this;
    var testComment = {
      id: 5,
      content: 'test'
    };
    var testComment2 = {
      id: 6,
      content: 'test',
      approvedBy: 4
    };

    datastore.inject('comment', testComment);

    datastore.destroy('comment', 5, {
      params: {
        approvedBy: 4
      }
    }).then(function () {
      datastore.inject('comment', testComment2);

      datastore.destroy('comment', 6, {
        bypassCache: true
      }).then(function () {
        datastore.inject('comment', testComment2);

        datastore.destroy('comment', 6, {
          params: {
            approvedBy: false
          }
        }).then(function () {
          done();
        }).catch(function () {
          done('Should not have failed!');
        });

        setTimeout(function () {
          assert.equal(3, _this.requests.length);
          assert.equal(_this.requests[2].url, 'http://test.js-data.io/comment/6');
          assert.equal(_this.requests[2].method, 'delete');
          _this.requests[2].respond(204);
        }, 30);
      }).catch(function () {
        done('Should not have failed!');
      });

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/user/4/comment/6');
        assert.equal(_this.requests[1].method, 'delete');
        _this.requests[1].respond(204);
      }, 30);
    }).catch(function () {
      done('Should not have failed!');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/user/4/comment/5');
      assert.equal(_this.requests[0].method, 'delete');
      _this.requests[0].respond(204);
    }, 30);
  });
  it('should eager eject', function (done) {
    var _this = this;

    datastore.inject('post', p1);

    datastore.destroy('post', 5, { eagerEject: true }).then(function (id) {
      try {
        assert.equal(id, '5', 'post 5 should have been deleted');
        assert.equal(lifecycle.beforeDestroy.callCount, 1, 'beforeDestroy should have been called');
        assert.equal(lifecycle.afterDestroy.callCount, 1, 'afterDestroy should have been called');
        assert.isUndefined(datastore.get('post', 5));
        assert.equal(datastore.lastModified('post', 5), 0);
        assert.equal(datastore.lastSaved('post', 5), 0);
        done();
      } catch (e) {
        done(e);
      }
    }).catch(function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      assert.isUndefined(datastore.get('post', 5));
      setTimeout(function () {
        try {
          assert.equal(1, _this.requests.length);
          assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
          assert.equal(_this.requests[0].method, 'delete');
          _this.requests[0].respond(200, {'Content-Type': 'text/plain'}, '5');
        } catch (e) {
          done(e);
        }
      }, 30);
    }, 30);
  });
});
