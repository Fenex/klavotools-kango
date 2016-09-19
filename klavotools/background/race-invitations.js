/**
 * @file A simple module for creating desktop notifications on race
 * invitations.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */
function RaceInvitations () {
    this._init();
}

// Adding the teardown() and addMessageListener() methods to the prototype:
RaceInvitations.prototype.__proto__ = MutableModule.prototype;

/**
 * Processes a race invitation (creates a desktop notification).
 * @param {Object} game A hash object with game data.
 * @throws TypeError
 * @private
 */
RaceInvitations.prototype._processInvite = function (game) {
    if (!game || !game.invited_by || !game.gametype_html ||
        !game.invited_by.avatar || !game.game_id) {
        throw new TypeError('Wrong data for the _processInvite method');
    }

    var icon = game.invited_by.avatar.replace('.gif', '_big.gif');
    var body = game.invited_by.login + ' приглашает вас в ' +
        (game.type === 'private' ? 'игру с друзьями' : 'игру') +
        ' ' + game.gametype_html.replace(/<(?:.|\n)*?>/gm, '');

    var notification = new Notification('Приглашение в игру', {
        body: body,
        icon: icon,
    });

    notification.onclick = function () {
        kango.browser.tabs.create({
            url: 'http://klavogonki.ru/g/?gmid=' + game.game_id,
            focused: true,
        });
    };
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
};
