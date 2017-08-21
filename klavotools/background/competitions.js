/**
 * @file Competitions Module. The module checks for new open competitions and shows
 *  notifications to user.
 * @requires DeferredNotification
 * @requires Q
 * @author Vitaliy Busko
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */
var Competitions = function() {
    // Set default values:
    // TODO: move these options to a hash object:
    this.rates = kango.storage.getItem('competition_rates') || [3, 5]; //x3, x5
    this.delay = kango.storage.getItem('competition_delay');
    this.audio = !!kango.storage.getItem('competition_audio');
    this.onlyWithPlayers = kango.storage.getItem('competition_onlyWithPlayers') || false;
    this.minimalPlayersNumber = kango.storage.getItem('competition_minimalPlayersNumber') || 2;

    if (typeof this.delay != 'number') {
        // 1 minute:
        this.delay = 60;
    }

    /**
     * Competition object structure.
     * @typedef {Object} CompetitionData
     * @property {number} id An id of the competition.
     * @property {number} ratingValue A rating value of the competition (1, 2, 3, or 5).
     * @property {beginTime} beginTime A string in the ISO 8601 format, or an unix
     * timestamp.
     * @property {boolean} audio Switch sound notification.
     */

    /**
     * A key-value hash object with active competitions data.
     * @name Competitions#_hash
     * @property {CompetitionData}
     */
    this._hash = {};
    // A server time delta in milliseconds. Should be set by the implementing class:
    this._timeCorrection = null;
    // A global notification click handler:
    chrome.notifications.onClicked.addListener(function (id) {
        if (id in this._hash) {
            var competitionUrl = 'http://klavogonki.ru/g/?gmid=' + id;
            KlavoTools.tabs.createOrNavigateExisting(competitionUrl);
            browser.notifications.clear(id);
        }
    }.bind(this));
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
        audio: this.audio,
        onlyWithPlayers: this.onlyWithPlayers,
        minimalPlayersNumber: this.minimalPlayersNumber,
    };
};

/**
 * Save new parameters got from the options page.
 * @param {Object} params A hash object with new parameters.
 */
Competitions.prototype.setParams = function (params) {
    // Preventing dead objects to appear in FF:
    var p = JSON.parse(JSON.stringify(params))
    this.rates = p.rates || this.rates;
    this.audio = p.audio != void 0 ? !!p.audio : this.audio;

    if (typeof p.delay === 'number' && p.delay >= 0) {
        this.delay = p.delay;
    }

    if (typeof p.onlyWithPlayers === 'boolean') {
        this.onlyWithPlayers = p.onlyWithPlayers;
    }

    if (typeof p.minimalPlayersNumber === 'number') {
        this.minimalPlayersNumber = p.minimalPlayersNumber;
    }

    kango.storage.setItem('competition_delay', this.delay);
    kango.storage.setItem('competition_rates', this.rates);
    kango.storage.setItem('competition_audio', this.audio);
    kango.storage.setItem('competition_onlyWithPlayers', this.onlyWithPlayers);
    kango.storage.setItem('competition_minimalPlayersNumber', this.minimalPlayersNumber);

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
}

/**
 * Fetches the number of active players in the given competition, with their logins list.
 * @param {CompetitionData} competition A hash object with competition data
 * @returns {Promise.<Object>} A promise to a hash object with number and logins fields
 */
Competitions.prototype._fetchPlayersData = function (competition) {
    function processGamelistData(data) {
        if (!Array.isArray(data.gamelist)) {
            throw new Error('Competitions._checkPlayersNumber: data.gamelist not found.');
        }

        var found = data.gamelist.find(function(game) {
            return game.id === competition.id;
        });

        if (!found) {
            throw new Error('Competitions._checkPlayersNumber: ' +
                'Competition #' + competition.id + ' not found.');
        }

        if (!Array.isArray(found.players)) {
            throw new Error('Competitions._checkPlayersNumber: players array not available.');
        }

        var activePlayers = found.players.filter(function(player) {
            return !player.leave;
        });

        return {
            number: activePlayers.length,
            logins: activePlayers.map(function (player) {
                return player.name || '';
            }),
        };
    }

    return fetch(KlavoTools.const.GAMELIST_DATA_URL)
        .then(function(response) {
            return response.ok ? response.json() : Q.reject(response.json());
        })
        .then(processGamelistData.bind(this));
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

    var notification = new DeferredNotification(competition.id, {
        title: title,
        message: body,
        iconUrl: icon,
        audioUrl: this.audio ? kango.io.getResourceUrl('res/competition.ogg') : undefined,
    });

    // Check if we are already at the competition page:
    function checkPresence(competition) {
        var deferred = Q.defer();
        var re = new RegExp('klavogonki.ru/g/\\?gmid=' + competition.id + '$');
        kango.browser.tabs.getAll(function (tabs) {
            deferred.resolve(tabs.some(function (tab) {
                return tab._tab && tab.getUrl().search(re) !== -1;
            }));
        });
        return deferred.promise;
    }

    function finalChecks(competition, notification) {
        var deferred = Q.defer();

        if (this.onlyWithPlayers) {
            checkPresence(competition).then(function(alreadyThere) {
                if (alreadyThere) {
                    deferred.resolve(false);
                }
            }).then(this._fetchPlayersData.bind(this, competition))
            .then(function(notification, data) {
                // Updating the notification body:
                if (data.number === 0) {
                    notification.options.message += '\n(Нет активных участников)';
                } else {
                    notification.options.message += '\nУчастники (' + data.number + '): ' +
                        data.logins.join(', ');
                }

                deferred.resolve(this.minimalPlayersNumber <= data.number);
            }.bind(this, notification));
        } else {
            checkPresence(competition).then(function(alreadyThere) {
                deferred.resolve(!alreadyThere);
            });
        }

        return deferred.promise;
    }

    notification.before = finalChecks.bind(this, competition, notification);
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
 * Deletes all competitions from the this._hash object.
 * @private
 */
Competitions.prototype._clearAll = function () {
    for (var id in this._hash) {
        var competition = this._hash[id];
        if (competition.notification) {
            competition.notification.revoke();
        }
        delete this._hash[id];
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
 * Revokes all deferred notifications on teardown.
 */
Competitions.prototype.teardown = function () {
    MutableModule.prototype.teardown.apply(this, arguments);
    this._clearAll();
};

/**
 * Initialization method to implement.
 * @private
 */
Competitions.prototype._init = function () {};
