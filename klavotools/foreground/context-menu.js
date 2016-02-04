// ==UserScript==
// @name        ContextMenu
// @include     http://klavogonki.ru/*
// ==/UserScript==

/**
 * ContextMenu class constructor.
 */
function ContextMenu () {
    this.obj = document.createElement('menu');
}

/**
 * Adds an item to the menu.
 *
 * @param {Object} options An object with item parameters:
 * @param {String} options.label An item's text
 * @param {Function} options.callback An onclick callback function
 * @param {String} [options.icon] A path to the icon for the menu's item
 * @param {Boolean} [options.disabled=false] Wheither the item is disabled
 */
ContextMenu.prototype.addItem = function (options) {
    var item = document.createElement('menuitem');
    item.label = options.label;
    item.onclick = options.callback;
    if (options.icon) {
        var icon = options.icon;
        kango.invokeAsync('kango.io.getResourceUrl', icon, function (url) {
            item.icon = url;
        });
    }
    if (options.disabled) {
        item.disabled = 'disabled';
    }
    this.getElement().appendChild(item);
};

/**
 * Adds a submenu
 *
 * @param {String} label A submenu's label
 * @param {Object} menu An instance of the ContextMenu class
 */
ContextMenu.prototype.addSubmenu = function (label, menu) {
    var menuElement = menu.getElement();
    menuElement.label = label;
    this.getElement().appendChild(menuElement);
};

/**
 * Returns the <menu> html element.
 *
 * @return {Object}
 */
ContextMenu.prototype.getElement = function () {
    return this.obj;
};

function createMenu (menu) {
    var container = new ContextMenu;
    menu.items.forEach(function (item) {
        // Recursively adding submenus:
        if (item.items instanceof Array) {
            var submenu = createMenu(item);
            return container.addSubmenu(item.label, submenu);
        }
        var callback = function () {};
        if (item.url) {
            // TODO: use promises:
            callback = function () {
                kango.invokeAsync('KlavoTools.ContextMenus.makeRedirectURL',
                  this.url,
                  function (path) {
                    window.location.href = window.location.origin + path;
                });
            }.bind({ url: item.url });
        }
        container.addItem({
            label: item.label,
            icon: item.icon,
            disabled: item.disabled,
            callback: callback,
        });
    });
    return container;
}

function setupMenu (id, structure) {
    var menu = createMenu(structure).getElement();
    menu.id = id;
    menu.type = 'context';
    document.body.appendChild(menu);
    return menu;
}

var userContextMenu;
var vocContextMenu;

kango.invokeAsync('KlavoTools.ContextMenus.getUserMenuStructure',
  function (structure) {
    userContextMenu = setupMenu('klavotools_context_user', structure);
});
kango.invokeAsync('KlavoTools.ContextMenus.getVocMenuStructure',
  function (structure) {
    vocContextMenu = setupMenu('klavotools_context_vocabulary', structure);
});


// Black magic: copying the parseLinkURL static method from the background
// script, with a view to the possibility of setting the "contextmenu"
// attribute at the same time, when the oncontextmenu event occurs.
var parseLinkURL;
kango.invokeAsync('ContextMenus.parseLinkURL.toString', function (funcBody) {
    eval('parseLinkURL = ' + funcBody);
});

/**
 * "Binds" the given <a> element to corresponding context menu.
 *
 * @param {Object} link
 */
function bindLink (link) {
    var params = parseLinkURL(link.href);
    var menuId;
    if (params.user_id ) {
        menuId = userContextMenu.id;
    } else if (params.voc_id) {
        menuId = vocContextMenu.id;
    }
    if (menuId) {
        link.setAttribute('contextmenu', menuId);
    }
    kango.invokeAsync('KlavoTools.ContextMenus.setParams', params);
}

document.addEventListener('contextmenu', function (event) {
    var current = event.target;
    while (current.parentNode) {
        if (current.tagName === 'A') {
            bindLink(current);
            break;
        } else {
            current = current.parentNode;
        }
    }
});
