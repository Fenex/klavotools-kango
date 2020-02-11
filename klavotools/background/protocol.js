const ProtocolTypes = [
    'HTTPS', // opens new tabs over https
    'HTTP', // ... over http
    'prev' // ... over last used protocol
]

class Protocol {
    static get defaultCfg () {
        return {
            type: 'HTTP',
            redirect: true
        }
    }

    constructor () {
        var config = kango.storage.getItem('settings')
        if (typeof config === 'object' && config.protocol)
            this.config = config.protocol
        else
            this.config = Protocol.defaultCfg

        chrome.runtime.onMessage.addListener(function (message, sender, response) {
            var key = message.name.match(/^protocol\/(.+)$/)
            if (!key)
                return

            switch (key[1]) {
                case 'get': {
                    response({config: this.config})
                    break
                }
                case 'set': {
                    this.saveCfg(message.value)
                    break
                }
                case 'is-need-redirect': {
                    response({redirect: this.isNeedRedirect(message.url)})
                    break
                }
            }
        }.bind(this))
    }

    isNeedRedirect (url) {
        var m = url.match(/^http(s)?:\/\/(klavogonki\.ru.+)$/);
        if (!this.config.redirect || this.config.type === 'prev' || !m)
            return

        var is_https = !!m[1]

        if (is_https && this.config.type === 'HTTP')
            return 'http://' + m[2]

        if (!is_https && this.config.type === 'HTTPS')
            return 'https://' + m[2]

        return false
    }

    saveCfg (cfg) {
        if (ProtocolTypes.indexOf(cfg.type) !== -1
         && typeof cfg.redirect === 'boolean') {
            var ls = kango.storage.getItem('settings') || {}
            ls.protocol = cfg
            kango.storage.setItem('settings', ls)

            // change all properties instead of rewrite a whole object
            // because a reference of the object should not change
            for (var key in cfg)
                this.config[key] = cfg[key]
        }
    }
}
