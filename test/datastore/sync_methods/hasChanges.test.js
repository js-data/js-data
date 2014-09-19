describe('DS.hasChanges(resourceName, id)', function () {
  function errorPrefix(resourceName, id) {
    return 'DS.hasChanges(' + resourceName + ', ' + id + '): ';
  }

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      datastore.hasChanges('does not exist', {});
    }, datastore.errors.NonexistentResourceError, errorPrefix('does not exist', {}) + 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        datastore.hasChanges('post', key);
      }, datastore.errors.IllegalArgumentError, errorPrefix('post', key) + 'id: Must be a string or a number!');
    });
  });
  it('should return false if the item is not in the store', function () {
    assert.isFalse(datastore.hasChanges('post', 5));
  });
  it('should return whether an item has changes', function () {

    datastore.inject('post', p1);

    assert.isFalse(datastore.hasChanges('post', 5));

    var post = datastore.get('post', 5);
    post.author = 'Jake';

    datastore.digest();

    assert.isTrue(datastore.hasChanges('post', 5));
  });
  it('should return false for resources with defined methods', function () {
    datastore.defineResource({
      name: 'person',
      methods: {
        fullName: function () {
          return this.first + ' ' + this.last;
        }
      }
    });

    datastore.inject('person', {
      first: 'John',
      last: 'Anderson',
      id: 1
    });

    assert.isFalse(datastore.hasChanges('person', 1));
  });
  it('should return false after loading relations', function (done) {
    var _this = this;
    datastore.inject('user', user10);

    datastore.loadRelations('user', 10, ['comment', 'profile', 'organization'], { params: { approvedBy: 10 } }).then(function () {
      try {
        assert.isFalse(datastore.hasChanges('user', 10));

        // try a comment that has a belongsTo relationship to multiple users:
        datastore.inject('comment', comment19);

        datastore.loadRelations('comment', 19, ['user']).then(function () {
          try {
            assert.isFalse(datastore.hasChanges('comment', 19));
          } catch (err) {
            done(err);
          }
          done();
        }, fail);
        setTimeout(function () {
          try {
            assert.equal(5, _this.requests.length);
            assert.equal(_this.requests[3].url, 'http://test.js-data.io/user/20');
            assert.equal(_this.requests[3].method, 'get');
            assert.equal(_this.requests[4].url, 'http://test.js-data.io/user/19');
            assert.equal(_this.requests[4].method, 'get');
            _this.requests[3].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(user20));
            _this.requests[4].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(user19));
          } catch (err) {
            done(err);
          }
        }, 30);
      } catch (err) {
        done (err);
      }
    }, fail);

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
});
