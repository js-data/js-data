describe('DS#loadRelations', function () {
  it('should get an item from the server', function (done) {
    var _this = this;
    store.inject('user', user10);

    store.loadRelations('user', 10, ['comment', 'profile', 'organization'], { params: { approvedBy: 10 } }).then(function (user) {
      try {
        assert.deepEqual(user.comments[0].id, store.get('comment', user.comments[0].id).id);
        assert.deepEqual(user.comments[0].user.id, store.get('comment', user.comments[0].id).user.id);
        assert.deepEqual(user.comments[1].id, store.get('comment', user.comments[1].id).id);
        assert.deepEqual(user.comments[1].user.id, store.get('comment', user.comments[1].id).user.id);
        assert.deepEqual(user.comments[2].id, store.get('comment', user.comments[2].id).id);
        assert.deepEqual(user.comments[2].user.id, store.get('comment', user.comments[2].id).user.id);
        assert.deepEqual(user.organization.id, store.get('organization', 14).id);
        assert.deepEqual(user.profile.id, store.get('profile', 15).id);
        // try a comment that has a belongsTo relationship to multiple users:
        store.inject('comment', comment19);
        store.loadRelations('comment', 19, ['user']).then(function (comment) {
          assert.isObject(comment.user);
          assert.equal(comment.user.id, user20.id);
          assert.isObject(comment.approvedByUser);
          assert.equal(comment.approvedByUser.id, user19.id);
          done();
        }, done);
      } catch (err) {
        done(err);
      }

      setTimeout(function () {
        assert.equal(5, _this.requests.length);
        assert.equal(_this.requests[3].url, 'http://test.js-data.io/user/20');
        assert.equal(_this.requests[3].method, 'get');
        assert.equal(_this.requests[4].url, 'http://test.js-data.io/user/19');
        assert.equal(_this.requests[4].method, 'get');
        _this.requests[3].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(user20));
        _this.requests[4].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(user19));
      }, 30);
    }, done);

    setTimeout(function () {
      try {
        assert.equal(3, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/organization/14/user/10/comment');
        assert.equal(_this.requests[0].method, 'get');
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/profile?approvedBy=10&userId=10');
        assert.equal(_this.requests[1].method, 'get');
        assert.equal(_this.requests[2].url, 'http://test.js-data.io/organization/14?approvedBy=10');
        assert.equal(_this.requests[2].method, 'get');
        _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([
          comment11,
          comment12,
          comment13
        ]));
        _this.requests[1].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([profile15]));
        _this.requests[2].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(organization14));
      } catch (err) {
        done(err.stack);
      }
    }, 30);
  });
  it('should get an item from the server but not store it if cacheResponse is false', function (done) {
    var _this = this;
    store.inject('user', {
      name: 'John Anderson',
      id: 10,
      organizationId: 14
    });

    store.loadRelations('user', 10, ['comment', 'profile', 'organization'], { cacheResponse: false }).then(function (user) {
      assert.deepEqual(JSON.stringify(user.comments), JSON.stringify([
        comment11,
        comment12,
        comment13
      ]));
      assert.deepEqual(JSON.stringify(user.organization), JSON.stringify(organization14));
      assert.deepEqual(JSON.stringify(user.profile), JSON.stringify(profile15));

      assert.isUndefined(store.get('comment', 11));
      assert.isUndefined(store.get('comment', 12));
      assert.isUndefined(store.get('comment', 13));
      assert.isUndefined(store.get('organization', 14));
      assert.isUndefined(store.get('profile', 15));

      done();
    }, done);

    setTimeout(function () {
      try {
        assert.equal(3, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/organization/14/user/10/comment');
        assert.equal(_this.requests[0].method, 'get');
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/profile?userId=10');
        assert.equal(_this.requests[1].method, 'get');
        assert.equal(_this.requests[2].url, 'http://test.js-data.io/organization/14');
        assert.equal(_this.requests[2].method, 'get');
        _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([
          comment11,
          comment12,
          comment13
        ]));
        _this.requests[1].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([profile15]));
        _this.requests[2].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(organization14));
      } catch (err) {
        done(err.stack);
      }
    }, 30);
  });
  it('should correctly propagate errors', function (done) {
    var _this = this;
    store.inject('user', {
      name: 'John Anderson',
      id: 10,
      organizationId: 14
    });

    store.loadRelations('user', 10, ['comment', 'profile', 'organization']).then(function () {
      done('Should not have succeeded!');
    }, function (err) {
      assert.equal(err.data, 'Not Found');
      done();
    }).catch(function (err) {
      assert.equal(err.data, 'Not Found');
      done();
    });

    setTimeout(function () {
      try {
        assert.equal(3, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/organization/14/user/10/comment');
        assert.equal(_this.requests[0].method, 'get');
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/profile?userId=10');
        assert.equal(_this.requests[1].method, 'get');
        assert.equal(_this.requests[2].url, 'http://test.js-data.io/organization/14');
        assert.equal(_this.requests[2].method, 'get');
        _this.requests[0].respond(404, {'Content-Type': 'text/plain'}, 'Not Found');
        _this.requests[1].respond(404, {'Content-Type': 'text/plain'}, 'Not Found');
        _this.requests[2].respond(404, {'Content-Type': 'text/plain'}, 'Not Found');
      } catch (err) {
        done(err.stack);
      }
    }, 30);
  });
  it('should handle multiple belongsTo levels', function (done) {
    var _this = this;
    var organization = store.inject('organization', organization14);

    var copy = DSUtils.deepMixIn({}, user10);
    delete copy.organization;
    delete copy.comments;
    delete copy.profile;

    store.loadRelations('organization', organization, ['user']).then(function (organization) {
      assert.isTrue(organization === organization.users[0].organization);

      var user = store.get('user', 10);

      store.loadRelations('user', user, ['comment']).then(function (user) {
        assert.isArray(user.comments);
        done();
      }).catch(function (err) {
        console.error(err.stack);
        done('Should not have failed!');
      });

      setTimeout(function () {
        try {
          assert.equal(2, _this.requests.length);
          assert.equal(_this.requests[1].url, 'http://test.js-data.io/organization/14/user/10/comment');
          assert.equal(_this.requests[1].method, 'get');
          _this.requests[1].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson[comment11, comment12]);
        } catch (err) {
          done(err.stack);
        }
      }, 30);
    }).catch(function () {
      done('Should not have failed!');
    });

    setTimeout(function () {
      try {
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/organization/14/user');
        assert.equal(_this.requests[0].method, 'get');
        _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([copy]));
      } catch (err) {
        done(err.stack);
      }
    }, 30);
  });
  it('should handle multiple belongsTo levels when the response includes nested resources', function (done) {
    var _this = this;
    var organization = store.inject('organization', {
      id: 1
    });

    store.loadRelations('organization', organization, ['user']).then(function (organization) {
      assert.isTrue(organization === organization.users[0].organization);

      var user = store.get('user', 1);

      store.loadRelations('user', user, ['comment']).then(function (user) {
        assert.isArray(user.comments);

        done();
      }).catch(function () {
        done('Should not have failed!');
      });

      setTimeout(function () {
        try {
          assert.equal(2, _this.requests.length);
          assert.equal(_this.requests[1].url, 'http://test.js-data.io/organization/1/user/1/comment');
          assert.equal(_this.requests[1].method, 'get');
          _this.requests[1].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([
            {
              id: 1,
              userId: 1,
              user: {
                id: 1
              }
            },
            {
              id: 2,
              userId: 1,
              user: {
                id: 1
              }
            }
          ]));
        } catch (err) {
          done(err.stack);
        }
      }, 30);
    }).catch(function () {
      done('Should not have failed!');
    });

    setTimeout(function () {
      try {
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/organization/1/user');
        assert.equal(_this.requests[0].method, 'get');
        _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([
          {
            organizationId: 1,
            id: 1
          }
        ]));
      } catch (err) {
        done(err.stack);
      }
    }, 30);
  });
});
