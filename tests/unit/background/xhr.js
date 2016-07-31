/**
 * @file Unit tests for the xhr global function.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

require('../background.js');
var sinon = require('sinon');
var assertStyles = require('../../assert-styles.js');
var expect = assertStyles.expect;

describe('xhr module', function () {
  describe('xhr function', function () {
    // Reference to the sinon sandbox:
    var sandbox;

    beforeEach(function () {
      sandbox = sinon.sandbox.create();
      sandbox.spy(global, 'xhr');
      sandbox.stub(kango.xhr, 'send');
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('should perform a simple GET-request if only URL string is given', function () {
      xhr('http://klavogonki.ru');
      var settingsMatch = { url: 'http://klavogonki.ru', method: 'GET' };
      expect(kango.xhr.send)
        .to.have.been.calledWithExactly(settingsMatch, sinon.match.func);
      xhr({ url: 'http://klavogonki.ru' });
      expect(kango.xhr.send)
        .to.have.been.calledWithExactly(settingsMatch, sinon.match.func);
    });

    it('should call the kango.xhr.send() method with correct parameters', function () {
      var settings = {
        method: 'POST',
        url: 'http://klavogonki.ru',
        params: { p1: 1, p2: 2 },
        headers: { 'Cache-Control': 'max-age=0' },
        contentType: 'text',
        username: 'anonymous',
        password: '1337',
        mimeType: 'text/plain; charset=x-user-defined',
      };
      xhr(settings);
      expect(kango.xhr.send)
        .to.have.been.calledWithExactly(settings, sinon.match.func);
    });

    it('should throw a TypeError, if the URL is not specified', function () {
      expect(xhr).to.throw(TypeError);
      expect(xhr.bind(null, { method: 'POST' })).to.throw(TypeError);
    });

    it('should fulfill promise if the HTTP status is ' +
        'in the range [100, 399]', function () {
      kango.xhr.send
        .onFirstCall().yields({ status: 102, response: 'http://klavogonki.ru' })
        .onSecondCall().yields({ status: 202, response: 'http://klavogonki.ru' })
        .onThirdCall().yields({ status: 302, response: 'http://klavogonki.ru' });
      return expect(xhr('http://klavogonki.ru').then(xhr).then(xhr)).to.be.fulfilled;
    });

    it('should reject promise if the HTTP status is not ' +
        'in the range [100, 399]', function () {
      kango.xhr.send
        .onFirstCall().yields({ status: 0, response: 'Network error' })
        .onSecondCall().yields({ status: 402, response: 'Payment Required' })
        .onThirdCall().yields({ status: 502, response: 'Bad Gateway' });
      return Promise.all([
        expect(xhr('http://klavogonki.ru')).to.be.rejected,
        expect(xhr('http://klavogonki.ru')).to.be.rejected,
        expect(xhr('http://klavogonki.ru')).to.be.rejected,
      ]);
    });

  })
});
