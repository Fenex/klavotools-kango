/**
 * @file A background script for creating context menus in the Chrome.
 *
 * Chrome doesn't support the creation of context menus with the <menu> element
 * at the moment (http://caniuse.com/#feat=menu). Using the Extensions API as
 * a workaround.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

/**
 * ChromeContextMenu class constructor.
 * @param {string[]} [urlPatterns] An array of match patterns for target elements
 */
function ChromeContextMenu (urlPatterns) {
    // An array with ids of items:
    this.items = [];
    // An id of the parent menu's item
    this.parent = null;
    this.urlPatterns = urlPatterns;
}

/**
 * Adds an item to the menu.
 * @param {Object} options An object with item's parameters:
 * @param {string} options.label An item's text
 * @param {function} [options.callback] An onclick callback function
 * @param {string[]} [options.urlPattern] An array of match patterns
 * @param {boolean} [options.disabled=false] Wheither the item is disabled
 * @param {string[]} [options.contexts] An array of contexts. Defaults to ['link']
 * @returns {Promise.<(number|string)>} A Q promise to the id of created menu's item
 */
ChromeContextMenu.prototype.addItem = function (options) {
    if (!options.contexts) {
        options.contexts = ['link'];
    }

    var deferred = Q.defer();
    var id = chrome.contextMenus.create({
        title: options.label,
        contexts: options.contexts,
        onclick: options.callback,
        enabled: options.enabled,
        targetUrlPatterns: this.urlPatterns,
    }, function () {
        var error = chrome.runtime.lastError;
        if (!error) {
            this.items.push(id);
            deferred.resolve(id);
        } else {
            var message = 'ChromeContextMenu.addItem error: ' + error.message;
            kango.console.log(message);
            deferred.reject(message);
        }
    }.bind(this));

    return deferred.promise;
};

/**
 * Updates an item by the given id.
 * @param {(number|string)} id An id of the item
 * @param {Object} options Item's parameters to update
 */
ChromeContextMenu.prototype.updateItem = function (id, options) {
    chrome.contextMenus.update(id, options);
};

/**
 * Adds an item to the menu.
 * @param {Object} options An object with submenu's item's parameters:
 * @param {Object} menu An instance of the ChromeContextMenu class
 */
ChromeContextMenu.prototype.addSubmenu = function (options, menu) {
    this.addItem(options).then(function (parentId) {
        menu.items.forEach(function (childId) {
            chrome.contextMenus.update(childId, {
                parentId: parentId,
            });
        });
        menu.parent = parentId;
    });
};

(function () {
    function createChromeMenu (structure) {
        var menu = new ChromeContextMenu(structure.urlPatterns);
        var auth_dependent = [];
        structure.items.forEach(function (item) {
            // Recursively adding submenus:
            if (item.items instanceof Array) {
                var submenu = createChromeMenu(item);
                return menu.addSubmenu({
                    label: item.label,
                }, submenu);
            }

            var callback = function () {};
            if (item.url) {
                callback = function (event) {
                    var path = KlavoTools.ContextMenus.makeRedirectURL(this.url, event.linkUrl);
                    kango.browser.tabs.getCurrent(function (tab) {
                        var url = tab.getUrl();
                        var arr = url.split('/');
                        var protocol = arr[0];
                        var host = arr[2];
                        tab.navigate(protocol + '//' + host + path);
                    });
                }.bind({ url: item.url });
            }

            menu.addItem({
                label: item.label,
                callback: callback,
            }).then(function (id) {
                if (item.authorized) {
                    auth_dependent.push(id);
                }
            });
        });

        function handleAuthStateChange(event) {
            auth_dependent.forEach(function (item) {
                menu.updateItem(item, {
                    enabled: !!event.data.id,
                });
            });
        }

        kango.addMessageListener('AuthStateChanged', handleAuthStateChange);
        var authState = KlavoTools.Auth.getState();
        handleAuthStateChange({ data: { id: authState.id } });

        return menu;
    }

    if (typeof chrome !== 'undefined') {
        var userMenuStruct = KlavoTools.ContextMenus.getUserMenuStructure();
        var vocMenuStruct = KlavoTools.ContextMenus.getVocMenuStructure();

        var menuUser = createChromeMenu(userMenuStruct);
        var menuVoc = createChromeMenu(vocMenuStruct);
    }
})();
