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
            if(typeof this.prefs[name] != 'undefined')
                this.prefs[name] = prefs[name];
        }
    }
    
    //call the method to save added new scripts after update extension
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

var Skin = function(list) {
    //list of all skins
    this.list = list;
    //object {skin-name: isEnable}
    this.skins = {};
    //load (equal "init" for first exec)
    this.load();
    //active skin
    this.active = null;
    
    //localstorage key's name for memory
    this.key = 'skin1';
};

Skin.prototype = {
    load: function() {
        this.skins = {};
        this.active = kango.storage.getItem(this.skins) || 'beige';
        
        for(var i=0; i<this.list.length; i++) {
            var name = this.list[i];
            this.skins[name] = (name == this.active) ? true : false;
        }
    },
    save: function(skin) {
        this.active = skin;
        kango.storage.setItem(this.skins, skin);
        this.load();
    },
    getActive: function() {
        return this.active;
    }
};