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
    // Reference to the kango.storage.setItem spy:
    var setItem;
    // Reference to a fixture representing an empty userscript in the kango
    // storage:
    var emptyUserScript;

    before(function () {
      // Loading localStorage fixtures for the Script class:
      var fixtures = environment.fixtures;
      emptyUserScript = fixtures.fromLocalStorage('userjs_empty.user.js');
      // Setting up the kango.storage.getItem stub:
      getItem = sinon.stub(context.kango.storage, 'getItem');
      getItem.withArgs('userjs_empty.user.js').returns(emptyUserScript);
      getItem.withArgs('userjs_unexisting.user.js').returns(null);
      // Setting up the the kango.storage.setItem spy:
      setItem = sinon.spy(context.kango.storage, 'setItem');
    });

    /**
     * Test for the Script.prototype.toString method
     */
    it('has an unique string representation', function () {
      var script = new Script('empty.user.js', 'empty script');
      script.toString().should.be.equal('[object Script]');
    });

    /**
     * Test for the Script.prototype.save method
     */
    it('should correctly save the userscript to storage', function () {
      var script = new Script('empty.user.js', 'empty script');
      script.save();
      setItem
        .should.have.been
        .calledWithExactly('userjs_empty.user.js', emptyUserScript);
    });

    after(function () {
      // Unwraping all stubs and spies:
      context.kango.storage.getItem.restore();
      context.kango.storage.setItem.restore();
    });
  });
});
