var DEBUG_MODE = true;

function ktslog() {
    if(DEBUG_MODE)
        console.log(arguments);
}

var UserJS = {};
UserJS.scripts = {};
UserJS.addScript = function(id, rules, func) {
    for(var i=0; i<rules.length; i++) {
        if(rules[i].test(location.href)) {
            UserJS.scripts[id] = {
                rules: rules,
                func: func
            };
            return true;
        }
    }
    
    return false;
};