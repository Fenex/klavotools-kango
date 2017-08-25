/**
 * @file Content script for user styles applying.
 * @author Vitaliy Busko
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

document.documentElement.classList.add('skin');
chrome.runtime.sendMessage({
    name: 'getActiveSkin',
}, function (name) {
    document.documentElement.classList.add(name);
});
