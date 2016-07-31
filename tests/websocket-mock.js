/**
 * @file A simple WebSocket mock.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

function WebSocket (url) {}

WebSocket.prototype.send = function (data) {};
WebSocket.prototype.close = function (code, reason) {};
WebSocket.prototype.dispatchEvent = function (event) {};
WebSocket.prototype.addEventListener = function (type, listener, useCapture) {};
WebSocket.prototype.removeEventListener = function (type, listener, useCapture) {};

module.exports = WebSocket;

