/**
 * @file Competitions Module. The module checks for new open competitions and shows
 *  notifications to user.
 * @author Vitaliy Busko
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */
var Competitions = function() {
    // A reference to the deferred notification:
    this.notification = null;
    //active status of the module
    this.active = false;
    //point to timeout of this.check
    this.timer = false;

    this.url = 'http://klavogonki.ru/gamelist.data?KTS_REQUEST';
    
    /** default values **/
    this.rates = kango.storage.getItem('competition_rates') || [3, 5]; //x3, x5
    this.delay = kango.storage.getItem('competition_delay');
    this.displayTime = kango.storage.getItem('competition_displayTime');
    if (typeof this.delay != 'number') {
        // 1 minute:
        this.delay = 60;
    }
    if (typeof this.displayTime != 'number') {
        // Default time:
        this.displayTime = 0;
    }

    if (this.delay * this.rates.length > 0) {
        this.activate();
    }
};

Competitions.prototype.getParams = function() {
    return {
        rates: this.rates,
        delay: this.delay,
        displayTime: this.displayTime,
    };
};

Competitions.prototype.setParams = function(param) {
    this.rates = param.rates || this.rates;
    if (typeof param.displayTime === 'number' && param.displayTime >= 0) {
        this.displayTime = param.displayTime;
    }

    if (typeof param.delay === 'number' && param.delay >= 0) {
        this.delay = param.delay;
    }

    kango.storage.setItem('competition_delay', this.delay);
    kango.storage.setItem('competition_rates', this.rates);
    kango.storage.setItem('competition_displayTime', this.displayTime);

    if (this.delay * this.rates.length === 0) return this.deactivate();

    if (param.delay || param.displayTime >= 0) {
        this.deactivate();
        this.activate();
    }
};

Competitions.prototype.activate = function() {
    if(this.active)
        return kango.console.log('active already');

   this.active = true;
   this.check();
};

Competitions.prototype.deactivate = function() {
    if(!this.active)
        return kango.console.log('deactive already');

    clearTimeout(this.timer);
    if (this.notification !== null) {
        this.notification.revoke();
        this.notification = null;
    }
    this.active = false;
};

Competitions.prototype.checkKango = function(data) {
    var details = {
        method: 'POST',
        url: this.url,
        params: {
            'cached_users': '0'
        },
        contentType: 'json'
    };

    var deferred = Q.defer();
    kango.xhr.send(details, function (data) {
        if(data.status == 200)
            deferred.resolve(data.response);
        else
            deferred.reject(data);
    });
    return deferred.promise;
};

Competitions.prototype.checkFetch = function(data) {
    return fetch(this.url, {
        method: 'POST',
        body: JSON.stringify({
            cached_users: '0'
        })
    }).then(function(res) {
        return res.json()
    });
};

Competitions.prototype.check = function() {
    if(!this.active) { return; }
    var self = this;

    var defer;
    
    if(typeof fetch == 'function') {
        //returned native Promise
        this._last_type_xhr = 'fetch';
        defer = this.checkFetch();
    } else {
        //returned Q-promise
        this._last_type_xhr = 'kango';
        defer = this.checkKango();
    }
    
    defer.then(function(data) {
        if(!data.gamelist[0].params.competition)
            return Q.reject();
        
        clearTimeout(self.timer);
        
        var serverTime = data.time;
        var rate = data.gamelist[0].params.regular_competition || 1;
        var beginTime = data.gamelist[0].begintime;
        var gmid = data.gamelist[0].id;
        var remainingTime = beginTime - serverTime;

        if (remainingTime <= 0) {
            self.timer = setTimeout(function() { self.check() }, 120 * 1000);
            return false;
        }

        /** next check in (start + 2) minutes **/
        self.timer = setTimeout(function() { self.check() }, (remainingTime + 120) * 1000);

        /** does user want to see competition with this rate? **/
        if(!~self.rates.indexOf(rate)) {
            return false;
        }

        var timer = remainingTime - self.delay;
        if(timer < 1)
            timer = 1;

        var title = 'Соревнование';
        var body = 'Соревнование x'+rate+' начинается';
        var icon = kango.io.getResourceUrl('res/comp_btn.png');

        var displayTime = self.displayTime;
        if (displayTime > remainingTime - timer) {
            displayTime = remainingTime - timer;
        }

        self.notification = new DeferredNotification(title, {
            body: body,
            icon: icon,
            displayTime: displayTime > 0 ? displayTime : void 0,
        });

        self.notification.onclick = function () {
            kango.browser.tabs.create({
                url: 'http://klavogonki.ru/g/?gmid='+gmid,
                focused: true,
            });
            self.notification.revoke();
        };

        self.notification.show(timer);
    }).catch(function(err) {
        clearTimeout(self.timer);
        self.timer = setTimeout(function() { self.check() }, 10 * 1000);
    });
};
