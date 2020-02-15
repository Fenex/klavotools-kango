const ProtocolTypes = [
    'HTTPS', // opens new tabs over https
    'HTTP', // ... over http
    'prev' // ... over same last opened page's protocol
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
        if (typeof config === 'object' && config.protocol !== void 0)
            this.config = config.protocol
        else
            this.config = Protocol.defaultCfg

        chrome.runtime.onMessage.addListener(function (message, sender, response) {
            var key = message.name.match(/^protocol\/(.+)$/)
            if (!key)
                return

            switch (key[1]) {
                case 'config': {
                    response({config: this.config})
                    break
                }
                case 'get': {
                    response({protocol: this.get()})
                    break
                }
                case 'set': {
                    this.saveCfg(message.value)
                    response({ok: 1})
                    break
                }
                case 'opened-tab': {
                    response({redirect: this.redirect(message.url)})
                    break
                }
                case 'convert': {
                    response({url: this.convert(message.url)})
                    break
                }
                default: {
                    response({err: 'unknown key: `' + key[1] + '`'})
                    break
                }
            }
        }.bind(this))
    }

    redirect (url) {
        var m = url.match(/^http(s)?:\/\/(klavogonki\.ru.+)$/);
        if (m) {
            var is_https = !!m[1]
            if (this.config.redirect && this.config.type !== 'prev') {
                if (is_https && this.config.type === 'HTTP') {
                    this.is_last_protocol_https = false
                    return 'http://' + m[2]
                }
                if (!is_https && this.config.type === 'HTTPS') {
                    this.is_last_protocol_https = true
                    return 'https://' + m[2]
                }
            }

            this.is_last_protocol_https = is_https
        }

        return false
    }

    get () {
        switch (this.config.type) {
            case 'HTTP': return 'http'
            case 'HTTPS': return 'https'
            default:
                return this.is_last_protocol_https ? 'https' : 'http'
        }
    }

    convert (url) {
        url = new URL(url, 'http://klavogonki.ru');
        if (url.hostname !== 'klavogonki.ru')
            return url

        url.protocol = this.get() + ':'
        return url.href
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
