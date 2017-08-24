/**
 * @file Content script for handling logins and logouts
 * @author Vitaliy Busko
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

document.addEventListener('DOMContentLoaded', function () {
    try {
        var testPage = document.querySelector('#head .login-block + .menu');
        if (!testPage) {
            throw new ReferenceError('Script loaded on the page with no session data');
        }

        var link = document.querySelector('.user-dropdown .dropmenu a.btn');
        chrome.runtime.sendMessage({
            name: 'authUserId',
            id: link ? link.href.match(/\d+/)[0] * 1 : null,
        });
    } catch (err) {
        console.error('AuthStateListener content script failed: ' + err.toString());
    }
});
