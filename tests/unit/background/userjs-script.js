/**
 * @file Unit tests for the Script background module
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

require('../background.js');
var sinon = require('sinon');
var _Q = require('q');
var assertStyles = require('../../assert-styles.js');
var expect = assertStyles.expect;
var fixtures = require('../../fixtures.js');

describe('userjs module', function () {
  describe('Script class', function () {
    // Reference to the sinon sandbox:
    var sandbox;

    beforeEach(function () {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('should throw an error if the updateUrl was not specified', function () {
      var dummy = function () { new Script({ badData: true }); };
      expect(dummy).to.throw(Error);
      dummy = function () { new Script({ updateUrl: 'http://klavogonki.ru/' }); };
      expect(dummy).to.not.throw();
    });

    it('should save passed data to the instance properties', function () {
      var script = new Script({
        updateUrl: 'http://klavogonki.ru',
        foo: 1,
        bar: 2,
      });
      expect(script.foo).to.be.equal(1);
      expect(script.bar).to.be.equal(2);
    });

    it('should save the keys of the passed hash object', function () {
      var script = new Script({
        updateUrl: 'http://klavogonki.ru',
        foo: 1,
        bar: 2,
      });
      expect(script._keys).to.be.deep.equal(['code', 'updateUrl', 'foo', 'bar']);
    });

    it('should set the loaded field to the source code promise', function () {
      sandbox.stub(kango.xhr, 'send').yields({ response: 'source', status: 200 });
      var script = new Script({ updateUrl: 'http://klavogonki.ru' });
      return expect(script.loaded).to.be.eventually.equal('source');
    });

    it('should call the _setIncludes() method after obtaining ' +
        'the source code', function () {
      sandbox.spy(Script.prototype, '_setIncludes');
      var script1 = new Script({ updateUrl: 'http://klavogonki.ru', code: 'source' });
      var promise1 = script1.loaded;
      sandbox.stub(kango.xhr, 'send').yields({ response: 'source', status: 200 });
      var script2 = new Script({ updateUrl: 'http://klavogonki.ru' });
      var promise2 = script2.loaded;
      return promise1.then(function () {
        expect(Script.prototype._setIncludes).to.have.been.calledWithExactly('source');
      }).then(promise2).then(function () {
        expect(Script.prototype._setIncludes).to.have.been.calledWithExactly('source');
      });
    });

    it('should correctly set RegExp objects with the _setIncludes() method', function () {
      var source = fixtures.userscripts.includes;
      var script = new Script({ updateUrl: 'http://klavogonki.ru', code: source });
      return script.loaded.then(function () {
        expect(script.includes).to.be.deep.equal([
          new RegExp('http:\/\/example\\.com\/.*'),
          new RegExp('https:\/\/.*\\.example2\\.com\/\\?somePage=1'),
        ]);
      });
    });

    it('should return correct boolean with the shouldBeIncluded() method', function () {
      var source = fixtures.userscripts.includes;
      var script = new Script({ updateUrl: 'http://klavogonki.ru', code: source });
      return script.loaded.then(function () {
        script.disabled = true;
        expect(script.shouldBeIncluded('http://example.com/abc')).to.be.equal(false);
        script.disabled = false;
        expect(script.shouldBeIncluded('http://example.com/abc')).to.be.equal(true);
        expect(script.shouldBeIncluded('https://test.example2.com/?somePage=1&test=2'))
          .to.be.equal(true);
      });
    });

    it('should set the code field within the update() method call', function () {
      sandbox.stub(kango.xhr, 'send').yields({ response: 'source', status: 200 });
      var source = fixtures.userscripts.includes;
      var script = new Script({ updateUrl: 'http://klavogonki.ru', code: source });
      return script.update().then(function (code) {
        expect(code).to.be.equal('source');
        expect(script.code).to.be.equal('source');
      });
    });

    it('should have a custom JSON serialization method', function () {
      var source = fixtures.userscripts.includes;
      var script = new Script({ updateUrl: 'http://klavogonki.ru', code: source, foo: 1 });
      expect(script.toJSON()).to.be.deep.equal({
        updateUrl: 'http://klavogonki.ru',
        code: source,
        foo: 1,
      });
    });
  });
});
