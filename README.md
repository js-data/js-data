<img src="https://raw.githubusercontent.com/js-data/js-data/master/js-data.png" alt="js-data logo" title="js-data" align="right" width="64" height="64" />

## JSData [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/js-data/js-data?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) [![bower version](https://img.shields.io/bower/v/js-data.svg?style=flat-square)](https://www.npmjs.org/package/js-data) [![npm version](https://img.shields.io/npm/v/js-data.svg?style=flat-square)](https://www.npmjs.org/package/js-data) [![Circle CI](https://img.shields.io/circleci/project/js-data/js-data/master.svg?style=flat-square)](https://circleci.com/gh/js-data/js-data/tree/master) [![npm downloads](https://img.shields.io/npm/dm/js-data.svg?style=flat-square)](https://www.npmjs.org/package/js-data) [![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/js-data/js-data/blob/master/LICENSE)

Inspired by [Ember Data](https://github.com/emberjs/data), js-data is the model layer you've been craving. It consists of a convenient framework-agnostic, in-memory cache for managing your data, which uses adapters to communicate with various persistence layers.

You can use the [http adapter](http://www.js-data.io/docs/dshttpadapter), which is perfect for communicating with your RESTful backend. You could also use the [localStorage adapter](http://www.js-data.io/docs/dslocalstorageadapter). On the server you could hook up to the [SQL adapter (Postgres/MySQL/MariaDB/SQLite3)](http://www.js-data.io/docs/dssqladapter) and add in the [Redis adapter](http://www.js-data.io/docs/dsredisadapter) as a caching layer for your read endpoints. More adapters are coming, and you're free to implement your own. View [available adapters](http://www.js-data.io/docs/working-with-adapters).

Unlike Backbone and Ember Models, JSData does not require the use of getters and setters, and doesn't wrap your data with custom classes if you don't want it to. JSData's internal change detection (via [observe-js](https://github.com/Polymer/observe-js) or `Object.observe` in supporting browsers) allows for powerful use cases and an easy avenue for implementing your own [3-way data-binding](https://www.firebase.com/blog/2013-10-04-firebase-angular-data-binding.html).

Supporting relations, computed properties, model lifecycle control and a slew of other features, JSData is the tool for [giving your data the respect it deserves](http://confreaks.tv/videos/mwjs2015-give-your-data-the-respect-it-deserves).

It's also written in ES6. Contributions ftw!

Support is handled via the [Mailing List](https://groups.io/org/groupsio/jsdata).

[![MtnWestJS Conf 2015 Presentation](http://img.youtube.com/vi/8wxnnJA9FKw/0.jpg)](https://www.youtube.com/watch?v=8wxnnJA9FKw)

__Status:__

[![Latest Release](https://img.shields.io/github/release/js-data/js-data.svg?style=flat-square)](https://github.com/js-data/js-data/releases) [![Dependency Status](https://img.shields.io/gemnasium/js-data/js-data.svg?style=flat-square)](https://gemnasium.com/js-data/js-data) [![Coverage Status](https://img.shields.io/coveralls/js-data/js-data/master.svg?style=flat-square)](https://coveralls.io/r/js-data/js-data?branch=master) [![Codacity](https://img.shields.io/codacy/88b55f71c45a47838d24ed1e5fd2476c.svg?style=flat-square)](https://www.codacy.com/public/jasondobry/js-data/dashboard)

__Supported Platforms:__

[![node version](https://img.shields.io/badge/Node-0.10%2B-green.svg?style=flat-square)](https://github.com/js-data/js-data) [![browsers](https://img.shields.io/badge/Browser-Chrome%2CFirefox%2CSafari%2COpera%2CIE%209%2B%2CiOS%20Safari%207.1%2B%2CAndroid%20Browser%202.3%2B-green.svg?style=flat-square)](https://github.com/js-data/js-data)

### Quick Start
`bower install --save js-data js-data-http` or `npm install --save js-data js-data-http`.

Load `js-data-http.js` after `js-data.js`. See [installation instructions](http://www.js-data.io/docs#use-with-webpack) for making js-data part of your r.js/browserify/webpack build.

```js
// you can also require "js-data" if you're using AMD/CommonJS
// e.g. var JSData = require('js-data'); var DSHttpAdapter = require('js-data-http');
var store = new JSData.DS();

// register and use http by default for async operations
store.registerAdapter('http', new DSHttpAdapter(), { default: true });

// simplest model definition
var User = store.defineResource('user');
var Comment = store.defineResource('comment');

var user;

// Example CRUD operations with default configuration
// See http://www.js-data.io/docs/dsfind
User.find(1)
  .then(function (_user) {
    _user; // { id: 1, name: 'John' }

    // See http://www.js-data.io/docs/dsis
    User.is(_user); // true
    Comment.is(_user); // false

    // The user is in the store now
    // See http://www.js-data.io/docs/dsget
    User.get(_user.id); // { id: 1, name: 'John' }

    user = _user;

    // No need for another GET request, will resolve immediately
    // See http://www.js-data.io/docs/dsfind
    return User.find(1);
  })
  .then(function (_user) {
    user === _user; // true

    // PUT /user/1 {name:"Johnny"}
    // See http://www.js-data.io/docs/dsupdate
    return User.update(user.id, { name: 'Johnny' });
  })
  .then(function (_user) {
    // identity mapping at play
    user === _user; // true
    user === User.get(_user.id); // true

    user; // { id: 1, name: 'Johnny' }

    user.name = 'Billy';

    // PUT /user/1 {id:1,name:"Billy"}
    // See http://www.js-data.io/docs/dssave
    return User.save(1);
  })
  .then(function (_user) {
    // identity mapping at play
    user === _user; // true
    user === User.get(_user.id); // true

    user; // { id: 1, name: 'Johnny' }

    // DELETE /user/1
    // See http://www.js-data.io/docs/dsdestroy
    return User.destroy(1);
  })
  .then(function () {
    // The user has also been removed from the in-memory store
    User.get(1); // undefined
  });
```

All your data are belong to you...

### Guides
- [Getting Started with js-data](http://www.js-data.io/docs/home)
- [Resources/Models](http://www.js-data.io/docs/resources)
- [Working with the Data Store](http://www.js-data.io/docs/working-with-the-data-store)
- [Adapters](http://www.js-data.io/docs/working-with-adapters)
- [Model Lifecycle](http://www.js-data.io/docs/model-lifecycle)
- [Custom Instance Behavior](http://www.js-data.io/docs/custom-instance-behavior)
- [Computed Properties](http://www.js-data.io/docs/computed-properties)
- [Relations](http://www.js-data.io/docs/relations)
- [Schemata & Validation](http://www.js-data.io/docs/schemata--validation)
- [JSData on the server](http://www.js-data.io/docs/jsdata-on-the-server)
- [Angular + JSData](http://www.js-data.io/docs/js-data-angular)
- [FAQ](http://www.js-data.io/docs/faq)

See an issue with or have a suggestion for the documentation? You can suggest edits right on the documentation pages! (There's a link at the top right of each page.)

### API Documentation
- [DS](http://www.js-data.io/docs/ds)
- [js-data-schema](http://www.js-data.io/docs/js-data-schema)
- [DSFirebaseAdapter](http://www.js-data.io/docs/dsfirebaseadapter)
- [DSHttpAdapter](http://www.js-data.io/docs/dshttpadapter)
- [DSLocalForageAdapter](http://www.js-data.io/docs/dslocalforageadapter)
- [DSLocalStorageAdapter](http://www.js-data.io/docs/dslocalstorageadapter)
- [DSMongoDBAdapter](http://www.js-data.io/docs/dsmongodbadapter)
- [DSRedisAdapter](http://www.js-data.io/docs/dsredisadapter)
- [DSRethinkDBAdapter](http://www.js-data.io/docs/dsrethinkdbadapter)
- [DSSqlAdapter](http://www.js-data.io/docs/dssqladapter)

### Changelog
[CHANGELOG.md](https://github.com/js-data/js-data/blob/master/CHANGELOG.md)

### Community
- [Mailing List](https://groups.io/org/groupsio/jsdata) - Ask your questions!
- [Issues](https://github.com/js-data/js-data/issues) - Found a bug? Feature request? Submit an issue!
- [GitHub](https://github.com/js-data/js-data) - View the source code for JSData.
- [Contributing Guide](https://github.com/js-data/js-data/blob/master/CONTRIBUTING.md)

### Contributing

First, support is handled via the [Mailing List](https://groups.io/org/groupsio/jsdata). Ask your questions there.

When submitting issues on GitHub, please include as much detail as possible to make debugging quick and easy.

- good - Your versions of Angular, JSData, etc, relevant console logs/error, code examples that revealed the issue
- better - A [plnkr](http://plnkr.co/), [fiddle](http://jsfiddle.net/), or [bin](http://jsbin.com/?html,output) that demonstrates the issue
- best - A Pull Request that fixes the issue, including test coverage for the issue and the fix

[Github Issues](https://github.com/js-data/js-data/issues).

#### Pull Requests

1. Contribute to the issue that is the reason you'll be developing in the first place
1. Fork js-data
1. `git clone https://github.com/<you>/js-data.git`
1. `cd js-data; npm install; bower install;`
1. `grunt go` (builds and starts a watch)
1. (in another terminal) `grunt karma:dev` (runs the tests)
1. Write your code, including relevant documentation and tests
1. Submit a PR and we'll review


### License

The MIT License (MIT)

Copyright (c) 2014-2015 Jason Dobry

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

