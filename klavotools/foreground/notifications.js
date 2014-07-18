// ==UserScript==
// @name notificationsModule
// @namespace notifications
// @include http://*/*
// ==/UserScript==

/**
 * FIXME: notifications overlap each other
*/

/*function createElement(tag, attrs, html) {
    var elem = document.createElement(tag);
    for(var attr in attrs)
        elem.setAttribute(attr, attrs[attr]);
    if(html)
        elem.innerHTML = html;
        
    return elem;    
}*/

var Notifications = function() {
    this.list = {};
};

Notifications.prototype = {
    query: function(data) {
        switch(data.action) {
            case 'show':
                if(!this.isExists(data.id)) {
                    data.params.id = data.id;
                    this.list[data.id] = new NotificationBox(data.params);
                }
                this.show(data.id);
            break;
            case 'hide':
                if(this.isExists(data.id))
                    this.hide(data.id);
            default:
            break;
        }
    },
    isExists: function(id) {
        return this.list[id] ? true : false;
    },
    show: function(id) {
        this.list[id].show();
    },
    hide: function(id) {
        this.list[id].hide();
    }
};

var notifications = new Notifications;

var NotificationBox = function(data) {
    this.prefix = "kts-notification-id-";
    
    /* arguments */
    this.title = data.title;
    this.message = data.message;
    this.id = data.id;
    this.iconUrl = data.iconUrl;

    /* element notification */
    this.element = null;
    
    this.create();
    
    Notifications[data.id] = this;
};

NotificationBox.prototype = {
    create: function() {
        var self = this;
        
        var div = document.createElement('div');
        div.className = 'kts-notification';
        div.id = this.prefix + this.id;
        div.style.bottom = '-200px';
        div.style.transition = 'bottom 0.5s';
        div.innerHTML = '\
            <table class="kts-notification-header">\
                <tr>\
                    <!--<td class="kts-notification-header-pic">\
                        <img src=""/>\
                    </td>-->\
                    <td class="kts-notification-header-caption">KlavoTools</td>\
                    <td class="kts-notification-header-close">\
                        <img class="kts-notification-close-button" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjExR/NCNwAAALRJREFUOE+l0DEOhCAQhWFvJr02noCTaSnGxsYObaws5EyzPDZjFmcKyRZfGH5MRCsi+osaS6ixhBpLqNF7H5e8XdclGoiwbRsZY6jv+7j9Nsx1XVMI4W4s2zDnHLVtS8MwJE3T0DiO8Ug+KwKb55m6rkswP8+ZGmGaJrLWJpif50yNuDbevCxLghnt+RyIsK5r+v7fa2PGfziO424s27B93+OSt/M8RQMRSqmxhBpLqPE9qj6dqPGU0auHvQAAAABJRU5ErkJggg=="/>\
                    </td>\
                </tr>\
            </table>\
            <div class="kts-notification-content">\
                <img src="'+this.iconUrl+'" class="kts-notification-content-logo"/>\
                <div class="kts-notification-content-main">\
                    <h1 class="kts-notification-content-header">'+this.title+'</h1>\
                    '+this.message+'\
                </div>\
            </div>\
        ';
        
        /* add listener on close button */
        div.getElementsByClassName('kts-notification-close-button')[0].addEventListener('click', function() {
            self.hide();
            kango.dispatchMessage('Notification', {action: 'closed', id: self.id});
        });

        document.body.appendChild(div);
        
        this.element = div;
    },
    isVisible: function() {
        return this.element.style.display == '-200px' ? false : true;
    },
    show: function() {
        this.changeVisible('5px');
    },
    hide: function() {
        this.changeVisible('-200px');
    },
    changeVisible: function(value) {
        var self = this;
        
        /* we need to give the deferring until notification element is added into the DOM */
        setTimeout(function() {
            self.element.style.bottom = value;
        }, 100);
    }
};

kango.addMessageListener('Notification', function(event) {
    /** 
    From kango API:
    
    @event = {
        @data: variant,  // JSON serializable data object attached to the message (see below)
        @target: object, // Point to object sent the message
        @source: KangoMessageSource // Message source
    }
    */
    
    /**
    * @data (object)
    *   |
    *   +-- @id
    *   +-- @action
    *   *-- @params
    *         |
    *         +-- @title
    *         +-- @message
    *         *-- @iconUrl
    */
    notifications.query(event.data);
});

(function() {
/** adding styles for our notifications */

var cssRules = {
    ' ': {
        'position': 'fixed',
        'right': '10px',
        'width': '330px',
        'background-color': 'white',
        'border': '1px solid black'
    },
    '.kts-notification-header': {
        'width': '100%'
    },
    '.kts-notification-header-caption': {
        'width': '99%',
        'padding-left': '3px'
    },
    '.kts-notification-header td': {
        'background-color': '#eee',
        'border-bottom': '1px solid grey',
        'font-weight': 'bold'
    },
    '.kts-notification-content-logo': {
        'width': '60px',
        'height': '60px',
        'margin': '3px 3px 3px 3px',
        'vertical-align': 'top'
    },
    '.kts-notification-content': {
        'padding': '3px'
    },
    '.kts-notification-content > *': {
        'display': 'inline-block'
    },
    '.kts-notification-content-header': {
        'font-size': '18px',
        'font-weight': 'bold'
    },
    '.kts-notification-content-main': {
        'width': '248px'
    },
    '*': {
        'color': 'black',
        'padding': '0px',
        'margin': '0px',
        'border': '0px',
        'background-color': 'white'
    },
    '.kts-notification-close-button': {
        'cursor': 'pointer',
        'background-color': '#eee'
    },
    'table': {
        'border-collapse': 'collapse',
        'border-spacing': '0'
    }
};

function json2css(obj) {
    var out = '';
    for(var selector in obj) {
        out += '.kts-notification ' + selector + '{';
        for(var css in obj[selector]) {
            out += css + ':' + obj[selector][css] + ' !important;';
        }
        out += '}';
    }
    return out;
}

var s = document.createElement('style');
s.innerHTML = json2css(cssRules);
document.head.appendChild(s);

})();