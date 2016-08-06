/**
 * @file KlavoTools main background module.
 * @author Vitaliy Busko
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

var KlavoTools = {
    const: {
        BUTTON_BADGE_COLOR: [255, 0, 0, 255],
        ICON_DEFAULT: 'icons/digits.png',
        ICON_AUTH: 'icons/normal.png',
        ICON_UNREAD: 'icons/dic.png',
        WS_BASE_URL: 'ws://klavogonki.ru/ws',
        WS_HEARTBEAT_TIMEOUT: 40,
        GAMELIST_DATA_URL: 'http://klavogonki.ru/gamelist.data?KTS_REQUEST',
    },
    version: function() {
        return kango.getExtensionInfo().version;
    },
};

KlavoTools.UserJS = new UserJS;
KlavoTools.Skin = new Skin;
KlavoTools.Competitions = new CompetitionsWS;
KlavoTools.ContextMenus = new ContextMenus;
KlavoTools.Socket = new Socket;
KlavoTools.Button = new Button;
KlavoTools.Auth = new Auth;

KlavoTools.tabs = {
    create: function(data) {
        kango.browser.tabs.create(data);
    },
    navigateCurrent: function(url) {
        kango.browser.tabs.getCurrent(function(tab) {
            tab.navigate(url);
        });
    }
};
