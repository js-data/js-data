# Contributing Guide

### Support

Support questions are handled via [StackOverflow][so], [Slack][slack], and the
[Mailing List][ml]. Ask your questions there.

### Community
- [StackOverflow Channel][so]
- [Slack Chat][slack] [![Slack Status][sl_b]][slack]
- [Announcements](http://www.js-data.io/blog)
- [Mailing List](ml)
- [Issues Tracker](https://github.com/js-data/js-data/issues)
- [GitHub](https://github.com/js-data/js-data)
- [Contributing Guide](https://github.com/js-data/js-data/blob/master/CONTRIBUTING.md)

### Contributing

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
1. `cd js-data; npm install;`
1. Write your code, including relevant documentation and tests
1. Run `npm test` (build and test)
1. Your code will be linted and checked for formatting, the tests will be run
1. The `dist/` folder & files will be generated, do NOT commit `dist/*`! They
will be committed when a release is cut.
1. Submit your PR and we'll review!
1. Thanks!

### Have write access?

To cut a release:

1. Checkout master
1. Bump version in `package.json` appropriately
1. Run `npm test`
1. Update `CHANGELOG.md` appropriately
1. Commit and push changes, including the `dist/` folder
1. Make a GitHub release
  - set tag name to version
  - set release name to version
  - set release body to changelog entry for the version
  - attach the files in the `dist/` folder
1. `npm publish .`

[slack]: http://slack.js-data.io
[ml]: https://groups.io/org/groupsio/jsdata
[so]: http://stackoverflow.com/questions/tagged/jsdata
