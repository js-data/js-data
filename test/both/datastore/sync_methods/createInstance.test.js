describe('DS#createInstance', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      store.createInstance('fruit loops');
    }, Error, 'fruit loops is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (!key) {
        return;
      }
      assert.throws(function () {
        store.createInstance('post', key);
      }, Error, '"attrs" must be an object!');
    });

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (!key) {
        return;
      }
      assert.throws(function () {
        store.createInstance('post', {}, key);
      }, Error, '"options" must be an object!');
    });
  });

  it('create an instance', function () {
    var Person = store.defineResource({
      name: 'person',
      methods: {
        fullName: function () {
          return this.first + ' ' + this.last;
        }
      },
      computed: {
        fullName: ['first', 'last', function (first, last) {
          return first + ' ' + last;
        }]
      }
    });

    store.defineResource({
      name: 'dog'
    });

    var Cat = store.defineResource({
      name: 'cat'
    });

    var personAttrs = {
      first: 'John',
      last: 'Anderson'
    };

    var dogAttrs = {
      name: 'Spot'
    };

    var person = store.createInstance('person', personAttrs);
    var dog = store.createInstance('dog', dogAttrs);
    var cat = store.createInstance('cat');

    assert.equal(cat.say(), 'hi');

    assert.deepEqual(JSON.stringify(person), JSON.stringify({
      first: 'John',
      last: 'Anderson',
      fullName: 'John Anderson'
    }));
    assert.deepEqual(JSON.stringify(dog), JSON.stringify(dogAttrs));
    assert.deepEqual(JSON.stringify(cat), JSON.stringify({}));

    assert.isTrue(person instanceof store.definitions.person[store.definitions.person.class]);
    assert.isTrue(dog instanceof Object);
    assert.isTrue(cat instanceof store.definitions.cat[store.definitions.cat.class]);

    person = store.createInstance('person', { first: 'John', last: 'Doe' });

    person.DSCompute();

    assert.equal(person.fullName, 'John Doe');

    var person2 = store.inject('person', { id: 2, first: 'John', last: 'Doe' });

    store.compute('person', 2);

    assert.equal(person2.fullName, 'John Doe');

    var person3 = store.inject('person', { id: 3, first: 'John', last: 'Doe' });

    store.compute('person', person3);

    assert.equal(person3.fullName, 'John Doe');
  });
});
