if (location.host === 'klavogonki.ru') {
    // do not modify location if we on remind page with `key` param (reset pwd process)
    // see https://github.com/Fenex/klavotools-kango/issues/45
    if (!/\/remind.*[\?&]key=[\da-fA-F]{32}/.test(location.href)) {
        chrome.runtime.sendMessage({
            name: 'protocol/opened-tab',
            url: location.href
        }, function (response) {
            if (response.redirect)
                location.href = response.redirect
        })
    }
}
