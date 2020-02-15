angular.module('popup.redirect', [])
.constant('RedirectMode', {
    UNDEFINED: 0,
    CURRENT: 1,
    NEWTAB: 2,
    BACKGROUND: 3,
})
.factory('Auth', function() {
    var auth = {
        login: null,
        id: null
    };

    kango.invokeAsync('KlavoTools.Auth.getState', function(res) {
        auth.login = res.login;
        auth.id = res.id;
    });

    return auth;
})
.factory('Redirect', function(RedirectMode, Auth) {
    var extensionURI = '';

    kango.invokeAsync('kango.io.getResourceUrl', '/', function(URI) {
        extensionURI = URI;
    });

    function replacer(url) {
        if(/^__FALSE__$/.test(url)) {
            return false;
        }
        if(/__USERID__/.test(url)) {
            if(!Auth.id)
                return false;
            url = url.replace(/__USERID__/, Auth.id);
        }
        if(/^__EXTENSION_OPTIONS__$/.test(url)) {
            kango.invokeAsync('kango.ui.optionsPage.open');
            return null;
        } else if(/__EXTENSION__/.test(url)) {
            url = url.replace(/__EXTENSION__/, extensionURI);
        }
        else if(!(/^https?:\/\//.test(url))) {
            if(url[0] != '/')
                url = '/' + url;
            url = 'https://klavogonki.ru' + url;
        }

        return url;
    }

    return function(url, mode) {
        url = replacer(url);
        if(!url)
            return;
        switch(mode) {
            case RedirectMode.UNDEFINED:
                break;
            case RedirectMode.BACKGROUND:
                kango.invokeAsync('KlavoTools.tabs.create', {
                    url: url,
                    focused: false
                });
                break;
            case RedirectMode.CURRENT:
                kango.invokeAsync('KlavoTools.tabs.navigateCurrent', url);
                break;
            default:
                kango.invokeAsync('KlavoTools.tabs.create', {
                    url: url,
                    focused: true
                });
                break;
        }
    };
});
