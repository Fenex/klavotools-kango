var Skin = function() {
    //list of all skins
    this.list = ['beige', 'pink', 'green', 'blue', 'gray', 'nikitakozin'];
    //object {skin-name: isEnable}
    this.skins = {};
    //active skin
    this.active = null;

    //localstorage key's name for memory
    this.key = 'skin';

    //load (equal "init" for first exec)
    this.load();
};

Skin.prototype.load = function() {
    this.skins = {};
    this.active = kango.storage.getItem(this.key) || 'beige';
    
    for(var i=0; i<this.list.length; i++) {
        var name = this.list[i];
        this.skins[name] = (name == this.active) ? true : false;
    }
};

Skin.prototype.save = function(skin) {
    this.active = skin || 'beige';
    kango.storage.setItem(this.key, skin);
    this.load();
};

Skin.prototype.getAll = function() {
    return this.skins;
};

Skin.prototype.getActive = function(content) {
    if(!content)
        return this.active;
    return {
        skin: this.active,
        io: kango.io.getResourceUrl('res/skins/$1')
    };
};

Skin.prototype.toString = function() {
    return '[object Skin]';
};
