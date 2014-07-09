var UserPref = function(key, names) {
    this.key = key;
    
    /* set default settings "true" */
    this.prefs = {};
    for(var i=0; i<names.length; i++) {
        this.prefs[names[i]] = true;
    }
            
    /* replace default settings on user's prefs */
    this.load();
};

UserPref.prototype.load = function() {
    var prefs = kango.storage.getItem(this.key);
    if(prefs) {
        for(name in prefs) {
            this.prefs[name] = prefs[name];
        }
    }
    
    this.save();
};

UserPref.prototype.isEnabled = function(id) {
    return this.prefs[id];
}

UserPref.prototype.save = function() {
    kango.storage.setItem(this.key, this.prefs);
};

UserPref.prototype.getEnable = function() {
    for(var name in this.prefs)
        if(this.prefs[name])
            return name;
    return null;
};

UserPref.prototype.toString = function() {
    return '[object UserPref]';
};