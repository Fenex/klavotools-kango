/**
 *  Competitions Module
 *
 *  The module checks for new open competitions and shows notifications.
*/

var Competitions = function() {
    this.active = false;
};

Competitions.prototype.activate = function() {
    var self = this;
    if(this.active)
        return console.log('active already');
    
    this.active = setInterval(function() {
        self.check();
    });
};

Competitions.prototype.deactivate = function() {
    if(!this.active)
        return console.log('deactive already');
    
    clearInterval(this.active);
};

Competitions.prototype.check = function() {
    //kango.xhr.send('http://klavogonki.ru/gamelist.data')
};