/**
 * @file KlavoTools main background module.
 * @author Vitaliy Busko
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

var KlavoTools = {
    const: {
        BUTTON_BADGE_COLOR: [255, 0, 0, 255],
        ICON_DEFAULT: 'icons/button_default.png',
        ICON_AUTH: 'icons/button_auth.png',
        ICON_UNREAD: 'icons/button_unread.png',
        WS_BASE_URL: 'ws://klavogonki.ru/ws',
        WS_HEARTBEAT_TIMEOUT: 40,
        GAMELIST_DATA_URL: 'http://klavogonki.ru/gamelist.data?KTS_REQUEST',
        PM_DATA_URL: 'http://klavogonki.ru/api/profile/get-messages-contacts?KTS_REQUEST',
        USERJS_CONFIG_URL:
            'https://raw.githubusercontent.com/voidmain02/KgScripts/master/klavotools.json',
        USERJS_DIRECTORY_URL:
            'https://raw.githubusercontent.com/voidmain02/KgScripts/master/scripts',
    },
    version: function() {
        return kango.getExtensionInfo().version;
    },
};

KlavoTools.UserJS = new UserJS;
KlavoTools.Skin = new Skin;
KlavoTools.ContextMenus = new ContextMenus;
KlavoTools.Button = new Button;
KlavoTools.RaceInvitations = new RaceInvitations;
KlavoTools.Protocol = new Protocol;

KlavoTools.tabs = {
    create: function(data) {
        kango.browser.tabs.create(data);
    },
    navigateCurrent: function(url) {
        kango.browser.tabs.getCurrent(function(tab) {
            tab.navigate(url);
        });
    },
    createOrNavigateExisting: function(url) {
        var re = /klavogonki.ru/;
        kango.browser.tabs.getAll(function (tabs) {
            // Using private _tab property check because kango .getUrl() method is awful:
            var foundTab = tabs.find(function (tab) {
                return tab._tab && tab.getUrl().search(re) !== -1;
            });
            var foundCurrentTab = tabs.find(function (tab) {
                return tab._tab && tab.isActive() && tab.getUrl().search(re) !== -1;
            });

            if (foundCurrentTab) {
                foundTab = foundCurrentTab;
            }

            if (!foundTab) {
                kango.browser.tabs.create({
                    url: url,
                    focused: true,
                });
            } else {
                // Navigate to the given URL without creating new tab:
                foundTab.navigate(url);
                // Set the focus on this tab:
                foundTab.activate();
            }
        });
    }
};

var defaultGlobalSettings = {
    useWebSockets: true,
    protocol: KlavoTools.Protocol.config
};
var globalSettings = kango.storage.getItem('settings') || defaultGlobalSettings;

KlavoTools.Settings = {
    _hash: globalSettings,

    set: function (params) {
        for (var setting in params) {
            this._hash[setting] = params[setting];
        }

        kango.storage.setItem('settings', this._hash);

        if (params.protocol)
            KlavoTools.Protocol.saveCfg(params.protocol);
        if (params.useWebSockets)
            this._apply();
    },

    get: function () {
        return this._hash;
    },

    _apply: function () {
        if (this._hash.useWebSockets) {
            if (KlavoTools.Competitions instanceof CompetitionsXHR) {
                KlavoTools.Competitions.teardown();
                KlavoTools.UnreadPMCounter.teardown();
            }
            KlavoTools.Competitions = new CompetitionsWS;
            KlavoTools.Socket = new Socket;
        } else {
            if (KlavoTools.Competitions instanceof CompetitionsWS) {
                KlavoTools.Competitions.teardown();
                KlavoTools.Socket.teardown();
            }
            KlavoTools.Competitions = new CompetitionsXHR;
            KlavoTools.UnreadPMCounter = new UnreadPMCounter;
        }

        if (typeof KlavoTools.Auth === 'undefined') {
            KlavoTools.Auth = new Auth;
        } else {
            // Force relogin to affect changes:
            KlavoTools.Auth.logout();
            KlavoTools.Auth.login();
        }
    },
}

KlavoTools.Settings._apply();
