chrome.runtime.sendMessage({
    name: 'protocol/is-need-redirect',
    url: location.href
}, function (response) {
    if (response.redirect)
        location.href = response.redirect
})
