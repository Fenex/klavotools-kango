/**
 * A wrapper for the extension button.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */
function Button () {
    this._init();
}

/**
 * Sets the button icon.
 * @param {string} icon The icon URL, relative to the extension_info.json
 */
Button.prototype.setIcon = function (icon) {
    kango.ui.browserButton.setIcon(icon);
};

/**
 * Sets the background badge color of the button.
 * @param {number[]} color An array of four integers in the range [0, 255] (RGBA).
 */
Button.prototype.setBadgeColor = function (color) {
    kango.ui.browserButton.setBadgeBackgroundColor(color);
};

/**
 * Sets a number (or text value) to show on the button.
 * @param {(number|string)} value A value to show on the button.
 */
Button.prototype.setBadgeValue = function (value) {
    kango.ui.browserButton.setBadgeValue(value);
};

/**
 * Sets the button icon and value, according to the given object with settings.
 * @param {Object} state An object with settings.
 * @param {boolean} [state.authorized] Whether the user is authorized on the site.
 * @param {number} [state.unreadMessagesNumber] The number of unread private messages.
 */
Button.prototype.setState = function (state) {
    var icon = 'ICON_DEFAULT';
    var value = '';
    if (state.authorized) {
        icon = 'ICON_AUTH';
        if (state.unreadMessagesNumber > 0) {
            icon = 'ICON_UNREAD';
            value = state.unreadMessagesNumber;
        }
    }
    this.setIcon(KlavoTools.const[icon]);
    this.setBadgeColor(KlavoTools.const.BUTTON_BADGE_COLOR);
    this.setBadgeValue(value);
};

/**
 * Handles the AuthStateChanged event and listens for the counters:{userId}/unreadMail
 * site WebSocket events.
 * @param {Auth#AuthStateChanged} event An event with the current session data.
 * @listens Socket#counters:{userId}/unreadMail
 */
Button.prototype._update = function (event) {
    var state = event.data;
    if (state.id) {
        KlavoTools.Auth.on('counters:' + state.id + '/unreadMail', function (data) {
            this.setState({ authorized: true, unreadMessagesNumber: data.newAmount });
        }.bind(this));
        this.setState({ authorized: true, unreadMessagesNumber: state.unread_mail });
    } else {
        this.setState({ authorized: false });
    }
};

/**
 * Sets the default button state and listens for AuthStateChanged events.
 * @listens Auth#AuthStateChanged
 */
Button.prototype._init = function () {
    this.setState({ authorized: false });
    kango.addMessageListener('AuthStateChanged', this._update.bind(this));
};
