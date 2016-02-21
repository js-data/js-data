<img src="https://raw.githubusercontent.com/js-data/js-data/master/js-data.png" alt="js-data logo" title="js-data" align="right" width="96" height="96" />

# [js-data](http://www.js-data.io/)

[![Slack Status][b1]][b2]
[![npm version][b3]][b4]
[![Circle CI][b5]][b6]
[![npm downloads][b7]][b8]
[![Coverage Status][b9]][b10]
[![Codacy][b11]][b12]

[b1]: http://slack.js-data.io/badge.svg
[b2]: http://slack.js-data.io
[b3]: https://img.shields.io/npm/v/js-data.svg?style=flat
[b4]: https://www.npmjs.org/package/js-data
[b5]: https://img.shields.io/circleci/project/js-data/js-data/master.svg?style=flat
[b6]: https://circleci.com/gh/js-data
[b7]: https://img.shields.io/npm/dm/js-data.svg?style=flat
[b8]: https://www.npmjs.org/package/js-data
[b9]: https://img.shields.io/coveralls/js-data/js-data/master.svg?style=flat
[b10]: https://coveralls.io/github/js-data
[b11]: https://img.shields.io/codacy/88b55f71c45a47838d24ed1e5fd2476c.svg
[b12]: https://www.codacy.com/app/jasondobry/js-data/dashboard

js-data is a framework-agnostic, datastore-agnostic ORM/ODM for Node.js and the
Browser.

Adapters allow js-data to connect to various data sources such as Firebase,
MySql, RethinkDB, MongoDB, localStorage, Redis, a REST API, etc. With js-data
you can re-use your data modeling code between environments, keep your data
layer intact when transitioning between app frameworks, and work with a unified
data API on the server and the client. js-data employs conventions for rapid
development, but allows for endless customization in order to meet your
particular needs.

To get started, visit __[http://js-data.io](http://www.js-data.io)__.

## Table of contents

* [Quick start](#quick-start)
* [Background](#background)
* [Dependencies](#dependencies)
* [Guides and Tutorials](#guides-and-tutorials)
* [API Reference Docs](#api-reference-docs)
* [Community](#community)
* [Support](#support)
* [Contributing](#contributing)
* [License](#license)

## Quick Start

This example shows setting up js-data to use the Http adapter in the browser:

```
npm i --save js-data js-data-http
```

See [installation instructions](http://js-data.io/docs/installation) for more
information.

```javascript
import {DataStore} from 'js-data'
import HttpAdapter from 'js-data-http'

// Create an empty data store
const store = new DataStore()

// "store" will use an http adapter by default
store.registerAdapter('http', new HttpAdapter(), { 'default': true })

// Define a Mapper for a "user" resource
store.defineMapper('user')
```

```js
// GET /user/1
let user = await store.find('user', 1)

console.log(user) // { id: 1, name: 'John' }

// The user record is now stored in Users
console.log(store.get('user', user.id)) // { id: 1, name: 'John' }
console.log(user === store.get('user', user.id)) // true

// PUT /user/1 {name:"Johnny"}
user = await store.update('user', user.id, { name: 'Johnny' })

// The user record has been updated, and the change synced to the store
console.log(store.get('user', user.id)) // { id: 1, name: 'Johnny' }
console.log(user === store.get('user', user.id)) // true

// DELETE /user/1
await store.destroy('user', user.id)

// The user instance no longer in the store
console.log(store.get('user', 1)) // undefined
```

__ES5:__

```javascript
// Create an empty data store
var store = new JSData.DataStore()

// "store" will use an http adapter by default
store.registerAdapter('http', new HttpAdapter(), { default: true })

// Define a Mapper for a "user" resource
store.defineMapper('user')

// GET /user/1
store.find('user', 1)
  .then(function (user) {
    console.log(user) // { id: 1, name: 'John' }

    // The user record is now stored in Users
    console.log(store.get('user', user.id)) // { id: 1, name: 'John' }
    console.log(user === store.get('user', user.id)) // true

    // PUT /user/1 {name:"Johnny"}
    return await store.update('user', user.id, { name: 'Johnny' })
  })
  .then(function (user) {
    // The user record has been updated, and the change synced to the store
    console.log(store.get('user', user.id)) // { id: 1, name: 'Johnny' }
    console.log(user === store.get('user', user.id)) // true

    // DELETE /user/1
    return store.destroy('user', user.id)
  })
  .then(function () {
    // The user instance no longer in the store
    console.log(store.get('user', 1)) // undefined
  })
```

## Background

Most ORMs/ODMs only work with a single datastore, and most JavaScript ORMs only
work in Node.js _or_ the Browser. Wouldn't it be nice if you could use the same
ORM/ODM on the client as you do on the backend? Wouldn't it be nice if you could
switch databases without having to switch out your data layer code? Enter
__js-data__.

Originally inspired by the desire to have something like [Ember Data][1] that
worked in Angular.js and other frameworks, js-data was created. Turns out,
js-data works in Node.js, so server-side adapters were written. js-data is the
Model layer you've been craving. It consists of a convenient
__framework-agnostic__, __datastore-agnostic__ ORM for managing your data, which
uses __adapters__ to connect to various __persistence layers__.

The most commonly used adapter is the [http adapter][2], which is perfect for
connecting your frontend to your backend. [localStorage][3], [localForage][4],
[Firebase][5] and [other adapters][6] are available for the browser. On the
server you could hook up to the [SQL adapter (Postgres/MySQL/MariaDB/SQLite3)][7]
or the [MongoDB][8] adapter. More adapters are coming, and you're free to
implement your own. See [Adapters][6].

[![MtnWestJS Conf 2015 Presentation][9]][10]

[1]: https://github.com/emberjs/data
[2]: https://github.com/js-data/js-data-http
[3]: https://github.com/js-data/js-data-localstorage
[4]: https://github.com/js-data/js-data-localforage
[5]: https://github.com/js-data/js-data-firebase
[6]: http://js-data.io/docs/adapters
[7]: https://github.com/js-data/js-data-sql
[8]: https://github.com/js-data/js-data-mongodb
[9]: http://img.youtube.com/vi/8wxnnJA9FKw/0.jpg
[10]: https://www.youtube.com/watch?v=8wxnnJA9FKw

## Dependencies

js-data and its adapters depend on a global ES2015 `Promise` constructor. In
the browser, `window.Promise` must be available. In Node.js, `global.Promise`
must be available. Here is a handy [ES2015 Promise polyfill](https://github.com/jakearchibald/es6-promise)
if you need it.

js-data and its adapters require full ES5 support from the runtime. Here is a
handy [ES5 polyfill](https://github.com/afarkas/html5shiv) if you need it.

## Guides and Tutorials

[Get started at http://js-data.io](http://js-data.io)

## API Reference Docs

[Visit http://api.js-data.io](http://api.js-data.io).

## Community

[Explore the Community](http://js-data.io/docs/community).

## Support

[Find out how to Get Support](http://js-data.io/docs/support).

## Contributing

[Read the Contributing Guide](http://js-data.io/docs/contributing).

## License

The MIT License (MIT)

Copyright (c) 2014-2016 js-data project authors

* [LICENSE](https://github.com/js-data/js-data/blob/master/LICENSE)
* [AUTHORS](https://github.com/js-data/js-data/blob/master/AUTHORS)
* [CONTRIBUTORS](https://github.com/js-data/js-data/blob/master/CONTRIBUTORS)
