if (location.host === 'klavogonki.ru') {
    chrome.runtime.sendMessage({
        name: 'protocol/opened-tab',
        url: location.href
    }, function (response) {
        if (response.redirect)
            location.href = response.redirect
    })
}
