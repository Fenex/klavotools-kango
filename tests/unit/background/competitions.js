/**
 * Unit tests for the competitions background module
 *
 * @author Daniil Filippov aka agile <filippovdaniil@gmail.com>
 */

var sinon = require('sinon');
var assertStyles = require('../../assert-styles.js');
var expect = assertStyles.expect;
var loadModule = require('../../loader.js');

describe('competitions module', function () {
  describe('Competitions class', function () {
    // Reference to the sinon sandbox:
    var sandbox;

    before(function () {
      // Setting up the DeferredNotification mock:
      global.DeferredNotification = function (title) {};
      global.DeferredNotification.prototype.revoke = function () {};
      loadModule('klavotools/background/competitions.js');
    });

    beforeEach(function () {
      sandbox = sinon.sandbox.create();
      sandbox.useFakeTimers();
      // Setting up stubs and spies for the kango mock object:
      sandbox.stub(kango.storage, 'getItem');
      sandbox.stub(kango.xhr, 'send');
      sandbox.spy(kango.storage, 'setItem');
      // Setting up spies for the Competitions.prototype:
      sandbox.spy(Competitions.prototype, 'activate');
      sandbox.spy(Competitions.prototype, 'deactivate');
      sandbox.spy(Competitions.prototype, 'check');
    });

    afterEach(function () {
      // Unwraping all stubs and spies:
      sandbox.restore();
    });

    after(function () {
      // Clean the global scope:
      delete global.DeferredNotification;
    });

    /**
     * Tests for the Competitions class constructor
     */
    it('should set the correct default settings', function () {
      var competitions = new Competitions;
      expect(competitions.rates).to.be.deep.equal([3, 5]);
      expect(competitions.delay).to.be.equal(60);
      expect(competitions.displayTime).to.be.equal(0);
    });

    it('should not call activate() method if delay or list of rates are not set', function () {
      kango.storage.getItem.withArgs('competition_rates').onFirstCall().returns([]);
      var competitions = new Competitions;
      expect(Competitions.prototype.activate).to.have.not.been.called;
      kango.storage.getItem.withArgs('competition_delay').returns(0);
      competitions = new Competitions;
      expect(Competitions.prototype.activate).to.have.not.been.called;
    });

    /**
     * Test for the Competitions.prototype.getParams method
     */
    it('should return the correct settings with the getParams() method', function () {
      kango.storage.getItem.withArgs('competition_rates').returns([1, 2, 3, 5]);
      kango.storage.getItem.withArgs('competition_delay').returns(15);
      kango.storage.getItem.withArgs('competition_displayTime').returns(5);
      var competitions = new Competitions;
      expect(competitions.getParams()).to.be.deep.equal({
        rates: [1, 2, 3, 5],
        delay: 15,
        displayTime: 5,
      });
    });

    /**
     * Tests for the Competitions.prototype.setParams method
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
      sinon
        .assert
        .neverCalledWithMatch(kango.storage.setItem, sinon.match.string, null);
      // Checking the valid parameters:
      competitions.setParams({
        delay: 15,
        rates: [1, 2, 3, 5],
        displayTime: 5,
      });
      expect(kango.storage.setItem)
        .to.have.been.calledWithExactly('competition_delay', 15)
        .to.have.been.calledWithExactly('competition_rates', [1, 2, 3, 5])
        .to.have.been.calledWithExactly('competition_displayTime', 5);
    });

    it('should call deactivate() method within the setParams() ' +
        'if the delay or the list of rates are not set', function () {
      var competitions = new Competitions;
      competitions.setParams({ delay: 0 });
      competitions.setParams({ rates: [] });
      expect(Competitions.prototype.deactivate).to.have.been.calledTwice;
    });

    it('should "reactivate" the state within the setParams() method ' +
        'if the delay or the displayTime are set', function () {
      var competitions = new Competitions;
      competitions.setParams({ delay: 15 });
      competitions.setParams({ displayTime: 5 });
      expect(Competitions.prototype.deactivate).to.have.been.calledTwice;
      expect(Competitions.prototype.activate)
        .to.have.been.calledAfter(Competitions.prototype.deactivate);
    });

    /**
     * Test for the Competitions.prototype.activate method
     */
    it('should call the check() method with the activate() only once', function () {
      var competitions = new Competitions;
      competitions.activate();
      competitions.activate();
      expect(Competitions.prototype.check).to.have.been.calledOnce;
    });

    /**
     * Test for the Competitions.prototype.deactivate method
     */
    it('should revoke an existing notification with the deactivate() method', function () {
      var competitions = new Competitions;
      competitions.notification = {};
      // TODO: is this the best way to check the revoke method was called before
      // the notification object will be set to null?
      var notificationRevoked = false;
      competitions.notification.revoke = function () {
        notificationRevoked = true;
      };
      competitions.deactivate();
      expect(notificationRevoked).to.be.equal(true);
    });

    /**
     * Tests for the Competitions.prototype.check method
     */
    it('should call the check() method again, ' +
        'if the server response code not equal to 200');

    it('should call the check() method after 10 seconds, ' +
        'if there are no competitions at the moment', function () {
      kango.xhr.send.yields({
        status: 200,
        response: { gamelist: [{ params: { competition: false } }] },
      });
      var competitions = new Competitions;
      sandbox.clock.tick(10 * 1000);
      expect(Competitions.prototype.check).to.have.been.calledTwice;
    });
  });
});
