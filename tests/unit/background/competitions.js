/**
 * @file Unit tests for the competitions background module
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

require('../background.js');
var sinon = require('sinon');
var assertStyles = require('../../assert-styles.js');
var expect = assertStyles.expect;
var fixtures = require('../../fixtures.js');

describe('competitions module', function () {
  describe('Competitions class', function () {
    // Reference to the sinon sandbox:
    var sandbox;
    // Reference to the Competitions class instance:
    var competitions;

    beforeEach(function () {
      sandbox = sinon.sandbox.create();
      sandbox.useFakeTimers();
      // Setting up stubs and spies for the kango mock object:
      sandbox.stub(kango.storage, 'getItem');
      sandbox.stub(kango.xhr, 'send');
      sandbox.spy(kango.storage, 'setItem');
      sandbox.spy(kango.browser.tabs, 'create');
      sandbox.spy(Competitions.prototype, '_updateNotifications');
      sandbox.spy(Competitions.prototype, '_createNotification');
      // Setting up a spy for the DeferredNotification class constructor:
      sandbox.spy(global, 'DeferredNotification');
      sandbox.stub(DeferredNotification.prototype, 'revoke');
      sandbox.stub(DeferredNotification.prototype, 'show');
      sandbox.stub(Auth.prototype, 'getServerTimeDelta');
      // Set the default server time correction to 1 second:
      Auth.prototype.getServerTimeDelta.returns(1000);
      competitions = new Competitions;
    });

    afterEach(function () {
      // Unwraping all stubs and spies:
      sandbox.restore();
    });

    /**
     * Tests for the Competitions class constructor
     */
    it('should set the correct default settings', function () {
      expect(competitions.rates).to.be.deep.equal([3, 5]);
      expect(competitions.delay).to.be.equal(60);
      expect(competitions.displayTime).to.be.equal(0);
    });

    /**
     * Test for the Competitions.prototype.getParams method
     */
    it('should return the correct settings with the getParams() method', function () {
      kango.storage.getItem.withArgs('competition_rates').returns([1, 2, 3, 5]);
      kango.storage.getItem.withArgs('competition_delay').returns(15);
      kango.storage.getItem.withArgs('competition_displayTime').returns(5);
      competitions = new Competitions;
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

    it('should call the _updateNotifications() method within ' +
        'the setParams() method', function () {
      var competitions = new Competitions;
      competitions.setParams({ delay: 15 });
      competitions.setParams({ displayTime: 5 });
      expect(Competitions.prototype._updateNotifications).to.have.been.calledTwice;
    });

    it('should recreate deferred notifications instances with the ' +
        '_updateNotifications() method for active competitions', function () {
      var spy1 = new DeferredNotification('test1');
      var spy2 = new DeferredNotification('test2');
      competitions._hash = {
        1337: {
          id: 1337,
          beginTime: null,
          ratingValue: 1,
        },
        1338: {
          id: 1338,
          beginTime: 1000,
          ratingValue: 3,
          notification: spy1,
        },
        1339: {
          id: 1339,
          beginTime: 3000,
          ratingValue: 5,
          notification: spy2,
        },
      }
      competitions._updateNotifications();
      expect(spy1.revoke).to.have.been.called;
      expect(spy2.revoke).to.have.been.called;
      expect(Competitions.prototype._createNotification).to.have.been.calledTwice;
      expect(competitions._hash[1338].notification)
        .to.be.an.instanceOf(DeferredNotification)
        .to.be.not.deep.equal(spy1);
      expect(competitions._hash[1339].notification)
        .to.be.an.instanceOf(DeferredNotification)
        .to.be.not.deep.equal(spy2);
    });

    it('should create the "deferred" notification ' +
        'with the correct parameters', function () {
      kango.xhr.send.yields(fixtures.xhr.competition({
        id: 100500,
        rate: 5,
        beginTime: 400,
      }));
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
      expect(DeferredNotification).to.have.not.been.called;
      competitions.check();
      expect(DeferredNotification).to.have.been.called;
    });
  });
});
