/**
 * @file A fixtures loader helper.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

var fs = require('fs');
var path = require('path');
var glob = require('glob');

var fixtures = {};
// glob library uses only forwarding slashes:
var pattern = __dirname + '/fixtures/**/*.*';
glob.sync(pattern).forEach(function (fixturePath) {
  // Get the parent folder name for the fixture:
  var folder = path.dirname(fixturePath).split(/[\\/]/).pop();
  // Get the fixture extension:
  var ext = path.extname(fixturePath);
  // Get the fixture filename:
  var name = path.basename(fixturePath, ext);

  if (!fixtures.hasOwnProperty(folder)) {
    fixtures[folder] = {};
  }

  var isModule = true;
  if (ext === '.js') {
    var entity = require(fixturePath);
    if (typeof entity === 'object') {
      isModule = false;
      // Check for empty object:
      for (var key in entity) {
        if (entity.hasOwnProperty(key)) {
          isModule = true;
          break;
        }
      }
    }
  } else {
    isModule = false;
  }

  if (isModule) {
    fixtures[folder][name] = entity;
  } else {
    // This is not a node.js module — save the file contents:
    fixtures[folder][name] = fs.readFileSync(fixturePath, 'utf8');
  }
});

module.exports = fixtures;
