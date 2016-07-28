/**
 * @file A wrapper for klavogonki.ru WebSocket connection.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */
function Socket () {
    this._ws = null;
    this._authorized = false;
    this._listeners = {};
}

/**
 * Starts new WebSocket session.
 * @param {number} id The Me.id value.
 * @param {string} hash The Me.one_shot_hash value.
 * @returns {Promise.<(string|Error)>} A Q promise, which resolves when the auth process
 *  is finished.
 */
Socket.prototype.connect = function (id, hash) {
    if (!id || !hash) {
        return Q.reject(new Error('The user id or disposable hash not specified.'));
    }
    var deferred = Q.defer();
    // By default, SockJS appends to the base URL two random ids:
    var randomId = Math.floor(Math.random() * 1e3);
    var ktsId = 'kts' + Math.floor(Math.random() * 1e5);
    var trans = 'websocket';
    var url = KlavoTools.const.WS_BASE_URL + '/' + randomId + '/' + ktsId + '/' + trans;
    this._id = id;
    this._hash = hash;
    this._ws = new WebSocket(url);
    this._ws.onopen = this._auth.bind(this);
    this._ws.onerror = this._onError.bind(this);
    this._ws.onclose = this._onClose.bind(this, deferred);
    this._ws.onmessage = this._onMessage.bind(this, deferred);
    return deferred.promise;
};

/**
 * Removes all listeners and closes current WebSocket session.
 * @param {number} [code] Close event code (in the range [4000, 4999]).
 * @param {string} [reason] Close event reason.
 * @fires Event#close
 */
Socket.prototype.disconnect = function (code, reason) {
    this._listeners = {};
    this._authorized = false;
    clearTimeout(this._heartbeatTimer);
    if (this._ws && this._ws.readyState === this._ws.OPEN) {
        this._ws.close(code, reason);
    }
};

/**
 * Adds a handler for the given klavogonki.ru WebSocket event.
 * @param {string} eventName The event name.
 * @param {function} callback The event handler.
 */
Socket.prototype.on = function (eventName, callback) {
    if (!this._listeners[eventName]) {
        this._listeners[eventName] = [];
        this._subscribe(eventName);
    }
    this._listeners[eventName].push(callback);
};

/**
 * Sends the auth request after the socket was opened.
 * @listens Event#open
 * @private
 */
Socket.prototype._auth = function () {
    this._ws.send('["auth ' + this._id + ':' + this._hash + '"]');
    this._onHeartbeat();
};

/**
 * Sends the subscribe request for the given event name.
 * @private
 * @param {string} eventName The event name.
 */
Socket.prototype._subscribe = function (eventName) {
    if (this._authorized) {
        this._ws.send('["subscribe ' + eventName + '"]');
    }
};

/**
 * Sends the subscribe requests for all registered events.
 * @private
 */
Socket.prototype._subscribeAll = function () {
    for (var event in this._listeners) {
        this._subscribe(event);
    }
};

/**
 * Heartbeat frames handler.
 * @fires CustomEvent#error
 * @private
 */
Socket.prototype._onHeartbeat = function () {
    clearTimeout(this._heartbeatTimer);
    this._heartbeatTimer = setTimeout(function () {
        this._ws.dispatchEvent(new CustomEvent('error', {
            detail: {
                code: 4000,
                reason: 'Connection closed by client due to server inactivity.',
            }
        }));
    }.bind(this), KlavoTools.const.WS_HEARTBEAT_TIMEOUT * 1000);
};

/**
 * WebSocket.onmessage handler.
 * @param {Object} deferred A Q deferred object.
 * @param {MessageEvent#message} event A message event.
 * @listens MessageEvent#message
 * @private
 */
Socket.prototype._onMessage = function (deferred, event) {
    if (!event.data.length || event.data === 'o') {
        return;
    }

    if (event.data === 'h') {
        return this._onHeartbeat();
    }

    var messageType = event.data[0];
    // Extract the 'answer' message from the 'a["answer"]' frame:
    var message = event.data.substring(1).slice(2, -2).replace(/\\"/g, '"');
    if (!this._authorized) {
        if (messageType === 'a' && message === 'auth ok') {
            this._authorized = true;
            this._subscribeAll();
            deferred.resolve(event.data);
        } else if (messageType === 'a' && message === 'auth failed') {
            deferred.reject(event.data);
        }
    } else {
        try { message = JSON.parse(message); } catch (e) {}

        if (message && message.length === 2 && this._listeners[message[0]]) {
            this._listeners[message[0]].forEach(function (listener) {
                listener(message[1]);
            });
        }
    }
};

/**
 * WebSocket.onclose handler.
 * @param {Object} deferred A Q deferred object.
 * @param {Event#close} event A close event.
 * @listens Event#close
 * @private
 */
Socket.prototype._onClose = function (deferred, event) {
    if (!event.wasClean || event.code === 4000) {
        if (!this._authorized) {
            deferred.reject(event.reason);
        } else {
            kango.console.log('WebSocket closed: #' + event.code + ': ' + event.reason);
        }
    }
};

/**
 * WebSocket.onerror handler.
 * @param {(Event#error|CustomEvent#error)} event An error event.
 * @listens Event#error
 * @listens CustomEvent#error
 * @private
 */
Socket.prototype._onError = function (event) {
    kango.console.log('A WebSocket error has occured.');
    if (event.detail && event.detail.code) {
        this.disconnect(event.detail.code, event.detail.reason);
    } else {
        this.disconnect();
    }
    if (typeof this.onError !== 'function') {
        return;
    }
    this.onError(event);
};
