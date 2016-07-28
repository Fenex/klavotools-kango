function isNull(obj) {
    return !obj && typeof obj == 'object';
}

function xhr(detail) {
    var deferred = Q.defer();

    var details = {
        method: 'GET',
        url: detail,
        async: true
        //params: {'param1': '1', 'param2': '2'},
        //headers: {'If-Modified-Since': 'Sat, 1 Jan 2000 00:00:00 GMT', 'Cache-Control': 'max-age=0'},
        //contentType: 'text'
    };

    kango.xhr.send(details, function(data) {
        if (data.status > 0 && data.status < 400 && data.response != null) {
            deferred.resolve(data.response);
        } else {
            deferred.reject(data);
        }
    });

    return deferred.promise;
}

var KlavoTools = {
    const: {
        BUTTON_BADGE_COLOR: [255, 0, 0, 255],
        ICON_DEFAULT: 'icons/digits.png',
        ICON_AUTH: 'icons/normal.png',
        ICON_UNREAD: 'icons/dic.png',
        WS_BASE_URL: 'ws://klavogonki.ru/ws',
        WS_HEARTBEAT_TIMEOUT: 40,
    },
    version: function() {
        return kango.getExtensionInfo().version;
    },
};

KlavoTools.UserJS = new UserJS;
KlavoTools.Skin = new Skin;
KlavoTools.Competitions = new Competitions;
KlavoTools.ContextMenus = new ContextMenus;
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

