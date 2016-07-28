/**
 * @file ContextMenus module.
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */
function ContextMenus () {
    this._params = {};
}

// TODO: Move structure's data from the module
ContextMenus.prototype.getUserMenuStructure = function () {
    return {
        urlPatterns: [
            '*://klavogonki.ru/profile/*',
            '*://klavogonki.ru/u/*',
        ],
        items: [
            {
                label: 'Открыть диалог',
                icon: 'icons/context_messages.png',
                url: '/u/#/{auth_id}/messages/{user_id}',
                authorized: true,
            },
            {
                label: 'Сводка',
                icon: 'icons/context_summary.png',
                url: '/u/#/{user_id}',
            },
            {
                label: 'Статистика',
                icon: 'icons/context_statistics.png',
                url: '/u/#/{user_id}/stats/',
            },
            {
                label: 'Бортжурнал',
                icon: 'icons/context_logbook.png',
                url: '/u/#/{user_id}/journal/',
            },
            {
                label: 'Достижения',
                icon: 'icons/context_achievements.png',
                url: '/u/#/{user_id}/achievements/',
            },
            {
                label: 'Друзья',
                icon: 'icons/context_friends.png',
                url: '/u/#/{user_id}/friends/',
            },
            {
                label: 'Гараж',
                icon: 'icons/context_garage.png',
                url: '/u/#/{user_id}/car/',
            },
        ],
    };
};

ContextMenus.prototype.getVocMenuStructure = function () {
    return {
        urlPatterns: [
            '*://klavogonki.ru/vocs/*',
        ],
        items: [
            {
                label: 'Информация',
                url: '/vocs/{voc_id}',
            },
            {
                label: 'Играть',
                items: [
                    {
                        label: 'Открытый заезд, 10 сек',
                        url: '/create/?gametype=voc&type=normal&level_from=1' +
                            '&level_to=9&timeout=10&submit=1&voc={voc_id}',
                    },
                    {
                        label: 'Открытый заезд, 20 сек',
                        url: '/create/?gametype=voc&type=normal&level_from=1' +
                            '&level_to=9&timeout=20&submit=1&voc={voc_id}',
                    },
                    {
                        label: 'Одиночный заезд, 5 сек',
                        url: '/create?gametype=voc&type=practice&level_from=1' +
                            '&level_to=9&timeout=5&submit=1&voc={voc_id}',
                    },
                    {
                        label: 'Заезд с друзьями, 10 сек',
                        url: '/create/?gametype=voc&type=private&level_from=1' +
                            '&level_to=9&timeout=10&submit=1&voc={voc_id}',
                        authorized: true,
                    },
                    {
                        label: 'Квалификация, 5 сек',
                        url: '/create/?gametype=voc&type=practice&level_from=1' +
                            '&level_to=9&timeout=5&submit=1&qual=1&voc={voc_id}',
                    },
                ],
            },
            {
                label: 'Рекорды',
                url: '/vocs/{voc_id}/top',
            },
            {
                label: 'История',
                url: '/vocs/{voc_id}/history',
            },
            {
                label: 'Комментарии',
                url: '/vocs/{voc_id}/comments',
            },
        ],
    };
};

/**
 * Substitutes variables into the URL's path.
 * @param {String} template The URL's path template
 * @return {String}
 */
ContextMenus.prototype.makeRedirectURL = function(template) {
    var auth_id = KlavoTools.Auth.getState().id;
    if (auth_id) {
        template = template.replace(/{auth_id}/g, auth_id);
    }
    for (var field in this._params) {
        var re = new RegExp('{' + field + '}', 'g');
        template = template.replace(re, this._params[field]);
    }
    return template;
};

/**
 * (Static method) Checks the given link's "href" attribute value for the id of
 * user or vocabulary, and in case of success, returns an object with
 * corresponding data, or an empty object otherwise.
 *
 * @param {String} url Link's "href" attribute value
 * @return {Object} An object with results
 */
ContextMenus.parseLinkURL = function (url) {
    var re = /(profile|u\/#|vocs)\/(\d+)/;
    var matches = url.match(re);
    var result = {};
    if (!matches) {
        return result;
    }

    if (matches[1] === 'vocs') {
        result.voc_id = matches[2];
    } else {
        result.user_id = matches[2];
    }
    return result;
}

/**
 * Set the parameters for the active context menu.
 *
 * @param {Object} params An object with parameters to save
 */
ContextMenus.prototype.setParams = function (params) {
    for (var field in this._params) {
        delete this._params[field];
    }
    for (var field in params) {
        this._params[field] = params[field];
    }
};
