/**
 * DeferredNotification module. Depends on the Q promises library.
 *
 * Example of usage:
 *
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
 *
 * @param {String} title
 * @param {Object} options
 * @return {Object}
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
 * Create the Notification after the certain delay
 *
 * @param {Number} [delay=0] Delay in seconds
 * @return {Object} A promise resolving to the Notification instance object
 */
DeferredNotification.prototype.show = function (delay) {
    delay = delay || 0;
    var deferred = Q.defer();
    var timeShown = 0;
    function _show () {
        kango.console.log((new Date).toString());
        var notify = new Notification(this.title, this.options);

        if (this.options.displayTime) {
            var diff = this.options.displayTime - timeShown;
            if (diff > 3) {
                // Show again after the 3 seconds:
                timeShown += 3;
                setTimeout(_show.bind(this), 3 * 1000);
            } else {
                setTimeout(notify.close.bind(notify), diff * 1000);
            }
        }

        // Proxing methods to the Notification instance object:
        for (var prop in this) {
            if (typeof this[prop] === 'function' && Notification.prototype.hasOwnProperty(prop)) {
                notify[prop] = this[prop];
            }
        }

        if (timeShown) return;
        deferred.resolve(notify);
    }

    setTimeout(_show.bind(this), delay * 1000);
};
