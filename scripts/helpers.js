var fs = require('fs');

console.log('Fixing names of Babel helpers...');

var filepath = 'dist/js-data-debug.js';
var file = fs.readFileSync(filepath, {
  encoding: 'utf-8'
});

file = file.replace(/__callCheck__/gi, '_classCallCheck');
file = file.replace(/__inherits__/gi, '_inherits');

fs.writeFileSync(filepath, file, {
  encoding: 'utf-8'
});

console.log('Done!');
