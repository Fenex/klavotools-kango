/**
 * A simple helper for loading "vanilla" JavaScript modules
 *
 * @author Daniil Filippov aka agile <filippovdaniil@gmail.com>
 */

var vm = require('vm');
var fs = require('fs');

// Adding the kango framework mock object to the global scope:
global.kango = require('./kango-mock.js');

/**
 * @param {String} path A path to the "vanilla" JavaScript module
 */
module.exports = function (path) {
  var data = fs.readFileSync(path);
  vm.runInThisContext(data);
};
