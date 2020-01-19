/**
 * @file Loads all background modules to the global scope, with all necessary mocks.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

var loadVanillaModule = require('../loader.js');
var config = require('../../extension_info.json');

global.chrome = require('sinon-chrome/extensions');
global.kango = require('../kango-mock.js');
global.WebSocket = require('../websocket-mock.js');
global.Event = function () {};
global.CustomEvent = function () {};

var commonJSModules = [
  {
    path: 'klavotools/background/lib/q.js',
    name: 'Q',
  },
];

config.background_scripts.forEach(function (module) {
  var commonJS = commonJSModules.filter(function (obj) { return obj.path == module })[0];
  if (commonJS) {
    global[commonJS.name] = require('../../' + commonJS.path);
  } else {
    loadVanillaModule(module);
  }
});
