// ==UserScript==
// @name executeSkin
// @namespace skin
// @run-at document-start
// @include http://klavogonki.ru/*
// @require klavotools/foreground/userstyle-default.js
// ==/UserScript==
kango.invokeAsync('KlavoTools.Skin.getActive', true, function(answer) {console.log(answer);
    var skin_cache = kango.storage.getItem('skin-cache');
    var skin_pref = kango.storage.getItem('skin-pref');
    if(answer.skin == skin_pref)
        return applySkin(skin_cache);
    
    kango.xhr.send({
        method: 'GET',
        url: 'res/skins/'+answer.skin+'.css',
        async: true,
        contentType: 'text'
    }, function(res) {
        res = res.response.replace(/%FOLDER_([a-zA-Z0-9]+?)%/gm, answer.io);
        var css = res + json2css(default_style) + css_txt;
        kango.storage.setItem('skin-cache', css);
        kango.storage.setItem('skin-pref', answer.skin);
        applySkin(css);
    });
    
    function applySkin(css) {
        var s = document.createElement('style');
        s.innerHTML = css;        
        document.head.appendChild(s);
    }
});