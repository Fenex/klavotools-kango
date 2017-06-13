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
      competitions = new Competitions;
      // Set the default server time delta to 1000 milliseconds:
      competitions._timeCorrection = 1000;
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
      expect(competitions.audio).to.be.equal(false);
    });

    /**
     * Test for the Competitions.prototype.getParams method
     */
    it('should return the correct settings with the getParams() method', function () {
      kango.storage.getItem.withArgs('competition_rates').returns([1, 2, 3, 5]);
      kango.storage.getItem.withArgs('competition_delay').returns(15);
      kango.storage.getItem.withArgs('competition_displayTime').returns(5);
      kango.storage.getItem.withArgs('competition_audio').returns(false);
      competitions = new Competitions;
      expect(competitions.getParams()).to.be.deep.equal({
        rates: [1, 2, 3, 5],
        delay: 15,
        displayTime: 5,
        audio: false
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
        audio: null
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
        audio: false
      });
      expect(kango.storage.setItem)
        .to.have.been.calledWithExactly('competition_delay', 15)
        .to.have.been.calledWithExactly('competition_rates', [1, 2, 3, 5])
        .to.have.been.calledWithExactly('competition_displayTime', 5)
        .to.have.been.calledWithExactly('competition_audio', false);
    });

    it('should call the _updateNotifications() method within ' +
        'the setParams() method', function () {
      var competitions = new Competitions;
      competitions.setParams({ delay: 15 });
      competitions.setParams({ displayTime: 5 });
      expect(Competitions.prototype._updateNotifications).to.have.been.calledTwice;
    });

    it('should recreate deferred notifications instances with the for ' +
        'active competitions', function () {
      var spy1 = new DeferredNotification('test1');
      var spy2 = new DeferredNotification('test2');
      sandbox.stub(Competitions.prototype, 'getRemainingTime').returns(1000);
      competitions._hash = {
        1337: {
          id: 1337,
          beginTime: null,
          ratingValue: 1,
        },
        1338: {
          id: 1338,
          // For this test doesn't matter:
          beginTime: 0,
          ratingValue: 3,
          notification: spy1,
        },
        1339: {
          id: 1339,
          beginTime: 0,
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

    it('should create the "deferred" notification with correct parameters', function () {
      var competitionData = {
        id: 1337,
        ratingValue: 5,
        // For this test doesn't matter:
        beginTime: 0,
      };
      var notification = competitions._createNotification(competitionData, 400);
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
      // TODO: Check the notification's click handler:
      // notification.onclick();
      // expect(kango.browser.tabs.create)
      //   .to.have.been.calledWithExactly({
      //     url: 'http://klavogonki.ru/g/?gmid=1337',
      //     focused: true,
      //   });
      // Check the case with a huge displayTime:
      kango.storage.getItem.withArgs('competition_displayTime').returns(500);
      competitions = new Competitions;
      var notification = competitions._createNotification(competitionData, 400);
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
      var notification = competitions._createNotification(competitionData, 400);
      expect(DeferredNotification.prototype.show)
        .to.have.been.calledWithExactly(0);
    });

    it('should revoke the notification with the click on it', function () {
      var competitionData = {
        id: 1337,
        ratingValue: 5,
        // For this test doesn't matter:
        beginTime: 0,
      };
      var notification = competitions._createNotification(competitionData, 400);
      notification.onclick();
      expect(DeferredNotification.prototype.revoke).to.have.been.called;
    });

    it('should correctly calculate the remaining time before the ' +
        'competition start', function () {
      sandbox.clock.tick(1470230514177);
      // The default server time delta is set to 1000 milliseconds:
      expect(competitions.getRemainingTime(1470230614)).to.be.equal(99);
      expect(competitions.getRemainingTime('2016-08-03T13:23:34.000Z')).to.be.equal(99);
    });

    it('should throw an error for invalid competition begin time or ' +
        'server time delta', function () {
      sandbox.clock.tick(1470230514177);
      expect(competitions.getRemainingTime.bind(competitions, null)).to.throw(TypeError);
      competitions._timeCorrection = null;
      expect(competitions.getRemainingTime.bind(competitions, 1470230614))
        .to.throw(Error);
    });

    it('should delete already started competitions with _clearStarted() ' +
        'method', function () {
      sandbox.clock.tick(2 * 1e3);
      competitions._hash = {
        1337: {
          id: 1337,
          beginTime: null,
          ratingValue: 1,
        },
        1338: {
          id: 1338,
          beginTime: 0,
          ratingValue: 3,
        },
        1339: {
          id: 1339,
          beginTime: 5,
          ratingValue: 5,
        },
      };
      competitions._clearStarted();
      expect(competitions._hash[1337]).to.be.an('object');
      expect(competitions._hash[1338]).to.be.undefined;
      expect(competitions._hash[1339]).to.be.an('object');
    });

    it('should show the notifications only for selected rates', function () {
      sandbox.stub(Competitions.prototype, 'getRemainingTime').returns(1000);
      kango.storage.getItem.withArgs('competition_rates').returns([2, 3, 5]);
      competitions = new Competitions;
      competitions._hash = {
        1337: {
          id: 1337,
          beginTime: 0,
          ratingValue: 1,
        },
        1338: {
          id: 1338,
          beginTime: 0,
          ratingValue: 2,
        },
        1339: {
          id: 1339,
          beginTime: 0,
          ratingValue: 3,
        },
        1340: {
          id: 1340,
          beginTime: 0,
          ratingValue: 5,
        },
      };
      competitions._notify(1337);
      competitions._notify(1338);
      competitions._notify(1339);
      competitions._notify(1340);
      expect(Competitions.prototype._createNotification).to.have.been.calledThrice;
    });

    it('should not show notifications if the delay is set to zero', function () {
      sandbox.stub(Competitions.prototype, 'getRemainingTime').returns(1000);
      kango.storage.getItem.withArgs('competition_delay').returns(0);
      competitions = new Competitions;
      competitions._hash = {
        1337: {
          id: 1338,
          beginTime: 0,
          ratingValue: 3,
        },
        1338: {
          id: 1339,
          beginTime: 5,
          ratingValue: 5,
        },
      };
      competitions._notify(1337);
      competitions._notify(1338);
      expect(Competitions.prototype._createNotification).to.not.been.called;
    });

    it('should revoke all notifications on teardown');
  });
});
