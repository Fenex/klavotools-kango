// ==UserScript==
// @name AuthStatusListener
// @namespace auth status listener
// @run-at document-start
// @include http://klavogonki.ru/*
// ==/UserScript==

var auth = {
    login: undefined,
    id: undefined,
    unread: undefined
};

function onChangedAuthStatus(count) {
    kango.invokeAsync('KlavoTools.Auth.ChangedStatus', auth);
}

function Update() {
    if(!document.querySelector('#head #logo')) {
        //empty page or incorrect page
        return;
    }
        
    var out = {};
    ['id', 'login', 'unread'].forEach(function(item) {
        out[item] = getParams(item)();
    });
    
    return out;
}

function getParams(name) {
    var isGhost = document.querySelector('.user-dropdown') ? false : true;
    
    var obj = {
        id: function() {
            try {
                return parseInt(document.querySelector('.user-dropdown .btn').href.match(/\d+/)[0]);
            } catch (e) { return undefined; }
        },
        login: function() {
            try {
                return document.querySelector('.user-dropdown .name span').textContent;
            } catch (e) { return undefined; }
        },
        unread: function() {
            try {
                return parseInt(document.querySelector('.userpanel .mail .cnt').textContent);
            } catch (e) { return undefined; }
        }
    }
    
    if(isGhost) {
        return function() {
            return null;
        };
    }
    
    return obj[name];
}

setInterval(function() {
    var updated = Update();
    if(!updated)
        return;
    
    for(var key in auth)
        if(auth[key] !== updated[key])
            return onChangedAuthStatus(auth = updated);
}, 5 * 1000);