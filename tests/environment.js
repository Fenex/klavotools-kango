/**
 * A helper for creating the testing environment context.
 *
 * @author Daniil Filippov aka agile <filippovdaniil@gmail.com>
 */

var chai = require('chai');
chai.should();

var kango = require('./kango-mock.js');
var fixturesLoader = require('./fixtures.js');

module.exports = {
  kango: kango,
  isNull: function (obj) {},
  xhr: function (detail) {},
  fixtures: new fixturesLoader,
}
