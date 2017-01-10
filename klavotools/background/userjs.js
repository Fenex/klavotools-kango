/**
 * @file A module for work with the userscripts.
 * @author Vitaliy Busko
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 * @requires Script
 * @requires semver
 */
function UserJS () {
    this._scripts = {};
    this._init();
}

/**
 * Fetches the userscripts configuration from the repository.
 * @returns {Promise.<Object.<string, UserscriptData>>}
 * @private
 */
UserJS.prototype._fetchConfig = function () {
    var options = {
        url: KlavoTools.const.USERJS_CONFIG_URL,
        contentType: 'json',
    };
    return xhr(options).then(function (config) {
        if (!Array.isArray(config)) {
            return Q.reject('Got bad userscripts configuration: ' + config.toString());
        }
        var hash = {};
        config.forEach(function (script) {
            // FIXME: remove this crutch :D
            if (script.name === 'chat2BBcode') {
                script.name = 'chat2BBCode';
            }
            script.updateUrl =
                KlavoTools.const.USERJS_DIRECTORY_URL + '/' + script.name + '.user.js';
            script.integrated = script.integrated ? true : false;
            script.disabled = script.disabled ? true : false;
            script.conflicts = script.conflicts ? script.conflicts : [];
            script._ignoreUpdate = ['disabled'];
            hash[script.name] = script;
        });
        return hash;
    }).fail(function (error) {
        kango.console.log('Error while loading userscripts config: ' + error.toString());
        return Q.reject(error);
    });
};

/**
 * Returns a 2d array, containing the data of userscripts, that should be
 * included on the page, by the given URL string.
 * @param {string} url The location.href value.
 * @returns {Array.<string[]>>} Userscripts names and codes.
 */
UserJS.prototype.getScriptsForURL = function (url) {
    var res = [];
    for (var name in this._scripts) {
        if (this._scripts[name].shouldBeIncluded(url)) {
            res[res.length] = [name, this._scripts[name].code];
        }
    }
    return res;
};

/**
 * Returns an array of the all registered userscripts.
 * @returns {Script[]}
 */
UserJS.prototype.getAllScripts = function () {
    return this._scripts;
};

/**
 * Updates the userscript data by the given name and hash object.
 * @param {string} name The userscript name.
 * @param {Object} data A key-value hash object with userscript properties to change.
 */
UserJS.prototype.updateScriptData = function (name, data) {
    if (!this._scripts[name]) {
        throw new Error('Userscript ' + name + ' not found');
    }

    for (var key in data) {
        this._scripts[name][key] = data[key];
    }
    this._saveState();
};

/**
 * Sets the initial state of userscripts.
 * @requires Script
 * @param {string} name The userscript name.
 * @param {UserscriptData} data A key-value hash object with userscripts data.
 * @returns {Promise.<(Object|string)>}
 * @private
 */
UserJS.prototype._addScript = function (name, data) {
    var script = new Script(data);
    this._scripts[name] = script;
    return script.loaded;
};

/**
 * Sets the initial state of userscripts.
 * @returns {Promise.<(Object|Array)>}
 * @private
 */
UserJS.prototype._setState = function (data) {
    if (data !== Object(data)
            || Object.prototype.toString.call(data) !== '[object Object]') {
        throw new TypeError('Wrong data for the UserJS.prototype._setState method');
    }

    var promises = [];
    for (var name in data) {
        promises.push(this._addScript(name, data[name]));
    }

    return Q.all(promises);
};

/**
 * Fetches userscripts configuration from the repository, updates the current state if
 * needed.
 * @requires semver
 * @returns {Promise.<(Object|Array)>}
 * @private
 */
UserJS.prototype._syncState = function () {
    return this._fetchConfig().then(function (config) {
        var promises = [];

        for (var name in this._scripts) {
            if (!config[name]) {
                delete this._scripts[name];
            } else if (semver.gt(config[name].version, this._scripts[name].version)) {
                promises.push(this._scripts[name].update());
            }
        }

        for (var name in config) {
            if (!this._scripts[name]) {
                promises.push(this._addScript(name, config[name]));
            } else {
                var script = this._scripts[name];
                var data = config[name];
                for (var key in data) {
                    if (data._ignoreUpdate.indexOf(key) < 0) {
                        script[key] = data[key];
                    }
                }
            }
        }

        return Q.all(promises).then(function (data) {
            return Q.resolve(this._scripts)
        }.bind(this));
    }.bind(this));
};

/**
 * Saves the current userscripts data to the localStorage.
 * @private
 */
UserJS.prototype._saveState = function () {
    kango.storage.setItem('userscripts_data', this._scripts);
};

/**
 * Loads userscripts data, starts check timer.
 * @returns {Promise.<(Object|Array)>}
 * @private
 */
UserJS.prototype._init = function () {
    this._timer = setInterval(function () {
        this._syncState().then(this._saveState.bind(this));
    }.bind(this), 15 * 60 * 1000);

    var data = kango.storage.getItem('userscripts_data');
    if (!data) {
        return this._fetchConfig()
            .then(this._setState.bind(this))
            .then(this._saveState.bind(this));
    }
    return this._setState(data);
};
