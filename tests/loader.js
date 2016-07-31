/**
 * @file A simple helper for loading "vanilla" JavaScript modules to the global scope.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

var vm = require('vm');
var fs = require('fs');
var path = require('path');

/**
 * @param {String} modulePath A path to the "vanilla" JavaScript module
 */
module.exports = function (modulePath) {
  var data = fs.readFileSync(path.normalize(modulePath));
  vm.runInThisContext(data);
};
