var KlavoTools = {};

//KlavoTools.prefs = {};
KlavoTools.userjs = new UserPref('userjs', DefaultConfig.userjs);
KlavoTools.userstyle = new Skin(DefaultConfig.userstyles);

KlavoTools.version = function() {
    return kango.getExtensionInfo().version;
};

KlavoTools.Skin = {
    getActive: function(content) {
        if(!content)
            return KlavoTools.userstyle.active;
        return {
            skin: KlavoTools.userstyle.active,
            io: kango.io.getResourceUrl('res/skins/$1')
        };
    },
    setActive: function(skin) {
        return KlavoTools.userstyle.save(skin);
    },
    getAll: function() {
        return KlavoTools.userstyle.skins;
    }
};