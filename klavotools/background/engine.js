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
        if (data.status == 200 && data.response != null) {
            var text = data.response;
            deferred.resolve(text);
        }
        else { // something went wrong
            kango.console.log('something went wrong');
        }
    });

    return deferred.promise;
}


var KlavoTools = {
    UserJS: new UserJS,
    Skin: new Skin,
    Competitions: new Competitions,
    ContextMenus: new ContextMenus,
};

KlavoTools.version = function() {
    return kango.getExtensionInfo().version;
};

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

KlavoTools.const = {
    ICON_DEFAULT: 'icons/digits.png',
    ICON_AUTH: 'icons/normal.png',
    ICON_UNREAD: 'icons/dic.png'
};

KlavoTools.Auth = new Auth();

KlavoTools.Button = {
    setBadgeValue: function(num) {
        if(num == 0)
            num = '';
    },
    update: function() {
        var icon = 'ICON_DEFAULT';
        var unread = '';

        if(!KlavoTools.Auth.status.id) {
            KlavoTools.Auth.status.unread = 0;
        } else {
            if(KlavoTools.Auth.status.unread > 0) {
                unread = KlavoTools.Auth.status.unread;
                icon = 'ICON_UNREAD';
            } else {
                icon = 'ICON_AUTH';
            }
        }

        kango.ui.browserButton.setIcon(KlavoTools.const[icon]);
        kango.ui.browserButton.setBadgeValue(unread);
    },
    init: function() {
        kango.ui.browserButton.setBadgeBackgroundColor([255, 0, 0, 255]);
    }
};

KlavoTools.Button.init();
