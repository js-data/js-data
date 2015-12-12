<img src="https://raw.githubusercontent.com/js-data/js-data/master/js-data.png" alt="js-data logo" title="js-data" align="right" width="64" height="64" />

## JSData [![Slack Status][sl_b]][slack] [![npm version][npm_b]][npm_l] [![Circle CI][circle_b]][circle_l] [![npm downloads][dn_b]][dn_l] [![Coverage Status][cov_b]][cov_l] [![Codacy][cod_b]][cod_l]

Inspired by [Ember Data][ember], __JSData__ is the model layer you've been
craving. It consists of a convenient __framework-agnostic__, __in-memory store__
for managing your data, which uses __adapters__ to communicate with various
__persistence layers__.

The most commonly used adapter is the [http adapter][http], which is perfect for
connecting your frontend to your backend. [localStorage][3], [localForage][4],
[firebase][5] and [other adapters][6] are already available. On the server you
could hook up to the [SQL adapter (Postgres/MySQL/MariaDB/SQLite3)][7] and add
in the [Redis adapter][8] as a caching layer for your read endpoints. More
adapters are coming, and you're free to implement your own. See [Adapters][9].

Unlike some libraries, JSData does not require the use of getter and setter
functions, and doesn't decorate your data with a bunch of cruft.

Supporting relations, Node.js and the Browser, model lifecycle control and a
slew of other features, JSData is the tool for [giving your data the respect it deserves][12].

Written in ES6 and built for modern web development, JSData will save you
thousands of lines of code.

Support is handled via the [Slack channel][slack] or the [Mailing List][ml].

##### Looking for contributors!

JSData is getting popular and becoming a lot of work for me. I could use help
with tests, documentation, demos/examples, and adapters. Contact me if you wan
to help! jason dot dobry at gmail dot com

[![MtnWestJS Conf 2015 Presentation][mtn_b]][mtn_l]

### Dependencies

JSData requires the presence of the ES6-spec (ES2015) `Promise` constructor in
the global environment. In the browser, `window.Promise` must be available. In
Node, `global.Promise` must be available. Here is a handy library for
polyfilling: https://github.com/jakearchibald/es6-promise.

### Quick Start

##### For use in a Browser

`npm install --save js-data js-data-http` or `bower install --save js-data js-data-http`.

(You may also substitute `js-data-http` for any one of the other client-side adapters.)

##### For use in Node.js

`npm install --save js-data axios js-data-http-node`

(You may also substitute `js-data-http-node` for any one of the other server-side adapters.)

See [installation instructions][inst] for making js-data part of your
r.js/browserify/webpack build.

__ES7:__

```js
import {Model, registerAdapter} from 'js-data'
import DSHttpAdapter from 'js-data-http'

async function showExample() {
  // "User" will use an http adapter by default
  @registerAdapter('http', new DSHttpAdapter(), { default: true })
  class User extends Model {}

  // Allow "User" to store data
  User.initialize()

  let user = await User.find(1)

  console.log(user) // { id: 1, name: 'John' }
  console.log(user instanceof User) // true

  // The user instance is stored in User now
  console.log(User.get(user.id)) // { id: 1, name: 'John' }
  console.log(user === User.get(user.id)) // true

  // No need for another GET request, will resolve immediately
  // See http://www.js-data.io/docs/dsfind
  user = await User.find(user.id)

  console.log(user === User.get(user.id)) // true

  // PUT /user/1 {name:"Johnny"}
  // See http://www.js-data.io/docs/dsupdate
  user = await User.update(user.id, { name: 'Johnny' })

  // The user instance stored in User has been updated
  console.log(User.get(user.id)) // { id: 1, name: 'Johnny' }
  console.log(user === User.get(user.id)) // true

  await User.destroy(user.id)

  // The user instance no longer stored in User
  console.log(User.get(1)) // undefined
}

showExample()
```

__ES6:__

```js
import {Model, registerAdapter} from 'js-data'
import DSHttpAdapter from 'js-data-http'

function* showExample() {
  class User extends Model {}

  // "User" will use an http adapter by default
  User.setAdapter('http', new DSHttpAdapter(), { default: true })

  // Allow "User" to store data
  User.initialize()

  let user = yield User.find(1)

  console.log(user) // { id: 1, name: 'John' }
  console.log(user instanceof User) // true

  // The user instance is stored in User now
  console.log(User.get(user.id)) // { id: 1, name: 'John' }
  console.log(user === User.get(user.id)) // true

  // No need for another GET request, will resolve immediately
  // See http://www.js-data.io/docs/dsfind
  user = yield User.find(user.id)

  console.log(user === User.get(user.id)) // true

  // PUT /user/1 {name:"Johnny"}
  // See http://www.js-data.io/docs/dsupdate
  user = yield User.update(user.id, { name: 'Johnny' })

  // The user instance stored in User has been updated
  console.log(User.get(user.id)) // { id: 1, name: 'Johnny' }
  console.log(user === User.get(user.id)) // true

  yield User.destroy(user.id)

  // The user instance no longer stored in User
  console.log(User.get(1)) // undefined
}

showExample()
```

__ES5:__

