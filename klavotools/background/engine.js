var KlavoTools = {};

//KlavoTools.prefs = {};
KlavoTools.userjs = new UserPref('userjs', DefaultConfig.userjs);
KlavoTools.userstyle = new Skin(DefaultConfig.userstyles);

KlavoTools.version = function() {
    return kango.getExtensionInfo().version;
};

KlavoTools.getSkin = function() {
    return KlavoTools.userstyle.skins;
};

KlavoTools.setSkin = function(skin) {
    KlavoTools.userstyle.save(skin);
};