/**
 * A helper for creating the testing environment context.
 *
 * @author Daniil Filippov aka agile <filippovdaniil@gmail.com>
 */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.should();

var kango = require('./kango-mock.js');

module.exports = {
  kango: kango,
  isNull: function (obj) {},
  xhr: function (detail) {},
}
