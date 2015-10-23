describe('DS#revert', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      store.revert('does not exist', {});
    }, store.errors.NonexistentResourceError, 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      //if (key === false) {
      //  return;
      //}
      assert.throws(function () {
        store.revert('post', key);
      }, store.errors.IllegalArgumentError, '"id" must be a string or a number!');
    });
  });
  it('should return the previous version of an item', function () {

    Post.inject(p1);
    var post = Post.get(5);
    post.author = 'Jake';
    post.DSRevert();
    assert.equal(JSON.stringify(post), JSON.stringify(p1));
  });
  it('should preserve fields in the optional preserve array', function () {
    var post = Post.inject(p1);
    post.author = 'Jake';
    post.age = 20;
    post.DSRevert({preserve: ['age']});
    assert.equal(post.age, 20, 'The age of the post should have been preserved');
    assert.equal(post.author, 'John', 'The author of the post should have been reverted');
  });
});
