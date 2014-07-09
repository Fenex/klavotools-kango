// ==UserScript==
// @name execute
// @namespace userstyle
// @run-at document-start
// @include http://klavogonki.ru/*
// @require klavotools/foreground/debug.js
// @require klavotools/foreground/userstyle-config.js
// ==/UserScript==
(function() {
    function json2css(json) {
        return json.toString();
    }
    
    var s = document.createElement('style');
    s.innerHTML = json2css('body{background: black !important;}');
    document.head.appendChild(s);
})();