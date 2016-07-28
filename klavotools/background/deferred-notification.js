/**
 * @file DeferredNotification module.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 * @example <caption>Example of usage.</caption>
 * var notify = new DeferredNotification('title', {
 *     body: 'Hello, world!',
 *     icon: 'http://example.com/img.png',
 *     displayTime: 10, // Hide the notification after 10 seconds
 * });
 * notify.show(5); // Show the notification after 5 seconds
 * notify.onclick = function() {
 *     alert('Clicked!');
 * }
 */


/**
 * Notification class constructor. Takes the same arguments, as the
 * window.Notification's constructor, with the addition of an optional parameter:
 *
 * {Number} [options.displayTime] Sets the display time for the notification in seconds
 * @param {string} title
 * @param {Object} options
 * @returns {Object}
 */
function DeferredNotification (title, options) {
    if (typeof title === 'undefined') {
        throw new TypeError('Not enough arguments to Notifications\'s constructor');
    }

    this.title = title;
    this.options = options || {};
    if (this.options.displayTime && !this.options.tag) {
        // Set the tag property for the possibility of replacing of same notifications:
        this.options.tag = Math.random().toString(16).slice(2);
    }
    return this;
}

/**
 * Revokes the delayed notification or closes the active.
 */
DeferredNotification.prototype.revoke = function () {
    clearTimeout(this._timeout);
    if (typeof this._notification !== 'undefined') {
        this.options.displayTime = 0;
        this._notification.close();
    }
};

/**
 * Create the Notification after the certain delay.
 * @param {number} [delay=0] Delay in seconds
 */
DeferredNotification.prototype.show = function (delay) {
    delay = delay || 0;
    var timeShown = 0;
    function _show () {
        // Close event triggers whenever the replacement of a notification occurs. So, in order to
        // check whether the close event was triggered by user — saving the current timestamp:
        var timestamp = Date.now();
        var notification = new Notification(this.title, this.options);
        this._notification = notification;

        // Proxing methods to the Notification instance object:
        for (var prop in this) {
            if (typeof this[prop] === 'function' && Notification.prototype.hasOwnProperty(prop)) {
                notification[prop] = this[prop];
            }
        }

        // Preventing the rerun of the notification:
        notification.addEventListener('close', function () {
            if (((Date.now() - timestamp) / 1000 | 0) < 3) {
                // Close event was triggered by user — revoke the notification:
                this.revoke();
            }
        }.bind(this));

        if (this.options.displayTime) {
            var diff = this.options.displayTime - timeShown;
            if (diff > 3) {
                // Show again after the 3 seconds:
                timeShown += 3;
                this._timeout = setTimeout(_show.bind(this), 3 * 1000);
            } else {
                this._timeout = setTimeout(notification.close.bind(notification), diff * 1000);
            }
        }
    }

    this._timeout = setTimeout(_show.bind(this), delay * 1000);
};
