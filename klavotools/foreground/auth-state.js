// ==UserScript==
// @name AuthStateListener
// @namespace auth
// @include http://klavogonki.ru/*
// ==/UserScript==

try {
    var link = document.querySelector('.user-dropdown .dropmenu a.btn');
    var userId = link ? link.href.match(/\d+/)[0] * 1 : null;
    kango.invokeAsync('KlavoTools.Auth.getState', function (state) {
        if (state.id !== userId) {
            if (userId) {
                kango.invokeAsync('KlavoTools.Auth.login');
            } else {
                kango.invokeAsync('KlavoTools.Auth.logout');
            }
        }
    });
} catch (err) {
    console.error('AuthStateListener content script failed: ' + err.toString());
}
