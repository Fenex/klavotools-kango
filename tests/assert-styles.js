/**
 * @file A helper for setting up the chai assertions library.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
chai.use(chaiAsPromised);

var expect = chai.expect;
var should = chai.should;

module.exports = {
  expect: expect,
  should: should,
};
