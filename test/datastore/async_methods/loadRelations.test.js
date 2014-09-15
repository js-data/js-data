describe('DS.loadRelations(resourceName, instance(Id), relations[, options]): ', function () {
  function errorPrefix(resourceName) {
    return 'DS.loadRelations(' + resourceName + ', instance(Id), relations[, options]): ';
  }

  it('should throw an error when method pre-conditions are not met', function () {
    datastore.loadRelations('does not exist', user10, []).then(function () {
      fail('should have rejected');
    }, function (err) {
      assert.isTrue(err instanceof datastore.errors.NonexistentResourceError);
      assert.equal(err.message, errorPrefix('does not exist') + 'does not exist is not a registered resource!');
    });

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER_OBJECT, function (key) {
      if (DSUtils.isArray(key)) {
        return;
      }
      datastore.loadRelations('user', key).then(function () {
        fail('should have rejected');
      }, function (err) {
        assert.isTrue(err instanceof datastore.errors.IllegalArgumentError);
        assert.equal(err.message, errorPrefix('user') + 'instance(Id): Must be a string, number or object!');
      });
    });

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_ARRAY, function (key) {
      if (key) {
        datastore.loadRelations('user', user10, key).then(function () {
          fail('should have rejected');
        }, function (err) {
          assert.isTrue(err instanceof datastore.errors.IllegalArgumentError);
          assert.equal(err.message, errorPrefix('user') + 'relations: Must be a string or an array!');
        });
      }
    });

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        datastore.loadRelations('user', user10, [], key).then(function () {
          fail('should have rejected');
        }, function (err) {
          assert.isTrue(err instanceof datastore.errors.IllegalArgumentError);
          assert.equal(err.message, errorPrefix('user') + 'options: Must be an object!');
        });
      }
    });
  });
  it('should get an item from the server', function (done) {
    var _this = this;
    datastore.inject('user', user10);

    datastore.loadRelations('user', 10, ['comment', 'profile', 'organization'], { params: { approvedBy: 10 } }).then(function (user) {
      try {
        assert.deepEqual(user.comments[0].id, datastore.get('comment', user.comments[0].id).id);
        assert.deepEqual(user.comments[0].user, datastore.get('comment', user.comments[0].id).user);
        assert.deepEqual(user.comments[1].id, datastore.get('comment', user.comments[1].id).id);
        assert.deepEqual(user.comments[1].user, datastore.get('comment', user.comments[1].id).user);
        assert.deepEqual(user.comments[2].id, datastore.get('comment', user.comments[2].id).id);
        assert.deepEqual(user.comments[2].user, datastore.get('comment', user.comments[2].id).user);
        assert.deepEqual(user.organization.id, datastore.get('organization', 14).id);
        assert.deepEqual(user.profile.id, datastore.get('profile', 15).id);
        // try a comment that has a belongsTo relationship to multiple users:
        datastore.inject('comment', comment19);
        datastore.loadRelations('comment', 19, ['user']).then(function (comment) {
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
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/user/10/comment');
        assert.equal(_this.requests[0].method, 'get');
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/profile?userId=10');
        assert.equal(_this.requests[1].method, 'get');
        assert.equal(_this.requests[2].url, 'http://test.js-data.io/organization/14?userId=10');
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
    datastore.inject('user', {
      name: 'John Anderson',
      id: 10,
      organizationId: 14
    });

    datastore.loadRelations('user', 10, ['comment', 'profile', 'organization'], { cacheResponse: false }).then(function (user) {
      assert.deepEqual(user.comments, [
        comment11,
        comment12,
        comment13
      ]);
      assert.deepEqual(user.organization, organization14);
      assert.deepEqual(user.profile, profile15);

      assert.isUndefined(datastore.get('comment', 11));
      assert.isUndefined(datastore.get('comment', 12));
      assert.isUndefined(datastore.get('comment', 13));
      assert.isUndefined(datastore.get('organization', 14));
      assert.isUndefined(datastore.get('profile', 15));

      done();
    }, done);

    setTimeout(function () {
      try {
        assert.equal(3, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/user/10/comment');
        assert.equal(_this.requests[0].method, 'get');
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/profile?userId=10');
        assert.equal(_this.requests[1].method, 'get');
        assert.equal(_this.requests[2].url, 'http://test.js-data.io/organization/14?userId=10');
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
    datastore.inject('user', {
      name: 'John Anderson',
      id: 10,
      organizationId: 14
    });

    datastore.loadRelations('user', 10, ['comment', 'profile', 'organization']).then(function () {
      done('Should not have succeeded!');
    }).catch(function (err) {
      assert.equal(err, 'Not Found');
      done();
    });

    setTimeout(function () {
      try {
        assert.equal(3, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/user/10/comment');
        assert.equal(_this.requests[0].method, 'get');
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/profile?userId=10');
        assert.equal(_this.requests[1].method, 'get');
        assert.equal(_this.requests[2].url, 'http://test.js-data.io/organization/14?userId=10');
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
    var organization = datastore.inject('organization', organization14);

    var copy = DSUtils.deepMixIn({}, user10);
    delete copy.organization;
    delete copy.comments;
    delete copy.profile;

    datastore.loadRelations('organization', organization, ['user']).then(function (organization) {
      assert.isTrue(organization === organization.users[0].organization);

      var user = datastore.get('user', 10);

      datastore.loadRelations('user', user, ['comment']).then(function (user) {
        assert.isArray(user.comments);
        done();
      }).catch(function () {
        done('Should not have failed!');
      });

      setTimeout(function () {
        try {
          assert.equal(2, _this.requests.length);
          assert.equal(_this.requests[1].url, 'http://test.js-data.io/user/10/comment');
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
    var organization = datastore.inject('organization', {
      id: 1
    });

    datastore.loadRelations('organization', organization, ['user']).then(function (organization) {
      assert.isTrue(organization === organization.users[0].organization);

      var user = datastore.get('user', 1);

      datastore.loadRelations('user', user, ['comment']).then(function (user) {
        assert.isArray(user.comments);

        done();
      }).catch(function () {
        done('Should not have failed!');
      });

      setTimeout(function () {
        try {
          assert.equal(2, _this.requests.length);
          assert.equal(_this.requests[1].url, 'http://test.js-data.io/user/1/comment');
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
