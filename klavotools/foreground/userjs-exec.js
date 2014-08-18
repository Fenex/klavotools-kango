// ==UserScript==
// @name executeScript
// @namespace userjs
// @include http://klavogonki.ru/*
// @require klavotools/foreground/debug.js
// @require klavotools/foreground/userjs-config.js
// @require klavotools/userjs/BB-Tools.user.js
// @require klavotools/userjs/PostOptionsPlus.user.js
// @require klavotools/userjs/DailyScores.user.js
// @require klavotools/userjs/BigTextarea.user.js
// @require klavotools/userjs/DelGameButton.user.js
// @require klavotools/userjs/KlavoEvents.user.js
// @require klavotools/userjs/QuickVocsStart.user.js
// @require klavotools/userjs/KG_DisableTab.user.js
// @require klavotools/userjs/sortresults.user.js
// @require klavotools/userjs/ECM.user.js
// @require klavotools/userjs/NEC.user.js
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
