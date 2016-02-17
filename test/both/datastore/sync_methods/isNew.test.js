describe('DS#isNew', function () {
  it('should return true for temporary instances', function () {
    var user = store.inject('user', {
      foo: 'foo'
    }, {
      temporary: true
    });

    assert.ok(user.DSIsNew());
  });
  it('should return false for `real` instances', function() {
    var user = store.inject('user', user1);
    assert.notOk(user.DSIsNew());
  });
});