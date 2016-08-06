/**
 * @file Extends Competitions class for use with a site WebSocket connection.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

/**
 * @constructor
 * @extends Competitions
 */
function CompetitionsWS () {
    return Competitions.apply(this, arguments);
}

CompetitionsWS.prototype.__proto__ = Competitions.prototype;

/**
 * A handler for the Socket#gamelist/gameUpdated event.
 * @param {Object} game A hash object with game data diff.
 * @private
 */
CompetitionsWS.prototype._processUpdated = function (game) {
    if (!this._hash[game.g]) {
        return false;
    }
    if (game.diff && game.diff.begintime) {
        this._hash[game.g].beginTime = game.diff.begintime;
        this._notify(game.g);
    }
};

/**
 * A handler for the Socket#gamelist/gameCreated event.
 * @param {Object} game A hash object with game data.
 * @private
 */
CompetitionsWS.prototype._processCreated = function (game) {
    if (!game.params || !game.params.competition) {
        return false;
    }

    this._hash[game.id] = {
        id: game.id,
        ratingValue: game.params.regular_competition || 1,
        beginTime: game.begintime,
    }

    if (game.begintime !== null) {
        this._notify(game.id);
    }

    this._clearStarted();
};

/**
 * A handler for the Socket#gamelist/initList event.
 * @param {Object[]} list An array with current gamelist data.
 * @private
 */
CompetitionsWS.prototype._processInitList = function (list) {
    list.forEach(function (game) {
        if (typeof game.info === 'object') {
            this._processCreated(game.info);
        }
    }, this);
};

/**
 * Sets a handler for AuthStateChanged events and listens for changes in the gamelist,
 * if the user is authorized.
 * @listens Auth#AuthStateChanged
 * @listens Socket#SocketConnected
 * @listens Socket#ServerTimeDelta
 * @fires SocketSubscribe
 * @listens Socket#gamelist/initList
 * @listens Socket#gamelist/gameCreated
 * @listens Socket#gamelist/gameUpdated
 * @private
 */
CompetitionsWS.prototype._init = function() {
    this.addMessageListener('AuthStateChanged', function (event) {
        if (event.data.id) {
            this.addMessageListener('SocketConnected', function (event) {
                event.target.dispatchMessage('SocketSubscribe', {
                    'gamelist/initList': this._processInitList.bind(this),
                    'gamelist/gameCreated': this._processCreated.bind(this),
                    'gamelist/gameUpdated': this._processUpdated.bind(this),
                });
            }.bind(this));
            this.addMessageListener('ServerTimeDelta', function (event) {
                this._timeCorrection = event.data;
            }.bind(this))
        }
    }.bind(this));
};
