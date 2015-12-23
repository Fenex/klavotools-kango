/**
 * A fixtures loader helper
 *
 * @author Daniil Filippov aka agile <filippovdaniil@gmail.com>
 */

var path = require('path');

function FixturesLoader () {}

/**
 * A static method for loading "localStorage" fixtures.
 *
 * @param {String} name A name of the entity
 * @return {String}
 */
FixturesLoader.fromLocalStorage = function (name) {
  var js = path.join(__dirname, 'fixtures/localstorage/' + name + '.js');
  var entity = require(js);
  return entity;
};

module.exports = FixturesLoader;
