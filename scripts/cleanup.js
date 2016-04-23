var fs = require('fs')

var pkg = require('../package.json')

var path = './doc/js-data/' + pkg.version + '/styles/'

var files = fs.readdirSync(path)
files.forEach(function (file) {
  if (file.indexOf('site') === 0) {
    if (file.indexOf('jsdata') === -1 && file.indexOf('dibs') === -1) {
      fs.unlinkSync(path + file)
    }
  }
})

path = './doc/js-data/' + pkg.version

files = fs.readdirSync(path)
files.forEach(function (file) {
  if (file.indexOf('.html') === file.length - 5) {
    var content = fs.readFileSync(path + '/' + file, { encoding: 'utf8' })
    content = content.replace(/\/home\/ubuntu\/workspace\//gi, '')
    fs.writeFileSync(path + '/' + file, content, { encoding: 'utf8' })
  }
})
