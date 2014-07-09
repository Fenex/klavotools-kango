// ==UserScript==
// @name execute
// @namespace userjs
// @include http://klavogonki.ru/*
// @require klavotools/foreground/debug.js
// @require klavotools/foreground/userjs-config.js
// @require klavotools/userjs/BB-Tools.user.js
// @require klavotools/userjs/PostOptionsPlus.user.js
// ==/UserScript==

for (var userjs in UserJS.scripts) {
    (function() {
        var id = userjs;
        kango.invokeAsync('KlavoTools.userjs.isEnabled', id, function(value) {
        if(value)
            UserJS.scripts[id].func();
        });
    })();
}