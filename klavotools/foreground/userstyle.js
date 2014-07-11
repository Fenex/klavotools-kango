// ==UserScript==
// @name executeSkin
// @namespace skin
// @run-at document-start
// @include http://klavogonki.ru/*
// @require klavotools/foreground/debug.js
// @require klavotools/foreground/userstyle-default.js
// ==/UserScript==
kango.invokeAsync('KlavoTools.Skin.getActive', true, function(answer) {
    /**
    * TODO: write cache. perhaps, background-side (?)
    */
    kango.xhr.send({
        method: 'GET',
        url: 'res/skins/'+answer.skin+'.css',
        async: true,
        contentType: 'text'
    }, function(res) {
        res = res.response.replace(/%FOLDER_([a-zA-Z0-9]+?)%/gm, answer.io);
        
        var s = document.createElement('style');
        s.innerHTML = res + json2css(default_style) + css_txt;
        document.head.appendChild(s);
    });
});