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
    this.delay = 60; //1 min
    this.rates = [1, 2, 3, 5];
};

Competitions.prototype.setParams = function(param) {
    this.delay = param.delay || this.delay;
    this.rates = param.rates || this.rates;
    
    this.deactivate();
    this.activate();
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
        if(res.status != 200) { return; }
        res = res.response;
        
        if(!res.gamelist[0].params.competition) {
            self.timer = setTimeout(function() { self.check() }, 10 * 1000);
            console.log('competition game not found. try to get again in 2 min');
            return false;
        }
            
        var server_time = res.time;
        var rate = res.gamelist[0].params.regular_competition || 1;
        var begintime = res.gamelist[0].begintime;
        var gmid = res.gamelist[0].id;
        
        if(begintime - server_time <= 0) {
            self.timer = setTimeout(function() { self.check() }, 120 * 1000);
            console.log('bigintime < server_time: ' + begintime + ' ' + server_time);
            return false;
        }
        
        console.log('set to execute check func in (start + 2 minutes)');
        /** next check in (start + 2) minutes **/
        self.timer = setTimeout(function() { self.check() }, (begintime - server_time + 120) * 1000);
        
        console.log('detected game with rate: ' + rate);
        if(!~self.rates.indexOf(rate)) {
            return false;
        }

        var timer = begintime - server_time - self.delay;
        if(timer < 1)
            timer = 1;
        
        var notif = self.notifications.create({
            title: 'Соревнование',
            message: 'Соревнование х'+rate+' начинается',
            iconUrl: kango.io.getResourceUrl('res/comp_btn.png')
        });
        
        console.log(timer * 1000);
        console.log((begintime - server_time) * 1000);
        
        setTimeout(function() {notif.show()}, timer * 1000);
        setTimeout(function() {notif.hide()}, (begintime - server_time) * 1000);
    });
};