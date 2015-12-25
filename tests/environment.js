/**
 * A helper for creating the testing environment context.
 *
 * @author Daniil Filippov aka agile <filippovdaniil@gmail.com>
 */

var kango = require('./kango-mock.js');

var context = {
  kango: kango,
  isNull: function (obj) {},
  xhr: function (detail) {},
  // Creating references to some default global functions and objects:
  setTimeout: setTimeout,
  setInteval: setInterval,
  clearTimeout: clearTimeout,
  clearInterval: clearInterval,
  console: {}
}

// Setting up the console object mock:
for (var prop in console) {
  if (typeof console[prop] === 'function') {
    context.console[prop] = function () {};
  }
}

module.exports = context;
