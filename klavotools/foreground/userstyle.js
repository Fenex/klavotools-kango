// ==UserScript==
// @name executeStyle
// @namespace userstyle
// @run-at document-start
// @include http://klavogonki.ru/*
// @require klavotools/foreground/debug.js
// ==/UserScript==
kango.invokeAsync('KlavoTools.userstyle.getActive', function(skin) {
    var s = document.createElement('link');
    s.setAttribute('type', 'text/css');
    s.setAttribute('rel', 'stylesheet');
    s.setAttribute('href', kango.io.getResourceUrl('res/skins/'+skin+'.css'));
    document.head.appendChild(s);
});