```js
var User = JSData.Model.extend({}, { name: 'User' })
// register and use http by default for async operations
User.registerAdapter('http', new DSHttpAdapter(), { default: true });

// Example CRUD operations with default configuration
// See http://www.js-data.io/docs/dsfind
User.find(1)
  .then(function (user) {
    console.log(user) // { id: 1, name: 'John' }
    console.log(user instanceof User) // true

    // The user instance is stored in User now
    console.log(User.get(user.id)) // { id: 1, name: 'John' }
    console.log(user === User.get(user.id)) // true

    // No need for another GET request, will resolve immediately
    // See http://www.js-data.io/docs/dsfind
    return User.find(user.id)
  })
  .then(function (user) {
    console.log(user === User.get(user.id)) // true

    // PUT /user/1 {name:"Johnny"}
    // See http://www.js-data.io/docs/dsupdate
    return User.update(user.id, { name: 'Johnny' })
  })
  .then(function (user) {
    // The user instance stored in User has been updated
    console.log(User.get(user.id)) // { id: 1, name: 'Johnny' }
    console.log(user === User.get(user.id)) // true

    // DELETE /user/1
    // See http://www.js-data.io/docs/dsdestroy
    return User.destroy(user.id)
  })
  .then(function () {
    // The user instance no longer stored in User
    console.log(User.get(1)) // undefined
  })
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
- [Configuration Options](http://www.js-data.io/docs/dsdefaults)
- [DSFirebaseAdapter](http://www.js-data.io/docs/dsfirebaseadapter)
- [DSHttpAdapter](http://www.js-data.io/docs/dshttpadapter)
- [DSLevelUpAdapter](http://www.js-data.io/docs/dslevelupadapter)
- [DSLocalForageAdapter](http://www.js-data.io/docs/dslocalforageadapter)
- [DSLocalStorageAdapter](http://www.js-data.io/docs/dslocalstorageadapter)
- [DSMongoDBAdapter](http://www.js-data.io/docs/dsmongodbadapter)
- [DSNeDBAdapter](http://www.js-data.io/docs/dsnedbadapter)
- [DSRedisAdapter](http://www.js-data.io/docs/dsredisadapter)
- [DSRethinkDBAdapter](http://www.js-data.io/docs/dsrethinkdbadapter)
- [DSSqlAdapter](http://www.js-data.io/docs/dssqladapter)
- [js-data-schema](http://www.js-data.io/docs/js-data-schema)

### Changelog
[CHANGELOG.md](https://github.com/js-data/js-data/blob/master/CHANGELOG.md)

### Community
- [Slack Channel](http://slack.js-data.io) [![Slack Status][sl_b]][slack] - Better than IRC!
- [Announcements](http://www.js-data.io/blog)
- [Mailing List](ml) - Ask your questions!
- [Issues](https://github.com/js-data/js-data/issues) - Found a bug? Feature request? Submit an issue!
- [GitHub](https://github.com/js-data/js-data) - View the source code for JSData.
- [Contributing Guide](https://github.com/js-data/js-data/blob/master/CONTRIBUTING.md)

### Contributing

First, support is handled via the [Slack Channel][slack] and the
[Mailing List][ml]. Ask your questions there.

When submitting issues on GitHub, please include as much detail as possible to
make debugging quick and easy.

- good - Your versions of Angular, JSData, etc, relevant console logs/error,
code examples that revealed the issue
- better - A [plnkr](http://plnkr.co/), [fiddle](http://jsfiddle.net/), or
[bin](http://jsbin.com/?html,output) that demonstrates the issue
- best - A Pull Request that fixes the issue, including test coverage for the
issue and the fix

[Github Issues](https://github.com/js-data/js-data/issues).

#### Pull Requests

1. Contribute to the issue/discussion that is the reason you'll be developing in
the first place
1. Fork js-data
1. `git clone git@github.com:<you>/js-data.git`
1. `cd js-data; npm install; bower install;`
1. Write your code, including relevant documentation and tests
1. Run `npm test` (build and test)
1. Your code will be linted and checked for formatting, the tests will be run
1. The `dist/` folder & files will be generated, do NOT commit `dist/*`! They
will be committed when a release is cut.
1. Submit your PR and we'll review!
1. Thanks!

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


[sl_b]: http://slack.js-data.io/badge.svg
[npm_b]: https://img.shields.io/npm/v/js-data.svg?style=flat
[npm_l]: https://www.npmjs.org/package/js-data
[circle_b]: https://img.shields.io/circleci/project/js-data/js-data/master.svg?style=flat
[circle_l]: https://circleci.com/gh/js-data/js-data/tree/master
[dn_b]: https://img.shields.io/npm/dm/js-data.svg?style=flat
[dn_l]: https://www.npmjs.org/package/js-data
[cov_b]: https://img.shields.io/coveralls/js-data/js-data/master.svg?style=flat
[cov_l]: https://coveralls.io/github/js-data/js-data?branch=master
[cod_b]: https://img.shields.io/codacy/88b55f71c45a47838d24ed1e5fd2476c.svg
[cod_l]: https://www.codacy.com/app/jasondobry/js-data/dashboard

[ember]: https://github.com/emberjs/data
[http]: http://www.js-data.io/docs/dshttpadapter
[3]: http://www.js-data.io/docs/dslocalstorageadapter
[4]: http://www.js-data.io/docs/dslocalforageadapter
[5]: http://www.js-data.io/docs/dsfirebaseadapter
[6]: http://www.js-data.io/docs/working-with-adapters
[7]: http://www.js-data.io/docs/dssqladapter
[8]: http://www.js-data.io/docs/dsredisadapter
[9]: http://www.js-data.io/docs/working-with-adapters
[10]: https://github.com/Polymer/observe-js
[11]: https://www.firebase.com/blog/2013-10-04-firebase-angular-data-binding.html
[12]: http://confreaks.tv/videos/mwjs2015-give-your-data-the-respect-it-deserves
[mtn_b]: http://img.youtube.com/vi/8wxnnJA9FKw/0.jpg
[mtn_l]: https://www.youtube.com/watch?v=8wxnnJA9FKw

[inst]: http://www.js-data.io/docs#use-with-webpack

[slack]: http://slack.js-data.io
[ml]: https://groups.io/org/groupsio/jsdata