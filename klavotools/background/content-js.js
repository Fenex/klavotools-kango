function Script (data) {
    if (!data.updateUrl) {
        throw new Error('Update URL not specified for the ' + data.name + ' userscript');
    }
    this._keys = [];
    for (var key in data) {
        this[key] = data[key];
        this._keys[this._keys.length] = key;
    }
    this.includes = [];
    this.loaded = this.getCode().then(function (code) {
        if (!this.includes.length) {
            this._setIncludes(code);
        }
    }.bind(this));
}

Script.prototype._setIncludes = function (code) {
    var metadata = code.substring(0, code.indexOf('==/UserScript=='));
    var rx = /@(?:include|match)\s+(\S*)/g;
    var url;
    this.includes = [];
    while ((url = rx.exec(metadata)) !== null) {
        var re = new RegExp(url[1].replace(/\./g, '\\.').replace(/\*/g, '.*')
                                .replace(/\?/g, '\\?'));
        this.includes.push(re);
    }
    return Q.resolve(this.includes);
};

Script.prototype.shouldBeIncluded = function (url) {
    if (this.disabled) {
        return false;
    }
    return this.includes.some(function (re) {
        return re.test(url);
    });
};

Script.prototype.getCode = function () {
    if (this.code) {
        return Q.resolve(this.code);
    }
    return this.update();
};

Script.prototype.update = function () {
    return xhr(this.updateUrl).then(function (code) {
        this.code = code;
        this._setIncludes(code);
        return code;
    }.bind(this));
};

Script.prototype.toJSON = function () {
    var res = {};
    this._keys.forEach(function (key) {
        res[key] = this[key];
    }, this);
    return res;
};


function UserJS () {
    this._scripts = {};
    this._init();
}

UserJS.prototype._fetchConfig = function () {
    var options = {
        url: KlavoTools.const.USERJS_CONFIG_URL,
        contentType: 'json',
    };
    return xhr(options).then(function (config) {
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
            script.code = null;
            hash[script.name] = script;
        });
        return hash;
    }).fail(function (error) {
        kango.console.log('Error while loading userscripts config: ' + error.toString());
    });
};

UserJS.prototype._applyLegacyConfig = function (config) {
    var keys = kango.storage.getKeys();
    keys.forEach(function (key) {
        var name = key.match(/^userjs_(\S+)$/);
        if (name) {
            try {
                var oldData = JSON.parse(kango.storage.getItem('userjs_' + name[1]));
                var actualName = name[1].replace('.user.js', '');
                var data = config[actualName];
            } catch (error) {
                kango.console.log('Old UserJS data load error: ' + error.toString());
            }

            if (typeof data !== 'undefined') {
                config[actualName].disabled = !oldData.enabled;
            }
            // Deleting old data:
            kango.storage.removeItem('userjs_' + name[1]);
        }
    }, this);
    return Q.resolve(config);
};

UserJS.prototype.getScriptsForURL = function (url) {
    var res = [];
    for (var name in this._scripts) {
        if (this._scripts[name].shouldBeIncluded(url)) {
            res[res.length] = [name, this._scripts[name].code];
        }
    }
    return res;
};

UserJS.prototype.getAllScripts = function () {
    return this._scripts;
};

UserJS.prototype.updateScriptData = function (name, data) {
    if (!this._scripts[name]) {
        throw new Error('Userscript ' + name + ' not found');
    }

    for (var key in data) {
        this._scripts[name][key] = data[key];
    }
    this._saveState();
};

UserJS.prototype._addScript = function (name, data) {
    var script = new Script(data);
    this._scripts[name] = script;
    return script.loaded;
};

UserJS.prototype._setState = function (data) {
    if (!(data instanceof Object)) {
        throw new TypeError('Wrong data for the UserJS.prototype._setState method');
    }

    var promises = [];
    for (var name in data) {
        promises.push(this._addScript(name, data[name]));
    }

    return Q.all(promises);
};

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
            }
        }

        return Q.all(promises);
    }.bind(this));
};

UserJS.prototype._saveState = function () {
    kango.storage.setItem('userscripts_data', this._scripts);
};

UserJS.prototype._init = function () {
    this._timer = setInterval(function () {
        this._syncState().then(this._saveState.bind(this));
    }.bind(this), 15 * 60 * 1000);

    var data = kango.storage.getItem('userscripts_data');
    if (!data) {
        return this._fetchConfig()
            .then(this._applyLegacyConfig.bind(this))
            .then(this._setState.bind(this))
            .then(this._saveState.bind(this));
    }
    return this._setState(data);
};
