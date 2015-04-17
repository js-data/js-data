describe('DS#filter', function () {
  it('should return an empty array if the query has never been made before', function () {
    assert.deepEqual(JSON.stringify(store.filter('post', {
      where: {
        author: {
          '==': 'John'
        }
      }
    })), JSON.stringify([]), 'should be an empty array');
  });
});
