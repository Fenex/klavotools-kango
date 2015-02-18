/**
 *  Competitions Module
 *
 *  The module checks for new open competitions and shows notifications.
*/

var Competitions = function(notifications) {
    //point to notification module
    this.notifications = notifications;
    //active status of the module
    this.active = false;
    //point to timeout of this.check
    this.timer = false;
    
    /** default values **/
    this.delay = kango.storage.getItem('competition_delay') || 60; //1 min
    this.rates = kango.storage.getItem('competition_rates') || [3, 5]; //x3, x5
    
    if(this.delay * this.rates.length > 0)
        this.activate();
};

Competitions.prototype.getParams = function() {
    return {
        rates: this.rates,
        delay: this.delay
    };
};

Competitions.prototype.setParams = function(param) {
    this.rates = param.rates || this.rates;
    if(param.delay >= 0) {
        this.delay = param.delay;
    }
    
    kango.storage.setItem('competition_delay', this.delay);
    kango.storage.setItem('competition_rates', this.rates);
    
    if(this.delay * this.rates.length === 0)
        return this.deactivate();
    
    if(param.delay) {
        this.deactivate();
        this.activate();
    }    
};

Competitions.prototype.activate = function() {
    if(this.active)
        return console.log('active already');
    
   this.active = true;
   this.check();
};

Competitions.prototype.deactivate = function() {
    if(!this.active)
        return console.log('deactive already');
    
    clearTimeout(this.timer);
    this.active = false;
};

Competitions.prototype.check = function() {
    if(!this.active) { return; }
    var self = this;
    
    var details = {
        method: 'POST',
        url: 'http://klavogonki.ru/gamelist.data?KTS_REQUEST',
        async: true,
        params: {
            'cached_users': '0'
        },
        contentType: 'json'
    };
    
    kango.xhr.send(details, function(res) {
        /**
        * FIXME: if @status isn't equal to 200, @check will not performed anymore
        */        
        if(res.status != 200) { return; }
        res = res.response;
        
        clearTimeout(self.timer);
        
        if(!res.gamelist[0].params.competition) {
            self.timer = setTimeout(function() { self.check() }, 10 * 1000);
            return false;
        }
            
        var server_time = res.time;
        var rate = res.gamelist[0].params.regular_competition || 1;
        var begintime = res.gamelist[0].begintime;
        var gmid = res.gamelist[0].id;
        
        if(begintime - server_time <= 0) {
            self.timer = setTimeout(function() { self.check() }, 120 * 1000);
            return false;
        }
        
        /** next check in (start + 2) minutes **/
        self.timer = setTimeout(function() { self.check() }, (begintime - server_time + 120) * 1000);
        
        /** does user want to see competition with this rate? **/
        if(!~self.rates.indexOf(rate)) {
            return false;
        }

        var timer = begintime - server_time - self.delay;
        if(timer < 1)
            timer = 1;
        
        var notif = self.notifications.create({
            title: 'Соревнование',
            message: 'Соревнование х'+rate+' начинается',
            iconUrl: kango.io.getResourceUrl('res/comp_btn.png'),
            onclick: 'http://klavogonki.ru/g/?gmid='+gmid
        });
        
        notif.show(timer * 1000);
        notif.hide((begintime - server_time) * 1000);
    });
};