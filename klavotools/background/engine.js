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
    Notifications: new NotificationList
};
KlavoTools.Competitions = new Competitions(KlavoTools.Notifications);

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

KlavoTools.Auth = {
    user: {
        id: null,
        login: null,
        unread: 0
    }, 
    get: function() {
        return KlavoTools.Auth.user;
    },
    init: function() {
        var url = 'http://klavogonki.ru/api/profile/get-messages-contacts?KTS_REQUEST';
        var url_send = 'http://klavogonki.ru/api/profile/send-message?KTS_REQUEST';
        
        function set(id, login, unread) {
            KlavoTools.Auth.user.id = id;
            KlavoTools.Auth.user.login = login;
            KlavoTools.Auth.user.unread = unread;
            KlavoTools.Button.update();
            
            return null;
        }
        
        function send() {
            kango.xhr.send({
                method: 'POST',
                url: url_send,
                headers:{
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                params: JSON.stringify({
                    respondentId: "274224",
                    text: "Это сообщение было отправлено KlavoTools автоматически."
                })
            }, function(res) {
            });
            
            return null;
        }
        
        function check() {
            kango.xhr.send({
                method: 'GET',
                url: url
            }, function(res) {
                if(!res.response)
                    return set(null, null, 0);
                var answer = JSON.parse(res.response);
                if(answer.err)
                    return set(null, null, 0);
                
                if(!answer.messages[0])
                    return send();

                var unread = 0;
                for(var i=0; i<answer.messages.length; i++) {
                    if(answer.messages[i].folder == 'in')
                        unread += answer.messages[i].unread;
                }
                
                set(answer.messages[0].user_id, null, unread);
            });
        }
        
        check();
        setInterval(check, 1000 * 15);
    }
};

KlavoTools.Button = {
    setBadgeValue: function(num) {
        if(num == 0)
            num = '';
    },
    update: function() {
        var icon = 'ICON_DEFAULT';
        var unread = '';
        
        if(!KlavoTools.Auth.user.id) {
            KlavoTools.Auth.user.unread = 0;
        } else {
            if(KlavoTools.Auth.user.unread > 0) {
                unread = KlavoTools.Auth.user.unread;
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

KlavoTools.Auth.init();
KlavoTools.Button.init();