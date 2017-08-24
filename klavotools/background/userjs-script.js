/**
 * @file A module for work with a single userscript data.
 * @author Vitaliy Busko
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

/**
 * Userscripts data object structure.
 * @typedef {Object} UserscriptData
 * @property {string} name An unique userscript name.
 * @property {strng} version A valid semantic version.
 * @property {string[]} authors An array with authors names of the userscript.
 * @property {boolean} integrated Whether the script is "integrated" in the KlavoTools.
 * @property {boolean} disabled Whether the script is disabled.
 * @property {string[]} tags An array with userscript tags.
 * @property {string} description The userscript description.
 * @property {string[]} conflicts An array with the names of conflicting userscripts.
 */

/**
 * @param {UserscriptData} data A hash object with the userscript data
 * @constructor
 */
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
        return code;
    }.bind(this));
}

/**
 * Sets the RegExp objects (for testing whether the userscript should be included on
 * the page) by the given userscript source code.
 * @param {string} code The userscript source code.
 * @returns {Promise.<Object>}
 * @private
 */
Script.prototype._setIncludes = function (code) {
    var metadata = code.substring(0, code.indexOf('==/UserScript=='));
    var includesRE = /@(?:include|match)\s+(\S*)/g;
    var runAtRE = /@run-at\s+(\S+)/;
    var url;
    this.includes = [];
    this.runAt = runAtRE.test(metadata) ? metadata.match(runAtRE)[1].replace('-', '_')
        : 'document_idle';
    while ((url = includesRE.exec(metadata)) !== null) {
        var re = new RegExp(url[1].replace(/\./g, '\\.').replace(/\*/g, '.*')
                                .replace(/\?/g, '\\?'));
        this.includes.push(re);
    }

    return Q.resolve(this.includes);
};

/**
 * Returns a boolean, representing whether the userscript should be included on the page,
 * by the given URL string.
 * @param {string} url The location.href value
 * @returns {boolean}
 */
Script.prototype.shouldBeIncluded = function (url) {
    if (this.disabled || this.broken) {
        return false;
    }
    return this.includes.some(function (re) {
        return re.test(url);
    });
};

/**
 * Returns a promise to the userscript source code.
 * @returns {Promise.<(string|Object)>}
 */
Script.prototype.getCode = function () {
    if (this.code) {
        return Q.resolve(this.code);
    }
    return this.update();
};

/**
 * Fetches and saves the userscript source code from the repository.
 * @returns {Promise.<(string|Object)>}
 */
Script.prototype.update = function () {
    return xhr(this.updateUrl).then(function (code) {
        this.code = code;
        this._setIncludes(code);
        return code;
    }.bind(this));
};

/**
 * A custom JSON serialization method.
 * @returns {Object}
 */
Script.prototype.toJSON = function () {
    var res = {};
    this._keys.forEach(function (key) {
        res[key] = this[key];
    }, this);
    return res;
};
