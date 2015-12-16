/**
 * A fixtures loader helper
 *
 * @author Daniil Filippov aka agile <filippovdaniil@gmail.com>
 */

var path = require('path');

function FixturesLoader () {}

FixturesLoader.prototype.fromLocalStorage = function (name) {
  var js = path.join(__dirname, 'fixtures/localstorage/' + name + '.js');
  var entity = require(js);
  return entity;
};

module.exports = FixturesLoader;
