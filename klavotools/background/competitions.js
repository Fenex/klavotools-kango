/**
 * @file Competitions Module. The module checks for new open competitions and shows
 *  notifications to user.
 * @author Vitaliy Busko
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */
var Competitions = function() {
    // Set default values:
    this.rates = kango.storage.getItem('competition_rates') || [3, 5]; //x3, x5
    this.delay = kango.storage.getItem('competition_delay');
    this.displayTime = kango.storage.getItem('competition_displayTime');
    if (typeof this.delay != 'number') {
        // 1 minute:
        this.delay = 60;
    }
    if (typeof this.displayTime != 'number') {
        // Default time:
        this.displayTime = 0;
    }

    /**
     * Competition object structure.
     * @typedef {Object} CompetitionData
     * @property {number} id An id of the competition.
     * @property {number} ratingValue A rating value of the competition (1, 2, 3, or 5).
     * @property {beginTime} beginTime A string in the ISO 8601 format, or an unix
     *  timestamp.
     */

    /**
     * A key-value hash object with active competitions data.
     * @name Competitions#_hash
     * @property {CompetitionData}
     */
    this._hash = {};
    // A server time delta in milliseconds. Should be set by the implementing class:
    this._timeCorrection = null;
    this._init();
};

// Adding the teardown() and addMessageListener() methods to the prototype:
Competitions.prototype.__proto__ = MutableModule.prototype;

/**
 * Returns current parameters for the options page.
 * @returns {Object}
 */
Competitions.prototype.getParams = function() {
    return {
        rates: this.rates,
        delay: this.delay,
        displayTime: this.displayTime,
    };
};

/**
 * Save new parameters got from the options page.
 * @param {Object} param A hash object with new parameters,
 */
Competitions.prototype.setParams = function (param) {
    this.rates = param.rates || this.rates;
    if (typeof param.displayTime === 'number' && param.displayTime >= 0) {
        this.displayTime = param.displayTime;
    }

    if (typeof param.delay === 'number' && param.delay >= 0) {
        this.delay = param.delay;
    }

    kango.storage.setItem('competition_delay', this.delay);
    kango.storage.setItem('competition_rates', this.rates);
    kango.storage.setItem('competition_displayTime', this.displayTime);
    this._updateNotifications();
};

/**
 * Recreates existing notifications for active competitions.
 * @private
 */
Competitions.prototype._updateNotifications = function () {
    for (var id in this._hash) {
        var competition = this._hash[id];
        if (competition.notification) {
            competition.notification.revoke();
        }
        if (competition.beginTime !== null) {
            this._notify(id);
        }
    }
};

/**
 * Creates a new DeferredNotification instance by the given competition data and
 * remaining time.
 * @param {CompetitionData} competition A hash object with competition data
 * @param {number} remainingTime Remaining time before the competition start (in seconds)
 * @returns {Object} DeferredNotification class instance
 */
Competitions.prototype._createNotification = function (competition, remainingTime) {
    var title = 'Соревнование';
    var body = 'Соревнование x' + competition.ratingValue + ' начинается';
    var icon = kango.io.getResourceUrl('res/comp_btn.png');
    var showDelay = remainingTime - this.delay;
    if (showDelay < 0) {
        showDelay = 0;
    }

    var displayTime = this.displayTime;
    if (displayTime > remainingTime - showDelay) {
        displayTime = remainingTime - showDelay;
    }

    var notification = new DeferredNotification(title, {
        body: body,
        icon: icon,
        displayTime: displayTime > 0 ? displayTime : void 0,
    });

    notification.onclick = function () {
        kango.browser.tabs.create({
            url: 'http://klavogonki.ru/g/?gmid=' + competition.id,
            focused: true,
        });
        notification.revoke();
    };

    notification.show(showDelay);
    return notification;
};

/**
 * Returns the remaining time before the competition start.
 * @param {(string|number)} beginTime A string in the ISO 8601 format, or an unix
 *  timestamp.
 * @throws TypeError
 * @throws Error
 * @returns {number} remaining time in seconds.
 */
Competitions.prototype.getRemainingTime = function (beginTime) {
    var beginTimestamp;
    if (typeof beginTime === 'string') {
        beginTimestamp = new Date(beginTime).getTime();
    } else if (typeof beginTime === 'number') {
        beginTimestamp = beginTime * 1000;
    }

    if (typeof beginTimestamp === 'undefined') {
        throw new TypeError('Wrong argument type for getRemainingTime() method');
    }

    if (typeof this._timeCorrection !== 'number') {
        throw new Error('Server time delta is not set');
    }

    var remaining = beginTimestamp - (Date.now() + this._timeCorrection);
    return remaining > 0 ? Math.round(remaining / 1000) : 0;
};

/**
 * Deletes all started competitions from the this._hash object.
 * @private
 */
Competitions.prototype._clearStarted = function () {
    for (var id in this._hash) {
        var beginTime = this._hash[id].beginTime;
        if (beginTime !== null && this.getRemainingTime(beginTime) === 0) {
            delete this._hash[id];
        }
    }
};

/**
 * Checks the remaining time before the competition start by its id, creates and saves
 * the new notification instance if needed.
 * @param {number} id An id of the competition
 * @private
 */
Competitions.prototype._notify = function (id) {
    var competition = this._hash[id];
    var remainingTime = this.getRemainingTime(competition.beginTime);
    if (this.delay > 0 && remainingTime > 0
            && !!~this.rates.indexOf(competition.ratingValue)) {
        this._hash[id].notification = this._createNotification(competition, remainingTime);
    }
};

/**
 * Initialization method to implement.
 * @private
 */
Competitions.prototype._init = function () {};


/**
 * Revokes all deferred notifications on teardown.
 */
Competitions.prototype.teardown = function () {
    MutableModule.prototype.teardown.apply(this, arguments);
    for (var id in this._hash) {
        var competition = this._hash[id];
        if (competition.notification) {
            competition.notification.revoke();
        }
    }
};
