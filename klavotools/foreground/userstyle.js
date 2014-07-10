// ==UserScript==
// @name executeStyle
// @namespace userstyle
// @run-at document-start
// @include http://klavogonki.ru/*
// @require klavotools/foreground/debug.js
// ==/UserScript==
(function() {
    var s = document.createElement('link');
    s.setAttribute('type', 'text/css');
    s.setAttribute('rel', 'stylesheet');
    s.setAttribute('href', kango.io.getResourceUrl('res/skins/beige.css'));
    document.head.appendChild(s);
})();