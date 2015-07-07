describe('DS#clear', function () {
  it('should remove everything from the store', function () {

    Post.inject([p1, p2, p3, p4, p5]);
    User.inject(user10);

    assert.equal(Post.getAll().length, 5);
    assert.equal(User.getAll().length, 1);
    assert.equal(Organization.getAll().length, 1);
    assert.equal(Profile.getAll().length, 1);
    assert.equal(Comment.getAll().length, 3);

    var ejected = store.clear();

    assert.equal(ejected.post.length, 5);
    assert.equal(ejected.user.length, 1);
    assert.equal(ejected.organization.length, 1);
    assert.equal(ejected.profile.length, 1);
    assert.equal(ejected.comment.length, 3);
  });
});
