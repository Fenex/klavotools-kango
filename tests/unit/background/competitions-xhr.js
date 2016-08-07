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
  describe('CompetitionsXHR class', function () {
    // Reference to the sinon sandbox:
    var sandbox;
    // Reference to the Competitions class instance:
    var competitions;

    beforeEach(function () {
      sandbox = sinon.sandbox.create();
      competitions = new CompetitionsXHR;
    });

    afterEach(function () {
      // Unwraping all stubs and spies:
      sandbox.restore();
    });

    it('should fetch gamelist data with the _fetchData() method');

    it('should reject a _fetchData promise if the gamelist data ' +
        'is not available');

    it('should set the server time delta with the _check() method');

    it('should call the check() method again after 10 seconds, ' +
        'if an error has occured');

    it('should call the check() method again after 2 minutes, ' +
        'if no competitions were found');

    it('should process a gamelist data with the _processGamelist() ' +
        'method');

    it('should add a competition data with the _processCompetition() ' +
        'method');

    it('should call the check() method with a 2 minutes delay after ' +
        'the competition start');

    it('should call the check() method within the _setParams() method');
  });
});
