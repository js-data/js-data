var fs = require('fs')

var pkg = require('../package.json')

var path = './doc/js-data-localstorage/' + pkg.version + '/styles/'

var files = fs.readdirSync(path)
files.forEach(function (file) {
  if (file.indexOf('site') === 0) {
    if (file.indexOf('lumen') === -1 && file.indexOf('dibs') === -1) {
      fs.unlinkSync(path + file)
    }
  }
})
