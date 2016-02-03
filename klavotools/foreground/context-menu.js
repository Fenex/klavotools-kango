// ==UserScript==
// @name        ContextMenu
// @include     http://klavogonki.ru/*
// ==/UserScript==

kango.invokeAsync('KlavoTools.Auth.get', function (auth) {
    /**
     * ContextMenu class constructor.
     *
     * @param {String} id An unique id for the <menu> element
     */
    function ContextMenu (id) {
        this.id = id;
        this.obj = document.createElement('menu');
        this.obj.id = id;
        this.obj.type = 'context';
    }

    /**
     * Add an item to the menu.
     *
     * @param {String} label A text of the menu item
     * @param {String} icon A path to the icon for the menu item
     * @param {Function} callback An onclick callback function for the item
     */
    ContextMenu.prototype.addItem = function (label, icon, callback) {
        var item = document.createElement('menuitem');
        item.label = label;
        item.onclick = callback;
        kango.invokeAsync('kango.io.getResourceUrl', icon, function (url) {
            item.icon = url;
        });
        this.obj.appendChild(item);
    };

    /**
     * Set the data-* attribute for the menu element.
     *
     * @param {String} name Name of the attribute (without "data-")
     * @param {String} value Value of the data attribute
     */
    ContextMenu.prototype.setData = function (name, value) {
        this.obj.setAttribute('data-' + name, value);
    };

    /**
     * Get the value of the data-* attribute for the menu element.
     *
     * @param {String} name Name of the attribute (without "data-")
     * @return {String}
     */
    ContextMenu.prototype.getData = function (name) {
        return this.obj.getAttribute('data-' + name);
    };

    /**
     * Returns the <menu> html element.
     *
     * @return {Object}
     */
    ContextMenu.prototype.getElement = function () {
        return this.obj;
    };

    var userContextMenu = new ContextMenu('klavotools_context_user');
    // TODO: bring this to the background?
    [
        {
            label: 'Открыть диалог',
            icon: 'icons/context_messages.png',
            url: '/u/#/%auth_id%/messages/%id%',
        },
        {
            label: 'Сводка',
            icon: 'icons/context_summary.png',
            url: '/u/#/%id%',
        },
        {
            label: 'Статистика',
            icon: 'icons/context_statistics.png',
            url: '/u/#/%id%/stats/',
        },
        {
            label: 'Бортжурнал',
            icon: 'icons/context_logbook.png',
            url: '/u/#/%id%/journal/',
        },
        {
            label: 'Достижения',
            icon: 'icons/context_achievements.png',
            url: '/u/#/%id%/achievements/',
        },
        {
            label: 'Друзья',
            icon: 'icons/context_friends.png',
            url: '/u/#/%id%/friends/',
        },
        {
            label: 'Гараж',
            icon: 'icons/context_garage.png',
            url: '/u/#/%id%/car/',
        },
    ].forEach(function (item) {
        if (!auth.id && item.url.indexOf('%auth_id%') + 1) {
            return;
        }
        userContextMenu.addItem(item.label, item.icon, function () {
            var path = makeURL(this.url, this.menu.getData('id'));
            window.location.href = window.location.origin + path;
        }.bind({ menu: userContextMenu, url: item.url }));
    });
    document.body.appendChild(userContextMenu.getElement());


    /**
     * Substitutes variables into the URL's path
     *
     * @param {String} template The URL's path template
     * @param {String} [id] The value of the %id% variable
     * @return {String}
     */
    function makeURL (template, id) {
        if (id) {
            template = template.replace(/%id%/, id);
        }
        if (auth.id) {
            template = template.replace(/%auth_id%/, auth.id);
        }
        return template;
    }

    /**
     * For the given <a> element, checks it's "href" attribute for the id of
     * user or vocabulary, and in case of success, adds the "contextmenu"
     * attribute with appropriate value (id of the <menu> element).
     *
     * @param {Object} link
     */
    function updateLink (link) {
        // A RegExp for getting the user's or vocabulary's id from the link's
        // href:
        var re = /(profile|u\/#|vocs)\/(\d+)/;
        var matches = link.href.match(re);
        if (!matches) {
            return;
        }

        var menuId = userContextMenu.id;
        if (matches[1] === 'vocs') {
            // TODO:
            //menuId = 'klavotools_context_voc';
        } else {
            userContextMenu.setData('id', matches[2]);
        }
        link.setAttribute('contextmenu', menuId);
    }

    document.addEventListener('contextmenu', function (event) {
        var current = event.target;
        while (current.parentNode) {
            if (current.tagName === 'A') {
                updateLink(current);
                break;
            } else {
                current = current.parentNode;
            }
        }
    });
});
