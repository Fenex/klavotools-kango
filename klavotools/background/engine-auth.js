var Auth = function() {
    this.status = {};

    this.check();
    this.Timer = new AuthTimer(this.check);
};

Auth.prototype.ChangedStatus = function(auth) {
    for(var key in auth)
        if(typeof auth[key] != 'undefined')
            this.status[key] = auth[key];

    KlavoTools.Button.update();
    this.Timer.start();
};

Auth.prototype.check = function() {
    var self = this;

    xhr('http://klavogonki.ru/api/profile/get-messages-contacts?KTS_REQUEST')
    .then(function(res) {
        if(!res)
            return [undefined, undefined, undefined];

        var answer = JSON.parse(res);
        if(answer.err)
            return [null, null, 0];

        if(!answer.messages[0])
            return null;

        var unread = 0;
        for(var i=0; i<answer.messages.length; i++) {
            if(answer.messages[i].folder == 'in')
                unread += answer.messages[i].unread;
        }

        return [answer.messages[0].user_id, undefined, unread];
    }).then(function(p) {
        if(!p)
            return;

        self.ChangedStatus({
            id: p[0],
            login: p[1],
            unread: p[2]
        });
    });
};

Auth.prototype.get = function () {
    return this.status;
}

var AuthTimer = function(check) {
    //ID interval
    this.timer = null;
    //pause between requests
    this.pause = 60 * 1000;
    //function pointer
    this.check = check;

    this.start();
};

AuthTimer.prototype.start = function() {
    if(this.timer)
        this.stop();

    this.timer = setInterval(this.check, this.pause);
};

AuthTimer.prototype.stop = function() {
    clearInterval(this.timer);
    this.timer = null;
};
