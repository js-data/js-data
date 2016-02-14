<img src="https://raw.githubusercontent.com/js-data/js-data/master/js-data.png" alt="js-data logo" title="js-data" align="right" width="96" height="96" />

# [JSData](http://www.js-data.io/)

[![Slack Status][sl_b]][slack]
[![npm version][npm_b]][npm_l]
[![Circle CI][circle_b]][circle_l]
[![npm downloads][dn_b]][dn_l]
[![Coverage Status][cov_b]][cov_l]
[![Codacy][cod_b]][cod_l]

JSData is a framework-agnostic, datastore-agnostic ORM/ODM for Node.js and the
Browser.

Adapters allow JSData to connect to various data sources such as Firebase, MySql,
RethinkDB, MongoDB, localStorage, Redis, a REST API, etc. With JSData you can
re-use your Models between environments, keep your data layer intact when
transitioning between app frameworks, and work with a unified data API on the
server and the client. JSData employs conventions for rapid development, but
allows for endless customization in order to meet your particular needs.

For Getting Started guides, visit __[http://js-data.io](http://www.js-data.io)__!

## Table of contents

* [Quick start](#quick-start)
* [Background](#background)
* [Dependencies](#dependencies)
* [Guides & Tutorials](#documentation)
* [API Reference Docs](#api-reference)
* [Support](#support)
* [Community](#community)
* [Contributing](#contributing)
* [License](#license)

## Quick Start

This example shows setting up JSData to use the Http adapter in the browser:

```
npm i --save js-data js-data-http
```

See [installation instructions][inst] for making JSData part of your
r.js/browserify/webpack build.

```javascript
import {DataStore} from 'js-data'
import HttpAdapter from 'js-data-http'

// Create an empty data store
const store = new DataStore()

// "store" will use an http adapter by default
store.registerAdapter('http', new HttpAdapter(), { 'default': true })

// Define a new Mapper for a "user" resource
store.defineMapper('user')
// Get a reference to the store's "user" collection
const Users = store.getCollection('user')

async function showExample () {
  let user = await store.find('user', 1)

  console.log(user) // { id: 1, name: 'John' }

  // The user record is now stored in Users
  console.log(Users.get(user.id)) // { id: 1, name: 'John' }
  console.log(user === Users.get(user.id)) // true

  user.name = 'Johnny'

  // PUT /user/1 {name:"Johnny"}
  user = await user.save()

  // The user record has been updated
  console.log(Users.get(user.id)) // { id: 1, name: 'Johnny' }
  console.log(user === Users.get(user.id)) // true

  await user.destroy()

  // The user instance no longer stored in Users
  console.log(Users.get(1)) // undefined
}
```

__ES5:__

```javascript
// Create an empty data store
var store = new JSData.DataStore()

// "store" will use an http adapter by default
store.registerAdapter('http', new HttpAdapter(), { default: true })

// Define a new Mapper for a "user" resource
store.defineMapper('user')
// Get a reference to the store's "user" collection
var Users = store.getCollection('user')

store.find('user', 1)
  .then(function (user) {
    console.log(user) // { id: 1, name: 'John' }

    // The user record is now stored in Users
    console.log(Users.get(user.id)) // { id: 1, name: 'John' }
    console.log(user === Users.get(user.id)) // true

    user.name = 'Johnny'

    // PUT /user/1 {name:"Johnny"}
    return user.save()
  })
  .then(function (user) {
    // The user record has been updated
    console.log(Users.get(user.id)) // { id: 1, name: 'Johnny' }
    console.log(user === Users.get(user.id)) // true

    return user.destroy()
  })
  .then(function () {
    // The user instance no longer stored in Users
    console.log(Users.get(1)) // undefined
  })
```

## Background

Most ORMs/ODMs only work with a single datastore, most JavaScript ORMs only work
in Node.js _or_ the Browser. Wouldn't it be nice if you could use the same
ORM/ODM on the client as you do on the backend? Wouldn't it be nice if you could
switch databases without having to switch out your data layer code? Enter
__JSData__.

Originally inspired by the desire to have something like [Ember Data][ember]
that worked in Angular.js and other frameworks, JSData was created. Turns out,
JSData works in Node.js, so server-side adapters were written. JSData is the
Model layer you've been craving. It consists of a convenient
__framework-agnostic__, __datastore-agnostic__ ORM for managing your data, which
uses __adapters__ to connect to various __persistence layers__.

The most commonly used adapter is the [http adapter][http], which is perfect for
connecting your frontend to your backend. [localStorage][3], [localForage][4],
[Firebase][5] and [other adapters][6] are available for the browser. On the
server you could hook up to the [SQL adapter (Postgres/MySQL/MariaDB/SQLite3)][7]
or the [MongoDB][8] adapter. More adapters are coming, and you're free to
implement your own. See [Adapters][9].

[![MtnWestJS Conf 2015 Presentation][mtn_b]][mtn_l]

## Dependencies

JSData requires the presence of a `Promise` constructor in the global
environment. In the browser, `window.Promise` must be available. In Node.js,
`global.Promise` must be available. Here is a handy library for polyfilling:
https://github.com/jakearchibald/es6-promise.

JSData also requires full ES5 support from the runtime. Here is a handy library
for polyfilling: https://github.com/afarkas/html5shiv

## Guides & Tutorials
- [Main Site](http://www.js-data.io)
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
- [CHANGELOG.md](https://github.com/js-data/js-data/blob/master/CHANGELOG.md)

See an issue with the documentation? Have something to add? Click the "Suggest
Edits" button at the top right of each page and make your suggested changes!

## API Reference Docs
- [all](http://api.js-data.io/)
- [js-data](http://api.js-data.io/js-data)
- [js-data-http](http://api.js-data.io/js-data-http)
- [js-data-localstorage](http://api.js-data.io/js-data-localstorage)

## Support

Support questions are handled via [Stack Overflow][so], [Slack][slack], and the
[Mailing List][ml]. Ask your questions there.

## Community
- [StackOverflow][so]
- [Slack chat][slack] [![Slack Status][sl_b]][slack]
- [Announcements](http://www.js-data.io/blog)
- [Mailing List](ml)
- [Issue Tracker](https://github.com/js-data/js-data/issues)
- [GitHub](https://github.com/js-data/js-data)
- [Contributing Guide](https://github.com/js-data/js-data/blob/master/CONTRIBUTING.md)

## Contributing

When submitting bug reports or feature requests on GitHub, please include _as
much detail as possible_.

- good - Your versions of Angular, JSData, etc, relevant console logs, stack
traces, code examples that revealed the issue, etc.
- better - A [plnkr](http://plnkr.co/), [fiddle](http://jsfiddle.net/), or
[bin](http://jsbin.com/?html,output) that demonstrates the issue
- best - A Pull Request that fixes the issue, including test coverage for the
issue and the fix

#### Pull Requests

1. Contribute to the issue/discussion that is the reason you'll be developing in
the first place
1. Fork js-data
1. `git clone git@github.com:<you>/js-data.git`
1. `cd js-data`
1. `npm install`
1. Write your code, including relevant documentation and tests
1. Run `npm test` (build and test)
1. Your code will be linted and checked for formatting, the tests will be run
1. The `dist/` folder & files will be generated, do NOT commit `dist/*`! They
will be committed when a release is cut.
1. Submit your PR and we'll review!
1. Thanks!

## License

The MIT License (MIT)

Copyright (c) 2014-2016 Jason Dobry

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
[8]: http://www.js-data.io/docs/dsmongodbadapter
[9]: http://www.js-data.io/docs/working-with-adapters
[10]: https://github.com/Polymer/observe-js
[11]: https://www.firebase.com/blog/2013-10-04-firebase-angular-data-binding.html
[12]: http://confreaks.tv/videos/mwjs2015-give-your-data-the-respect-it-deserves
[mtn_b]: http://img.youtube.com/vi/8wxnnJA9FKw/0.jpg
[mtn_l]: https://www.youtube.com/watch?v=8wxnnJA9FKw

[inst]: http://www.js-data.io/docs#use-with-webpack

[slack]: http://slack.js-data.io
[ml]: https://groups.io/org/groupsio/jsdata
[so]: http://stackoverflow.com/questions/tagged/jsdata
