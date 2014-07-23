/**
 *   Notification module (background)
 *   
 *   sample code to use:
 *   
    var notifications = new NotificationList;
    var notif = notifications.create({
        title: 'title',
        message: 'message',
        iconUrl: "http://example.com/img.png"
    });
    notif.show(); //show right now
    notif.hide(1000 * 10); //hide after 10 sec
*/

var NotificationList = function() {
    var self = this;
    this.list = {};
    
    kango.addMessageListener('Notification', function(event) {
        self.action(event);
    });
    
    kango.addMessageListener('NotificationList', function(event) {
        // event.data - point to data attached
        // event.target - point to the KangoBrowseTab object that sent the message
        self.getVisible(event);
    });
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
    action: function(event) {
        var data = event.data;
        if(data.action == 'closed') {
            dispatchToAllTabs({
                id: data.id,
                action: 'hide',
            });
        }
        if(data.action == 'clicked') {
            this.list[data.id].onclick();
        }
    },
    count: function() {
        var i=0;
        for(var name in this.list)
            i++;
        
        return i;
    },
    getVisible: function(event) {
        var notifs = [];
        
        for(var name in this.list)
            if(this.list[name].visible)
                notifs.push(this.list[name].getBlank('show'));
                
        event.target.dispatchMessage('NotificationList', notifs);
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
    this.onclick_href = data.onclick || null;

    this.visible = false;
    
    this.timers = {
        show: null,
        hide: null
    };
};

Notification.prototype = {
    onclick: function() {
        if(this.onclick_href) {
            this.hide();
            kango.browser.tabs.create({
                url: this.onclick_href,
                focused: true
            });
        }
    },
    show: function(delay) {
        var self = this;
        delay = this.checkDelay(delay);
        
        this.timers.show = setTimeout(function() {
            self.visible = true;
            var data = self.getBlank('show');
            dispatchToAllTabs(data);
        }, delay);
    },
    hide: function(delay) {
        var self = this;
        delay = this.checkDelay(delay);
        
        this.timers.hide = setTimeout(function() {
            self.visible = false;
            var data = self.getBlank('hide');
            dispatchToAllTabs(data);
        }, delay);
    },
    checkDelay: function(delay) {
        if(typeof delay != 'number' || delay < 1)
            return 1;
        return delay;
    },
    getBlank: function(action) {
        var blank = {
            id: this.id,
            params: {
                title: this.title,
                message: this.message,
                iconUrl: this.iconUrl
            }
        };
        
        if(action)
            blank.action = action;
            
        return blank;
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
