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
  describe('CompetitionsWS class', function () {
    // Reference to the sinon sandbox:
    var sandbox;
    // Reference to the Competitions class instance:
    var competitions;

    beforeEach(function () {
      sandbox = sinon.sandbox.create();
      competitions = new CompetitionsWS;
      // Set the default server time delta to 1000 milliseconds:
      competitions._timeCorrection = 1000;
    });

    afterEach(function () {
      // Unwraping all stubs and spies:
      sandbox.restore();
    });

    it('should update the competition start time on the ' +
        '"gamelist/gameUpdated" socket event', function () {
      competitions._hash = {
        1337: {
          id: 1337,
          beginTime: null,
          ratingValue: 1,
        },
      };
      competitions._processUpdated({
        g: 1337,
        diff: {
          begintime: 1,
        },
      });
      expect(competitions._hash[1337].beginTime).to.be.equal(1);
      competitions._processUpdated({
        g: 1338,
        diff: {
          begintime: 2,
        },
      });
      expect(competitions._hash[1337].beginTime).to.be.equal(1);
    });

    it('should add competition data on the "gamelist/gameCreated" ' +
        'socket event');

    it('should process the gamelist data on the "gamelist/initList" ' +
        'socket event');

    it('should subscribe for gamelist changes if the user ' +
        'is authorized');

    it('should set the _timeCorrection field on the ServerTimeDelta event');
  });
});
