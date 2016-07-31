/**
 * @file Unit tests for the content-js background module
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

require('../background.js');
var sinon = require('sinon');
var assertStyles = require('../../assert-styles.js');
var expect = assertStyles.expect;
var fixtures = require('../../fixtures.js');

describe('content-js module', function () {
  describe('Script class', function () {
    // Reference to the sinon sandbox:
    var sandbox;

    beforeEach(function () {
      sandbox = sinon.sandbox.create();
      // Setting up the kango.storage.getItem stub:
      sandbox.stub(kango.storage, 'getItem');
      kango.storage.getItem
        .withArgs('userjs_empty.user.js')
        .returns(fixtures.storage.userjs_empty);
      kango.storage.getItem
        .withArgs('userjs_unexisting.user.js').returns(null);
      // Setting up the the kango.storage.setItem spy:
      sandbox.spy(kango.storage, 'setItem');
    });

    afterEach(function () {
      // Unwraping all stubs and spies:
      sandbox.restore();
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
        .calledWithExactly('userjs_empty.user.js',
          fixtures.storage.userjs_empty);
    });
  });
});
