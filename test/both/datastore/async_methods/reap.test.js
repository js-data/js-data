describe('DS#reap', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    var tasks = [];

    tasks.push(store.reap('does not exist').then(function () {
      fail('should not have succeeded');
    }).catch(function (err) {
      assert.isTrue(err instanceof store.errors.NonexistentResourceError);
      assert.equal(err.message, 'does not exist is not a registered resource!');
    }));

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        tasks.push(store.reap('post', 5).then(function () {
          fail('should not have succeeded');
        }).catch(function (err) {
          assert.isTrue(err instanceof store.errors.IllegalArgumentError);
          assert.equal(err.message, '"options" must be an object!');
        }));
      }
    });

    return store.utils.Promise.all(tasks);
  });
  it('should order items by expire date', function (done) {
    var Thing = store.defineResource({
      name: 'thing',
      maxAge: 300
    });
    var expiresHeap = store.store.thing.expiresHeap;

    Thing.inject({ id: 1 });
    Thing.inject({ id: 2 });

    setTimeout(function () {
      try {
        assert.equal(expiresHeap.peek().item.id, 1);
        assert.equal(expiresHeap.heap.length, 2);

        Thing.inject({ id: 1 });

        assert.equal(expiresHeap.peek().item.id, 2);
        assert.equal(expiresHeap.heap.length, 2);

        done();
      } catch (err) {
        done(err);
      }
    }, 30);
  });
  it('should return expired items and re-inject', function (done) {
    var Thing = store.defineResource({
      name: 'thing',
      maxAge: 30
    });

    var expiresHeap = store.store.thing.expiresHeap;

    Thing.inject({ id: 1 });
    Thing.inject({ id: 2 });

    setTimeout(function () {
      Thing.reap({
        reapAction: 'inject'
      }).then(function (items) {
        try {
          assert.equal(items.length, 2);
          assert.equal(expiresHeap.peek().item.id, 1);
          assert.equal(expiresHeap.heap.length, 2);
          done();
        } catch (err) {
          done(err);
        }
      }, done).catch(done);
    }, 60);
  });
  it('should return expired items and eject', function (done) {
    var Thing = store.defineResource({
      name: 'thing',
      maxAge: 30,
      reapAction: 'eject'
    });

    var expiresHeap = store.store.thing.expiresHeap;

    Thing.inject({ id: 1 });
    Thing.inject({ id: 2 });

    setTimeout(function () {
      Thing.reap({
        reapAction: 'eject'
      }).then(function (items) {
        try {
          assert.equal(items.length, 2);
          assert.equal(expiresHeap.heap.length, 0);
          done();
        } catch (err) {
          done(err);
        }
      }, done).catch(done);
    }, 60);
  });
});
