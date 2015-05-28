describe('DSUtils', function () {
  describe('promisify', function () {
    it('should exist', function () {
      assert.isFunction(DSUtils.promisify);
    });

    it('should resolve with a cb', function (done) {
      var resolveValue = {};
      var resolveCb = function (cb) {
        cb(null, resolveValue);
      };
      var resolveSpy = sinon.spy();

      DSUtils.promisify(resolveCb)().then(resolveSpy);

      setTimeout(function () {
        try {
          assert(resolveSpy.calledWith(resolveValue));
          done();
        } catch (err) {
          done(err.stack);
        }
      }, 30);
    });

    it('should reject with a cb', function (done) {
      var rejectValue = {};
      var rejectCb = function (cb) {
        cb(rejectValue);
      };
      var rejectSpy = sinon.spy();

      DSUtils.promisify(rejectCb)().then(null, rejectSpy);

      setTimeout(function () {
        try {
          assert(rejectSpy.calledWith(rejectValue));
          done();
        } catch (err) {
          done(err.stack);
        }
      }, 30);
    });

    it('should resolve with a promise', function (done) {
      var resolveValue = {};
      var resolveCb = function () {
        return new Promise(function (resolve) {
          resolve(resolveValue);
        });
      };
      var resolveSpy = sinon.spy();

      DSUtils.promisify(resolveCb)().then(resolveSpy);

      setTimeout(function () {
        try {
          assert(resolveSpy.calledWith(resolveValue));
          done();
        } catch (err) {
          done(err.stack);
        }
      }, 30);
    });

    it('should reject with a promise', function (done) {
      var rejectValue = {};
      var rejectCb = function () {
        return new Promise(function (resolve, reject) {
          reject(rejectValue);
        });
      };
      var rejectSpy = sinon.spy();

      DSUtils.promisify(rejectCb)().then(null, rejectSpy);

      setTimeout(function () {
        try {
          assert(rejectSpy.calledWith(rejectValue));
          done();
        } catch (err) {
          done(err.stack);
        }
      }, 30);
    });

    // Typically, functions that return a promise will be wrapped with a DSUtils.when, meaning if you were to return nothing, it would execute straight away
    // This would mean the cb style would not work at all, as any developer that uses cb would have the function immediately resolve
    // This just ensures that doesn't ever happen
    it('should not resolve or reject if return value is not a promise', function (done) {
      var resolve;
      var cb = function (next) {
        resolve = next;
        return true;
      };
      var spy = sinon.spy();

      DSUtils.promisify(cb)().then(spy);

      assert(!spy.called);

      resolve();

      setTimeout(function () {
        try {
          assert(spy.called);
          done();
        } catch (err) {
          done(err.stack);
        }
      }, 30);
    });

  });
  describe('removeCircular', function () {
    it('should remove circular', function () {
      var a = { name: 'a' };
      var b = { name: 'b' };
      var c = { name: 'c' };
      a.b = b;
      b.a = a;
      a.c = [c, c, c];
      b.c = [c, c];

      assert.equal(JSON.stringify(DSUtils.removeCircular(a), null, 2), JSON.stringify({
        name: 'a',
        b: {
          name: 'b',
          c: [
            {
              name: 'c'
            },
            {
              name: 'c'
            }
          ]
        },
        c: [
          {
            name: 'c'
          },
          {
            name: 'c'
          },
          {
            name: 'c'
          }
        ]
      }, null, 2));
    });
  });
});
