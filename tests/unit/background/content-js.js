/**
 * Unit tests for the content-js background module
 *
 * @author Daniil Filippov aka agile <filippovdaniil@gmail.com>
 */

var sinon = require('sinon');
var assertStyles = require('../../assert-styles.js');
var environment = require('../../environment.js');
var fixtures = require('../../fixtures.js');

var context = require('../../loader.js') (
  'klavotools/background/content-js.js',
  environment
);

var expect = assertStyles.expect;

var Script = context.Script;
var UserJS = context.UserJS;
var kango = context.kango;

describe('content-js module', function () {
  describe('Script class', function () {
    // Reference to the sinon sandbox:
    var sandbox;
    // Reference to a fixture representing an empty userscript in the kango
    // storage:
    var emptyUserScript;

    before(function () {
      sandbox = sinon.sandbox.create();
      // Loading localStorage fixtures for the Script class:
      emptyUserScript = fixtures.fromLocalStorage('userjs_empty.user.js');
      // Setting up the kango.storage.getItem stub:
      sandbox.stub(kango.storage, 'getItem');
      kango.storage.getItem
        .withArgs('userjs_empty.user.js').returns(emptyUserScript);
      kango.storage.getItem
        .withArgs('userjs_unexisting.user.js').returns(null);
      // Setting up the the kango.storage.setItem spy:
      sandbox.spy(kango.storage, 'setItem');
    });

    /**
     * Test for the Script.prototype.toString method
     */
    it('has an unique string representation', function () {
      var script = new Script('empty.user.js', 'empty script');
      expect(script.toString()).to.be.equal('[object Script]');
    });

    /**
     * Test for the Script.prototype.save method
     */
    it('should correctly save the userscript to storage', function () {
      var script = new Script('empty.user.js', 'empty script');
      script.save();
      expect(kango.storage.setItem)
        .to.have.been
        .calledWithExactly('userjs_empty.user.js', emptyUserScript);
    });

    after(function () {
      // Unwraping all stubs and spies:
      sandbox.restore();
    });
  });
});
