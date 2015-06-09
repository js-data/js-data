describe('DS#hasChanges', function () {
  it('should return false after loading relations', function () {
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
    }, 100);

    return User.loadRelations(10, ['comment', 'profile', 'organization'], { params: { approvedBy: 10 }, findStrictCache: true }).then(function () {
      assert.isFalse(User.hasChanges(10));

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
      }, 100);

      return Comment.loadRelations(19, ['user'], { findStrictCache: true });
    }).then(function () {
      assert.isFalse(store.hasChanges('comment', 19));
    });
  });
});
