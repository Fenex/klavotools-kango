/**
 *
 * @author Vitaliy Busko
 * 
 * An AngularJS wrapper for async kango framework methods:
 * invokeAsync, invokeAsyncCallback, addMessageListener.
 * Supports promises.
 * 
 * Snippets below the same and output in the console:
 * >> "3.4.0"
 * >> ["3", "4", "0"]
 * 
 * KangoQ.invokeAsync('kango.getExtensionInfo', function(res) {
 *     console.log(res.version);
 *     return res.version.split('.');
 * }).then(function(res) {
 *     console.log(res);
 * });
 * 
 * KangoQ.invokeAsync('kango.getExtensionInfo')
 * .then(function(res) {
 *     console.log(res.version);
 *     return res.version.split('.');
 * }).then(function(res) {
 *     console.log(res);
 * });
 * 
 */
 
angular.module('fnx.kango-q', [])

.factory('KangoQ', function($q) {
    function WrapK() {
        var defer = $q.defer();
        var args = Array.prototype.slice.call(arguments);
        var __callback = null;

        if(typeof args[args.length - 1] == 'function')
            __callback = args.pop();

        args.push(function() {
            var arg = arguments[0];
            if(__callback)
                arg = __callback(arg);
            defer.resolve(arg);
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
