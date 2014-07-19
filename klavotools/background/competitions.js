/**
 *  Competitions Module
 *
 *  The module checks for new open competitions and shows notifications.
*/

var Competitions = function(notifications) {
    this.notifications = notifications;
    this.active = false;
    this.timer = false;
    this.delay = 10 * 1000; //10 sec
    this.rates = [1, 2, 3, 5];
};

Competitions.prototype.activate = function() {
    if(this.active)
        return console.log('active already');
    
   this.active = true;
   this.check();
};

Competitions.prototype.deactivate = function() {
    if(!this.active)
        return console.log('deactive already') && false;
    
    clearTimeout(this.timer);
    this.active = false;
    
    return true;
};

Competitions.prototype.check = function() {
    if(!this.deactivate()) { return; }
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
            self.timer = setTimeout(self.check, 120 * 1000);
            return false;
        }
            
        var server_time = res.time;
        var rate = res.gamelist[0].params.regular_competition || 1;
        var begintime = res.gamelist[0].begintime;
        var gmid = res.gamelist[0].id;
        
        if(begintime - server_time <= 0) {
            self.timer = setTimeout(self.check, 120 * 1000);
            return false;
        }
        
        /** next check in (start + 2) minutes **/
        self.timer = setTimeout(self.check, (begintime - server_time + 120) * 1000);
        
        if(!~self.rates.indexOf(rate)) {
            return false;
        }
        
        //var a = self.notifications.create()
    });
};