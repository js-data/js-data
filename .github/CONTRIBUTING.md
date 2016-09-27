# Contributing to js-data

Dear contributor,

**Thank you!** Projects like this are successful because of you!

## Getting started

1. Read the the general [JSData Contributing Guide](http://js-data.io/docs/contributing)
1. To report a bug or request a feature, please [open an issue](https://github.com/js-data/js-data/issues/new)
  * Be sure to search the existing issues to prevent duplication
  * Give your issue a short but descriptive title
  * For bug reports, please include all steps to reproduce the error
  * For feature requests, please include details of your use case
1. To improve to the general JSData documentation, go to [js-data.io/v3.0/docs/home](http://www.js-data.io/v3.0/docs/home) and click "Suggest Edits"
1. To improve the API Reference Documentation, write a test, fix a bug, or add a feature:
  1. Create a fork of github.com/js-data/js-data. [Click here](https://github.com/js-data/js-data#fork-destination-box) to do so now.
  1. Clone your fork:

      ```
      git clone git@github.com:YOUR_USERNAME/js-data.git
      ```
  1. Change directory to `js-data`:

      ```
      cd js-data
      ```
  1. Install development dependencies

      ```
      npm install
      ```
1. To just update API Reference Documentation, make changes to the [JSDoc](http://usejsdoc.org/) comments in the source code. To regenerate the API documentation:

    ```
    npm run doc
    ```

    You can find the regenerated API Reference Documentation in the `doc/` folder.
1. To write a test, fix a bug, or add a feature, make your changes to files in the `src/` and `test/` folders.
1. To build and run the tests:

    ```
    npm test
    ```

1. Commit your changes, submit a Pull Request, and wait for review!

## Project structure

* `dist/` - Contains final build files for distribution
* `doc/` - Output folder for JSDocs
* `lib/` - Holds the vendored `mindex` library
* `scripts/ - Various build scripts
* `src/` - Project source code
* `test/` - Project tests

## To cut a release

1. `git checkout master`
1. Bump version in `package.json` appropriately
1. Update `CHANGELOG.md` appropriately
1. `npm run release`
1. Commit and push changes (message should be something like "Prepare for VERSION")
1. `git checkout release`
1. `git merge master`
1. `npm run release`
1. Commit and push changes (message should be something like "VERSION")
1. [Make a new GitHub release](https://github.com/js-data/js-data/releases/new)
  - tag from `release` branch
  - set tag name to version
  - set release name to version
  - set release body to changelog entry for the version
1. `npm publish .`
1. `git checkout gh-pages`
1. `cp -r doc/js-data/VERSION VERSION`
1. `cp -r doc/js-data/VERSION latest`
1. `git add -A`
1. `git commit -m "VERSION"`
1. `git push -u origin gh-pages`
1. `git checkout master`

See also [Community & Support](http://js-data.io/docs/community).
