var KlavoTools = {};

//KlavoTools.prefs = {};
KlavoTools.userjs = new UserPref('userjs', DefaultConfig.userjs);
KlavoTools.userstyle = new Skin(DefaultConfig.userstyles);

KlavoTools.version = function() {
    return kango.getExtensionInfo().version;
};

KlavoTools.Script = {
    get: function() {
        return KlavoTools.userjs.prefs;
    },
    set: function(data) {
        KlavoTools.userjs.merge(data);
    }
};

KlavoTools.Skin = {
    getActive: function(content) {
        if(!content)
            return KlavoTools.userstyle.active;
        return {
            skin: KlavoTools.userstyle.active,
            io: kango.io.getResourceUrl('res/skins/$1')
        };
    },
    setActive: function(skin) {
        return KlavoTools.userstyle.save(skin);
    },
    getAll: function() {
        return KlavoTools.userstyle.skins;
    }
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

KlavoTools.Auth = {
    user: {
        id: null,
        login: null
    }, 
    get: function() {
        return KlavoTools.Auth.user;
    },
    init: function() {
        var url = 'http://klavogonki.ru/api/profile/get-messages-contacts';
        var url_send = 'http://klavogonki.ru/api/profile/send-message';
        
        function set(id, login) {
            console.log(id);
            
            KlavoTools.Auth.user.id = id;
            KlavoTools.Auth.user.login = login;
            
            return null;
        }
        
        function send() {
            kango.xhr.send({
                method: 'POST',
                url: 'http://klavogonki.ru/api/profile/send-message',
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
                var answer = JSON.parse(res.response);
                if(answer.err) {
                    return set(null, null);
                }
                
                if(!answer.messages[0]) {
                    return send();
                }
                
                set(answer.messages[0].user_id);
            });
        }
        
        check();
        setInterval(check, 1000 * 60);
    }
}

KlavoTools.Auth.init();