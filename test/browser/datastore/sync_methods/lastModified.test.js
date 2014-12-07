describe('DS#lastModified', function () {
  it('should update lastModified when top-level "own" properties change', function (done) {

    var Thing = store.defineResource('thing');

    var thing = Thing.inject({ id: 1, foo: 'bar', bing: { boom: 'bam' } });
    var time = Thing.lastModified(1);

    thing.foo = 'baz';
    if (typeof Object.observe !== 'function') {
      Thing.digest();
    }
    setTimeout(function () {
      try {
        assert.notEqual(time, Thing.lastModified(1));
        time = Thing.lastModified(1);
        thing.bing.boom = 'kazaam';
        if (typeof Object.observe !== 'function') {
          Thing.digest();
        }
        setTimeout(function () {
          try {
            assert.equal(time, Thing.lastModified(1));
            done();
          } catch (e) {
            console.error(e.stack);
            done(e);
          }
        }, 100);
      } catch (e) {
        console.error(e.stack);
        done(e);
      }
    }, 100);
  });
});
