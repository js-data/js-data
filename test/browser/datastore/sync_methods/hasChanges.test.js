describe('DS#hasChanges', function () {
  it('should return false after loading relations', function (done) {
    var _this = this;
    store.inject('user', user10);

    store.loadRelations('user', 10, ['comment', 'profile', 'organization'], { params: { approvedBy: 10 } }).then(function () {
      try {
        assert.isFalse(store.hasChanges('user', 10));

        // try a comment that has a belongsTo relationship to multiple users:
        store.inject('comment', comment19);

        store.loadRelations('comment', 19, ['user']).then(function () {
          try {
            assert.isFalse(store.hasChanges('comment', 19));
          } catch (err) {
            done(err);
          }
          done();
        }, fail);
        setTimeout(function () {
          try {
            assert.equal(5, _this.requests.length);
            assert.equal(_this.requests[3].url, 'http://test.js-data.io/user/20');
            assert.equal(_this.requests[3].method, 'GET');
            assert.equal(_this.requests[4].url, 'http://test.js-data.io/user/19');
            assert.equal(_this.requests[4].method, 'GET');
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
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/organization/14/user/10/comment');
        assert.equal(_this.requests[0].method, 'GET');
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/profile?approvedBy=10&userId=10');
        assert.equal(_this.requests[1].method, 'GET');
        assert.equal(_this.requests[2].url, 'http://test.js-data.io/organization/14?approvedBy=10');
        assert.equal(_this.requests[2].method, 'GET');
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
