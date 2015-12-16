/**
 * A simple helper for loading "vanilla" JavaScript modules
 *
 * @author Daniil Filippov aka agile <filippovdaniil@gmail.com>
 */

var vm = require('vm');
var fs = require('fs');

/**
 * @param {String} path A path to the "vanilla" JavaScript module
 * @param {Object} [context={}] An optional context object to use
 */
module.exports = function (path, context) {
  context = context || {};
  var data = fs.readFileSync(path);
  vm.runInNewContext(data, context, path);
  return context;
};
