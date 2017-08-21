/**
 * @file DeferredNotification module.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 * @example <caption>Example of usage.</caption>
 * var notify = new DeferredNotification('nice-id', {
 *     title: 'Notification'
 *     message: 'Hello, world!',
 *     iconUrl: 'http://example.com/img.png',
 *     audioUrl: kango.io.getResourceUrl('res/competition.ogg'), // Play sound
 * });
 * notify.show(5); // Show the notification after 5 seconds
 */


/**
 * Notification class constructor.
 *
 * @param {string} id
 * @param {Object} options
 * @param {string} [options.audioUrl] An URL to the audio file
 * @returns {Object}
 */
function DeferredNotification (id, options) {
    if (typeof id === 'undefined' || typeof options === 'undefined') {
        throw new TypeError('Not enough arguments to Notifications\'s constructor');
    }

    this.id = id.toString();
    // For testing purposes it's important to save the original state of the arguments.
    // So, we can't simply assign this.options to options || {}, because the first can be
    // changed further:
    this.options = {};

    if (options) {
        if (typeof options !== 'object') {
            throw new TypeError('Argument 2 of DeferredNotification should be an object');
        }

        for (var field in options) {
            this.options[field] = options[field];
        }
    }

    return this;
}

/**
 * Revokes the delayed notification or closes the active.
 */
DeferredNotification.prototype.revoke = function () {
    clearTimeout(this._timeout);
    browser.notifications.clear(this.id);
};

/**
 * User-defined function which performs some action just before notification is shown.
 * @returns {Promise.<boolean>} Whether the notification should be shown
 */
DeferredNotification.prototype.before = undefined;

/**
 * Create the Notification after the certain delay.
 * @param {number} [delay=0] Delay in seconds
 */
DeferredNotification.prototype.show = function (delay) {
    delay = delay || 0;
    function _show () {
        browser.notifications.create(this.id, {
            type: 'basic',
            title: this.options.title,
            message: this.options.message,
            iconUrl: this.options.iconUrl,
        });

        // Play a sound if needed:
        if (typeof this.options.audioUrl !== 'undefined') {
            new Audio(this.options.audioUrl).play();
        }
    }

    this._timeout = setTimeout(function () {
        if (typeof this.before === 'function') {
            this.before.call(this).then(function (res) {
                if (res === false) {
                    return false;
                }
                _show.call(this);
            }.bind(this));
        } else {
            _show.call(this);
        }
    }.bind(this), delay * 1000);
};
