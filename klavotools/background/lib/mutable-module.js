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
    if (!this._teardownList) {
        this._teardownList = [];
    }
    this._teardownList.push({
        event: eventName,
        listener: listener,
    });
    return kango.addMessageListener(eventName, listener);
};

/**
 * Makes some actions before the class instance destroy.
 */
MutableModule.prototype.teardown = function () {
    if (!this.teardownList) {
        return false;
    }
    this.teardownList.forEach(function (item) {
        if (item.event) {
            kango.removeMessageListener(item.event, item.listener);
        }
    });
};
