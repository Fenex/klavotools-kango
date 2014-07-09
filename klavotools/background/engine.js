var KlavoTools = {};

//KlavoTools.prefs = {};
KlavoTools.userjs = new UserPref('userjs', DefaultConfig.userjs);
KlavoTools.userstyle = new UserPref('userstyle', DefaultConfig.userstyle);
KlavoTools.version = function() {
    return kango.getExtensionInfo().version;
};