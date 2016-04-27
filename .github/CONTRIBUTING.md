# Contributing to js-data core

[Read the general Contributing Guide](http://js-data.io/docs/contributing).

## Project structure

* `dist/` - Contains final build files for distribution
* `doc/` - Output folder for JSDocs
* `lib/` - Holds vendored `mindex` library
* `scripts/ - Various build scripts
* `src/` - Project source code
* `test/` - Project tests

## Clone, build & test

1. `clone git@github.com:js-data/js-data.git`
1. `cd js-data`
1. `npm install`
1. `npm run mocha` - Run tests
1. `npm run build` - Lint and build distribution files

## To cut a release

1. Checkout master
1. Bump version in `package.json` appropriately
1. Run `npm run release`
1. Update `CHANGELOG.md` appropriately
1. Commit and push changes, including the `dist/` folder
1. Make a GitHub release
  - set tag name to version
  - set release name to version
  - set release body to changelog entry for the version
  - attach the files in the `dist/` folder
1. `npm publish .`

See also [Community & Support](http://js-data.io/docs/community).
