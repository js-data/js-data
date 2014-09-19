describe('DS.filter(resourceName[, params][, options])', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      datastore.filter('does not exist');
    }, datastore.errors.NonexistentResourceError, 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        assert.throws(function () {
          datastore.filter('post', key);
        }, datastore.errors.IllegalArgumentError, '"params" must be an object!');
      }
    });

    datastore.inject('post', p1);

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        assert.throws(function () {
          datastore.filter('post', {}, key);
        }, datastore.errors.IllegalArgumentError, '"options" must be an object!');
      }
    });

    datastore.filter('post');
  });
  it('should return an empty array if the query has never been made before', function (done) {
    var _this = this;

    assert.deepEqual(datastore.filter('post', {
      where: {
        author: {
          '==': 'John'
        }
      }
    }, { loadFromServer: true }), [], 'should be an empty array');

    assert.deepEqual(datastore.filter('post', {
      where: {
        author: {
          '==': 'John'
        }
      }
    }, { loadFromServer: true }), [], 'should still be an empty array because the request is pending');

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts?where=%7B%22author%22:%7B%22%3D%3D%22:%22John%22%7D%7D');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([p1]));

      setTimeout(function () {
        assert.deepEqual(datastore.filter('post', {
          where: {
            author: {
              '==': 'John'
            }
          }
        }), [
          p1
        ], 'should no longer be empty');
        done();
      }, 30);
    }, 30);
  });
  it('should correctly apply "where" predicates', function () {
    assert.doesNotThrow(function () {
      datastore.inject('post', p1);
      datastore.inject('post', p2);
      datastore.inject('post', p3);
      datastore.inject('post', p4);
      datastore.inject('post', p5);
    }, Error, 'should not throw an error');

    assert.equal(lifecycle.beforeInject.callCount, 5);
    assert.equal(lifecycle.afterInject.callCount, 5);

    var params = {
      author: 'John'
    };

    assert.deepEqual(datastore.filter('post', params), [p1], 'should default a string to "=="');

    params = {
      author: 'Adam',
      id: 9
    };

    assert.deepEqual(datastore.filter('post', params), [p5], 'should default a string to "=="');

    params = {
      where: {
        author: 'John'
      }
    };

    assert.deepEqual(datastore.filter('post', params), [p1], 'should default a string to "=="');

    params.where.author = {
      '==': 'John'
    };

    assert.deepEqual(datastore.filter('post', params), [p1], 'should accept normal "==" clause');

    params.where.author = {
      '===': null
    };

    assert.deepEqual(datastore.filter('post', params), [], 'should accept normal "===" clause');

    params.where.author = {
      '!=': 'John'
    };

    assert.deepEqual(datastore.filter('post', params), [p2, p3, p4, p5], 'should accept normal "!=" clause');

    params.where = {
      age: {
        '>': 31
      }
    };

    assert.deepEqual(datastore.filter('post', params), [p3, p4, p5], 'should accept normal ">" clause');

    params.where = {
      age: {
        '>=': 31
      }
    };

    assert.deepEqual(datastore.filter('post', params), [p2, p3, p4, p5], 'should accept normal ">=" clause');

    params.where = {
      age: {
        '<': 31
      }
    };

    assert.deepEqual(datastore.filter('post', params), [p1], 'should accept normal "<" clause');

    params.where = {
      age: {
        '>': 30,
        '<': 33
      }
    };

    assert.deepEqual(datastore.filter('post', params), [p2, p3], 'should accept dual "<" and ">" clause');

    params.where = {
      age: {
        '|>': 30,
        '|<': 33
      }
    };

    assert.deepEqual(datastore.filter('post', params), [p1, p2, p3, p4, p5], 'should accept or "<" and ">" clause');

    params.where = {
      age: {
        '|<=': 31
      },
      author: {
        '|==': 'Adam'
      }
    };

    assert.deepEqual(datastore.filter('post', params), [p1, p2, p4, p5], 'should accept or "<=" and "==" clause');

    params.where = {
      age: {
        '<=': 31
      }
    };

    assert.deepEqual(datastore.filter('post', params), [p1, p2], 'should accept normal "<=" clause');

    params.where = {
      age: {
        'in': [30, 33]
      },
      author: {
        'in': ['John', 'Sally', 'Adam']
      }
    };

    assert.deepEqual(datastore.filter('post', params), [p1, p4, p5], 'should accept normal "in" clause');

    params.where = {
      age: {
        '|in': [31]
      },
      id: {
        '|in': [8]
      }
    };

    assert.deepEqual(datastore.filter('post', params), [p2, p4], 'should accept and/or clause');

    params.where = {
      id: {
        'notIn': [8]
      }
    };

    assert.deepEqual(datastore.filter('post', params), [p1, p2, p3, p5], 'should accept notIn clause');

    params.where = { age: { garbage: 'should have no effect' } };

    assert.deepEqual(datastore.filter('post', params), [p1, p2, p3, p4, p5], 'should return all elements');
  });
  it('should correctly apply "orderBy" predicates', function () {
    assert.doesNotThrow(function () {
      datastore.inject('post', p1);
      datastore.inject('post', p2);
      datastore.inject('post', p3);
      datastore.inject('post', p4);
    }, Error, 'should not throw an error');

    var params = {
      orderBy: 'age'
    };

    assert.deepEqual(datastore.filter('post', params), [p1, p2, p3, p4], 'should accept a single string and sort in ascending order for numbers');

    params.orderBy = 'author';

    assert.deepEqual(datastore.filter('post', params), [p4, p1, p3, p2], 'should accept a single string and sort in ascending for strings');

    params.orderBy = [
      ['age', 'DESC']
    ];

    assert.deepEqual(datastore.filter('post', params), [p4, p3, p2, p1], 'should accept an array of an array and sort in descending for numbers');

    params.orderBy = [
      ['author', 'DESC']
    ];

    assert.deepEqual(datastore.filter('post', params), [p2, p3, p1, p4], 'should accept an array of an array and sort in descending for strings');

    params.orderBy = ['age'];

    assert.deepEqual(datastore.filter('post', params), [p1, p2, p3, p4], 'should accept an array of a string and sort in ascending for numbers');

    params.orderBy = ['author'];

    assert.deepEqual(datastore.filter('post', params), [p4, p1, p3, p2], 'should accept an array of a string and sort in ascending for strings');
  });
  it('should correctly apply "skip" predicates', function () {
    assert.doesNotThrow(function () {
      datastore.inject('post', p1);
      datastore.inject('post', p2);
      datastore.inject('post', p3);
      datastore.inject('post', p4);
    }, Error, 'should not throw an error');

    var params = {
      skip: 1
    };

    assert.deepEqual(datastore.filter('post', params), [p2, p3, p4], 'should skip 1');

    params.skip = 2;
    assert.deepEqual(datastore.filter('post', params), [p3, p4], 'should skip 2');

    params.skip = 3;
    assert.deepEqual(datastore.filter('post', params), [p4], 'should skip 3');

    params.skip = 4;
    assert.deepEqual(datastore.filter('post', params), [], 'should skip 4');
  });
  it('should correctly apply "limit" predicates', function () {
    assert.doesNotThrow(function () {
      datastore.inject('post', p1);
      datastore.inject('post', p2);
      datastore.inject('post', p3);
      datastore.inject('post', p4);
    }, Error, 'should not throw an error');

    var params = {
      limit: 1
    };

    assert.deepEqual(datastore.filter('post', params), [p1], 'should limit to 1');

    params.limit = 2;
    assert.deepEqual(datastore.filter('post', params), [p1, p2], 'should limit to 2');

    params.limit = 3;
    assert.deepEqual(datastore.filter('post', params), [p1, p2, p3], 'should limit to 3');

    params.limit = 4;
    assert.deepEqual(datastore.filter('post', params), [p1, p2, p3, p4], 'should limit to 4');
  });
  it('should correctly apply "limit" and "skip" predicates together', function () {
    assert.doesNotThrow(function () {
      datastore.inject('post', p1);
      datastore.inject('post', p2);
      datastore.inject('post', p3);
      datastore.inject('post', p4);
    }, Error, 'should not throw an error');

    var params = {
      limit: 1,
      skip: 1
    };

    assert.deepEqual(datastore.filter('post', params), [p2], 'should limit to 1 and skip 2');

    params.limit = 2;
    assert.deepEqual(datastore.filter('post', params), [p2, p3], 'should limit to 2 and skip 1');

    params.skip = 2;
    assert.deepEqual(datastore.filter('post', params), [p3, p4], 'should limit to 2 and skip 2');

    params.limit = 1;
    params.skip = 3;
    assert.deepEqual(datastore.filter('post', params), [p4], 'should limit to 1 and skip 3');

    params.limit = 8;
    params.skip = 0;
    assert.deepEqual(datastore.filter('post', params), [p1, p2, p3, p4], 'should return all items');

    params.limit = 1;
    params.skip = 5;
    assert.deepEqual(datastore.filter('post', params), [], 'should return nothing if skip if greater than the number of items');

    params.limit = 8;
    delete params.skip;
    assert.deepEqual(datastore.filter('post', params), [p1, p2, p3, p4], 'should return all items');

    delete params.limit;
    params.skip = 5;
    assert.deepEqual(datastore.filter('post', params), [], 'should return nothing if skip if greater than the number of items');
  });
  it('should allow custom filter function', function () {
    datastore.defineResource({
      name: 'Comment',
      defaultFilter: function (collection, resourceName, params) {
        var filtered = collection;
        var where = params.where;
        filtered = this.utils.filter(filtered, function (attrs) {
          return attrs.author === where.author.EQUALS || attrs.age % where.age.MOD === 1;
        });
        return filtered;
      }
    });
    assert.doesNotThrow(function () {
      datastore.inject('Comment', p1);
      datastore.inject('Comment', p2);
      datastore.inject('Comment', p3);
      datastore.inject('Comment', p4);
    }, Error, 'should not throw an error');

    var params = {
      where: {
        author: {
          'EQUALS': 'John'
        },
        age: {
          'MOD': 30
        }
      }
    };

    assert.deepEqual(datastore.filter('Comment', params), [p1, p2], 'should keep p1 and p2');
  });
});
