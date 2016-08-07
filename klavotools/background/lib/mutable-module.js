/**
 * @file A base class for creating "mutable" modules with teardown() method.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */
function MutableModule () {}

/**
 * Proxies arguments to the kango.addMessageListener and saves them in the _teardownList
 * array.
 * @param {string} eventName An event name
 * @param {function} listener An event callback function
 * @returns {boolean} The result of the kango.addMessageListener call
 */
MutableModule.prototype.addMessageListener = function (eventName, listener) {
    if (typeof this._teardownList === 'undefined') {
        this._teardownList = [];
    }

    this._teardownList.push({
        event: eventName,
        listener: listener,
    });
    return kango.addMessageListener(eventName, listener);
};

/**
 * Sets only one handler for the given event name (replaces existing one).
 * @param {string} eventName An event name
 * @param {function} listener An event callback function
 * @returns {boolean} The result of the kango.addMessageListener call
 */
MutableModule.prototype.setMessageListener = function (eventName, listener) {
    var found = this._teardownList.filter(function (item) {
        return item.event === eventName;
    })[0];

    if (found) {
        kango.removeMessageListener(found.event, found.listener);
        this._teardownList.splice(this._teardownList.indexOf(found), 1);
    }

    return this.addMessageListener(eventName, listener);
};

/**
 * Makes some actions before the class instance destroy.
 */
MutableModule.prototype.teardown = function () {
    if (!this._teardownList) {
        return false;
    }

    this._teardownList.forEach(function (item) {
        if (item.event) {
            kango.removeMessageListener(item.event, item.listener);
        }
    });

    this._teardownList = [];
};
