// ==UserScript==
// @name executeScript
// @namespace userjs
// @include http://klavogonki.ru/*
// ==/UserScript==

kango.invokeAsync('KlavoTools.UserJS.getScriptsForURL', location.href, function(scripts) {
    if (document.getElementById('KTS-AUTO')) {
        return false;
    }

    scripts.forEach(function execScript(script, index) {
        try {
            eval(script[1]);
        } catch (error) {
            console.log('KlavoTools: error in script ', script[0], error);
        }
    })

    var link = document.createElement('link');
    link.setAttribute('id', 'KTS-AUTO');
    document.head.appendChild(link);
});
