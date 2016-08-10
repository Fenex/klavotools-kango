/**
 * @file Fetches the number of unread private messages and broadcasts
 * the UnreadMessagesNumber event. Used only when WebSockets are disabled in settings.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */
function UnreadPMCounter () {
    this._init();
}

// Adding the teardown() and addMessageListener() methods to the prototype:
UnreadPMCounter.prototype.__proto__ = MutableModule.prototype;

/**
 * Fetches the number of unread PM and broadcasts the UnreadMessagesNumber event.
 * @fires UnreadPMCounter#UnreadMessagesNumber
 * @returns {Promise.<(Object|string)>}
 * @private
 */
UnreadPMCounter.prototype._check = function () {
    return xhr({
        url: KlavoTools.const.PM_DATA_URL,
        contentType: 'json',
    }).then(function (data) {
        if (!data.messages) {
            return Q.reject('PM data is not available');
        }

        var unread = 0;
        data.messages.forEach(function (message) {
            if (message.folder === 'in') {
                unread += message.unread;
            }
        });
        kango.dispatchMessage('UnreadMessagesNumber', unread);
        return Q.resolve(unread);
    }).catch(function (error) {
        kango.console.log('Error while fetching PM data: ' + error.toString());
    })
};

/**
 * Clears the check timer on teardown.
 */
UnreadPMCounter.prototype.teardown = function () {
    MutableModule.prototype.teardown.apply(this, arguments);
    clearInterval(this._timer);
};

/**
 * Listens for the AuthStateChanged events and sets the check timer.
 * @private
 */
UnreadPMCounter.prototype._init = function () {
    this.addMessageListener('AuthStateChanged', function (event) {
        clearInterval(this._timer);
        if (event.data.id) {
            this._timer = setInterval(this._check.bind(this), 60 * 1000);
            this._check();
        }
    }.bind(this));
};
