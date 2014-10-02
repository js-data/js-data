describe('DS#eject', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      store.eject('does not exist', 5);
    }, store.errors.NonexistentResourceError, 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        Post.eject(key);
      }, store.errors.IllegalArgumentError, '"id" must be a string or a number!');
    });
  });
  it('should do nothing if the item is not in the store', function () {
    assert.equal(Post.lastModified(5), 0);
    assert.doesNotThrow(function () {
      Post.eject(5);
    });
    assert.equal(Post.lastModified(5), 0);
  });
  it('should eject an item from the store', function () {
    Post.inject(p3);
    Post.inject(p2);
    Post.inject(p1);
    assert.notEqual(Post.lastModified(5), 0);
    assert.doesNotThrow(function () {
      Post.eject(5);
    });
    assert.isUndefined(store.get('post', 5));
    assert.equal(Post.lastModified(5), 0);
  });
  it('should unlink upon ejection', function () {
    store.inject('user', user10, 0);
    store.inject('organization', organization15);
    store.inject('comment', comment19);
    store.inject('profile', profile21);

    // user10 relations
    assert.isArray(store.get('user', 10).comments);
    Comment.eject(11);
    assert.isUndefined(Comment.get(11));
    assert.equal(store.get('user', 10).comments.length, 2);
    Comment.eject(12);
    assert.isUndefined(Comment.get(12));
    assert.equal(store.get('user', 10).comments.length, 1);
    Comment.eject(13);
    assert.isUndefined(Comment.get(13));
    assert.equal(store.get('user', 10).comments.length, 0);
    store.eject('organization', 14);
    assert.isUndefined(store.get('organization', 14));
    assert.isUndefined(store.get('user', 10).organization);

    // organization15 relations
    assert.isArray(store.get('organization', 15).users);
    store.eject('user', 16);
    assert.isUndefined(store.get('user', 16));
    assert.equal(store.get('organization', 15).users.length, 2);
    store.eject('user', 17);
    assert.isUndefined(store.get('user', 17));
    assert.equal(store.get('organization', 15).users.length, 1);
    store.eject('user', 18);
    assert.isUndefined(store.get('user', 18));
    assert.equal(store.get('organization', 15).users.length, 0);

    // comment19 relations
    assert.deepEqual(store.get('user', 20), Comment.get(19).user);
    assert.deepEqual(store.get('user', 19), Comment.get(19).approvedByUser);
    store.eject('user', 20);
    assert.isUndefined(Comment.get(19).user);
    store.eject('user', 19);
    assert.isUndefined(Comment.get(19).approvedByUser);

    // profile21 relations
    assert.deepEqual(store.get('user', 22), store.get('profile', 21).user);
    store.eject('user', 22);
    assert.isUndefined(store.get('profile', 21).user);
  });
});
