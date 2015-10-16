describe('DS#loadRelations', function () {
  it('should get an item from the server', function () {
    var _this = this;
    User.inject(user10);

    setTimeout(function () {
      assert.equal(3, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/organization/14/user/10/comment');
      assert.equal(_this.requests[0].method, 'GET');
      assert.equal(_this.requests[1].url, 'http://test.js-data.io/profile?approvedBy=10&userId=10');
      assert.equal(_this.requests[1].method, 'GET');
      assert.equal(_this.requests[2].url, 'http://test.js-data.io/organization/14?approvedBy=10');
      assert.equal(_this.requests[2].method, 'GET');
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson([
        comment11,
        comment12,
        comment13
      ]));
      _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson([profile15]));
      _this.requests[2].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(organization14));
    }, 60);

    return User.loadRelations(10, ['comment', 'profile', 'organization'], {
      params: { approvedBy: 10 },
      findStrictCache: true
    }).then(function (user) {
      assert.deepEqual(user.comments[0].id, Comment.get(user.comments[0].id).id);
      assert.deepEqual(user.comments[0].user.id, Comment.get(user.comments[0].id).user.id);
      assert.deepEqual(user.comments[1].id, Comment.get(user.comments[1].id).id);
      assert.deepEqual(user.comments[1].user.id, Comment.get(user.comments[1].id).user.id);
      assert.deepEqual(user.comments[2].id, Comment.get(user.comments[2].id).id);
      assert.deepEqual(user.comments[2].user.id, Comment.get(user.comments[2].id).user.id);
      assert.deepEqual(user.organization.id, Organization.get(14).id);
      assert.deepEqual(user.profile.id, store.get('profile', 15).id);
      // try a comment that has a belongsTo relationship to multiple users:
      Comment.inject(comment19);

      setTimeout(function () {
        assert.equal(5, _this.requests.length);
        assert.equal(_this.requests[3].url, 'http://test.js-data.io/user/20');
        assert.equal(_this.requests[3].method, 'GET');
        assert.equal(_this.requests[4].url, 'http://test.js-data.io/user/19');
        assert.equal(_this.requests[4].method, 'GET');
        _this.requests[3].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(user20));
        _this.requests[4].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(user19));
      }, 60);

      return Comment.loadRelations(19, ['user'], { findStrictCache: true, bypassCache: true });
    }).then(function (comment) {
      assert.isObject(comment.user);
      assert.equal(comment.user.id, user20.id);
      assert.isObject(comment.approvedByUser);
      assert.equal(comment.approvedByUser.id, user19.id);
    });
  });
  it('should load relations based on field name', function () {
    var _this = this;
    User.inject(user10);

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/organization/14/user/10/comment');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson([
        comment11,
        comment12,
        comment13
      ]));
    }, 60);

    return User.loadRelations(10, ['comments'], { params: { approvedBy: 10 } }).then(function (user) {
      assert.deepEqual(user.comments[0].id, Comment.get(user.comments[0].id).id);
      assert.deepEqual(user.comments[0].user.id, Comment.get(user.comments[0].id).user.id);
      assert.deepEqual(user.comments[1].id, Comment.get(user.comments[1].id).id);
      assert.deepEqual(user.comments[1].user.id, Comment.get(user.comments[1].id).user.id);
      assert.deepEqual(user.comments[2].id, Comment.get(user.comments[2].id).id);
      assert.deepEqual(user.comments[2].user.id, Comment.get(user.comments[2].id).user.id);
      // try a comment that has a belongsTo relationship to multiple users:
      Comment.inject(comment19);

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/user/19');
        assert.equal(_this.requests[1].method, 'GET');
        _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(user19));
      }, 60);

      return Comment.loadRelations(19, ['approvedByUser'], { findStrictCache: true, bypassCache: true });
    }).then(function (comment) {
      assert.isObject(comment.approvedByUser);
      assert.equal(comment.approvedByUser.id, user19.id);
    });
  });
  //it.only('should get an item from the server but not store it if cacheResponse is false', function (done) {
  //  var _this = this;
  //  User.inject({
  //    name: 'John Anderson',
  //    id: 10,
  //    organizationId: 14
  //  });
  //
  //  User.loadRelations(10, ['comment', 'profile', 'organization'], { cacheResponse: false }).then(function (user) {
  //    console.log('LOADED RELATIONS');
  //    try {
  //      assert.deepEqual(JSON.stringify(user.comments), JSON.stringify([
  //        comment11,
  //        comment12,
  //        comment13
  //      ]));
  //      assert.deepEqual(JSON.stringify(user.organization), JSON.stringify(organization14));
  //      assert.deepEqual(JSON.stringify(user.profile), JSON.stringify(profile15));
  //
  //      assert.isUndefined(Comment.get(11));
  //      assert.isUndefined(Comment.get(12));
  //      assert.isUndefined(Comment.get(13));
  //      assert.isUndefined(Organization.get(14));
  //      assert.isUndefined(store.get('profile', 15));
  //      done();
  //    } catch (e) {
  //      done(e);
  //    }
  //  }, done);
  //
  //  setTimeout(function () {
  //    try {
  //      assert.equal(3, _this.requests.length);
  //      assert.equal(_this.requests[0].url, 'http://test.js-data.io/organization/14/user/10/comment');
  //      assert.equal(_this.requests[0].method, 'GET');
  //      assert.equal(_this.requests[1].url, 'http://test.js-data.io/profile?userId=10');
  //      assert.equal(_this.requests[1].method, 'GET');
  //      assert.equal(_this.requests[2].url, 'http://test.js-data.io/organization/14');
  //      assert.equal(_this.requests[2].method, 'GET');
  //      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson([
  //        comment11,
  //        comment12,
  //        comment13
  //      ]));
  //      _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson([profile15]));
  //      _this.requests[2].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(organization14));
  //    } catch (err) {
  //      done(err.stack);
  //    }
  //  }, 60);
  //});
  it('should correctly propagate errors', function () {
    var _this = this;
    User.inject({
      name: 'John Anderson',
      id: 10,
      organizationId: 14
    });

    setTimeout(function () {
      assert.equal(3, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/organization/14/user/10/comment');
      assert.equal(_this.requests[0].method, 'GET');
      assert.equal(_this.requests[1].url, 'http://test.js-data.io/profile?userId=10');
      assert.equal(_this.requests[1].method, 'GET');
      assert.equal(_this.requests[2].url, 'http://test.js-data.io/organization/14');
      assert.equal(_this.requests[2].method, 'GET');
      _this.requests[0].respond(404, { 'Content-Type': 'text/plain' }, 'Not Found');
      _this.requests[1].respond(404, { 'Content-Type': 'text/plain' }, 'Not Found');
      _this.requests[2].respond(404, { 'Content-Type': 'text/plain' }, 'Not Found');
    }, 60);

    return User.loadRelations(10, ['comment', 'profile', 'organization']).then(function () {
      throw new Error('Should not have succeeded!');
    }).catch(function (err) {
      assert.equal(err.data, 'Not Found');
    });
  });
  it('should handle multiple belongsTo levels', function () {
    var _this = this;
    var organization = Organization.inject(organization14);

    var copy = DSUtils.deepMixIn({}, user10);
    delete copy.organization;
    delete copy.comments;
    delete copy.profile;

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/organization/14/user');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson([copy]));
    }, 60);

    return Organization.loadRelations(organization, ['user']).then(function (organization) {
      assert.isTrue(organization === organization.users[0].organization);

      var user = User.get(10);

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/organization/14/user/10/comment');
        assert.equal(_this.requests[1].method, 'GET');
        _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson([comment11, comment12]));
      }, 60);

      return User.loadRelations(user, ['comment']);
    }).then(function (user) {
      assert.isArray(user.comments);
    });
  });
  it('should handle multiple belongsTo levels when the response includes nested resources', function () {
    var _this = this;
    var organization = Organization.inject({
      id: 1
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/organization/1/user');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson([
        {
          organizationId: 1,
          id: 1
        }
      ]));
    }, 60);

    return Organization.loadRelations(organization, ['user']).then(function (organization) {
      assert.isTrue(organization === organization.users[0].organization);

      var user = User.get(1);

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/organization/1/user/1/comment');
        assert.equal(_this.requests[1].method, 'GET');
        _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson([
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
      }, 60);

      return User.loadRelations(user, ['comment']);
    }).then(function (user) {
      assert.isArray(user.comments);
    });
  });

  it('should call the right hooks', function () {
    var _this = this;
    User.inject(user10);

    setTimeout(function () {
      assert.equal(3, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/organization/14/user/10/comment');
      assert.equal(_this.requests[0].method, 'GET');
      assert.equal(_this.requests[1].url, 'http://test.js-data.io/profile?approvedBy=10&userId=10');
      assert.equal(_this.requests[1].method, 'GET');
      assert.equal(_this.requests[2].url, 'http://test.js-data.io/organization/14?approvedBy=10');
      assert.equal(_this.requests[2].method, 'GET');
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson([
        comment11,
        comment12,
        comment13
      ]));
      _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson([profile15]));
      _this.requests[2].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(organization14));
    }, 60);

    return User.loadRelations(10, ['comment', 'profile', 'organization'], {
      params: { approvedBy: 10 },
      findStrictCache: true
    }).then(function (user) {
      assert.deepEqual(user.comments[0].id, Comment.get(user.comments[0].id).id);
      assert.deepEqual(user.comments[0].user.id, Comment.get(user.comments[0].id).user.id);
      assert.deepEqual(user.comments[1].id, Comment.get(user.comments[1].id).id);
      assert.deepEqual(user.comments[1].user.id, Comment.get(user.comments[1].id).user.id);
      assert.deepEqual(user.comments[2].id, Comment.get(user.comments[2].id).id);
      assert.deepEqual(user.comments[2].user.id, Comment.get(user.comments[2].id).user.id);
      assert.deepEqual(user.organization.id, Organization.get(14).id);
      assert.deepEqual(user.profile.id, store.get('profile', 15).id);

      assert.equal(lifecycle.beforeInject.callCount, 1);
      assert.equal(Comment.beforeInject.callCount, 4);
      assert.equal(Profile.beforeInject.callCount, 2);
      assert.deepEqual(Profile.beforeInject.getCall(0).args[1], {
        id: 15,
        userId: 10,
        email: 'john.anderson@test.com'
      });
      assert.equal(Organization.beforeInject.callCount, 2);
      assert.deepEqual(Organization.beforeInject.getCall(0).args[1], {
        id: 14,
        name: 'Test Corp'
      });
      assert.equal(Comment.beforeInject.callCount, 4);
      assert.deepEqual(Comment.beforeInject.getCall(3).args[1], [
        {
          id: 11,
          userId: 10,
          content: 'test comment 11'
        },
        {
          id: 12,
          userId: 10,
          content: 'test comment 12'
        },
        {
          id: 13,
          userId: 10,
          content: 'test comment 13'
        }
      ]);
      // try a comment that has a belongsTo relationship to multiple users:
    });
  });

  it('should get an item from the server with allowSimpleWhere disabled', function () {
    var _this = this;
    var user = User.inject(user10);
    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/profile?where=%7B%22userId%22:%7B%22%3D%3D%22:10%7D%7D');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(profile15));
    }, 60);
    return User.loadRelations(user, ['profile'], { allowSimpleWhere: false, bypassCache: true, findStrictCache: true });
  });

  it('should work in hasMany "localKeys" as array of IDs mode', function () {
    var Foo = store.defineResource({
      name: 'foo',
      relations: {
        hasMany: {
          bar: {
            localKeys: 'barIds',
            localField: 'bars'
          }
        }
      }
    });
    store.defineResource({
      name: 'bar',
      relations: {
        belongsTo: {
          foo: {
            localKey: 'fooId',
            localField: 'foo'
          }
        }
      }
    });
    var _this = this;
    var foo = Foo.inject({
      id: 1,
      barIds: [4, 7, 9]
    });
    var barsData = [
      {
        id: 4,
        fooId: 1
      },
      {
        id: 7,
        fooId: 1
      },
      {
        id: 9,
        fooId: 1
      }
    ];
    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/bar?where=%7B%22id%22:%7B%22in%22:%5B4,7,9%5D%7D%7D');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(barsData));
    }, 60);
    return Foo.loadRelations(foo, ['bar']).then(function (foo) {
      assert.deepEqual(DSUtils.toJson(foo.bars), DSUtils.toJson(barsData));
    });
  });

  it('should work in hasMany "localKeys" as object of IDs mode', function () {
    var Foo = store.defineResource({
      name: 'foo',
      relations: {
        hasMany: {
          bar: {
            localKeys: 'barIds',
            localField: 'bars'
          }
        }
      }
    });
    store.defineResource({
      name: 'bar',
      relations: {
        belongsTo: {
          foo: {
            localKey: 'fooId',
            localField: 'foo'
          }
        }
      }
    });
    var _this = this;
    var foo = Foo.inject({
      id: 1,
      barIds: {
        4: true,
        7: true,
        9: true
      }
    });
    var barsData = [
      {
        id: 4,
        fooId: 1
      },
      {
        id: 7,
        fooId: 1
      },
      {
        id: 9,
        fooId: 1
      }
    ];
    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.isTrue(_this.requests[0].url === 'http://test.js-data.io/bar?where=%7B%22id%22:%7B%22in%22:%5B%224%22,%227%22,%229%22%5D%7D%7D' || _this.requests[0].url === 'http://test.js-data.io/bar?where=%7B%22id%22:%7B%22in%22:%5B4,7,9%5D%7D%7D');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(barsData));
    }, 60);
    return Foo.loadRelations(foo, ['bar']).then(function (foo) {
      assert.deepEqual(DSUtils.toJson(foo.bars), DSUtils.toJson(barsData));
    });
  });
  it('should get objects from the server when loading foreignKeys', function () {
    var _this = this;
    User.inject(user10);

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/group?where=%7B%22userIds%22:%7B%22contains%22:10%7D%7D');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson([
        group1,
        group2
      ]));
    }, 60);

    return User.loadRelations(10, 'group', {
      findStrictCache: true
    }).then(function (user) {
      assert.deepEqual(user.groups[0], Group.get(user.groups[0].id))
      assert.deepEqual(user.groups[1], Group.get(user.groups[1].id))
    });
  });
  it('should allow custom load functions', function () {
    var Foo = store.defineResource({
      name: 'foo',
      relations: {
        hasMany: {
          bar: {
            localField: 'bars',
            foreignKey: 'fooId',
            load: function (Foo, relationDef, foo, options) {
              return new DSUtils.Promise(function (resolve) {
                return resolve(Bar.inject([{ id: 1, fooId: 1 }]));
              });
            }
          }
        }
      }
    });
    var Bar = store.defineResource({
      name: 'bar',
      relations: {
        belongsTo: {
          foo: {
            localField: 'foo',
            localKey: 'fooId'
          }
        }
      }
    })
    
    var foo = Foo.inject({ id: 1 });

    return foo.DSLoadRelations(['bar']).then(function (foo) {
      assert.objectsEqual(foo.bars, [{ id: 1, fooId: 1 }]);
    });
  });
  describe('zero id value in relations', function() {
    var Item, Client,
        clientZero = {
          id: 0,
          name: 'Client Zero'
        },
        item5 = {
          id: 5,
          ClientId: clientZero.id
        };
    beforeEach(function() {
      Item = store.defineResource({
        name: 'item',
        relations: {
          hasOne: {
            client: {
              localKey: 'ClientId',
              localField: 'Client'
            }
          }
        }
      });

      Client = store.defineResource({
        name: 'client'
      });
    });
    it('should call relation data in hasOne zero value for "localKey"', function (done) {
      var _this = this;
      setTimeout(function () {
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/item/5');
        assert.equal(_this.requests[0].method, 'GET');
        _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(item5));
      }, 60);
      return Item.find(item5.id)
        .then(function(item) {
          setTimeout(function () {
            assert.equal(2, _this.requests.length);
            assert.equal(_this.requests[1].url, 'http://test.js-data.io/client/' + clientZero.id);
            assert.equal(_this.requests[1].method, 'GET');
            _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(clientZero));
            done();
          }, 60);
          return Item.loadRelations(item, ['client']);
        });
    });
    it('should return relation data from "localField"', function() {
      var _this = this;
      setTimeout(function () {
        _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(item5));
      }, 60);
      return Item.find(item5.id)
        .then(function(item) {
          setTimeout(function () {
            assert.equal(2, _this.requests.length);
            assert.equal(_this.requests[1].url, 'http://test.js-data.io/client/' + clientZero.id);
            assert.equal(_this.requests[1].method, 'GET');
            _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(clientZero));
          }, 60);
          return Item.loadRelations(item);
        })
        .then(function (item) {
          assert.isObject(item.Client, 'Client "localField" is not an object');
          assert.deepEqual(DSUtils.toJson(item.Client), DSUtils.toJson(clientZero));
        });
    });
  });
});
