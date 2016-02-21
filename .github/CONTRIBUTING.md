# Contributing

[Read the Contributing Guide](http://js-data.io/docs/contributing).

## Support

[Find out how to Get Support](http://js-data.io/docs/support).

## Community

[Explore the Community](http://js-data.io/docs/community).

### Have write access?

To cut a release:

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
