/**
 * @file Auth module. Represents current session state of the user.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */
function Auth () {
    this._state = {};
    this.login().fail(this.relogin.bind(this));
    kango.addMessageListener('SocketError', this.relogin.bind(this));
    chrome.runtime.onMessage.addListener(function (message) {
        if (message.name === 'authUserId') {
            this.checkState(message.id);
        }
    }.bind(this));
}

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
            var Me = JSON.parse(body.match(/constant\(\s*'Me',\s*(.+)\s*\)/)[1]);
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
 * @returns {Object} A key-value hash object.
 */
Auth.prototype.getState = function () {
    return this._state;
};

/**
 * Repeatedly calls the .login() method (if its promise is rejected) with 5 seconds
 * delays for 10 times.
 * @param {number} [madeAttempts=0] The number of already made login attempts.
 */
Auth.prototype.relogin = function (madeAttempts) {
    if (this._state.id) {
        // Force logout:
        this.logout();
    }
    madeAttempts = typeof madeAttempts === 'number' ? madeAttempts : 0;
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
 * Fetches the session information and broadcasts the AuthStateChanged event.
 */
Auth.prototype.login = function () {
    return this._fetchState().then(function (state) {
        this._state = state;
        this._broadcastStateChange();
        return state;
    }.bind(this));
};

/**
 * Clears the session information and broadcasts the AuthStateChanged event.
 */
Auth.prototype.logout = function () {
    this._state = {};
    this._broadcastStateChange();
};

/**
 * Handles auth state changes.
 * @param {number|null} userId The current userId or null
 */
Auth.prototype.checkState = function (userId) {
    if (this._state.id !== userId) {
        userId ? this.login() : this.logout();
    }
};
