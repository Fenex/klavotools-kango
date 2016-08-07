/**
 * @file A "fallback" version of the Competitions module, which uses XHR requests.
 * Extends Competitions class.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

/**
 * @constructor
 * @extends Competitions
 */
function CompetitionsXHR () {
    return Competitions.apply(this, arguments);
}

CompetitionsXHR.prototype.__proto__ = Competitions.prototype;

/**
 * Extends Competitions.prototype.setParams method with a call of the _check().
 * @private
 */
CompetitionsXHR.prototype.setParams = function () {
    Competitions.prototype.setParams.apply(this, arguments);
    this._check();
};

/**
 * Processes a single competition data.
 * @param {Object} competition A hash object with competition data
 * @returns {boolean} Whether the check timer was set
 * @private
 */
CompetitionsXHR.prototype._processCompetition = function (competition) {
    if (this._hash[competition.id]) {
        return false;
    }

    this._hash[competition.id] = {
        id: competition.id,
        ratingValue: competition.params.regular_competition || 1,
        beginTime: competition.begintime,
    }

    this._notify(competition.id);
    this._clearStarted();
    var remainingTime = this.getRemainingTime(competition.begintime);
    if (remainingTime > 0 && (!this._lastTimeout || remainingTime < this._lastTimeout)) {
        this._lastTimeout = remainingTime;
        clearTimeout(this._timer);
        this._timer = setTimeout(this._check.bind(this), (remainingTime + 120) * 1000);
        return true;
    }

    return false;
};

/**
 * Processes a gamelist data array.
 * @param {Object[]} gamelist An array with gamelist data
 * @private
 */
CompetitionsXHR.prototype._processGamelist = function (gamelist) {
    this._lastTimeout = null;
    var foundCompetition = gamelist.some(function (game) {
        if (game.params && game.params.competition) {
            return this._processCompetition(game);
        }
    }, this);

    if (!foundCompetition) {
        this._timer = setTimeout(this._check.bind(this), 120 * 1000);
    }
};

/**
 * Fetches the gamelist data with _fetchData() method, and processes it.
 * @returns {Promise.<(Object|string)>}
 * @private
 */
CompetitionsXHR.prototype._check = function () {
    return this._fetchData().then(function (data) {
        this._timeCorrection = data.time - Math.round(Date.now() / 1000);
        this._processGamelist(data.gamelist);
    }.bind(this)).catch(function (error) {
        kango.console.log('Error while fetching gamelist data: ' + error.toString());
        this._timer = setTimeout(this._check.bind(this), 10 * 1000);
    }.bind(this));
};

/**
 * Fetches the gamelist data with a XHR request.
 * @returns {Promise.<(Object|string)>}
 * @private
 */
CompetitionsXHR.prototype._fetchData = function () {
    return xhr({
        url: KlavoTools.const.GAMELIST_DATA_URL,
        method: 'POST',
        params: { cached_users: 0 },
        contentType: 'json',
    }).then(function (data) {
        if (!data.gamelist || !(data.gamelist instanceof Array)) {
            return Q.reject('Gamelist data not available');
        }
        return data;
    }.bind(this));
};

/**
 * Clears the timer on teardown.
 */
CompetitionsXHR.prototype.teardown = function () {
    Competitions.prototype.teardown.apply(this, arguments);
    clearTimeout(this._timer);
};

/**
 * Sets a handler for AuthStateChanged events and calls the _check() method,
 * if the user is authorized.
 * @listens Auth#AuthStateChanged
 * @private
 */
CompetitionsXHR.prototype._init = function () {
    this.addMessageListener('AuthStateChanged', function (event) {
        this._clearAll();
        if (event.data.id) {
            this._check();
        }
    }.bind(this));
};
