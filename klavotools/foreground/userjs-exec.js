/**
 * @file Content script for user scripts execution.
 * @author Vitaliy Busko
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

function execScript(name, code) {
    try {
        eval(code);
    } catch (error) {
        console.log('KlavoTools: error in script ', name, error);
    }
}
function execScripts(scriptsData, state) {
    scriptsData.filter(function (data) {
        return data[1] === state;
    }).forEach(function (data) {
        execScript(data[0], data[2]);
    });
}

chrome.runtime.sendMessage({
    name: 'getScriptsForURL',
    url: location.href,
}, function(scripts) {
    if (document.getElementById('KTS-AUTO')) {
        return false;
    }

    execScripts(scripts, 'document_start');
    document.addEventListener('DOMContentLoaded', function () {
        execScripts(scripts, 'document_end');
        // TODO: document_idle != window.onload
        window.addEventListener('load', function () {
            execScripts(scripts, 'document_idle');
        });
    });

    var link = document.createElement('link');
    link.setAttribute('id', 'KTS-AUTO');
    document.head.appendChild(link);
});
