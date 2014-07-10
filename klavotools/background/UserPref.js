var UserPref = function(key, names) {
    var self = this;
    this.key = key;
    
    this.prefs = {};
    /**
    * @prefs is hash-array of @pref.
    *
    * (structure in the class)
    *  @pref
    *    |-- @enable => (bool)
    *    *-- @description => (string)
    *
    * (structure in the storage)
    * @pref => (bool)
    *
    */
    
    /* set default settings "true" */
    for(var name in names) {
        this.prefs[name] = {
            enable: true,
            description: names[name]
        }
    }
            
    /* replace default settings on user's prefs */
    this.load();
};

UserPref.prototype.load = function() {
    var prefs = kango.storage.getItem(this.key);
    if(prefs) {
        for(name in prefs) {
            if(typeof this.prefs[name] != 'undefined')
                this.prefs[name].enable = prefs[name];
        }
    }
    
    //call the method to save added new scripts after update extension
    this.save();
};

UserPref.prototype.isEnabled = function(id) {
    return this.prefs[id].enable;
};

UserPref.prototype.save = function() {
    /** convert structure of @prefs **/
    var save = {};
    for(var name in this.prefs)
        save[name] = this.prefs[name].enable;
    
    /** save converted @prefs **/
    kango.storage.setItem(this.key, save);
};

UserPref.prototype.getEnable = function() {
    for(var name in this.prefs)
        if(this.prefs[name])
            return name;
    return null;
};


UserPref.prototype.merge = function(data) {
    for(var script in data) {
        if(typeof this.prefs[script] != 'undefined')
            continue;
        this.prefs[script].enable = data[script];
    }
    
    this.save();
};

UserPref.prototype.toString = function() {
    return '[object UserPref]';
};

var Skin = function(list) {
    //list of all skins
    this.list = list;
    //object {skin-name: isEnable}
    this.skins = {};
    //active skin
    this.active = null;

    //localstorage key's name for memory
    this.key = 'skin';

    //load (equal "init" for first exec)
    this.load();
};

Skin.prototype = {
    load: function() {
        this.skins = {};
        this.active = kango.storage.getItem(this.key) || 'beige';
        
        for(var i=0; i<this.list.length; i++) {
            var name = this.list[i];
            this.skins[name] = (name == this.active) ? true : false;
        }
    },
    save: function(skin) {
        this.active = skin;
        kango.storage.setItem(this.key, skin);
        this.load();
    },
    toString: function() {
        return '[object Skin]';
    }
};