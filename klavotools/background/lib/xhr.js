/**
 * @file A Q promise wrapper for the kango.xhr.send() method.
 * @author Vitaliy Busko
 * @author Daniil Filippov <filippovdaniil@gmail.com>
 */

/**
 * Performs a XHR request using kango.xhr.send() method.
 * @param {(string|Object)} settings An URL string for simple GET request, or an object
 *  with settings for the kango.xhr.send() method.
 * @returns {Promise.<(Object|string|XMLDOMDocument)>}
 */
function xhr (settings) {
    var deferred = Q.defer();
    var defaultSettings = {
        method: 'GET',
    };

    if (typeof settings === 'string') {
        settings = { url: settings };
    }

    for (var field in defaultSettings) {
        if (typeof settings[field] === 'undefined') {
            settings[field] = defaultSettings[field];
        }
    }

    kango.xhr.send(settings, function(data) {
        if (data.status > 0 && data.status < 400 && data.response != null) {
            deferred.resolve(data.response);
        } else {
            deferred.reject(data);
        }
    });

    return deferred.promise;
}
