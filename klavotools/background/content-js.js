var Script = function(name, desc) {
    this.name = name;
    this.enabled = true;
    
    if(desc)
        this.desc = desc;
        
    this.includes = [];
    
    this.load();
};

Script.prototype.getIncludes = function() {
    if(!this.code) return false;
    
    var metadata = {
        start: /^\s*\/\/ +==UserScript==\s*$/,
        end: /^\s*\/\/ +==\/UserScript==\s*$/,
        block: false
    };
    
    var lines = this.code.split(/\n/);
    for(var i=0; i<lines.length; i++) {
        if(metadata.block) {
            var include = lines[i].match(/^\s*\/\/\s+@include\s+([\S]+)/);
            if(include){
                this.includes.push(
                    include[1]
                        .replace(/\./g, '\\.')
                        .replace(/\*/g, '.*')
                );
            }
        } else if (metadata.start.test(lines[i])) {
            metadata.block = true;
        } else if (metadata.end.test(lines[i])) {
            break;
        }
    }
    
    return this;
}

Script.prototype.update = function() {
    var _this = this;
    
    return xhr('https://raw.githubusercontent.com/voidmain02/KgScripts/master/scripts/' + this.name).then(function(res) {
        _this.code = res;
        _this.getIncludes();
        _this.save();
        
        return _this;
    });
}

Script.prototype.save = function() {
    kango.storage.setItem('userjs_'+this.name,
        JSON.stringify({
            name: this.name,
            desc: this.desc,
            code: this.code,
            enabled: this.enabled
        })
    );
};

Script.prototype.load = function() {
    var _this = this;
    
    if(!kango.storage.getItem('userjs_'+this.name)) {
        this.update();
    } else {
        var tmp = JSON.parse(kango.storage.getItem('userjs_'+this.name));
        
        this.name = tmp.name;
        this.desc = tmp.desc;
        this.code = tmp.code;
        this.enabled = tmp.enabled;
        
        this.getIncludes();
    }
};

Script.prototype.isInclude = function(url) {
    if(!this.enabled)
        return false;
        
    for(var i=0; i<this.includes.length; i++) {
        if( (new RegExp(this.includes[i])).test(url) )
            return true;
    }
    
    return false;
};

Script.prototype.toString = function() {
    return '[object Script]';
};

var UserJS = function() {
    this.files = [];
    
    this.init();
};

UserJS.prototype.init = function() {
    var _this = this;
    
    var keys = kango.storage.getKeys();
    for(var i=0; i<keys.length; i++) {
        var name = keys[i].match(/^userjs_(\S+)$/);
        if(name)
            this.files.push(new Script(name[1]));
    }
    
    if(!this.files.length) {
        this.update();
    } else {
        setTimeout(function() {
            _this.update();
        }, 1000 * 60 * 15 /* 15 min */);
    }
};

UserJS.prototype.update = function() {
    var _this = this;
    
    xhr('https://raw.githubusercontent.com/voidmain02/KgScripts/master/README.md').then(function(res) {
        var rows = res.split(/\n/);
        
        for(var i=0; i<rows.length; i++) {
            var m = rows[i].match(/docs\/(.+?).md.+_(.+?)_/);
            if(!m)
                continue;
        
            var name = m[1] + '.user.js';
            var desc = m[2];
            var index = _this.getIndexByName(name);
            if(index >= 0) {
                _this.files[index].desc = desc;
                _this.files[index].update();
            } else {
                _this.files.push(new Script(name, desc));
            }
        }
    });
};

UserJS.prototype.getIndexByName = function(name) {
    for(var i=0; i<this.files.length; i++) {
        if(this.files[i].name == name)
            return i;
    }
    
    return -1;
};

UserJS.prototype.getAll = function() {
    return this.files;
};

UserJS.prototype.set = function(data) {
    for(var i=0; i<this.files.length; i++) {
        if(this.files[i].name == data.id) {
            this.files[i].enabled = data.enabled;
            this.files[i].save();
            
            return;
        }
    }
};

UserJS.prototype.getScripts = function(url) {
    var answer = [];
    for(var i=0; i<this.files.length; i++) {
        if(this.files[i].isInclude(url)) {
            answer.push({
                name: this.files[i].name,
                code: this.files[i].code
            });
        }
    }
    
    return answer;
};

UserJS.prototype.toString = function() {
    return '[object UserJS]';
};