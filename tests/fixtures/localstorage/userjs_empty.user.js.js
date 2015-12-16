var path = require('path');
var fs = require('fs');

var js = path.join(__dirname, '../userscripts/empty.user.js');
var code = fs.readFileSync(js, 'utf8');

module.exports = JSON.stringify({
  name: 'empty.user.js',
  desc: 'example script',
  code: code,
  enabled: true,
});
