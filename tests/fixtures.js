/**
 * A fixtures loader helper
 *
 * @author Daniil Filippov aka agile <filippovdaniil@gmail.com>
 */

var fs = require('fs');
var path = require('path');
var glob = require('glob');

var fixtures = {};
// glob library uses only forwarding slashes:
var pattern = __dirname + '/fixtures/**/*.js';
glob.sync(pattern).forEach(function (fixturePath) {
  // Get the parent folder name for the fixture:
  var folder = path.dirname(fixturePath).split(path.sep).pop();
  // Get the fixture filename:
  var name = path.basename(fixturePath, '.js');
  if (!fixtures.hasOwnProperty(folder)) {
    fixtures[folder] = {};
  }

  var entity = require(fixturePath);
  var isModule = true;
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

  if (isModule) {
    fixtures[folder][name] = entity;
  } else {
    // This is not a node.js module — save the file contents:
    fixtures[folder][name] = fs.readFileSync(fixturePath, 'utf8');
  }
});

module.exports = fixtures;
