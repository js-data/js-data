describe('DS#get', function () {
  it('should return undefined if the item is not in the store', function () {
    assert.isUndefined(Post.get(5), 'should be undefined');
  });
});
