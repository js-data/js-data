<img src="https://raw.githubusercontent.com/js-data/js-data/master/js-data.png" alt="js-data logo" title="js-data" align="right" width="64" height="64" />

## js-data  [![Stories in Backlog](https://badge.waffle.io/js-data/js-data.svg?label=backlog&title=Backlog)](http://waffle.io/js-data/js-data) [![Stories in Ready](https://badge.waffle.io/js-data/js-data.svg?label=ready&title=Ready)](http://waffle.io/js-data/js-data) [![Stories in progress](https://badge.waffle.io/js-data/js-data.svg?label=in%20progress&title=In%20Progress)](http://waffle.io/js-data/js-data)

Inspired by [Ember Data](https://github.com/emberjs/data), js-data is the model layer you've been craving. It consists of a convenient framework-agnostic, in-memory cache for managing your data, which users adapters to communicate with various persistence layers.

You can use the [http adapter](http://www.js-data.io/docs/dshttpadapter), which is perfect for communicating with your RESTful backend. You could also use the [localStorage adapter](http://www.js-data.io/docs/dslocalstorageadapter). More adapters are coming, and you're free to implement your own. View [available adapters](http://www.js-data.io/docs/adapters).

Unlike Backbone and Ember Models, js-data does not require the use of getters and setters, and doesn't wrap your data with custom classes if you don't want it to. js-data's internal dirty-checking (via [observe-js](https://github.com/Polymer/observe-js) or `Object.observe` in supporting browsers) allows for powerful use cases and an easy avenue for implementing your own [3-way data-binding](https://www.firebase.com/blog/2013-10-04-firebase-angular-data-binding.html).

Supporting relations, computed properties, model lifecycle control and a slew of other features, js-data is the tool for giving your data the respect it deserves.

__Latest Release:__ [1.0.0-alpha.5-8](https://github.com/js-data/js-data/releases/tag/1.0.0-alpha.5-8)

js-data is pre-release. The API is subject to change, though the current api is well tested.

If you want to use js-data, keep a close eye on the changelog. 1.0.0 will introduce strict semver (until then, minor number is bumped for breaking changes).

## Project Status

| Project | js-data |
| ------ | ------ |
| Bower | [![Bower version](https://badge.fury.io/bo/js-data.png)](http://badge.fury.io/bo/js-data) |
| NPM | [![NPM version](https://badge.fury.io/js/js-data.png)](http://badge.fury.io/js/js-data) |
| Build Status | [![Circle CI](https://circleci.com/gh/js-data/js-data/tree/master.png?style=badge)](https://circleci.com/gh/js-data/js-data/tree/master) |
| Code Climate | [![Code Climate](https://codeclimate.com/github/js-data/js-data.png)](https://codeclimate.com/github/js-data/js-data) |
| Dependency Status | [![Dependency Status](https://gemnasium.com/js-data/js-data.png)](https://gemnasium.com/js-data/js-data) |
| Coverage | [![Coverage Status](https://coveralls.io/repos/js-data/js-data/badge.png?branch=master)](https://coveralls.io/r/js-data/js-data?branch=master) |

## Supported Platforms

Browsers: Chrome, Firefox, IE 9+, Safari, Opera, iOS Safari 7.1+, Android Browser 2.3+

Node: 0.10+

## Quick Start
`bower install --save js-data js-data-http` or `npm install --save js-data js-data-http`.

Load `js-data-http.js` after `js-data.js`.

```js
var store = new JSData.DS();

// register and use http by default for async operations
store.registerAdapter('http', new DSHttpAdapter(), { default: true });

// simplest model definition
var User = store.defineResource('user');

User.find(1).then(function (user) {
  user; // { id: 1, name: 'John' }
});
```

All your data are belong to you...

## Guides
- [Getting Started with js-data](http://www.js-data.io/docs/home)
- [Resources](http://www.js-data.io/docs/resources)
- [Working with the Data Store](http://www.js-data.io/docs/working-with-the-data-store)
- [Adapters](http://www.js-data.io/docs/working-with-adapters)
- [Model Lifecycle](http://www.js-data.io/docs/model-lifecycle)
- [Custom Instance Behavior](http://www.js-data.io/docs/custom-instance-behavior)
- [Computed Properties](http://www.js-data.io/docs/computed-properties)
- [Relations](http://www.js-data.io/docs/relations)
- [Schemata & Validation](http://www.js-data.io/docs/schemata--validation)
- [FAQ](http://www.js-data.io/docs/faq)

## API Documentation
- [DS](http://www.js-data.io/docs/ds)
- [Schemator](http://www.js-data.io/docs/js-data-schema)
- [DSHttpAdapter](http://www.js-data.io/docs/dshttpadapter)
- [DSLocalStorageAdapter](http://www.js-data.io/docs/dslocalstorageadapter)
- [DSLocalForageAdapter](http://www.js-data.io/docs/dslocalforageadapter)
- [DSFirebaseAdapter](http://www.js-data.io/docs/dsfirebaseadapter)
- [DSRedisAdapter](http://www.js-data.io/docs/dsredisadapter)
- [DSRethinkDBAdapter](http://www.js-data.io/docs/dsrethinkdbadapter)

## Changelog
[CHANGELOG.md](https://github.com/js-data/js-data/blob/master/CHANGELOG.md)

## Version Migration
[TRANSITION.md](https://github.com/js-data/js-data/blob/master/TRANSITION.md)

## Community
- [Mailing List](https://groups.io/org/groupsio/jsdata) - Ask your questions!
- [Issues](https://github.com/js-data/js-data/issues) - Found a bug? Feature request? Submit an issue!
- [GitHub](https://github.com/js-data/js-data) - View the source code for js-data.
- [Contributing Guide](https://github.com/js-data/js-data/blob/master/CONTRIBUTING.md)

## Contributing

First, feel free to contact me with questions. [Mailing List](https://groups.io/org/groupsio/jsdata). [Issues](https://github.com/js-data/js-data/issues).

1. Contribute to the issue that is the reason you'll be developing in the first place
1. Fork js-data
1. `git clone https://github.com/<you>/js-data.git`
1. `cd js-data; npm install; bower install;`
1. `grunt go` (builds and starts a watch)
1. (in another terminal) `grunt karma:dev` (runs the Karma tests)
1. (in another terminal) `grunt w` (runs the NodeJS tests)
1. Write your code, including relevant documentation and tests
1. Submit a PR and we'll review

## License

The MIT License (MIT)

Copyright (c) 2014 Jason Dobry

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

