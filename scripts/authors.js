var fs = require('fs')
var exec = require('child_process').exec

console.log('Writing AUTHORS file...')

var file = fs.readFileSync(__dirname + '/AUTHORS', {
  encoding: 'utf-8'
})

var tty = process.platform === 'win32' ? 'CON' : '/dev/tty';

exec('git shortlog -s -e < ' + tty, function (err, stdout, stderr) {
  if (err) {
    console.error(err)
    process.exit(-1)
  } else {
    var authors = stdout.split('\n')

    // Add to otherwise modify "authors" if necessary

    file = file + authors.join('\n')
    fs.writeFileSync(__dirname + '/../AUTHORS', file, {
      encoding: 'utf-8'
    })
    console.log('Done!')
  }
})
