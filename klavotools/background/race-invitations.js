/**
 * @file A simple module for creating desktop notifications on race
 * invitations.
 * @requires Protocol
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */
function RaceInvitations () {
    this._init();
    var defaultSettings = {
        notifyRaceInvitations: true,
    };
    this._storageId = 'race_invitations_settings';
    this._settings = kango.storage.getItem(this._storageId) || defaultSettings;
}

// Adding the teardown() and addMessageListener() methods to the prototype:
RaceInvitations.prototype.__proto__ = MutableModule.prototype;

/**
 * Returns a hash object with module settings.
 * @returns {Object}
 */
RaceInvitations.prototype.getParams = function () {
    return this._settings;
};

/**
 * Saves new settings to LocalStorage.
 * @param {Object} params A hash object with changed settings
 */
RaceInvitations.prototype.setParams = function (params) {
    for (var setting in params) {
        this._settings[setting] = params[setting];
    }

    kango.storage.setItem(this._storageId, this._settings);
};

/**
 * Creates a race notification.
 * @param {Object} game A hash object with game data.
 * @private
 */
RaceInvitations.prototype._createNotification = function (game) {
    var icon = game.invited_by.avatar.replace('.png', '_big.png');
    var body = game.invited_by.login + ' приглашает вас в ' +
        (game.type === 'private' ? 'игру с друзьями' : 'игру') +
        ' ' + game.gametype_html.replace(/<(?:.|\n)*?>/gm, '')
                .replace(/&laquo;/g, '«')
                .replace(/&raquo;/g, '»');

    chrome.notifications.create('raceInvitation' + game.game_id, {
        type: 'basic',
        title: 'Приглашение в игру',
        message: body,
        iconUrl: icon,
    });
};

/**
 * Processes a race invitation.
 * @param {Object} game A hash object with game data.
 * @throws TypeError
 * @private
 */
RaceInvitations.prototype._processInvite = function (game) {
    if (!this._settings.notifyRaceInvitations) {
        return false;
    }

    if (!game || !game.invited_by || !game.gametype_html ||
        !game.invited_by.avatar || !game.game_id) {
        throw new TypeError('Wrong data for the _processInvite method');
    }

    kango.browser.tabs.getAll(function (tabs) {
        var re = new RegExp('klavogonki.ru/g/\\?gmid=' + game.game_id + '$');
        // Check if there is already opened tab with this URL:
        var found = tabs.some(function (tab) {
            return tab._tab && tab.getUrl().search(re) !== -1
        });

        if (!found) {
            this._createNotification(game);
        }
    }.bind(this));
};

/**
 * Sets a handler for AuthStateChanged events and listens for race invites.
 * @listens Auth#AuthStateChanged
 * @listens Socket#SocketConnected
 * @fires SocketSubscribe
 * @listens Socket#gameInvite:{userId}
 * @private
 */
RaceInvitations.prototype._init = function () {
    this.addMessageListener('AuthStateChanged', function (event) {
        var authId = event.data.id;
        if (authId) {
            this.setMessageListener('SocketConnected', function (event) {
                var subscriber = {};
                subscriber['gameInvite:' + authId] =
                    this._processInvite.bind(this);
                event.target.dispatchMessage('SocketSubscribe', subscriber);
            }.bind(this));
        }
    }.bind(this));

    var re = /raceInvitation(\d+)/;
    chrome.notifications.onClicked.addListener(function (id) {
        if (re.test(id)) {
            var url = Protocol.convert('/g/?gmid=' + id.match(re)[1]);
            KlavoTools.tabs.createOrNavigateExisting(url);
            chrome.notifications.clear(id);
        }
    }.bind(this));
};
