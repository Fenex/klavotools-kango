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

Competitions.prototype._update = function (data) {
    clearTimeout(this.timer);

    var res = data.response;

    if (data.status && data.status != 200 || !res.gamelist[0].params.competition) {
        this.timer = setTimeout(this.check.bind(this), 10 * 1000);
        return false;
    }

    var serverTime = res.time;
    var rate = res.gamelist[0].params.regular_competition || 1;
    var beginTime = res.gamelist[0].begintime;
    var gmid = res.gamelist[0].id;
    var remainingTime = beginTime - serverTime;

    if (remainingTime <= 0) {
        this.timer = setTimeout(this.check.bind(this), 120 * 1000);
        return false;
    }

    // Next check in (start + 2) minutes:
    this.timer = setTimeout(this.check.bind(this), (remainingTime + 120) * 1000);

    // Does user want to see competition with this rate?
    if (!~this.rates.indexOf(rate)) {
        return false;
    }

    var timer = remainingTime - this.delay;
    if (timer < 1) {
        timer = 1;
    }

    var title = 'Соревнование';
    var body = 'Соревнование x' + rate + ' начинается';
    var icon = kango.io.getResourceUrl('res/comp_btn.png');

    var displayTime = this.displayTime;
    if (displayTime > remainingTime - timer) {
        displayTime = remainingTime - timer;
    }

    this.notification = new DeferredNotification(title, {
        body: body,
        icon: icon,
        displayTime: displayTime > 0 ? displayTime : undefined,
    });

    this.notification.onclick = function () {
        kango.browser.tabs.create({
            url: 'http://klavogonki.ru/g/?gmid='+gmid,
            focused: true,
        });
        this.notification.revoke();
    }.bind(this);

    this.notification.show(timer);
};

Competitions.prototype.check = function() {
    if(!this.active) { return; }
    var self = this;

    var details = {
        method: 'POST',
        url: 'http://klavogonki.ru/gamelist.data?KTS_REQUEST',
        params: {
            'cached_users': '0'
        },
        contentType: 'json'
    };

    kango.xhr.send(details, this._update.bind(this));
};
