/**
 * Represents current session state of the user.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */
function Auth () {
    this._state = {};
    this._socket = new Socket;
    this._socket.onError = this.relogin.bind(this, 0);
    this.login().fail(this.relogin.bind(this, 0));
}

/**
 * Adds a handler for the given klavogonki.ru WebSocket event.
 * @param {string} eventName The event name.
 * @param {function} handler The event handler.
 */
Auth.prototype.on = function (eventName, handler) {
    this._socket.on(eventName, handler);
};

/**
 * Broadcasts an AuthStateChanged event with the current session state data.
 * @fires Auth#AuthStateChanged
 * @private
 */
Auth.prototype._broadcastStateChange = function () {
    var state = this._state;
    kango.dispatchMessage('AuthStateChanged', state);
    kango.browser.tabs.getAll(function (tabs) {
        tabs.forEach(function (tab) {
            tab.dispatchMessage('AuthStateChanged', state)
        });
    });
}

/**
 * Fetches the session information from the page body.
 * @private
 */
Auth.prototype._fetchState = function () {
    var deferred = Q.defer();
    xhr('http://klavogonki.ru').then(function(body) {
        try {
            var Me = JSON.parse(body.match(/constant\(\s*'Me',\s*(.*)\s*\)/)[1]);
            deferred.resolve(Me || {});
        } catch (e) {
            kango.console.log(e.toString());
            deferred.reject(e);
        }
    }.bind(this)).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Returns the stored session state.
 */
Auth.prototype.getState = function () {
    return this._state;
};

/**
 * Repeatedly calls the .login() method (if its promise is rejected) with 5 seconds
 * delays for 10 times.
 * @param {!number} madeAttempts The number of already made login attempts.
 */
Auth.prototype.relogin = function (madeAttempts) {
    var attempts = 10;
    if (madeAttempts === attempts) {
        kango.console.log('Giving up after ' + attempts + ' unsuccessfull attempts...');
        return;
    }
    setTimeout(function () {
        this.login().fail(this.relogin.bind(this, ++madeAttempts));
        kango.console.log('Relogin attempt #' + madeAttempts + '...');
    }.bind(this), 5000);
};

/**
 * Fetches the session information, creates the long-lived WebSocket connection and
 * broadcasts the AuthStateChanged event.
 */
Auth.prototype.login = function () {
    return this._fetchState().then(function (state) {
        this._state = state;
        this._broadcastStateChange();
        if (state.id) {
            return this._socket.connect(state.id, state.one_shot_hash);
        }
        return Q.resolve(state);
    }.bind(this));
};

/**
 * Clears the session information, closes the WebSocket connection and broadcasts
 * the AuthStateChanged event.
 */
Auth.prototype.logout = function () {
    this._state = {};
    this._broadcastStateChange();
    this._socket.disconnect();
};
