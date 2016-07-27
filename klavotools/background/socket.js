/**
 * A wrapper for klavogonki.ru WebSocket connection.
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
 */
Socket.prototype.disconnect = function () {
    this._listeners = {};
    if (this._ws && this._ws.readyState === 1) {
        this._ws.close();
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
 * @private
 */
Socket.prototype._auth = function () {
    this._ws.send('["auth ' + this._id + ':' + this._hash + '"]');
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
 * WebSocket.onmessage handler.
 * @param {Object} deferred A Q deferred object.
 * @param {WebSocket#message} event A message event.
 * @listens WebSocket#message
 * @private
 */
Socket.prototype._onMessage = function (deferred, event) {
    if (!event.data.length || event.data.length === 1) {
        return;
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
 * @param {WebSocket#close} event A close event.
 * @listens WebSocket#close
 * @private
 */
Socket.prototype._onClose = function (deferred, event) {
    if (!event.wasClean) {
        if (!this._authorized) {
            deferred.reject(event.reason);
        } else {
            kango.console.log('WebSocket error: #' + event.code + ': ' + event.reason);

        }
    }
    this._authorized = false;
};

/**
 * WebSocket.onerror handler.
 * @param {WebSocket#error} event An error event.
 * @listens WebSocket#error
 * @private
 */
Socket.prototype._onError = function (event) {
    if (typeof this.onError !== 'function') {
        return;
    }
    this.onError(event);
};
