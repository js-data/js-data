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
