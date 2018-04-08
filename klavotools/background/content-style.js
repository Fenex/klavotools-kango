/**
 * @file A module for work with the user styles.
 * @author Vitaliy Busko
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */
function Skin() {
    // A list of all skins:
    this.list = [
        'beige',
        'pink',
        'green',
        'blue',
        'violet',
        'gray',
        'nikitakozin'
    ];
    // Currently active skin:
    this.active = kango.storage.getItem('skin') || 'beige';
    this.init();
};

Skin.prototype.init = function() {
    chrome.runtime.onMessage.addListener(function (message, sender, callback) {
        if (message.name === 'getActiveSkin') {
            callback(this.active);
        }
    }.bind(this));
};

Skin.prototype.setActive = function(skin) {
    this.active = skin || 'beige';
    kango.storage.setItem('skin', skin);
};

Skin.prototype.getActive = function(skin) {
    return this.active;
};

Skin.prototype.getAll = function() {
    return this.list;
};
