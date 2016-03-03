var fs = require('fs')
var exec = require('child_process').exec
var path = require('path')

console.log('Writing AUTHORS file...')

var authorsFile = fs.readFileSync(path.join(__dirname, '/AUTHORS'), {
  encoding: 'utf-8'
})
var contributorsFile = fs.readFileSync(path.join(__dirname, '/CONTRIBUTORS'), {
  encoding: 'utf-8'
})

var tty = process.platform === 'win32' ? 'CON' : '/dev/tty'

exec('git shortlog -s -e < ' + tty, function (err, stdout, stderr) {
  if (err) {
    console.error(err)
    process.exit(-1)
  } else {
    var lines = stdout.split('\n')
    var countsAndNames = lines.map(function (line) {
      return line.split('\t')
    })
    var names = countsAndNames.map(function (pair) {
      return pair[1]
    })

    // Add to or otherwise modify "names" if necessary

    fs.writeFileSync(path.join(__dirname, '/../AUTHORS'), authorsFile + names.join('\n'), {
      encoding: 'utf-8'
    })
    console.log('Done!')
    console.log('Writing CONTRIBUTORS file...')

    names = lines

    // Add to or otherwise modify "names" if necessary

    fs.writeFileSync(path.join(__dirname, '/../CONTRIBUTORS'), contributorsFile + names.join('\n'), {
      encoding: 'utf-8'
    })
    console.log('Done!')
  }
})
