var fs = require('fs')
var pkg = require('../package.json')

var banner = '/*!\n' +
  '* js-data\n' +
  '* @version ' + pkg.version + ' - Homepage <http://www.js-data.io/>\n' +
  '* @author js-data project authors\n' +
  '* @copyright (c) 2014-2016 js-data project authors\n' +
  '* @license MIT <https://github.com/js-data/js-data/blob/master/LICENSE>\n' +
  '*\n' +
  '* @overview js-data is a framework-agnostic, datastore-agnostic ORM/ODM ' +
  'for Node.js and the Browser.\n' +
  '*/\n'

console.log('Adding banner to dist/ files...')

function addBanner (filepath) {
  var contents = fs.readFileSync(filepath, {
    encoding: 'utf-8'
  })
  if (contents.substr(0, 3) !== '/*!') {
    fs.writeFileSync(filepath, banner + contents, {
      encoding: 'utf-8'
    })
  }
}

addBanner('dist/js-data.js')
addBanner('dist/js-data.es2015.js')
addBanner('dist/js-data.min.js')

console.log('Done!')
