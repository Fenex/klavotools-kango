// ==UserScript==
// @name executeScript
// @namespace userjs
// @include http://klavogonki.ru/*
// ==/UserScript==

kango.invokeAsync('KlavoTools.UserJS.getScripts', location.href, function(res) {
    if(document.getElementById('KTS-AUTO')) { return false; }
    
    for(var i=0; i<res.length; i++) {
        (function(i) {
            try {
                console.log(i+1, 'of', res.length, res[i].name);
                eval(res[i].code);
            } catch (e) {
                console.log('KlavoTools: error in script #', i, e);
                console.log('code script', res[i]);
            }
        })(i);
    }
    
    var link = document.createElement('link');
    link.setAttribute('id', 'KTS-AUTO');
    document.head.appendChild(link);
});