##### 3.0.0 - 01 July 2017

**v3 Stable Release**

###### Bug fixes
- [#473] - Fixes #471 by @Tronix117

##### 3.0.0-rc.9 - 22 February 2017

###### Bug fixes
- `Schema#pick` no longer incorrectly infers values for objects and arrays

##### 3.0.0-rc.8 - 21 February 2017

###### Breaking changes
- #445
  - The `strict` option has been removed from the `toJSON` methods. The methods now rely wholly on `Schema#pick` for strictness, and assumes the original `strict: false` behavior if no schema is defined.
  - `Schema#pick` now copies properties not defined in the "properties" keyword if the "additionalProperties" keyword is present and truthy.
  - Mappers are no longer given an empty schema if no schema is provided

###### Bug fixes
- #446 - fix(Collection): Add noValidate option to Collection#add, by @ivanvoznyakovsky

##### 3.0.0-rc.7 - 29 January 2017

###### Bug fixes
- #433 - `Collection#add` is missing a "silent" option

###### Backwards compatible changes
- Added a `emitRecordEvents` option to `Collection` which defaults to `true`

###### Other
- Moved Babel config from `package.json` to `.babelrc`
- Upgraded devDependencies
- Added a `yarn.lock` file

##### 3.0.0-rc.6 - 05 October 2016

###### Bug fixes
- Wrapped lifecycle hook validation error in an instance of Error

##### 3.0.0-rc.5 - 26 September 2016

###### Backwards compatible changes
- Fixed some edge cases with Schemas related to anyOf, oneOf, allOf, and additionalProperties
- #386 - Added intermediate `SimpleStore` class between `Container` and `DataStore`.
- #393 - Added `Schema#pick` method

###### Bug fixes
- #374 - revert() after a save() does not work with Schema defined properties
- #387 - Switch to passing only the current-change in 'changes' emit by @pik

###### Other
- #406 - refactor(test): splits tests into smaller ones by @stalniy

##### 3.0.0-rc.4 - 03 August 2016

###### Bug fixes
- #376 - Fix unlinking of records
- #379 fixes #380 - fix(hasOne): do not create links for undefined or null keys by @nickescallon
- #382 fixes #381 - check that inverseDef exists before attempting to setup Inverse for belongsTo by @pik
- #384 - DataStore does not correctly call super

##### 3.0.0-rc.3 - 25 July 2016

###### Bug fixes
- #370 - fix(belongsTo): do not try to link when foreign key is null by @nickescallon
- #371 - Remove target param when calling target.set() by @nickescallon

##### 3.0.0-rc.2 - 08 July 2016

###### Bug fixes
- #366 - Mapper doesn't always call Schema#apply when it should

##### 3.0.0-rc.1 - 08 July 2016

###### Breaking changes
- Added `Mapper#applyDefaults` option which defaults to `true`
- #352 - `Mapper#beforeCreate` and `Mapper#beforeCreateMany` now apply default values
to records for missing values according to the Mapper's schema and the `applyDefaults` option.

###### Backwards compatible changes
- Added the `ctx` property to the `opts` argument passed to validation keywords
- Added `Schema#applyDefaults(target)` method

###### Bug fixes
- #365 - "noValidate" should be used instead of "validate"

##### 3.0.0-beta.10 - 02 July 2016

Forgot to bump version in package.json for previous release

##### 3.0.0-beta.9 - 02 July 2016

###### Breaking changes
- Usaved records can now be added to a Collection (added to the store)
- Record#save now always updates the original record

###### Backwards compatible changes
- Added `Collection#unsaved`, `LinkedCollection#unsaved`, `DataStore#unsaved`
- Added `Collection#prune`, `LinkedCollection#prune`, `DataStore#prune`
- Added `Record#isNew` and `Record#changeHistory`
- Added option `DataStore#usePendingFind`, which defaults to `true`
- Added option `DataStore#usePendingFindAll`, which defaults to `true`

##### 3.0.0-beta.8 - 22 June 2016

###### Breaking changes
- #359 - In-memory relations are now unlinked by default when a record is destroyed

###### Backwards compatible changes
- #353 - Schema: Add shorthand option to track all properties
- #356 - Add back "methods" shortcut for adding instance methods to Mapper#recordClass

###### Bug fixes
- #349 - Individual Record property validation errors don't report correct path
- #354 - Unsubscribing from an event listener in the case of no event listeners, shouldn't raise an error
- #355 - Resetting locals to undefined triggers a setter with an (undefined)record argument
- #358 - findAll() on scoped store (store.as()) does not add the result to the store collection

###### Other
- TONS of additional JSDoc comments in the source code. Thanks @MatthewOverall!

##### 3.0.0-beta.7 - 05 June 2016

###### Backwards compatible changes
- #336 - refactor(Relation): move Relation class into separate file by @stalniy
- #337 - refactor(LinkedCollection) by @stalniy
- #342 - Allow definition of custom getter/setter for schema properties by @jmdobry
- #344 - Schema and utils tests by @MatthewOverall
- #345 - refactor(Container): move defineRelations method to Mapper by @stalniy
- Turned off minification of function names in js-data.min.js

###### Bug fixes
- #332 - records should "commit" when they are saved fixed by @jmdobry

###### Other
- Upgraded dependencies

##### 3.0.0-beta.6 - 16 May 2016

###### Breaking changes
- beforeCreate, beforeCreateMany, beforeUpdate, beforeUpdateAll, and beforeUpdateMany
now run `Mapper#validate` for you by default.

###### Backwards compatible changes
- Added `Container#as` and `DataStore#as`
- Added some deprecation warnings
- Added support for groupings in where clauses

##### 3.0.0-beta.5 - 07 May 2016

###### Backwards compatible changes
- Pulled in mindex updates

###### Bug fixes
- #327 - Issues with inheritance using babel and ES6 classes

##### 3.0.0-beta.4 - 06 May 2016

###### Breaking changes
- Relation links managed by `DataStore` are now non-enumerable by default
- Before calculating `Record#changes`, `toJSON` is called on if available.

##### 3.0.0-beta.3 - 27 April 2016

###### Breaking changes
- `dist/js-data.d.ts` is now in ES6 module format

###### Backwards compatible changes
- Added `typings` field to `package.json`
- Added `typings.json`

##### 3.0.0-beta.2 - 27 April 2016

###### Backwards compatible changes
- `Collection` now has a configurable `queryClass` property, which defaults to `Query`
- Lots of JSDoc improvements

##### 3.0.0-beta.1 - 17 April 2016

Official beta release.

###### Other
- Switched back to Mocha from Ava
- Added Karma tests with Sauce Labs browser testing
- Improved test coverage

##### 3.0.0-alpha.29 - 05 April 2016

###### Breaking changes
- Reworked DataStore relation linking to no longer uses dynamic getters.
Instead, links are updated as records are added to the store or when the
assignment operators are used to re-assign relaitons.
- DataStore now upgrades the Record classes that it touches so that things like
Record#save and Record#destroy will use the DataStore's methods instead of the
Mapper's methods.

###### Backwards compatible changes
- Other tweaks

##### 3.0.0-alpha.28 - 02 April 2016

###### Backwards compatible changes
- Added selectForAdd to DataStore

##### 3.0.0-alpha.27 - 02 April 2016

###### Backwards compatible bug fixes
- Quick fix for wrap functionality

##### 3.0.0-alpha.26 - 02 April 2016

###### Backwards compatible changes
- Improved Mapper#createRecord, and made it easier to work with non-standard responses

##### 3.0.0-alpha.25 - 01 April 2016

###### Backwards compatible bug fixes
- Removed accidental rx-lite optional dependency

##### 3.0.0-alpha.24 - 01 April 2016

###### Backwards compatible bug fixes
- Some fixes for js-data.d.ts
- Added argument check to Mapper#createRecord
- Made Record instances print nicer

##### 3.0.0-alpha.23 - 01 April 2016

###### Breaking changes
- Moved `js-data.d.ts` to `dist/js-data.d.ts`

###### Other
- Fixed some JSDoc comments

##### 3.0.0-alpha.22 - 31 March 2016

###### Backwards compatible API changes
- Containers and DataStores now bubble up Mapper events
- DataStores now bubble up Collection events

###### Other
- Switched from mocha/istanbul to ava/nyc for parallel tests

##### 3.0.0-alpha.21 - 22 March 2016

###### Backwards compatible API changes
- #195 - Add "with" to remove/removeAll (eject/ejectAll) to also remove relations
- Added `Mapper#validate(record[, opts])`, `Record#validate([opts])` and `Record#isValid()`

###### Backwards compatible bug fixes
- #263 - orderBy with undefined values doesn't order (though null works)

###### Other
- Updated js-data.d.ts

##### 3.0.0-alpha.20 - 18 March 2016

###### Breaking API changes
- Switched Record#changes and Record#hasChanges to using an options argument

###### Backwards compatible API changes
- Passive change detection now possible with changes to Record#changes() and Record#hasChanges(), see #313
- #283 - Added sum and count methods

###### Backwards compatible big fixes
- Container and DataStore now proxy all Mapper methods

##### 3.0.0-alpha.19 - 14 March 2016

###### Breaking API changes
- Passive change detection now possible with changes to Record#changes() and Record#hasChanges(), see #313

###### Other
- Now easier to customize utility functions (when necessary, should be rare)

##### 3.0.0-alpha.18 - 12 March 2016

###### Backwards compatible API changes
- Improved forEachRelation utility function to support filtering on "with" sub queries
- Added deepFillIn utility function
- Made some Mapper instance properties non-enumerable

##### 3.0.0-alpha.17 - 10 March 2016

###### Breaking API changes
- Removed `upsert` option from js-data core. `upsert` is now handled at the adapter level.
- Fixed order of arguments to updateAll
- Fixed how arguments are passed to the various lifecycle methods

###### 3.0.0-alpha.16 - 21 February 2016

- Added "omit" utility method

##### 3.0.0-alpha.15 - 21 February 2016

- Couple of fixes

##### 3.0.0-alpha.14 - 13 February 2016

- Added utility for recursively visiting relations based on `opts.with`

##### 3.0.0-alpha.13 - 05 February 2016

- Added back change detection

##### 3.0.0-alpha.12 - 04 February 2016

- Added back relation linking to DataStore and LinkedCollection
- Container and DataStore now proxy a number of Collection methods
- Container and DataStore now proxy Mapper#createRecord
- Container now proxies async Mapper methods, not just DataStore

##### 3.0.0-alpha.11 - 25 January 2016

- Refactored architecture into Record, Collection (and LinkedCollection), Mapper, Container, DataStore, and Schema

##### 3.0.0-alpha.10 - 09 January 2016

- (temporarily?) removed relation links
- Added `Collection#modelOpts` option
- Relations can be defined via `DS#defineModel`

##### 3.0.0-alpha.9 - 09 January 2016

###### Backwards compatible bug fixes
- Fixed a bug in IE where Object.prototype.toString !== window.toString

##### 3.0.0-alpha.8 - 09 January 2016

###### Breaking API changes
- The Model class is now stateless
- All stateful functionality has been moved to the Collection class
- The DS class no longer proxies Model methods.

##### 3.0.0-alpha.6 - 05 January 2016

- More fixes
- Inheritance should work better in TypeScript
- Better operational eventing

##### 3.0.0-alpha.4 - 04 January 2016

- Collections now fire "add" and "remove" events
- Added before/after(Inject/Eject/EjectAll) lifecycle hooks

##### 3.0.0-alpha.3 - 29 December 2015

- Implemented more methods from 2.x.
- Better compatibility for the classes exposed by js-data.
- Switched from Webpack to Rollup for a 7% smaller build
(automatic tree-shaking) and built code that's simpler and easier to read.

##### 3.0.0-alpha.2 - 22 December 2015

##### 3.0.0-alpha.1 - 12 December 2015

###### Breaking API changes
- js-data now requires full ES5 support from the runtime. The developer
can add es5-shim for older browsers.
- `DS` is now just a container for `Model` classes. It no longer stores data or
metadata.
- Settings are no longer inherited via the prototype. A base Model can be
created which the remaining Models can extend.
- A `Model` is essentially a constructor function, which can be used to create
instance of the Model. A Model has static methods like `find` and `create`. The
prototype of a Model defines behavior for instances of the Model. Models can be
defined using ES6 class syntax. A Model must be "initialized" in order to be
able to store data. A Model is automatically initialized if a schema is defined
for the Model, or if the Model is created using the `.extend` method, or the
legacy `DS#defineResource` or `DS#defineModel` methods.
- Use of `Object.observe` and the observe-js polyfill have been dropped in
`3.0.0-alpha.1` (see https://esdiscuss.org/topic/an-update-on-object-observe),
replaced with Backbone-style change detection (but unlike with Backbone, you can
still treat instances like POJOs!) Change detection is now more “opt in”, so you
can use it more wisely when you actually need, improving performance overall.
- In  `3.0.0-alpha.1` Models (Resources) can now be defined with plain ES6
classes

###### Other
- As this is an alpha build of a complete rewrite from scratch, there is still a
lot of work to be done. Some features from 2.x may not have been implemented yet
and there are probably bugs. If you're willing to experiment with 3.x, your
feedback is appreciated.
- 3.0.0-alpha.1 gzipped is approximately 40% smaller than 2.8.2 gzipped.
- In `3.0.0-alpha.1`, the internal store (cache) of each Model (Resource)
supports secondary indexes for blazing fast lookups on indexed keys. Where in
2.x a `hasMany` property accessor performs a O(n) lookup, in `3.0.0-alpha.1` the
lookup is performed in O(log n) time.

##### 2.8.2 - 04 November 2015

###### Backwards compatible bug fixes
- #258 - CSP violations due to use of new Function()

##### 2.8.1 - 02 November 2015

###### Backwards compatible bug fixes
- #239 - loadRelations assumes cacheResponse and linkRelations options are true
- #259, #260 - Reverting undefined keys by @davincho

##### 2.8.0 - 26 October 2015

###### Backwards compatible API changes
- #211 - Add case insensitive filtering in query syntax

##### 2.7.0 - 22 October 2015

###### Backwards compatible API changes
- #205 - DS#revert should ignore omitted fields
- #243 - DS#commit
- #245 - Closes #205 by @internalfx
- #248 - Fix `belongsTo` relation with zero value by @Pencroff

###### Other
- Dropped Grunt

##### 2.6.1 - 12 October 2015

###### Bug fixes
- #223 - Zero value Id in relations fixed in #237 by @Pencroff

##### 2.6.0 - 08 October 2015

###### Backwards compatible API changes
- #234 - findAll should query adapter if previous query is expired.
- #235 - Support maxAge in find/findAll requests by @antoinebrault

###### Bug fixes
- #236 - actions defined in defineResource are shared across definitions

##### 2.5.0 - 04 October 2015

###### Backwards compatible API changes
- #187 - No way to hook into error events globally
- #201 - Feature request: hook into loadRelations
- #220 - Optionally disable injection of nested relations
- #231 - Added hasMany relations linking using "foreignKeys" by @treyenelson

###### Bug fixes
- #229 - DS.change is emitted on an instance multiple times after only 1 modification
- #232 - Adapter default basepath is taken instead of definition basepath when using an action.

##### 2.4.0 - 22 September 2015

###### Backwards compatible API changes
- #179 - Implemented a feature like Sequelize Scopes
- #201 - Feature request: hook into loadRelations
- #217 - Add afterFind, afterFindAll, and afterLoadRelations hooks

###### Bug fixes
- #203 - createInstance/compute don't know about computed properties as property accessors
- #215 - Javascript error when trying to merge model with null value for relation
- #216 - Update remove circular to support File objects
- #218 - linkRelations (like cacheResponse) should have defaulted to false on the server

###### Other
- #204 - Choose official code style for project
- Switched unnecessary arrow functions back to regular functions to improve performance
- Updated CONTRIBUTING.md

##### 2.3.0 - 30 July 2015

###### Backwards compatible API changes
- #186 - Add relation setters for convenience
- #191 - Add ability to disable change detection
- #192 - Add ability to configure computed property as a property accessor

###### Backwards compatible bug fixes
- #190 - computed properties false positive minified code warning

##### 2.2.3 - 22 July 2015

###### Backwards compatible bug fixes
- Removed some asinine optimizations

##### 2.2.2 - 10 July 2015

###### Backwards compatible bug fixes
- #177 - Fix Events.off

##### 2.2.1 - 09 July 2015

###### Backwards compatible bug fixes
- #176 - `localKey`, `localKeys` and `foreignKey` don't support nested fields.

##### 2.2.0 - 07 July 2015

###### Backwards compatible API changes
- #173 - Added `DS#revert(resourceName, id)` Thanks @internalfx

##### 2.1.0 - 07 July 2015

###### Backwards compatible API changes
- Added `DS#clear()`, which is a method only available on a store, and will call `ejectAll` on all of the store's resources

##### 2.0.0 - 02 July 2015

Stable Version 2.0.0

##### 2.0.0-rc.3 - 30 June 2015

- Tweak to custom relation getters

##### 2.0.0-rc.2 - 30 June 2015

###### Backwards compatible API changes
- Enhanced relation getters and better localKeys support

##### 2.0.0-rc.1 - 27 June 2015

###### Breaking API changes
- Moved the `getEndpoint` method to the http adapter

##### 2.0.0-beta.11 - 26 June 2015

###### Backwards compatible API changes
- #167 - DS#refreshAll
- #168 - DS#inject - replace instead of merge. `onConflict: 'replace'` will replace existing items instead of merging into them.

##### 2.0.0-beta.10 - 26 June 2015

###### Backwards compatible bug fixes
- Fix so `DS#loadRelations` can load all relations

##### 2.0.0-beta.9 - 26 June 2015

###### Breaking API changes
- #161 - By default, computed properties are no longer sent to adapters. You can also configure other properties that shouldn't be sent.

###### Backwards compatible API changes
- #162 - Return query metadata as second parameter from a promise.

###### Backwards compatible bug fixes
- #165 - global leak

##### 2.0.0-beta.8 - 22 June 2015

###### Backwards compatible API changes
- #160 - Add "DS.change" events, fired on Resources and instances

##### 2.0.0-beta.7 - 09 June 2015

###### Breaking API changes
- #158 - Data store should consume resource definition methods internally (might not be breaking)

###### Backwards compatible API changes
- #157 - DSEject not available on instances

###### Other
- #156 - Thoroughly annotate all source code to encourage contribution

##### 2.0.0-beta.6 - 04 June 2015

###### Breaking API changes
- #150 - Debug output, `debug` now defaults to `false`

###### Backwards compatible API changes
- #145 - A little AOP, add a `.before` to all methods, allowing per-method argument customization

##### 2.0.0-beta.5 - 27 May 2015

###### Breaking API changes
- #54 - feat: Call the inject and eject lifecycle hooks regardless of if the notify option is enabled

###### Backwards compatible API changes
- #131 - array of IDs based hasMany relations
- #132 - Allow resources to extend other resources
- #133 - Allow filtering by nested fields
- #135 - JSData caching inconsistent behaviour when ejecting items
- #138 - Collection class
- #139 - Option to specify default values of new resource instances.

###### Backwards compatible bug fixes
- #127 - Memory leak in DS.changes
- #134 - All resources get all methods defined on any resource
- #142 - Allow omitting options in getEndpoint

##### 2.0.0-beta.4 - 28 April 2015

###### Backwards compatible API changes
- #129 - Add interceptors to actions

##### 2.0.0-beta.2 - 17 April 2015

Updated a dependency for better umd amd/r.js support

##### 2.0.0-beta.1 - 17 April 2015

###### Breaking API changes
- #107 - Switch to property accessors (getter/setter) for relations links. (Relation links are no longer enumerable)
- #121 - Remove bundled Promise code (The developer must now ensure an ES6-style Promise constructor is available)
- #122 - Remove coupling with js-data-schema (You can still use js-data-schema, js-data just doesn't know anything about js-data-schema anymore)

###### Backwards compatible API changes
- Computed properties now support nested fields (both the computed field and the fields it depends on) e.g. `computed: { 'name.fullName': ['name.first', 'name.last', function (first, last) { return first + ' ' + last; } }`

##### 1.8.0 - 14 April 2015

###### Backwards compatible API changes
- #117 - .find skips the object in the store
- #118 - DS#find() returns items cached with DS#inject() - Thanks @mightyguava!
- `createInstance` will now initialize computed properties (but they won't be updated until the item is injected into the store, or unless you use `Instance#set(key, value)` to mutate the instance)

###### Backwards compatible bug fixes
- #115 - removeCircular bug

##### 1.7.0 - 09 April 2015

###### Backwards compatible API changes
- #106 - Add pathname option to actions
- #114 - Add support to actions for having item ids in the path

##### 1.6.3 - 03 April 2015

###### Backwards compatible bug fixes
- #106 - loadRelations: check params.where instead when allowSimpleWhere is disabled - Thanks @maninga!

##### 1.6.2 - 01 April 2015

###### Backwards compatible bug fixes
- #104 - DS.schemator is undefined when using browserify

##### 1.6.1 - 31 March 2015

###### Backwards compatible bug fixes
- #101 - Reject instead of throw, as throw is messy in the console

##### 1.6.0 - 29 March 2015

###### Backwards compatible API changes
- #97 - Don't link relations where localField is undefined

###### Backwards compatible bug fixes
- #95 - actions should use defaultAdapter of the resource

##### 1.5.13 - 25 March 2015

###### Backwards compatible bug fixes
- #91 - Wrong second argument passed to afterCreateInstance

##### 1.5.12 - 23 March 2015

###### Backwards compatible bug fixes
- #84 - DS.Inject performance issues when reloading data (`DSUtils.copy` was attempting to copy relations)

##### 1.5.11 - 22 March 2015

###### Backwards compatible bug fixes
- #83 - Change detection incorrectly handles cycles in the object

##### 1.5.10 - 19 March 2015

###### Backwards compatible bug fixes
- #81 - Sometimes `inject` with nested relations causes an infinite loop

###### Other
- Added `.npmignore` for a slimmer npm package

##### 1.5.9 - 18 March 2015

###### Backwards compatible bug fixes
- #76 - Saving relation fields with changesOnly=true
- #80 - save + changesOnly + nested relations + no actual changes results in an error

###### Other
- Upgraded dependencies

##### 1.5.8 - 14 March 2015

###### Other
- Extracted BinaryHeap class to its own npm module

##### 1.5.7 - 13 March 2015

###### Backwards compatible bug fixes
- #75 - `DSUtils.removeCircular` is removing more stuff than it should

##### 1.5.6 - 07 March 2015

###### Backwards compatible bug fixes
- Fixed loading of the optional js-data-schema

##### 1.5.5 - 07 March 2015

###### Other
- Re-wrote a good amount of the code to use ES6. Now using Babel.js to transpile back to ES5.

##### 1.5.4 - 05 March 2015

###### Backwards compatible bug fixes
- #72 - bug: items injected via a relationship fail to fire notifications (fixed more cases of this happening)

##### 1.5.3 - 05 March 2015

###### Backwards compatible bug fixes
- #35 - beforeInject not called on relationships
- #72 - bug: items injected via a relationship fail to fire notifications

##### 1.5.2 - 02 March 2015

###### Backwards compatible bug fixes
- Now using `DSUtils.copy` when saving "original" attributes so changes can be computed properly

##### 1.5.1 - 02 March 2015

###### Backwards compatible bug fixes
- #66 - "saved" and "lastSaved" method seems to be a misnomer
- #69 - Using resource base class w/additional properties has some side effects
- #70 - "lastSaved" timestamp changes too often

###### Other
- Removed use of `DSUtils.copy` in the event hooks. This should increase performance quite a bit.

##### 1.5.0 - 27 February 2015

###### Backwards compatible API changes
- #17 - feat: Load relations based on local field name

###### Backwards compatible bug fixes
- #62 - getAdapter when called from a Resource fails
- #65 - internal emit api was not updated to use Resource instead of Resource.name like the lifecycle hooks were

###### Other
- Internal optimizations to shave ~2kb off the minified build

##### 1.4.1 - 27 February 2015

###### Backwards compatible bug fixes
- #64 - Two possible error cases in `DS#find`

##### 1.4.0 - 24 February 2015

###### Backwards compatible api changes
- #51 - Allow resource instances to be created from a base class

##### 1.3.0 - 11 February 2015

###### Backwards compatible api changes
- #50 - Added a `DS#is(resourceName, instance)` or `Resource#is(instance)` method to check if an object is an instance of a particular resource

###### Backwards compatible bug fixes
- When items are ejected cached collection queries are now checked to see if all the cached items from that query are gone, and if so, the cache query is deleted

##### 1.2.1 - 06 February 2015

###### Backwards compatible bug fixes
- #42 - deserialize and beforeInject are called from the parent relation when loadRelations is used

##### 1.2.0 - 05 February 2015

###### Backwards compatible bug fixes
- Added a `getResource(resourceName)` method to resource definitions so adapters can grab the definitions of a resource's relations

##### 1.1.1 - 05 February 2015

###### Backwards compatible bug fixes
- #46 - "actions" don't inherit basePath properly

##### 1.1.0 - 04 February 2015

##### Backwards compatible API changes
- Allow nested keys in "orderBy" clauses, i.e. `orderBy: 'foo.bar'`
- Added `get` and `set` methods to the instance prototype for getter/setter manipulation of data store items. Use of `set` will trigger immediate recalculation of computed properties on the instance. Both `get` and `set` support nested key names.
- Added a `removeCircular` util method so cyclic objects can be saved without fuss
- #43 - Added `contains` operator to the default filter

##### Backwards compatible bug fixes
- Added missing `createInstance` calls

##### 1.0.0 - 03 February 2015

Stable Version 1.0.0

###### Other
- Upgraded to the latest observe-js

##### 1.0.0-beta.2 - 23 January 2015

###### Backwards compatible API changes
- Updates to defining "actions"

##### 1.0.0-beta.1 - 10 January 2015

###### Breaking API changes
- #30 - Issue with offset. To solve this a `useFilter` option was added, which defaults to `false`. Previously `DS#filter` was used to return cached `findAll` queries, but that had problems. Now, cached items are also tracked by the query that retrieved them, so when you make a query again you consistently get the right data.

###### Backwards compatible API changes
- #6 - Allow logging to be configurable
- #29 - Add version to JSData export
- #31 - Add build for js-data-debug.js which contains lots of debugging statements and a configurable logger.

##### 1.0.0-alpha.5-8 - 05 December 2014

###### Backwards compatible API changes
- #27 - Properly resolve parent params for generating the URL

##### 1.0.0-alpha.5-7 - 05 December 2014

###### Backwards compatible API changes
- #26 - Added the DSCreate instance method

###### Backwards compatible bug fixes
- #23 - DS#findAll: make a copy of options.params if it's passed in and manipulate that

##### 1.0.0-alpha.5-6 - 03 December 2014

###### Backwards compatible bug fixes
- Backport jmdobry/angular-data#262

###### Other
- Optimized utility functions to save several kilobytes off of minified file
- Change detection of nested properties "should" work now

##### 1.0.0-alpha.5-5 - 30 November 2014

###### Breaking API changes
- findInverseLinks, findBelongsTo, findHasOne, and findHasMany now default to true

###### Backwards compatible bug fixes
- Backport jmdobry/angular-data#253

##### 1.0.0-alpha.5-3 - 28 November 2014

###### Backwards compatible API changes
- Added the isectEmpty, isectNotEmpty, |isectEmpty, and |isectNotEmpty filter operators

###### Other
- Fixed file size of browser dist file

##### 1.0.0-alpha.5-3 - 26 November 2014

###### Backwards compatible API changes
- Server-side js-data now uses the Bluebird promise library

##### 1.0.0-alpha.5-2 - 23 November 2014

###### Backwards compatible API changes
- items don't have to be in the data store to call destroy on them anymore

##### 1.0.0-alpha.5-1 - 19 November 2014

Removed DSUtils.deepFreeze

##### 1.0.0-alpha.5-0 - 18 November 2014

###### Breaking API changes
- All hooks now take the resource definition object as the first argument instead of just the name of the resource

###### Backwards compatible API changes
- jmdobry/angular-data#238

##### 1.0.0-alpha.4-3 - 11 November 2014

###### Backwards compatible bug fixes
- #19 - multiple orderBy does not work

##### 1.0.0-alpha.4-2 - 09 November 2014

###### Backwards compatible API changes
- jmdobry/angular-data#227 - Supporting methods on model instances

###### Backwards compatible bug fixes
- jmdobry/angular-data#235 - IE 8 support

##### 1.0.0-alpha.4-1 - 08 November 2014

###### Backwards compatible bug fixes
- Various fixes

##### 1.0.0-alpha.4-0 - 04 November 2014

###### Backwards compatible API changes
- jmdobry/angular-data#208 - ng-repeat $$hashKey affecting hasChanges

###### Backwards compatible bug fixes
- jmdobry/angular-data#225 - If the server returned an empty array for a get request (valid scenario), angular-data throws an exception

##### 1.0.0-alpha.2 - 31 October 2014

###### Backwards compatible API changes
- #20 - es6-promise finally polyfill

##### 1.0.0-alpha.1-2 - 30 October 2014

###### Backwards compatible bug fixes
- Fixed an issue with the options defaults util function

##### 1.0.0-alpha.1-1 - 19 October 2014

###### Backwards compatible API changes
- #10 - Add js-data-schema integration

##### 1.0.0-alpha.1-0 - 13 October 2014

###### Backwards compatible API changes
- #15 - Add beforeCreateInstance & afterCreateInstance

##### 0.4.2 - 06 October 2014

###### Backwards compatible API changes
- #12 - Add expiration capabilities (reapInterval, reapAction, maxAge, DS#reap)

##### 0.4.1 - 01 October 2014

###### Backwards compatible API changes
- #9 - Make all options passed to methods also inherit from Resource defaults

###### Backwards compatible bug fixes
- jmdobry/angular-data#195 - throw an error when you try to inject a relation but the resource for it hasn't been defined

###### Other
- Added official support for NodeJS

##### 0.4.0 - 25 September 2014

###### Breaking API changes
- Refactored from `baseUrl` to `basePath`, as `baseUrl` doesn't make sense for all adapters, but `basePath` does
- Made `notify` configurable globally and per-resource

##### 0.3.0 - 22 September 2014

###### Backwards compatible API changes
- Added `beforeDestroy` and `afterDestroy` to `DS#destroyAll`
- Added `eagerEject` option to `DS#destroyAll` and `DS#destroy`

##### 0.2.0 - 20 September 2014

###### Backwards compatible API changes
- jmdobry/angular-data#145 - Add "useClass" option to inject, find, findAll, create
- jmdobry/angular-data#159 - Find which items from collection have changed with lastModified
- jmdobry/angular-data#166 - Add ID Resolver
- jmdobry/angular-data#167 - Default params argument of bindAll to empty object
- jmdobry/angular-data#170 - Global callbacks
- jmdobry/angular-data#171 - "not in" query
- jmdobry/angular-data#177 - Allow promises to be returned in lifecycle hooks

###### Backwards compatible bug fixes
- jmdobry/angular-data#156 - cached findAll pending query doesn't get removed sometimes
- jmdobry/angular-data#163 - loadRelations shouldn't try to load a relation if the id for it is missing
- jmdobry/angular-data#165 - DS.hasChanges() reports changes after loading relations

###### Other
- Moved api documentation out of comments and into the GitHub wiki
- Re-organized code and shaved 5.5kb off the minified file
