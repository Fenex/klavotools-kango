/**
 * Unit tests for the competitions background module
 *
 * @author Daniil Filippov aka agile <filippovdaniil@gmail.com>
 */

var Q = require('q');
var sinon = require('sinon');
var assertStyles = require('../../assert-styles.js');
var environment = require('../../environment.js');

// Setting up the DeferredNotification mock:
environment.DeferredNotification = function (title) {};

var context = require('../../loader.js') (
  'klavotools/background/competitions.js',
  environment
);

var expect = assertStyles.expect;

var Competitions = context.Competitions;

describe('competitions module', function () {
  describe('Competitions class', function () {
    // Reference to the kango.storage.getItem stub:
    var getItem;
    // Reference to the kango.storage.setItem spy:
    var setItem;

    beforeEach(function () {
      // Setting up the kango.storage.getItem stub:
      getItem = sinon.stub(context.kango.storage, 'getItem');
      // Setting up the the kango.storage.setItem spy:
      setItem = sinon.spy(context.kango.storage, 'setItem');
    });

    /**
     * Test for the class constructor
     */
    it('should set the correct default settings', function () {
      var competitions = new Competitions;
      expect(competitions.rates).to.be.deep.equal([3, 5]);
      expect(competitions.delay).to.be.equal(60);
      expect(competitions.displayTime).to.be.equal(0);
    });

    /**
     * Test for the Competitions.prototype.getParams method
     */
    it('should return the correct settings with the getParams() method', function () {
      getItem.withArgs('competition_rates').returns([1, 2, 3, 5]);
      getItem.withArgs('competition_delay').returns(15);
      getItem.withArgs('competition_displayTime').returns(5);
      var competitions = new Competitions;
      expect(competitions.getParams()).to.be.deep.equal({
        rates: [1, 2, 3, 5],
        delay: 15,
        displayTime: 5,
      });
    });

    /**
     * Test for the Competitions.prototype.setParams method
     */
    it('should save the correct settings to storage with the setParams() method', function () {
      var competitions = new Competitions;
      // Checking the invalid parameters:
      competitions.setParams({
        delay: null,
        rates: null,
        displayTime: null,
      });
      // sinon-chai doesn't support neverCalledWithMatch :(
      sinon.assert.neverCalledWithMatch(setItem, sinon.match.string, null);
      // Checking the valid parameters:
      competitions.setParams({
        delay: 15,
        rates: [1, 2, 3, 5],
        displayTime: 5,
      });
      expect(setItem)
        .to.have.been.calledWithExactly('competition_delay', 15)
        .to.have.been.calledWithExactly('competition_rates', [1, 2, 3, 5])
        .to.have.been.calledWithExactly('competition_displayTime', 5);
    });

    afterEach(function () {
      // Unwraping all stubs and spies:
      context.kango.storage.getItem.restore();
      context.kango.storage.setItem.restore();
    });
  });
});
