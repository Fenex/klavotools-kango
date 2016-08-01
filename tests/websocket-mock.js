/**
 * @file A simple WebSocket mock.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

function WebSocket (url) {}

WebSocket.prototype.CONNECTING = 0;
WebSocket.prototype.OPEN = 1;
WebSocket.prototype.CLOSING = 2;
WebSocket.prototype.CLOSED = 3;

WebSocket.prototype.send = function (data) {};
WebSocket.prototype.close = function (code, reason) {};
WebSocket.prototype.dispatchEvent = function (event) {};
WebSocket.prototype.addEventListener = function (type, listener, useCapture) {};
WebSocket.prototype.removeEventListener = function (type, listener, useCapture) {};

module.exports = WebSocket;

