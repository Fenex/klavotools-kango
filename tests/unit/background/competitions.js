/**
 * @file Unit tests for the competitions background module
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

var sinon = require('sinon');
var assertStyles = require('../../assert-styles.js');
var expect = assertStyles.expect;
var fixtures = require('../../fixtures.js');
var loadModule = require('../../loader.js');

describe('competitions module', function () {
  describe('Competitions class', function () {
    // Reference to the sinon sandbox:
    var sandbox;

    before(function () {
      loadModule('klavotools/background/competitions.js')
        .loadDependency('klavotools/background/deferred-notification.js');
    });

    beforeEach(function () {
      sandbox = sinon.sandbox.create();
      sandbox.useFakeTimers();
      // Setting up stubs and spies for the kango mock object:
      sandbox.stub(kango.storage, 'getItem');
      sandbox.stub(kango.xhr, 'send');
      sandbox.spy(kango.storage, 'setItem');
      sandbox.spy(kango.browser.tabs, 'create');
      // Setting up spies for the Competitions.prototype:
      sandbox.spy(Competitions.prototype, 'activate');
      sandbox.spy(Competitions.prototype, 'deactivate');
      sandbox.spy(Competitions.prototype, 'check');
      // Setting up a spy for the DeferredNotification class constructor:
      sandbox.spy(global, 'DeferredNotification');
      sandbox.stub(DeferredNotification.prototype, 'revoke');
      sandbox.stub(DeferredNotification.prototype, 'show');
    });

    afterEach(function () {
      // Unwraping all stubs and spies:
      sandbox.restore();
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
        'if the delay or the list of rates are disabled', function () {
      var competitions = new Competitions;
      competitions.setParams({ delay: 0 });
      competitions.setParams({ rates: [] });
      expect(Competitions.prototype.activate).to.have.been.calledOnce;
      expect(Competitions.prototype.deactivate)
        .to.have.been.calledTwice
        .to.have.been.calledAfter(Competitions.prototype.activate);
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
    it('should call the check() method after 10 seconds, ' +
        'if the server\'s response code is not equal to 200', function () {
      kango.xhr.send.yields({
        status: 403,
        response: '',
      });
      var competitions = new Competitions;
      sandbox.clock.tick(10 * 1000);
      expect(Competitions.prototype.check).to.have.been.calledTwice;
    });

    it('should call the check() method after 10 seconds, ' +
        'if there are no competitions at the moment', function () {
      kango.xhr.send.yields(fixtures.xhr.competition({
        competition: undefined,
      }));
      var competitions = new Competitions;
      sandbox.clock.tick(10 * 1000);
      expect(Competitions.prototype.check).to.have.been.calledTwice;
    });

    it('should call the check() method after 2 minutes, ' +
        'if the current competition is already started', function () {
      kango.xhr.send.yields(fixtures.xhr.competition({
        beginTime: 0,
      }));
      var competitions = new Competitions;
      sandbox.clock.tick(120 * 1000);
      expect(Competitions.prototype.check).to.have.been.calledTwice;
    });

    it('should call the check() method 2 minutes ' +
        'after the start of the competition', function () {
      kango.xhr.send.yields(fixtures.xhr.competition({
        beginTime: 300,
      }));
      var competitions = new Competitions;
      sandbox.clock.tick(300 * 1000);
      expect(Competitions.prototype.check).to.have.been.calledOnce;
      sandbox.clock.tick(120 * 1000);
      expect(Competitions.prototype.check).to.have.been.calledTwice;
    });

    it('should create the "deferred" notification ' +
        'with the correct parameters', function () {
      kango.xhr.send.yields(fixtures.xhr.competition({
        id: 100500,
        rate: 5,
        beginTime: 400,
      }));
      var competitions = new Competitions;
      expect(DeferredNotification)
        .to.have.been.calledWithExactly('Соревнование', {
          body: 'Соревнование x5 начинается',
          // TODO: set the stub for the kango.io.getResourceUrl
          icon: undefined,
          displayTime: undefined,
        });
      // Default delay is set to 1 minute:
      expect(DeferredNotification.prototype.show)
        .to.have.been.calledWithExactly(340);
      // Check the notification's click handler:
      competitions.notification.onclick();
      expect(kango.browser.tabs.create)
        .to.have.been.calledWithExactly({
          url: 'http://klavogonki.ru/g/?gmid=100500',
          focused: true,
        });
      // Check the case with a huge displayTime:
      kango.storage.getItem.withArgs('competition_displayTime').returns(500);
      competitions = new Competitions;
      expect(DeferredNotification)
        .to.have.been.calledWithExactly('Соревнование', {
          body: 'Соревнование x5 начинается',
          icon: undefined,
          // displayTime == delay:
          displayTime: 60,
        });
      // Check the case with a huge delay:
      kango.storage.getItem.withArgs('competition_delay').returns(500);
      competitions = new Competitions;
      expect(DeferredNotification.prototype.show)
        .to.have.been.calledWithExactly(1);
    });

    it('should revoke the notification with the click on it', function () {
      kango.xhr.send.yields(fixtures.xhr.competition({
        beginTime: 400,
        rate: 5,
      }));
      var competitions = new Competitions;
      sandbox.clock.tick(340 * 1000);
      competitions.notification.onclick();
      expect(DeferredNotification.prototype.revoke).to.have.been.called;
    });

    it('should show the notifications only for selected rates', function () {
      kango.xhr.send
        .onFirstCall().yields(fixtures.xhr.competition({
          rate: 2,
        }))
        .onSecondCall().yields(fixtures.xhr.competition({
          rate: 3,
        }));
      var competitions = new Competitions;
      expect(DeferredNotification).to.have.not.been.called;
      competitions.check();
      expect(DeferredNotification).to.have.been.called;
    });
  });
});
