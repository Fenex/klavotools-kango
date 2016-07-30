/**
 * @file A simple helper for loading "vanilla" and CommonJS JavaScript modules
 * to the global scope.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

var vm = require('vm');
var fs = require('fs');
var path = require('path');

// Adding the kango framework mock object to the global scope:
global.kango = require('./kango-mock.js');

/**
 * @param {string} modulePath A path to the "vanilla" JavaScript module
 * @returns {Object} A reference to the ModuleLoader function object.
 */
function ModuleLoader (modulePath) {
  ModuleLoader.loadDependency({ path: modulePath });
  return ModuleLoader;
}

/**
 * Loads a module to the global scope.
 * @param {(string|Object)} options A path to the "vanilla" JavaScript module, or
 *  an object with module parameters.
 * @param {string} options.path A path to the module.
 * @param {string} options.globalName A global name for dependency (used only for
 *  CommonJS modules).
 * @param {('vanilla'|'commonjs')} options.type A module type.
 * @returns {Object} A reference to the ModuleLoader function object.
 * @static
 */
ModuleLoader.loadDependency = function (options) {
  if (typeof options === 'string') {
    options = { path: options };
  } else if (!options || typeof options !== 'object') {
    var msg = 'Argument should be either a string or an object';
    throw new TypeError(msg);
  }

  if (!options.type || options.type === 'vanilla') {
    return ModuleLoader.loadVanillaModule(options.path);
  } else if (options.type === 'commonjs') {
    return ModuleLoader.loadCommonJSModule(options.globalName, options.path);
  }
};

/**
 * Loads a "vanilla" JavaScript module to the global scope.
 * @param {string} modulePath A path to the module.
 * @returns {Object} A reference to the ModuleLoader function object.
 * @static
 */
ModuleLoader.loadVanillaModule = function (modulePath) {
  var data = fs.readFileSync(path.normalize(modulePath));
  vm.runInThisContext(data);
  return ModuleLoader;
};

/**
 * Loads a CommonJS module to the global scope.
 * @param {string} globalName A global variable name for the dependency.
 * @param {string} modulePath A path to the module.
 * @returns {Object} A reference to the ModuleLoader function object.
 * @static
 */
ModuleLoader.loadCommonJSModule = function (globalName, modulePath) {
  global[globalName] = require(path.resolve('.', modulePath));
  return ModuleLoader;
};


module.exports = ModuleLoader;
