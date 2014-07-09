var UserJS = function() {
    /* set default settings */
    this.scripts = {
        'BB-Tools': true,
        'PostOptionsPlus': true
    };
    
    /* replace default settings on user's prefs */
    this.load();
};

UserJS.prototype.load = function() {
    var scripts = kango.storage.getItem('userjs');
    if(scripts) {
        for(name in scripts) {
            this.scripts[name] = scripts[name];
        }
    } else {
        this.save();
    }
};

UserJS.prototype.isEnabled = function(id) {
    return this.scripts[id];
}

UserJS.prototype.save = function() {
    kango.storage.setItem('userjs', this.scripts);
};

UserJS.prototype.toString = function() {
    return '[object UserJS]';
};