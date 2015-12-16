/**
 * Unit tests for the content-js background module
 *
 * @author Daniil Filippov aka agile <filippovdaniil@gmail.com>
 */

var sinon = require('sinon');
var environment = require('../../environment.js');
var context = require('../../loader.js') (
  'klavotools/background/content-js.js',
  environment
);
var Script = context.Script;
var UserJS = context.UserJS;

describe('content-js module', function () {
  describe('Script class', function () {
    // Reference to the kango.storage.getItem stub:
    var getItem;

    before(function () {
      // Loading localStorage fixtures for the Script class:
      var fixtures = environment.fixtures;
      var emptyJs = fixtures.fromLocalStorage('userjs_empty.user.js');
      // Setting up the kango.storage.getItem stub:
      getItem = sinon.stub(context.kango.storage, 'getItem');
      getItem.withArgs('userjs_empty.user.js').returns(emptyJs);
      getItem.withArgs('userjs_unexisting.user.js').returns(null);
    });

    /**
     * Test for the Script.prototype.toString method
     */
    it('has an unique string representation', function () {
      var script = new Script('empty.user.js', 'example script');
      script.toString().should.be.equal('[object Script]');
    });

    after(function () {
      // Restoring the getItem method:
      context.kango.storage.getItem.restore();
    });
  });
});
