/**
 * @file Unit tests for the auth background module.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

require('../background.js');
var sinon = require('sinon');
var assertStyles = require('../../assert-styles.js');
var fixtures = require('../../fixtures.js');
var expect = assertStyles.expect;

describe('auth module', function () {
  describe('Auth class', function () {
    // Reference to the sinon sandbox:
    var sandbox;
    // Reference to the Auth class instance:
    var auth;

    beforeEach(function () {
      sandbox = sinon.sandbox.create();
      sandbox.useFakeTimers();
      sandbox.stub(Socket.prototype, 'on');
      sandbox.stub(Socket.prototype, 'connect');
      sandbox.stub(Socket.prototype, 'disconnect');
      sandbox.stub(kango.xhr, 'send');
      auth = new Auth;
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('should proxy on() calls to the Socket class instance', function (){
      auth.on('someEvent1', function () {});
      expect(Socket.prototype.on)
        .to.have.been.calledWithExactly('someEvent1', sinon.match.func);
    });

    it('should fetch the user session state properly', function () {
      kango.xhr.send
        .onSecondCall().yields({
          status: 200,
          response: fixtures.xhr.page_constant_me,
        })
        .onThirdCall().yields({
          status: 200,
          response: fixtures.xhr.page_constant_me_null,
        });
      return Promise.all([
        expect(auth._fetchState())
          .to.be.fulfilled
          .to.eventually.be.deep.equal({
            id: 1337,
            login: 'admin',
            one_shot_hash: '1337',
          }),
        expect(auth._fetchState())
          .to.be.fulfilled
          .to.eventually.be.deep.equal({})
      ]);
    });

    it('should reject _fetchState() promise if any error occured ' +
        'while fetching the user session state', function () {
      kango.xhr.send.onSecondCall().yields({
        status: 200,
        response: '',
      });
      return expect(auth._fetchState()).to.be.rejectedWith(TypeError);
    });

    it('should call login() method for 10 times before giving up ' +
        'with relogin() method')

    it('should broadcast the AuthStateChanged event to all scripts with ' +
        '_broadcastStateChange() method');

    it('should broadcast the user session state after fetching');

    it('should broadcast the user session state on logout()');

    it('should create a WebSocket connection if the user is authorized');

    it('should close current WebSocket connection with logout() method');
  });
});
