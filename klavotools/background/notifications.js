/**
 *   Notification module (background)
 *   
 *   example:
 *   
 *   var notifications = new NotificationList;
 *   var notif = notifications.create({
 *       title: 'title',
 *       message: 'message',
 *       iconUrl: "http://example.com/img.png"
 *   });
 *   notif.show();
 *   setTeimtout(notif.hide, 1000 * 10);
*/

var NotificationList = function() {
    this.list = {};
};

NotificationList.prototype = {
    create: function(data) {
        var id = this.getId();
        this.list[id] = new Notification(id, data);
        return this.list[id];
    },
    getId: function() {
        return new Date().getTime().toString(36);
    },
    count: function() {
        var i=0;
        for(var name in this.list)
            i++;
        
        return i;
    },
    toString: function() {
        return '[object NotificationList]';
    }
};

var Notification = function(id, data) {
    this.id = id;
    
    this.message = data.message;
    this.title = data.title;
    this.iconUrl = data.iconUrl;
};

Notification.prototype = {
    show: function() {
        var data = this.getBlank();
        data.action = 'show';
        dispatchToAllTabs(data);
    },
    hide: function() {
        var data = this.getBlank();
        data.action = 'hide';
        dispatchToAllTabs(data);
    },
    getBlank: function() {
        return {
            id: this.id,
            params: {
                title: this.title,
                message: this.message,
                iconUrl: this.iconUrl
            }
        };
    },
    toString: function() {
        return '[object Notification]';
    }
};

var dispatchToAllTabs = function(data) {
    kango.browser.tabs.getAll(function(tabs) {
        for (var i=0; i<tabs.length; i++) {
            tabs[i].dispatchMessage('Notification', data);
        }
    });
};
