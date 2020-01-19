/**
 * @file Unit tests for the UserJS background module
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

require('../background.js');
var sinon = require('sinon');
var assertStyles = require('../../assert-styles.js');
var expect = assertStyles.expect;
var fixtures = require('../../fixtures.js');

describe('userjs module', function () {
  describe('UserJS class', function () {
    // Reference to the sinon sandbox:
    var sandbox;
    // Reference to the UserJS class instance:
    var userjs;
    // Reference to the correct processed configuration for the fixtures.userscript.config:
    var processedConfig;
    // Reference to the correct processed configuration clone object:
    var processedConfigClone;

    beforeEach(function () {
      sandbox = sinon.sandbox.create();
      sandbox.useFakeTimers();
      userjs = new UserJS;
      var baseUrl = KlavoTools.const.USERJS_DIRECTORY_URL;
      var json = JSON.parse(fixtures.userscripts.config);
      processedConfig = { script1: json[0], script2: json[1], script3: json[2] };
      processedConfig.script1.updateUrl = baseUrl + '/script1.user.js'
      processedConfig.script1.disabled = false;
      processedConfig.script1.broken = true;
      processedConfig.script1.conflicts = [];
      processedConfig.script1._ignoreUpdate = ['disabled'];
      processedConfig.script2.updateUrl = baseUrl + '/script2.user.js'
      processedConfig.script2.broken = false;
      processedConfig.script2.integrated = false;
      processedConfig.script2.conflicts = [];
      processedConfig.script2._ignoreUpdate = ['disabled'];
      processedConfig.script3.updateUrl = baseUrl + '/script3.user.js'
      processedConfig.script3.disabled = false;
      processedConfig.script3.broken = false;
      processedConfig.script3.integrated = false;
      processedConfig.script3._ignoreUpdate = ['disabled'];
      processedConfigClone = {};
      for (var key1 in processedConfig) {
        processedConfigClone[key1] = {};
        for (var key2 in processedConfig[key1]) {
          processedConfigClone[key1][key2] = processedConfig[key1][key2];
        }
      }
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('should fetch and correctly process the userscripts configuration from the ' +
        'repository', function () {
      var config = JSON.parse(fixtures.userscripts.config);
      sandbox.stub(kango.xhr, 'send').yields({ response: config, status: 200 });
      return expect(userjs._fetchConfig()).to.be.eventually.deep.equal(processedConfig);
    });

    it('should reject the _fetchConfig() method promise in the case ' +
        'of bad configuration data', function () {
      var config = fixtures.userscripts.config;
      sandbox.stub(kango.xhr, 'send').yields({ response: config, status: 200 });
      return expect(userjs._fetchConfig()).to.be.rejected;
    });

    it('should return correct userscripts for the given URL', function () {
      sandbox.stub(Script.prototype, 'shouldBeIncluded')
        .onFirstCall().returns(true)
        .onSecondCall().returns(false)
        .onThirdCall().returns(true);
      userjs._scripts.script1 = new Script({
        updateUrl: 'http://klavogonki.ru',
        code: 'source1',
      });
      userjs._scripts.script2 = new Script({
        updateUrl: 'http://klavogonki.ru',
        code: 'source2',
      });
      userjs._scripts.script3 = new Script({
        updateUrl: 'http://klavogonki.ru',
        code: 'source3',
      });
      var scripts = userjs.getScriptsForURL('http://klavogonki.ru/gamelist/');
      expect(Script.prototype.shouldBeIncluded).to.have.been.calledThrice
        .to.have.been.calledWithExactly('http://klavogonki.ru/gamelist/');
      expect(scripts).to.be.deep.equal([
        ['script1', void 0, 'source1'],
        ['script3', void 0, 'source3']
      ]);
    });

    it('should correctly update userscript data with the updateScriptData() ' +
        'method', function () {
      userjs._scripts.script1 = new Script({ updateUrl: 'http://klavogonki.ru' });
      userjs.updateScriptData('script1', { foo: 1, updateUrl: 'https://klavogonki.ru' });
      expect(userjs._scripts.script1).to.have.property('foo');
      expect(userjs._scripts.script1.foo).to.be.equal(1);
      expect(userjs._scripts.script1.updateUrl).to.be.equal('https://klavogonki.ru');
    });

    it('should throw an error if the userscript was not found with ' +
        'the updateScriptData() method', function () {
      expect(userjs.updateScriptData.bind(userjs, 'script1', { foo: 1 }))
        .to.throw(Error);
    });

    it('should create and save a Script class instance with ' +
        'the _addScript() method', function () {
      var promise = userjs._addScript('script1', { updateUrl: 'http://klavogonki.ru' });
      expect(userjs._scripts.script1).to.be.instanceof(Script);
      expect(promise).to.be.deep.equal(userjs._scripts.script1.loaded);
    });

    it('should correctly set the initial state of the userscripts ' +
        'with the _setState() method', function () {
      sandbox.spy(UserJS.prototype, '_addScript');
      userjs._setState(processedConfig);
      expect(UserJS.prototype._addScript).to.be.calledThrice
        .to.be.calledWithExactly('script1', processedConfig.script1)
        .to.be.calledWithExactly('script2', processedConfig.script2)
        .to.be.calledWithExactly('script3', processedConfig.script3);
    });

    it('should throw an error if the bad data was passed ' +
        'to the _setState() method', function () {
      expect(userjs._setState.bind(userjs, [processedConfig.script1]))
        .to.throw(TypeError);
      expect(userjs._setState.bind(userjs, new Error('Everything is ok ;)')))
        .to.throw(TypeError);
      expect(userjs._setState.bind(userjs, 'Everything is ok ;)'))
        .to.throw(TypeError);
    });

    it('should correctly update the userscripts configuration with ' +
        'the _syncState() method', function () {
      sandbox.spy(UserJS.prototype, '_addScript');
      sandbox.stub(Script.prototype, '_setIncludes');
      userjs._setState(processedConfig);
      sandbox.spy(userjs._scripts.script2, 'update');
      sandbox.spy(userjs._scripts.script3, 'update');
      var config = JSON.parse(fixtures.userscripts.updated_config);
      sandbox.stub(kango.xhr, 'send').yields({ response: config, status: 200 });
      return userjs._syncState().then(function () {
        expect(userjs._scripts.script1).to.be.undefined;
        expect(userjs._scripts.script2).to.be.instanceof(Script);
        expect(userjs._scripts.script2.update).to.have.been.calledOnce;
        var script2Config = config[0];
        for (var key in script2Config) {
          if (script2Config._ignoreUpdate.indexOf(key) < 0) {
            expect(userjs._scripts.script2[key]).to.be.equal(script2Config[key]);
          }
        }
        expect(userjs._scripts.script3).to.be.instanceof(Script);
        expect(userjs._scripts.script3.update).to.have.not.been.called;
        expect(userjs._scripts.script4).to.be.instanceof(Script);
        expect(UserJS.prototype._addScript)
          .to.have.been.calledWithExactly('script4', config[2]);
      });
    });

    it('should correctly save the userscripts configuration ' +
        'to the localStorage', function () {
      sandbox.stub(kango.storage, 'setItem');
      userjs._setState(processedConfig);
      userjs._saveState();
      expect(kango.storage.setItem).to.have.been.calledOnce
        .to.have.been.calledWithExactly('userscripts_data', userjs._scripts);
    });

    it('should call the _syncState() method every 15 minutes', function () {
      sandbox.stub(UserJS.prototype, '_syncState').returns(Q.resolve());
      sandbox.stub(UserJS.prototype, '_fetchConfig');
      sandbox.stub(UserJS.prototype, '_setState');
      for (var i = 1; i < 10; i++) {
        sandbox.clock.tick(15 * 60 * 1000);
        expect(UserJS.prototype._syncState).to.have.callCount(i);
      }
    });
  });
});
