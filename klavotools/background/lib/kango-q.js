angular.module('fnx.kango-q', [])

.factory('KangoQ', function($q) {
    function WrapK() {
        var defer = $q.defer();
        var args = Array.prototype.slice.call(arguments);
        var __callback = null;
        
        if(typeof args[args.length - 1] == 'function')
            __callback = args.pop();
        
        args.push(function() {
            if(__callback)
                __callback(arguments[0]);
            defer.resolve(arguments[0]);
        });
        
        return {
            args: args,
            promise: defer.promise
        };
    }

    var KangoQ = {};
    
    [
        'invokeAsync',
        'invokeAsyncCallback',
        'addMessageListener'
    ].forEach(function(item) {
        KangoQ[item] = function() {
            if(typeof kango == 'undefined' || typeof kango[item] != 'function') {
                throw new Error('kango framework not found or `' + item + '` is not a function');
            }
            
            var wrapK = WrapK.apply(this, arguments);
            kango[item].apply(this, wrapK.args);
            return wrapK.promise;
        }
    });
    
    return KangoQ;
});